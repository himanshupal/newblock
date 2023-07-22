import { MongoClient } from "mongodb";
import app from "../../package.json";

const connectionURI = process.env.DATABASE_URL || "mongodb://localhost:27017";

let client = new MongoClient(connectionURI, {
	appName: app.name,
	zlibCompressionLevel: 7,
});

export const connectDatabase = async () => {
	client = await client.connect();
};

const useDatabase = (database?: string) => {
	const db = client.db(database || app.name);
	return { db, client };
};

export default useDatabase;
