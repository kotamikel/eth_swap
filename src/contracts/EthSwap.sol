pragma solidity ^0.5.0;

// Import DApp Token contract so we can talk to it
import "./Token.sol";

contract EthSwap {
	// Statically typed language - string variable
	// Public - a function on the smart contract called name which will return that value. 
	// STATE VARIABLE - data is actually stored on the blockchain
	string public name = "EthSwap Instant Exchange";

	// Keep track of token through a var - token methods will be called on this varaible. 
	// Just the code for SC doesnt tell us where it is on blockchain
	Token public token;

	// Redemption rate = # of tokens they recieve for 1 ether 
	// unsigned integer - cant be negative and decimal places
	uint public rate = 100;

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
	}
}