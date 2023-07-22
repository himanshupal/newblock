import "dotenv/config";
import express from "express";
import useDatabase from "@/utils/database";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

const headers = {
	"Access-Control-Max-Age": 86400,
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "OPTIONS,GET,POST",
	"Access-Control-Allow-Credentials": "true",
};

// CORS
app.use((req, res, next) => {
	Object.entries(headers).forEach(([k, v]) => {
		res.setHeader(k, v);
	});

	if (req.method === "OPTIONS") {
		return res.sendStatus(200);
	}

	next();
});

app.listen(PORT, async () => {
	const { client } = useDatabase();
	try {
		await client.connect();
		console.log(`Database connected & server started on port ${PORT}: ${new Date()}`);
	} catch {
		console.error("Database connection failed, exiting...");
		process.exit(1);
	}
});

const closeDatabaseConnection = async () => {
	const { client } = useDatabase();
	try {
		await client.close();
		process.exit(0);
	} catch (err) {
		console.error("Database connection not closed:", err);
		process.exit(1);
	}
};

process.on("SIGINT", closeDatabaseConnection);
process.on("SIGTERM", closeDatabaseConnection);
