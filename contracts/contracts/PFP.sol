// eth/contracts/PFP.sol
//
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// Voucher is produced by NFTar and is used to redeem the token.
struct NFTVoucher {
  address recipient;
  string uri;
  bytes signature;
}

/**
 * A token representing a generated 3ID PFP.
 */
contract ThreeId_ProfilePicture is
    ERC721URIStorage,
    AccessControl,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _profileIds;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // We only allow the creation of this many profiles.
    uint private _maxPFPs;
    address _operator;

    // Handles disambiguation of the multiple defitions of supportsInterface in our parent contracts.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * Constructor.
     *
     * @param minter the operator address that can mint new profiles
     * @param maxPFPs the maximum allowed number of profiles
     * @param voucher the voucher for the reserved zeroth profile
     */
    constructor(address minter, uint maxPFPs, NFTVoucher memory voucher) ERC721("3ID Profile Picture", "PFP") {
        _setupRole(OPERATOR_ROLE, minter);
        _operator = minter;
        _maxPFPs = maxPFPs;

        // Variance from Invite: we probably don't want to award to operator.
        //awardPFP(_operator, voucher);
    }

    /**
     * Destructor.
     *
     * Gozer:
     * Sub-creatures! Gozer the Gozerian, Gozer the Destructor, Volguus Zildrohar, the Traveller has come! Choose and perish!
     *
     * ---> This is an owner-only function that selfdestructs us.
     *
     * @param account the form of the destructor: the address that will receive contract contents.
     *
     */
     function destructor(address account) public onlyOwner  {
        require(hasRole(OPERATOR_ROLE, account), "The operator must be the destructor!");
        selfdestruct(payable(account));
     }

    /**
     * Verify the voucher signature and return the address of the signer
     * The address is expected to be the operator of the contract
     *
     * @param voucher the voucher to use to validate and award the profile pic.
     *
     * Returns:
     *   the address of the signer
     */
    function _recoverVoucherSigner(NFTVoucher memory voucher) public pure returns(address) {
        bytes32 messageHash = keccak256(abi.encodePacked(voucher.recipient, voucher.uri));
        bytes32 ethMessage = ECDSA.toEthSignedMessageHash(messageHash);
        return ECDSA.recover(ethMessage, voucher.signature);
    }

    /**
     * Award a PFP.
     *
     * @param recipient the address of the 3ID user awarded the PFP.
     * @param voucher the voucher to use to validate and award the PFP.
     *
     * Returns:
     *   the profile (token) identifier
     */
    function awardPFP(address recipient, NFTVoucher memory voucher) public returns(uint256) {

        // Make sure the voucher and signature are valid and get the address of the signer.
        address signer = _recoverVoucherSigner(voucher);

        // Make sure that the signer is authorized to mint NFTs.
        require(hasRole(OPERATOR_ROLE, signer), "Signature invalid or unauthorized!");

        // Make sure that the redeemer is the same as the receipient.
        require(recipient == voucher.recipient, "Invalid recipient!");

        // NB: PFP #0000 is reserved, user allocated range is [#0001 to #_maxPFPs].
        uint256 profileId = _profileIds.current();
        // require(voucher.tokenId == profileId, 'Please request profiles in sequence.');
        require(profileId <= _maxPFPs, "All profiles have been awarded!");

        _safeMint(recipient, profileId);
        _setTokenURI(profileId, voucher.uri);

        // Note: should this move to above minting because of re-entrancy?
        _profileIds.increment();

        return profileId;
    }

    /**
     * Return the next profile to be awarded.
     */
    function nextPFP() public view returns (uint256) {
        return _profileIds.current();
    }

    /**
     * Return the maximum number of profiles to be awarded.
     */
    function maxProfiles() public view returns (uint) {
        return _maxPFPs;
    }
}
