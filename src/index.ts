import "dotenv/config";
import express from "express";
import useDatabase from "@/utils/database";
import initializeBlockchain from "@/utils/initializeBlockchain";
import * as h from "@/handlers";

const app = express();
app.use(express.json());

/** Keeps track of if the server is ready to process incoming requests */
let connected = false;

const PORT = process.env.PORT || 8000;

// Headers to use for CORS check
const headers = {
	"Access-Control-Max-Age": 86400,
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "OPTIONS,GET,POST",
	"Access-Control-Allow-Credentials": "true",
};

// Intercept all incoming requests if the server is not ready
app.use((_, res, next) => {
	if (!connected) return res.sendStatus(418);
	next();
});

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

// Start the server & connect to database
app.listen(PORT, async () => {
	const { client } = useDatabase();
	try {
		await client.connect();
		connected = true;
		console.log(`Database connected & server started on port ${PORT}: ${new Date()}`);
		initializeBlockchain();
	} catch {
		console.error("Database connection failed, exiting...");
		process.exit(1);
	}
});

// Endpoints registerd below this
app.get("/logs", h.getLogs);
app.post("/transfer", h.transferAmount);
app.get("/balance/:address", h.getBalance);

// Callback function to close database connection on exiting app
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
