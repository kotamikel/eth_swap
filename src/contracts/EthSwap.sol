pragma solidity ^0.5.0;

// Import DApp Token contract so we can talk to it
import "./Token.sol";

contract EthSwap {

	// STATE VARIABLE - data is actually stored on the blockchain
	string public name = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100;

	// Event definition
	event TokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	event TokensSold(
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

	// Public - callable outside the  SC
	// Payable - send ether whenever we call fn
	function buyTokens() public payable {
		// Calculate the number of tokens to buy
		uint tokenAmount = msg.value * rate; // msg.value - global variable telling us how much ETHER was sent when the fn was called

		// Require that EthSwap has enough tokens
		require(token.balanceOf(address(this)) >= tokenAmount); 

		// Transfer the token from EthSwap to whoever is buying it
		// arg1 - msg is a global variable in solidity - sender is value of address calling this function
		// arg2 - the value of tokens based on the eth amount they are sending. 
		token.transfer(msg.sender, tokenAmount);

		// Emit an event. 
		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}

	function sellTokens(uint _amount) public {
		// User can't sell more tokens than they have
		require(token.balanceOf(msg.sender) >= _amount);

		// Calculate amount of Ether to redeem
		uint etherAmount = _amount / rate; 
		
		// Require that EthSwap has enough Ether
		require(address(this).balance >= etherAmount);

		// THE SC CANNOT CALL THE TRANSFER FN ON ERC20 TOKEN ON BEHALF OF INVESTOR. (you can hide transfer fns)
		// ERC20 HAS SPECIAL FN CALLED - TRANSFERFROM - This fn is used to have SC spend tokens for you. 
		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(etherAmount);

		// Emit an event. 
		emit TokensSold(msg.sender, address(token), _amount, rate);
	}
}