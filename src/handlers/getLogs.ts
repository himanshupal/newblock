import Blockchain from "@/utils/blockchain";
import { Request, Response } from "express";

const getLogs = async (req: Request, res: Response) => {
	try {
		return res.json(await Blockchain.history());
	} catch (err) {
		console.error("getLogs:", err);
		return res.status(500).json({ message: "Failed reading blockchain history" });
	}
};

export default getLogs;
