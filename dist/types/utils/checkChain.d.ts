import { Network } from '@ethersproject/providers';
export declare const GOERLI = 5;
export declare const OPTIMISM = 10;
export declare function checkChain(network: Network): Promise<void>;
