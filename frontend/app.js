const { useState, useEffect } = React;

    const BridgeDApp = () => {
      const [walletConnected, setWalletConnected] = useState(false);
      const [account, setAccount] = useState('');
      const [amount, setAmount] = useState('');
      const [destinationAddress, setDestinationAddress] = useState('');
      const [sourceChain, setSourceChain] = useState('Ethereum');
      const [destinationChain, setDestinationChain] = useState('Flare');
      const [token, setToken] = useState('USDC');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [modalMessage, setModalMessage] = useState('');

      // Token addresses (placeholders; replace with actual deployed addresses)
      const tokens = {
        USDC: '0x1c7D4B196Cb0C7B01d064914d9e0832C4473a1aE', // Sepolia USDC
        USDT: '0x7169D38820F6eC98d77051246d1A7fcB0c2f7E8b', // Sepolia USDT
      };

      const sourceBridgeABI = [
        {
          "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "address", "name": "destinationAddress", "type": "address"},
            {"internalType": "string", "name": "destinationChain", "type": "string"}
          ],
          "name": "lockTokens",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const erc20ABI = [
        {
          "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "approve",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "account", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      // Placeholder; replace with actual deployed address
      const sourceBridgeAddress = '0x0000000000000000000000000000000000000000';

      const connectWallet = async () => {
        if (!window.ethereum) {
          setModalMessage('Please install MetaMask!');
          setIsModalOpen(true);
          return;
        }
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setWalletConnected(true);
          setModalMessage('Wallet connected successfully!');
          setIsModalOpen(true);
        } catch (error) {
          setModalMessage('Failed to connect wallet: ' + error.message);
          setIsModalOpen(true);
        }
      };

      const approveTokens = async (tokenAddress, amount) => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
          const allowance = await tokenContract.allowance(account, sourceBridgeAddress);
          const parsedAmount = ethers.utils.parseUnits(amount, 6);
          if (allowance.lt(parsedAmount)) {
            setModalMessage('Requesting token approval...');
            setIsModalOpen(true);
            const tx = await tokenContract.approve(sourceBridgeAddress, parsedAmount);
            await tx.wait();
            setModalMessage('Tokens approved successfully!');
            setIsModalOpen(true);
          }
        } catch (error) {
          setModalMessage('Token approval failed: ' + error.message);
          setIsModalOpen(true);
          throw error;
        }
      };

      const bridgeTokens = async () => {
        if (!walletConnected) {
          setModalMessage('Connect wallet first!');
          setIsModalOpen(true);
          return;
        }
        if (!amount || parseFloat(amount) <= 0) {
          setModalMessage('Enter a valid amount!');
          setIsModalOpen(true);
          return;
        }
        if (!ethers.utils.isAddress(destinationAddress)) {
          setModalMessage('Enter a valid destination address!');
          setIsModalOpen(true);
          return;
        }
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(sourceBridgeAddress, sourceBridgeABI, signer);
          await approveTokens(tokens[token], amount);
          setModalMessage('Initiating token bridge...');
          setIsModalOpen(true);
          const tx = await contract.lockTokens(
            ethers.utils.parseUnits(amount, 6),
            destinationAddress,
            destinationChain
          );
          setModalMessage('Transaction sent! Waiting for confirmation...');
          setIsModalOpen(true);
          await tx.wait();
          setModalMessage('Tokens locked! Awaiting relayer to mint on Flare...');
          setIsModalOpen(true);
        } catch (error) {
          setModalMessage('Transaction failed: ' + error.message);
          setIsModalOpen(true);
        }
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
      };

      // QR Code Generation
      useEffect(() => {
        const qrCodeDiv = document.getElementById('qrcode');
        if (destinationAddress && ethers.utils.isAddress(destinationAddress)) {
          qrCodeDiv.innerHTML = '';
          new QRCode(qrCodeDiv, {
            text: destinationAddress,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
          });
        } else {
          qrCodeDiv.innerHTML = '';
        }
      }, [destinationAddress]);

      return (
        <div id="root" className="app-container">
          <header id="app-header" className="header">
            <img src="../images/logo.png" alt="MARS Bridge Logo" className="logo" style={{ height: '40px' }} />
            <h1 id="app-title" className="title">Flare Bridge dApp</h1>
            <div id="wallet-status" className="wallet-status">
              {!walletConnected ? (
                <button id="connect-wallet" className="connect-wallet-btn" onClick={connectWallet}>
                  Connect Wallet
                </button>
              ) : (
                <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
              )}
            </div>
          </header>
          <main id="main-content" className="main-content">
            <img src="../images/banner.png" alt="MARS Bridge Banner" className="banner" style={{ width: '100%', maxWidth: '600px', marginBottom: '1rem' }} />
            <div id="source-chain-selector" className="chain-selector source-chain">
              <label id="source-chain-label" className="selector-label">Source Chain</label>
              <select id="source-chain-dropdown" className="chain-dropdown" value={sourceChain} onChange={(e) => setSourceChain(e.target.value)}>
                <option value="Ethereum">Ethereum</option>
                <option value="Arbitrum">Arbitrum</option>
                <option value="Polygon">Polygon</option>
              </select>
            </div>
            <div id="destination-chain-selector" className="chain-selector destination-chain">
              <label id="destination-chain-label" className="selector-label">Destination Chain</label>
              <select id="destination-chain-dropdown" className="chain-dropdown" value={destinationChain} onChange={(e) => setDestinationChain(e.target.value)}>
                <option value="Flare">Flare</option>
              </select>
            </div>
            <div id="token-selector" className="token-selector">
              <label id="token-label" className="selector-label">Token</label>
              <select id="token-dropdown" className="token-dropdown" value={token} onChange={(e) => setToken(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div id="address-input" className="address-input">
              <label id="address-label" className="input-label">Destination Address</label>
              <input
                id="address-field"
                className="address-field"
                type="text"
                placeholder="Enter destination address"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
              />
            </div>
            <div id="amount-input" className="amount-input">
              <label id="amount-label" className="input-label">Amount</label>
              <input
                id="amount-field"
                className="amount-field"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div id="qrcode" className="qrcode" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}></div>
            <button id="bridge-btn" className="bridge-btn" onClick={bridgeTokens}>
              Bridge Tokens
            </button>
          </main>
          <div id="transaction-modal" className={`modal ${isModalOpen ? 'active' : ''}`}>
            <div id="modal-content" className="modal-content">
              <h2 id="modal-title" className="modal-title">Transaction Status</h2>
              <p id="modal-message" className="modal-message">{modalMessage}</p>
              <button id="modal-close" className="modal-close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
          <footer id="app-footer" className="footer">
            <p id="footer-text" className="footer-text">Powered by Flare</p>
            <a id="footer-link-docs" className="footer-link" href="https://docs.flare.network">Documentation</a>
          </footer>
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<BridgeDApp />);