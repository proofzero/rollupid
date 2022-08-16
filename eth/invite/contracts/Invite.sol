// eth/invite/contracts/Invite.sol
//
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * A token representing an invitation to use 3iD. A token holder is
 * granted special access to the site.
 */
contract ThreeId_Invitations is
    ERC721URIStorage
{
    using Counters for Counters.Counter;
    Counters.Counter private _inviteIds;

    // We only allow the creation of this many invitations.
    uint private _maxInvites;

    /**
     * Constructor.
     *
     * @param maxInvites the maximum allowed number of invitations
     * @param metaURI the token URI to associate with reserved zeroth invite
     */
    constructor(uint maxInvites, string memory metaURI) ERC721("3iD Invitation", "3ID") {
        _maxInvites = maxInvites;

        // Invitation #0000 is reserved.
        awardInvite(msg.sender, metaURI);
    }

    /**
     * Award an invitation.
     *
     * @param invitee invitation recipient
     * @param inviteURI a URI to associate with the invite
     * Returns:
     *   the invite (token) identifier
     */
    function awardInvite(address invitee, string memory inviteURI, string memory voucher) public returns(uint256) {
        // check if the voucher is valid
        
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
