// eth/mint/contracts/3idPFP.sol
//
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * A token representing a generative art PFP.
 */
contract ThreeId_ProfilePicture is
    ERC721URIStorage
{
    using Counters for Counters.Counter;
    Counters.Counter private _pfpIds;

    // We only allow the creation of this many PFPs.
    uint private _maxPFPs;

    /**
     * Constructor.
     *
     * @param maxPFPs the maximum allowed number of profile pics.
     * @param metaURI the token URI to associate with reserved zeroth PFP
     */
    constructor(uint maxPFPs, string memory metaURI) ERC721("3iD Profile Picture", "3ID PFP") {
        _maxPFPs = maxPFPs;

        // PFP #0000 is reserved.
        awardPFP(msg.sender, metaURI);
    }

    /**
     * Award a PFP.
     *
     * @param invitee invitation recipient
     * @param pfpURI a URI to associate with the profile pic
     * Returns:
     *   the invite (token) identifier
     */
    function awardInvite(address invitee, string memory inviteURI) public returns(uint256) {
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
     * Return the next PFP to be awarded.
     */
    function nextPFP() public view returns (uint256) {
        return _pfpIds.current();
    }

    /**
     * Return the maximum number of PFPs to be awarded.
     */
    function maxPFPs() public view returns (uint) {
        return _maxPFPs;
    }
}
