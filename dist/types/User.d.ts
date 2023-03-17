export default class User {
    address: string | undefined;
    alias: string | undefined;
    identityCommitment: bigint;
    constructor(identityCommitment: bigint, alias?: string, address?: string);
}
