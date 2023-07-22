import Blockchain from "@/utils/blockchain";
import { Request, Response } from "express";

interface IGetBalanceRequest extends Request {
	params: {
		address: string;
	};
}

/**
 * Takes user address as parameter and returns the balance
 */
const getBalance = async (req: IGetBalanceRequest, res: Response) => {
	if (!req.params.address) return res.status(400).json({ message: "Address not provided" });

	try {
		const userBalance = await Blockchain.getBalance(req.params.address);
		return res.json({ balance: userBalance });
	} catch (err) {
		console.error("getBalance:", err); // Or send to some logging service
		return res.status(500).json({ message: "Reading balance failed for address provided" });
	}
};

export default getBalance;
