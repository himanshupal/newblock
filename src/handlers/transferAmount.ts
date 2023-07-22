import Blockchain, { type ITransaction, Transaction } from "@/utils/blockchain";
import { Request, Response } from "express";

interface ITransferAmountRequest extends Request {
	body: Omit<ITransaction, "hash">;
}

const transferAmount = async (req: ITransferAmountRequest, res: Response) => {
	const missingValues: (keyof ITransferAmountRequest["body"])[] = [];

	if (!req.body.fromAddress) missingValues.push("fromAddress");
	if (!req.body.toAddress) missingValues.push("toAddress");
	if (req.body.amount === undefined) missingValues.push("amount");

	if (missingValues.length) {
		return res.status(400).json({ message: `${missingValues.join(", ")} is missing` });
	}

	try {
		const { fromAddress, toAddress, amount } = req.body;
		const transaction = new Transaction(fromAddress, toAddress, amount);
		return res.json(await Blockchain.addTransaction(transaction));
	} catch (err) {
		console.error("transferAmount:", err);
		return res.status(500).json({ message: "Transfer failed between recipients" });
	}
};

export default transferAmount;
