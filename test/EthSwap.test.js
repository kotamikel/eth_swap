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
// Refactor to not read out array - accounts = [deployer, investor]
contract('EthSwap', ([deployer, investor]) => {
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

	// FROM - corresponds to msg.sender
	// VALUE - corresponds to msg.value 
	describe('buyTokens()', async () => {

		let result 

		before(async () => {
			result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', "ether")})
		})
		
		it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
			// check investor token balance after purchase
			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('100'))

			// check ethSwap balance after purchase
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('999900'))

			// check ethbalance went up
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

			// Check logs to ensure event was emitted with correct data
			const event = result.logs[0].args
			assert.equal(event.account, investor)
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('100').toString())
			assert.equal(event.rate.toString(), '100')
		})
	})

	describe('sellTokens()', async () => {

		let result 

		before(async () => {
			// Investor must approve tokens before the purchase
			await token.approve(ethSwap.address, tokens('100'), { from: investor });
			// Investor sells tokens
			result = await ethSwap.sellTokens(tokens('100'), { from: investor });
		})
		
		it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
			// check investor token balance after purchase
			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('0'))

			// check ethSwap balance after sale
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('1000000'))
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

			// Check logs to ensure event was emitted with correct data
			const event = result.logs[0].args
			assert.equal(event.account, investor)
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('100').toString())
			assert.equal(event.rate.toString(), '100')

			// FAILURE: investor cant sell more tokens than they have
			await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
		})
	})
})