// eth/invite/contracts/Invite.sol
//
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

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
 * A token representing an invitation to use 3ID. A token holder is
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
     * @param voucher the voucher for the reserved zeroth invite
     */
    constructor(address minter, uint maxInvites, string memory metaURI, NFTVoucher memory voucher) ERC721("3ID Invitation", "3ID") {
        _setupRole(MINTER_ROLE, minter);
        _operator = minter;
        _maxInvites = maxInvites;

        awardInvite(_operator, metaURI, voucher);
    }

    // Handles disambiguation of the multiple defitions of supportsInterface in our parent contracts.
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
    function _recoverVoucherSigner(NFTVoucher memory voucher) public returns(address) {
        // See https://forum.openzeppelin.com/t/casting-an-address-to-string-solidity-8-0/25817/2
        string memory recipient = Strings.toHexString(uint256(uint160(voucher.recipient)), 20);

        // See https://docs.soliditylang.org/en/v0.8.12/types.html#string-concat
        string memory message = string.concat(recipient, voucher.uri);
        string memory ethMessage = string.concat("\x19Ethereum Signed Message:\n", Strings.toString(bytes(message).length), message);
        console.log('message: ', ethMessage);

        // See https://ethereum.stackexchange.com/questions/111549/cant-validate-authenticated-message-with-ethers-js
        // And https://docs.openzeppelin.com/contracts/2.x/utilities#checking_signatures_on_chain
        // But https://docs.openzeppelin.com/contracts/4.x/api/utils#ECDSA-toEthSignedMessageHash-bytes-
        // So:
        bytes32 digest = keccak256(bytes(ethMessage)); //ECDSA.toEthSignedMessageHash(bytes(message));
        return ECDSA.recover(digest, voucher.signature);
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
    function awardInvite(address invitee, string memory inviteURI, NFTVoucher memory voucher) public returns(uint256) {
        // make sure signature is valid and get the address of the signer
        address signer = _recoverVoucherSigner(voucher);
        console.log('(operator, invitee, signer) =', _operator, invitee, signer);

        // make sure that the signer is authorized to mint NFTs
        require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized!");

        // make sure that the redeemer is the same as the receipient
        require(invitee == voucher.recipient, "Invalid recipient!");
        
        // NB: invitation #0000 is reserved, user allocated range is
        // #0001 to #_maxInvites.
        uint256 inviteId = _inviteIds.current();
        require(inviteId <= _maxInvites, "All invitations have been awarded!");

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
