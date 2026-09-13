// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title DIDRegistry
 * @notice Decentralized Identity Registry for D-Vault.
 *         Allows users to register a self-sovereign DID string linked to their
 *         wallet address. Once registered, the DID is permanently recorded on-chain.
 *
 * @dev Satisfies both:
 *      - Backend: getDID(address) → string, DIDCreated event
 *      - Frontend: getIdentity(address) → (did, controller, createdAtBlock, verified)
 */
contract DIDRegistry {

    // ─── Storage ──────────────────────────────────────────────────────────────

    struct IdentityRecord {
        string  did;             // e.g. "did:ethr:sepolia:0xabc..."
        address controller;      // who controls this identity (defaults to owner)
        uint256 createdAtBlock;  // block number when registered
        bool    verified;        // can be set by admin/governance later
        bool    exists;          // internal flag — true once registered
    }

    /// @notice Maps wallet address → identity record
    mapping(address => IdentityRecord) private _identities;

    /// @notice Total number of registered identities
    uint256 public totalIdentities;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new DID is registered.
    ///         Backend event listener subscribes to this.
    event DIDCreated(address indexed owner, string did);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error AlreadyRegistered(address owner);
    error EmptyDID();
    error NotRegistered(address owner);

    // ─── Public Functions ─────────────────────────────────────────────────────

    /**
     * @notice Register a decentralized identifier for `msg.sender`.
     * @param did The DID string (e.g. "did:ethr:sepolia:0x…")
     *
     * Requirements:
     * - `did` must not be empty.
     * - Caller must not already have a registered DID.
     */
    function registerIdentity(string calldata did) external {
        if (bytes(did).length == 0) revert EmptyDID();
        if (_identities[msg.sender].exists) revert AlreadyRegistered(msg.sender);

        _identities[msg.sender] = IdentityRecord({
            did:            did,
            controller:     msg.sender,
            createdAtBlock: block.number,
            verified:       true,       // self-registered = auto-verified
            exists:         true
        });

        totalIdentities++;

        emit DIDCreated(msg.sender, did);
    }

    /**
     * @notice Get the full identity record for `account`.
     *         Used by the frontend's `useUserIdentity` hook.
     * @param account The wallet address to look up.
     * @return did            The registered DID string
     * @return controller     The controller address
     * @return createdAtBlock The block number at registration
     * @return verified       Whether the identity is verified
     */
    function getIdentity(address account) external view returns (
        string  memory did,
        address controller,
        uint256 createdAtBlock,
        bool    verified
    ) {
        IdentityRecord storage record = _identities[account];
        if (!record.exists) revert NotRegistered(account);

        return (
            record.did,
            record.controller,
            record.createdAtBlock,
            record.verified
        );
    }

    /**
     * @notice Get just the DID string for `owner`.
     *         Used by the backend's `blockchain.service.ts → getUserDID()`.
     * @param owner The wallet address to look up.
     * @return The DID string, or empty string if not registered.
     */
    function getDID(address owner) external view returns (string memory) {
        return _identities[owner].did;
    }

    /**
     * @notice Check if an address has a registered identity.
     * @param account The wallet address to check.
     * @return True if the address has a registered DID.
     */
    function hasIdentity(address account) external view returns (bool) {
        return _identities[account].exists;
    }
}
