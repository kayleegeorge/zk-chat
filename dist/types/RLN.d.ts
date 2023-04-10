import { Registry, RLN as RLNjs, RLNFullProof, Cache } from "rlnjs";
import { Contract } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
export default class RLN {
    registry: Registry;
    identityCommitments: bigint[];
    contract: Contract | undefined;
    rlnIdentifier: bigint;
    rlnjs?: RLNjs;
    cache?: Cache;
    identityCommitment?: bigint;
    vKey?: any;
    constructor(appName: string, onChain?: Contract, rlnIdentifier?: bigint);
    initRLN(vKeyPath: string, wasmFilePath: string, finalZkeyPath: string, existingIdentity?: string): Promise<void>;
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
            commitment: bigint | undefined;
            membershipGroups: {
                chainId: number;
                contract: Contract | undefined;
            }[];
        }[];
        version: number;
    };
}
