import type { ClientSession, ObjectId } from "mongodb";
import useDatabase from "./database";
import { createHash } from "crypto";

export interface IBlock {
	transaction: Transaction;
	prevHash: string;
	timestamp: number;
	nonce: number;
	hash: string;
}

export interface ITransaction {
	fromAddress: string;
	toAddress: string;
	amount: number;
	hash: string;
}

/**
 * Transaction represents a transfer of value from one address to another.
 * In this simplified scenario, a transaction has a single recipient.
 */
export class Transaction implements ITransaction {
	constructor(public fromAddress: string, public toAddress: string, public amount: number) {
		// ...
	}

	/**
	 * Save the transaction instance to database
	 */
	public async save(session?: ClientSession) {
		const { db } = useDatabase();
		return await db.collection<ITransaction>("transactions").insertOne(
			{
				fromAddress: this.fromAddress,
				toAddress: this.toAddress,
				amount: this.amount,
				hash: this.hash,
			},
			{ session }
		);
	}

	/**
	 * Generates a simple hash for the block data.
	 * In a real blockchain, a more secure method would be used.
	 */
	get hash() {
		return createHash("sha256").update(JSON.stringify(this)).digest("hex");
	}
}

/**
 * Block represents a set of transactions.
 * In this simplified scenario, a block contains a single transaction.
 */
export class Block implements IBlock {
	public nonce = Math.round(Math.random() * 999999999);

	constructor(public prevHash: string, public transaction: Transaction, public timestamp = Date.now()) {
		// ...
	}

	/**
	 * Save the block instance to database
	 */
	public async save(session?: ClientSession) {
		const { db } = useDatabase();
		const { insertedId } = await this.transaction.save(session);
		return await db.collection<Omit<IBlock, "transaction"> & { transaction: ObjectId }>("blocks").insertOne(
			{
				transaction: insertedId,
				timestamp: this.timestamp,
				prevHash: this.prevHash,
				nonce: this.nonce,
				hash: this.hash,
			},
			{ session }
		);
	}

	/**
	 * Generates a simple hash for the block data.
	 * In a real blockchain, a more secure method would be used.
	 */
	get hash() {
		return createHash("sha256").update(JSON.stringify(this)).digest("hex");
	}
}

/**
 * Blockchain represents a chain of blocks, with methods for adding blocks
 * and checking the integrity of the chain.
 */
class Blockchain {
	/**
	 * Create the initial block for the blockchain.
	 */
	public static async createGenesisBlock() {
		const tx = new Transaction("NULL", "0x0", 0);
		const block = new Block("0x", tx);

		const { client } = useDatabase();
		const session = client.startSession();

		try {
			session.startTransaction();
			await block.save(session);
			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
			throw new Error(err);
		}
	}

	/**
	 * Get the latest block in the chain.
	 */
	public static async latestBlock() {
		const chainData = await this.history();
		return chainData.at(-1);
	}

	/**
	 * Add a new transaction to the blockchain. The transaction is placed in a new block.
	 */
	public static async addTransaction(transaction: Transaction) {
		const latestBlock = await this.latestBlock();
		const newBlock = new Block(latestBlock.hash, transaction, Date.now());

		const { client } = useDatabase();
		const session = client.startSession();

		try {
			session.startTransaction();
			await newBlock.save(session);
			await session.commitTransaction();
			return newBlock;
		} catch (err) {
			await session.abortTransaction();
			throw new Error(err);
		}
	}

	/**
	 * Get current status of blockchain
	 * @returns All previous transaction blocks
	 */
	public static async history() {
		const { db } = useDatabase();
		return await db
			.collection<IBlock>("blocks")
			.aggregate([
				{
					$lookup: {
						from: "transactions",
						localField: "transaction",
						foreignField: "_id",
						as: "transaction",
					},
				},
				{
					$unwind: {
						path: "$transaction",
						preserveNullAndEmptyArrays: false,
					},
				},
				{
					$project: {
						_id: 0,
						transaction: {
							_id: 0,
						},
					},
				},
				{
					$sort: {
						timestamp: -1,
					},
				},
			])
			.toArray();
	}

	/**
	 * Get the balance of an address by aggregating the amounts in the related transactions.
	 */
	public static async getBalance(address: string) {
		const chainHistory = await this.history();
		const userHistory = chainHistory.filter(({ transaction: { fromAddress, toAddress } }) => fromAddress === address || toAddress === address);
		return userHistory.reduce((p, { transaction: { fromAddress, toAddress, amount } }) => {
			if (fromAddress === address) return p - amount;
			if (toAddress === address) return p + amount;
			return p;
		}, 0);
	}
}

export default Blockchain;
