import { Registry, RLN as RLNjs, RLNFullProof, Cache } from 'rlnjs';
import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
export default class RLN {
    registry: Registry;
    identityCommitments: bigint[];
    contract: Contract | undefined;
    rlnjs: RLNjs;
    cache: Cache;
    rlnIdentifier: bigint;
    identityCommitment: bigint;
    constructor(onChain?: Contract, existingIdentity?: string, rlnIdentifier?: bigint);
    initOnChain(): Promise<void>;
    generateRLNProof(msg: string, epoch: bigint): Promise<RLNFullProof>;
    verifyProof(rlnProof: RLNFullProof): Promise<boolean>;
    constructRLNMemberTree(): Promise<void>;
    registerUserOnRLNContract(provider: Web3Provider): Promise<void>;
    addProofToCache(proof: RLNFullProof): void;
    getIdentityAsString(): string;
    generateRLNcredentials(appName: string): {
        application: string;
        appIdentifier: bigint;
        credentials: {
            key: bigint;
            commitment: bigint;
            membershipGroups: {
                chainId: number;
                contract: Contract | undefined;
                treeIndex: number;
            }[];
        }[];
        version: number;
    };
}
