# Ledger Protocol assumptions

- Wallet connection, SIWE, contract writes, block explorer links, and indexer responses are simulated for a frontend-only prototype.
- The demo role switcher intentionally exposes Admin, Manager, Auditor, and User surfaces without real authorization; production permissions should be enforced by the on-chain RBAC contract and server/indexer.
- Asset imagery is represented with CSS-generated provenance art so the experience stays self-contained and the visual system remains consistent.
- The chosen direction is Cryptographic Ledger: graphite surfaces, mint verification signals, amber ownership signals, monospace chain data, hairline borders, and an audit trail treated as the emotional core.
- Theme switching is session-local in this prototype; persistence can be added when a real account/session store is connected.
