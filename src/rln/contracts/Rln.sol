// SPDX-License-Identifier: (GPL-2.0 OR MIT) 
pragma solidity >=0.8.15;

import { IPoseidonHasher } from "./PoseidonHasher.sol";

contract RLN {
	uint256 public immutable MEMBERSHIP_DEPOSIT;
	uint256 public immutable DEPTH;
	uint256 public immutable SET_SIZE;

	uint256 public memPubkeyIndex = 0;
	// member pubkeys (idCommitments) that have been registered with stake
	mapping(uint256 => uint256) public members;

	IPoseidonHasher public poseidonHasher;

	event MemberRegistered(uint256 memPubkey, uint256 index);
	event MemberWithdrawn(uint256 memPubkey);

	constructor(
		uint256 membershipDeposit,
		uint256 depth,
		address _poseidonHasher
	) {
		MEMBERSHIP_DEPOSIT = membershipDeposit;
		DEPTH = depth;
		SET_SIZE = 1 << depth;
		poseidonHasher = IPoseidonHasher(_poseidonHasher);
	}

	function register(uint256 memPubkey) external payable {
		require(members[memPubkey] == 0, "RLN, register: pubkey already registered");
		require(memPubkeyIndex < SET_SIZE, "RLN, register: set is full");
		require(msg.value == MEMBERSHIP_DEPOSIT, "RLN, register: membership deposit is not satisfied");
		_register(memPubkey);
	}

	function registerBatch(uint256[] calldata memPubkeys) external payable {
		uint256 memPubkeylen = memPubkeys.length;
		require(memPubkeyIndex + memPubkeylen <= SET_SIZE, "RLN, registerBatch: set is full");
		require(msg.value == MEMBERSHIP_DEPOSIT * memPubkeylen, "RLN, registerBatch: membership deposit is not satisfied");
		for (uint256 i = 0; i < memPubkeylen; i++) {
			_register(memPubkeys[i]);
		}
	}

	function _register(uint256 memPubkey) internal {
		members[memPubkeyIndex] = msg.value; 
		emit MemberRegistered(memPubkey, memPubkeyIndex);
		memPubkeyIndex += 1;
	}

	function withdrawBatch(
		uint256[] calldata secrets,
		address payable[] calldata receivers
	) external {
		uint256 batchSize = secrets.length;
		require(batchSize != 0, "RLN, withdrawBatch: batch size zero");
		require(batchSize == receivers.length, "RLN, withdrawBatch: batch size mismatch receivers");
		for (uint256 i = 0; i < batchSize; i++) {
			_withdraw(secrets[i], receivers[i]);
		}
	}

	function withdraw(
		uint256 secret,
		address payable receiver
	) external {
		_withdraw(secret, receiver);
	}

	function _withdraw(
		uint256 secret,
		address payable receiver
	) internal {
		// derive public key
		uint256 memPubkey = hash(secret);
		require(members[memPubkey] != 0, "RLN, _withdraw: member doesn't exist");
		require(receiver != address(0), "RLN, _withdraw: empty receiver address");

		// refund deposit
		(bool sent, bytes memory data) = receiver.call{value: members[memPubkey]}("");
        require(sent, "transfer failed");
		// delete member only if refund is successful
		members[memPubkey] = 0;

		emit MemberWithdrawn(memPubkey);
	}

	function hash(uint256 input) internal view returns (uint256) {
		return poseidonHasher.hash(input);
	}
}