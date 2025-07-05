A decentralized bridge application to transfer tokens between Ethereum-compatible chains and Flare.

## Directory Structure
- `contracts/`: Solidity smart contracts for the bridge and wrapped tokens.
- `frontend/`: React-based dApp interface.
- `images/`: Static assets (logo.png, banner.png, sideBackgroundImage.webm).
- `relayer/`: Relayer script for cross-chain event handling.

## Setup
1. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Deploy contracts**:
   - Use Hardhat or Remix to deploy `Bridge.sol` and `WrappedToken.sol` on Sepolia and Flare Coston.
   - Update `app.js` and `watcher.js` with deployed contract addresses.
3. **Run the frontend**:
   ```bash
   npx http-server
   ```
4. **Run the relayer**:
   ```bash
   cd relayer
   npm install ethers dotenv
   node watcher.js
   ```

## Usage
- Open `frontend/index.html` in a browser with MetaMask installed.
- Connect your wallet, select source/destination chains, token, and amount, then bridge tokens.
- Ensure `images/` contains `logo.png`, `banner.png`, and `sideBackgroundImage.webm`.

## Notes
- Replace placeholder contract addresses in `app.js` and `watcher.js`.
- Implement full relayer logic in `watcher.js` for production.
