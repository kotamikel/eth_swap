pragma solidity ^0.5.0;

// Import DApp Token contract so we can talk to it
import "./Token.sol";

contract EthSwap {

	// STATE VARIABLE - data is actually stored on the blockchain
	string public name = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100;

	// Event definition
	event TokenPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	//Set the address of the token(which lives on BC)
	constructor(Token _token) public {
		// _token is only local variable but its stored to the state variable token 
		token = _token;   // This will store it to the STATE VARIABLE and not local variable (_token)
	}

	// Public - callable outside the SC
	// Payable - send ether whenever we call fn
	function buyTokens() public payable {
		// Calculate the number of tokens to buy
		uint tokenAmount = msg.value * rate; // msg.value - global variable telling us how much ETHER was sent when the fn was called

		// Transfer the token from EthSwap to whoever is buying it
		// arg1 - msg is a global variable in solidity - sender is value of address calling this function
		// arg2 - the value of tokens based on the eth amount they are sending. 
		token.transfer(msg.sender, tokenAmount);

		// Emit an event. 
		emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
	}
}