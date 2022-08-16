// eth/invite/contracts/Invite.sol
//
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


// Voucher is produced by the operator and is used to redeem the token.
struct NFTVoucher {
  address recipient;
  string uri;
  bytes32 messageHash;
  bytes signature;
}

/**
 * A token representing an invitation to use 3iD. A token holder is
 * granted special access to the site.
 */
contract ThreeId_Invitations is
    ERC721URIStorage,
    AccessControl 
{
    using Counters for Counters.Counter;
    Counters.Counter private _inviteIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // We only allow the creation of this many invitations.
    uint private _maxInvites;
    address _operator;

    /**
     * Constructor.
     *
     * @param minter the operator address that can mint new invitations
     * @param maxInvites the maximum allowed number of invitations
     * @param metaURI the token URI to associate with reserved zeroth invite
     */
    constructor(address minter, uint maxInvites, string memory metaURI) ERC721("3ID Invitation", "3ID") {
        _maxInvites = maxInvites;
        _operator = minter;

        _setupRole(MINTER_ROLE, minter);

        // TODO: mint #0000 to a controlled address
        // construct the voucher
        // Invitation #0000 is reserved.
        // awardInvite(msg.sender, metaURI);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * Verify the voucher signature and return the address of the signer
     * THe address is expected to be the operator of the contract
     *
     * @param voucher the voucher to use to validate and award the invite
     *
     * Returns:
     *   the address of the signer
     */
    function _recoverVoucherSigner(NFTVoucher calldata voucher) public pure returns(address) {
        return ECDSA.recover(voucher.messageHash, voucher.signature);
    }

    /**
     * Award an invitation.
     *
     * @param invitee invitation recipient
     * @param inviteURI a URI to associate with the invite
     * @param voucher the voucher to use to validate and award the invite
     *
     * Returns:
     *   the invite (token) identifier
     */
    function awardInvite(address invitee, string memory inviteURI, NFTVoucher calldata voucher) public returns(uint256) {
        // make sure signature is valid and get the address of the signer
        address signer = _recoverVoucherSigner(voucher);

        // make sure that the signer is authorized to mint NFTs
        require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");

        // make sure that the redeemer is the same as the receipient
        require(invitee != voucher.recipient, "Invalid recipient");
        
        // NB: invitation #0000 is reserved, user allocated range is
        // #0001 to #_maxInvites.
        uint256 inviteId = _inviteIds.current();
        require(inviteId <= _maxInvites, "all invitations have been awarded");

        _safeMint(invitee, inviteId);
        _setTokenURI(inviteId, inviteURI);

        _inviteIds.increment();

        return inviteId;
    }

    /**
     * Return the next invitation to be awarded.
     */
    function nextInvite() public view returns (uint256) {
        return _inviteIds.current();
    }

    /**
     * Return the maximum number of invitations to be awarded.
     */
    function maxInvitations() public view returns (uint) {
        return _maxInvites;
    }
}
