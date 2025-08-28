import express, {Request, Response} from "express";
import ipController from "./controller/ip.controller";
import urlController from "./controller/url.controller";
import portController from "./controller/port.controller";
import rulesController from "./controller/rules.controller";
import pool from "./config/db.config";

const app = express();
app.use(express.json());

app.use('/api/firewall', ipController);
app.use('/api/firewall', urlController);
app.use('/api/firewall', portController);
app.use('/api/firewall', rulesController);

// default endpoint to test
app.get("/",(req: Request, res: Response) =>{
    res.send("server is up and running");
});

// A simple test route to check the database connection
app.get("/db-test", async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release(); // Release the client back to the pool

        res.status(200).json({
            message: "Database connection successful!",
            timestamp: result.rows[0].now,
        });
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).json({
            message: "Failed to connect to the database."
        });
    }
});


export default app;