import { ethers } from "../node_modules/hardhat";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";

/*
 *  Configuration for a user account. Implements the ethers
 * ExternallyOwnedAccount interface but in practice privateKeys are optional.
 */
export class UserConfiguration implements ExternallyOwnedAccount {
    address: string;
    privateKey: string;

    constructor(_address: string, _privateKey: string) {
        // TODO: Sanity check that the address is extractable from the private
        // key.
        this.address = _address;
        this.privateKey = _privateKey;
    }

    public toString = () : string => {
        return this.address;
    }
};

/*
 *  The list of user accounts.
 */
export interface UserAccountList {
    [user: string]: string;
    // owner: UserConfiguration;
    // operator: UserConfiguration;
};

/*
 *  Configuration for storage providers.
 */
export type StorageConfiguration = {
    apiKey: string;
};

/*
 *  Configuration for the NFTar service.
 */
export type NFTarConfiguration = {
    host: string;
    token: string;
};

/*
 *  Configuration for the NFTar service.
 * 
 * TODO: the owner and operator keys should come from the relevant
 * configurations defined above.
 * 
 */
export type WalletConfiguration = {
    ownerKey: string;
    operatorKey: string;
};

/*
 *  Configuration for Alchemy.
 */
export class AlchemyConfiguration {
    #url: string = "";

    constructor(_url: string) {
        this.#url = _url;
    }

    get appURL() { return this.#url; }
    get apiKey() { return this.#url.split('/').pop(); }
};

/*
 *  Configuration for (currently eth-like) chain networks.
 */
export type ChainnetConfiguration = {
    contract: string;
    alchemy: AlchemyConfiguration;
    nftar: NFTarConfiguration;
    storage: StorageConfiguration;
    wallet: WalletConfiguration;
    user: UserAccountList;
};
