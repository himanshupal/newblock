import Blockchain from "@/utils/blockchain";
import { Request, Response } from "express";

interface IGetBalanceRequest extends Request {
	params: {
		address: string;
	};
}

const getBalance = async (req: IGetBalanceRequest, res: Response) => {
	const userAddress = req.params.address;

	if (!userAddress) return res.status(400).json({ message: "Address not provided" });

	try {
		const userBalance = await Blockchain.getBalance(userAddress);
		return res.json({ balance: userBalance });
	} catch (err) {
		console.error("getBalance:", err);
		return res.status(500).json({ message: "Reading balance failed for address provided" });
	}
};

export default getBalance;
