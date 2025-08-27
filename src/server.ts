import express, {Request, Response} from "express";
import { ipValidationSchema } from "./validation/product.validation";
import { addIpRules, deleteIpRules } from "./db/ip.queries";
import { mode } from "./interfaces/mode.interface";
import pool from './config/db.config'; // Import the database pool

const app = express();
app.use(express.json());


// default endpoint to test
app.get("/",(req: Request, res: Response) =>{
    res.send("server is up and running");
});

// adds one or more IPs to the blacklist or whitelist.
app.post("/api/firewall/ip", async (req: Request, res: Response) => {
    try {
        const { error, value } = ipValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { ip, mode } = value as { ip: string | string[], mode: mode };
        const ipsToInsert: string[] = Array.isArray(ip) ? ip : [ip];
        const insertedIps = await addIpRules(ipsToInsert, mode);

        res.status(201).json({
            type: "ip",
            mode: mode,
            values: insertedIps,
            status: "success"
        });
    } catch (err) {
        console.error('API endpoint error', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// Removes one or more IPs from the blacklist or whitelist
app.delete("/api/firewall/ip",async (req: Request, res: Response) =>{
     try {
        const { error, value } = ipValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { ip, mode } = value as { ip: string | string[], mode: mode };
        const ipsToInsert: string[] = Array.isArray(ip) ? ip : [ip];
        const deletedIps = await deleteIpRules(ipsToInsert, mode);

        res.status(200).json({
            type: "ip",
            mode: mode,
            values: value,
            status: "success"
        });
    } catch (err) {
        console.error('API endpoint error', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// adds one or more domain names o the blacklist or whitelist
app.post("/api/firewall/url",(req: Request, res: Response) =>{});

// removes one or more domain names from the blacklist or whitelist.
app.delete("/api/firewall/url",(req: Request, res: Response) =>{});

// adds one or more ports to the blacklist whitelist.
app.post("/api/firewall/port",(req: Request, res: Response) =>{});

// removes one or more ports from the blacklist or whitelist
app.delete("/api/firewall/port",(req: Request, res: Response) =>{});

// retrieves all current firewall rules for IPs, URLs, and ports in both blacklist and white list
app.get("/api/firewall/rules",(req: Request, res: Response) =>{});

// removes one or more domain names from the black list or whitelist
app.put("/api/firewall/rules",(req: Request, res: Response) =>{});


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