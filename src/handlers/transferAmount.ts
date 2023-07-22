import Blockchain, { type ITransaction, Transaction } from "@/utils/blockchain";
import { Request, Response } from "express";

interface ITransferAmountRequest extends Request {
	body: Omit<ITransaction, "hash">; // Request body will not contain the hash, thus exclude it
}

/**
 * Records an amount transfer transaction to blockchain
 */
const transferAmount = async (req: ITransferAmountRequest, res: Response) => {
	/** Array to track missing values to be reported as error */
	const missingValues: (keyof ITransferAmountRequest["body"])[] = [];

	if (!req.body.fromAddress) missingValues.push("fromAddress");
	if (!req.body.toAddress) missingValues.push("toAddress");
	if (req.body.amount === undefined) missingValues.push("amount");

	// In case of no erorrs `missingValues` array wouldn't have any data
	// But in case some errors are found, notify user about the same
	if (missingValues.length) {
		return res.status(400).json({ message: `${missingValues.join(", ")} is missing` });
	}

	try {
		const { fromAddress, toAddress, amount } = req.body;
		// No need to explicity save the transaction here
		// Will be done while adding blocks using database session
		const transaction = new Transaction(fromAddress, toAddress, amount);
		return res.json(await Blockchain.addTransaction(transaction));
	} catch (err) {
		console.error("transferAmount:", err);
		return res.status(500).json({ message: "Transfer failed between recipients" });
	}
};

export default transferAmount;
