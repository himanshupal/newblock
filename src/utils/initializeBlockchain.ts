import Blockchain from "./blockchain";
import useDatabase from "./database";

const initializeBlockchain = async () => {
	const { db } = useDatabase();

	const chainExists = await db.collection("blocks").findOne();
	if (chainExists) return console.log("Genesis block already exists, skipping...");

	try {
		await Blockchain.createGenesisBlock();
		console.log("Initialized blockchain, app is ready to use!");
	} catch (err) {
		console.error("Failed creating genesis block, exiting...");
		process.exit();
	}
};

export default initializeBlockchain;
