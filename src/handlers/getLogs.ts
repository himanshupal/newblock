import Blockchain from "@/utils/blockchain";
import { Request, Response } from "express";

/**
 * Returns whole blockchain history, i.e. a list of blocks and their transaction(s)
 */
const getLogs = async (req: Request, res: Response) => {
	try {
		return res.json(await Blockchain.history());
	} catch (err) {
		console.error("getLogs:", err); // Or send to some logging service
		return res.status(500).json({ message: "Failed reading blockchain history" });
	}
};

export default getLogs;
