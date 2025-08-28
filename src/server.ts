import express, {Request, Response} from "express";
import { ipValidationSchema, portValidationSchema, urlValidationSchema } from "./validation/product.validation";
import { addIpRules, deleteIpRules, getIpRulesByMode } from "./db/ip.queries";
import { addUrlRules, deleteUrlRules, getUrlRulesByMode } from "./db/url.queries"; 
import { URLInterface } from "./interfaces/url.interface";
import { mode } from "./interfaces/mode.interface";
import pool from './config/db.config'; // Import the database pool
import { addPortRules, deletePortRules, getPortRulesByMode } from "./db/port.queries";
import { PortInterface } from "./interfaces/port.interface";

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
app.post("/api/firewall/url", async (req: Request, res: Response) => {
    try {
        const { error, value } = urlValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { url, mode } = value as { url: string | string[], mode: URLInterface['mode'] };
        const urlsToInsert: string[] = Array.isArray(url) ? url : [url];

        const insertedUrls = await addUrlRules(urlsToInsert, mode);

        res.status(201).json({
            type: "url",
            mode: mode,
            values: insertedUrls,
            status: "success"
        });
    } catch (err) {
        console.error('API endpoint error for URL:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});


// removes one or more domain names from the blacklist or whitelist.
app.delete("/api/firewall/url", async (req: Request, res: Response) => {
    try {
        const { error, value } = urlValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { url, mode } = value as { url: string | string[], mode: URLInterface['mode'] };
        const urlsToDelete: string[] = Array.isArray(url) ? url : [url];

        const deletedRows = await deleteUrlRules(urlsToDelete, mode);

        // Check if any rows were deleted
        const filteredRows = deletedRows.filter(count => typeof count === 'number');

        const totalDeleted = filteredRows.reduce((sum, count) => sum + count, 0);

        if (totalDeleted > 0) {
            return res.status(200).json({
                message: `Successfully deleted ${totalDeleted} URL(s).`,
                status: "success"
            });
        } else {
            return res.status(404).json({
                message: "No matching URLs found to delete.",
                status: "not found"
            });
        }

    } catch (err) {
        console.error('API endpoint error for URL:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// adds one or more ports to the blacklist whitelist.
app.post("/api/firewall/port", async (req: Request, res: Response) => {
    try {
        const { error, value } = portValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { port, mode } = value as { port: number | number[], mode: PortInterface['mode'] };
        const portsToInsert: number[] = Array.isArray(port) ? port : [port];

        const insertedPorts = await addPortRules(portsToInsert, mode);

        res.status(201).json({
            type: "port",
            mode: mode,
            values: insertedPorts,
            status: "success"
        });
    } catch (err) {
        console.error('API endpoint error for Port:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// removes one or more ports from the blacklist or whitelist
app.delete("/api/firewall/port", async (req: Request, res: Response) => {
    try {
        const { error, value } = portValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { port, mode } = value as { port: number | number[], mode: PortInterface['mode'] };
        const portsToDelete: number[] = Array.isArray(port) ? port : [port];

        const deletedRows = await deletePortRules(portsToDelete, mode);

        const filteredRows = deletedRows.filter(count => typeof count === 'number');
        const totalDeleted = filteredRows.reduce((sum, count) => sum + count, 0);

        if (totalDeleted > 0) {
            return res.status(200).json({
                message: `Successfully deleted ${totalDeleted} port(s).`,
                status: "success"
            });
        } else {
            return res.status(404).json({
                message: "No matching ports found to delete.",
                status: "not found"
            });
        }
    } catch (err) {
        console.error('API endpoint error for Port:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// retrieves all current firewall rules for IPs, URLs, and ports in both blacklist and white list
app.get("/api/firewall/rules", async (req: Request, res: Response) => {
    try {
        // Fetch all rules in parallel
        const [
            ipsBlacklist,
            ipsWhitelist,
            urlsBlacklist,
            urlsWhitelist,
            portsBlacklist,
            portsWhitelist
        ] = await Promise.all([
            getIpRulesByMode('blacklist'),
            getIpRulesByMode('whitelist'),
            getUrlRulesByMode('blacklist'),
            getUrlRulesByMode('whitelist'),
            getPortRulesByMode('blacklist'),
            getPortRulesByMode('whitelist')
        ]);

        const allRules = {
            ips: {
                blacklist: ipsBlacklist,
                whitelist: ipsWhitelist
            },
            urls: {
                blacklist: urlsBlacklist,
                whitelist: urlsWhitelist
            },
            ports: {
                blacklist: portsBlacklist,
                whitelist: portsWhitelist
            }
        };

        res.status(200).json(allRules);

    } catch (err) {
        console.error('API endpoint error for getting all rules:', err);
        res.status(500).json({
            message: "An unexpected error occurred while retrieving rules."
        });
    }
});

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