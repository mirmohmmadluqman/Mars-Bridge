// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

    contract Bridge is Ownable, ReentrancyGuard {
        IERC20 public token;
        mapping(address => uint256) public lockedBalances;

        event TokensLocked(address indexed user, uint256 amount, address destinationAddress, string destinationChain);
        event TokensUnlocked(address indexed user, uint256 amount);

        constructor(address _token) Ownable(msg.sender) {
            token = IERC20(_token);
        }

        function lockTokens(uint256 amount, address destinationAddress, string memory destinationChain) external nonReentrant {
            require(amount > 0, "Amount must be greater than 0");
            require(destinationAddress != address(0), "Invalid destination address");
            require(bytes(destinationChain).length > 0, "Destination chain required");
            require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
            lockedBalances[msg.sender] += amount;
            emit TokensLocked(msg.sender, amount, destinationAddress, destinationChain);
        }

        function unlockTokens(address user, uint256 amount) external onlyOwner nonReentrant {
            require(user != address(0), "Invalid user address");
            require(lockedBalances[user] >= amount, "Insufficient locked balance");
            lockedBalances[user] -= amount;
            require(token.transfer(user, amount), "Transfer failed");
            emit TokensUnlocked(user, amount);
        }
    }