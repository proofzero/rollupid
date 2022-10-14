// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20SnapshotUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20FlashMintUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:security-contact admin@kubelt.com
// , ERC20BurnableUpgradeable, PausableUpgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable, ERC20FlashMintUpgradeable
contract KubeltPlatformCreditsV2 is Initializable, ERC20Upgradeable, AccessControlUpgradeable, UUPSUpgradeable, ERC20SnapshotUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC20_init("Kubelt Platform Credits", "CRDT");
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, 100000000 * 10 ** decimals());
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        // __ERC20Burnable_init();
        __ERC20Snapshot_init();
        // __Pausable_init();
        // __ERC20Permit_init("Kubelt Platform Credits");
        // __ERC20Votes_init();
        // __ERC20FlashMint_init();

        _grantRole(SNAPSHOT_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function snapshot() public onlyRole(SNAPSHOT_ROLE) {
        _snapshot();
    }

    // function pause() public onlyRole(PAUSER_ROLE) {
    //     _pause();
    // }

    // function unpause() public onlyRole(PAUSER_ROLE) {
    //     _unpause();
    // }

    // function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    //     _mint(to, amount);
    // }

        // whenNotPaused
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20SnapshotUpgradeable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    // The following functions are overrides required by Solidity.

    // function _afterTokenTransfer(address from, address to, uint256 amount)
    //     internal
    //     override(ERC20Upgradeable, ERC20VotesUpgradeable)
    // {
    //     super._afterTokenTransfer(from, to, amount);
    // }

    // function _mint(address to, uint256 amount)
    //     internal
    //     override(ERC20Upgradeable, ERC20VotesUpgradeable)
    // {
    //     super._mint(to, amount);
    // }

    // function _burn(address account, uint256 amount)
    //     internal
    //     override(ERC20Upgradeable, ERC20VotesUpgradeable)
    // {
    //     super._burn(account, amount);
    // }
}
