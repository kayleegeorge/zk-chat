// const { ethers } = require('hardhat')
// const { assert } = require('chai')
// require('@nomicfoundation/hardhat-chai-matchers')

// describe('Rln', function () {
//   it('Deploying', async function () {
//     const PoseidonHasher = await ethers.getContractFactory('PoseidonHasher')
//     const poseidonHasher = await PoseidonHasher.deploy()

//     await poseidonHasher.deployed()

//     console.log('PoseidonHasher deployed to:', poseidonHasher.address)

//     const Rln = await ethers.getContractFactory('RLN')
//     const rln = await Rln.deploy(1000000000000000, 20, poseidonHasher.address)

//     await rln.deployed()

//     console.log('Rln deployed to:', rln.address)

//     const price = await rln.MEMBERSHIP_DEPOSIT()

//     // A valid pair of (idSecret, idCommitment) generated in rust
//     const idSecret = '0x2a09a9fd93c590c26b91effbb2499f07e8f7aa12e2b4940a3aed2411cb65e11c'
//     const idCommitment = '0x0c3ac305f6a4fe9bfeb3eba978bc876e2a99208b8b56c80160cfb54ba8f02368'

//     const resRegister = await rln.register(idCommitment, { value: price })
//     const txRegisterReceipt = await resRegister.wait()

//     const regPubkey =  txRegisterReceipt.events[0].args.memPubkey
//     // const reg_tree_index =  txRegisterReceipt.events[0].args.index;

//     // We ensure the registered idCommitment is the one we passed
//     assert(regPubkey.toHexString() === idCommitment, "registered commitment doesn't match passed commitment")

//     // We withdraw our idCommitment
//     const receiverAddress = '0x000000000000000000000000000000000000dead'
//     const resWithdraw = await rln.withdraw(idSecret, receiverAddress)

//     const txWithdrawReceipt = await resWithdraw.wait()

//     const witPubkey =  txWithdrawReceipt.events[0].args.memPubkey

//     // We ensure the registered idCommitment is the one we passed and that the index is the same
//     assert(witPubkey.toHexString() === idCommitment, "withdraw commitment doesn't match registered commitment")
//     const pubkeyIndex = (await rln.pubkeyIndex()).toNumber()
//     assert(pubkeyIndex === 1, 'pubkeyIndex should be 1')
//   })

//   it('should not allow dupe registrations', async () => {
//     const PoseidonHasher = await ethers.getContractFactory('PoseidonHasher')
//     const poseidonHasher = await PoseidonHasher.deploy()

//     await poseidonHasher.deployed()

//     console.log('PoseidonHasher deployed to:', poseidonHasher.address)

//     const Rln = await ethers.getContractFactory('RLN')
//     const rln = await Rln.deploy(1000000000000000, 20, poseidonHasher.address)

//     await rln.deployed()

//     console.log('Rln deployed to:', rln.address)

//     const price = await rln.MEMBERSHIP_DEPOSIT()

//     // A valid idCommitment generated in rust
//     const idCommitment = '0x0c3ac305f6a4fe9bfeb3eba978bc876e2a99208b8b56c80160cfb54ba8f02368'

//     await rln.register(idCommitment, { value: price })
//     // expect(rln.register(idCommitment, {value: price})).to.be.revertedWith("RLN, register: pubkey already registered");

//   })
// })