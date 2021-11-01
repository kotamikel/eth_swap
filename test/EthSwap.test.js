// Import SC
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

//CHAI TEST FRAMEWORK - Configure assertions
require('chai')
	.use(require('chai-as-promised'))
	.should()

// Make the DApp Token Human readable
function tokens(n) {
	// Convert token to WEI at the smart contract level
	return web3.utils.toWei(n, "ether");
}
//Test
contract('EthSwap', (accounts) => {
	//make these variables available in the other fn
	let token, ethSwap

	// Create a BEFORE HOOK to avoid repeating code. 
	before(async () => {
		token = await Token.new()
		ethSwap = await EthSwap.new(token.address)
		await token.transfer(ethSwap.address, tokens('1000000'))
	})

	//Test Token was deployed
	describe('Token deployment', async () => {
		it('contract has a name', async () => {
			const name = await token.name()
			assert.equal(name, 'DApp Token')
		})
	})

	//Test EthSwap was deployed
	describe('EthSwap deployment', async () => {
		it('contract has a name', async () => {
			const name = await ethSwap.name()
			assert.equal(name, 'EthSwap Instant Exchange')
		})
		//Test to see if the contract HAS TOKENS
		it('contract has tokens', async () => {
			let balance = await token.balanceOf(ethSwap.address)
			assert.equal(balance.toString(), tokens('1000000'))

		})
	})
})