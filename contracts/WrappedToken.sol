// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

    contract WrappedToken is ERC20, Ownable, ReentrancyGuard {
        event TokensMinted(address indexed to, uint256 amount);
        event TokensBurned(address indexed from, uint256 amount);

        constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {}

        function mint(address to, uint256 amount) external onlyOwner nonReentrant {
            require(to != address(0), "Invalid recipient address");
            _mint(to, amount);
            emit TokensMinted(to, amount);
        }

        function burn(uint256 amount) external nonReentrant {
            require(amount > 0, "Amount must be greater than 0");
            _burn(msg.sender, amount);
            emit TokensBurned(msg.sender, amount);
        }
    }