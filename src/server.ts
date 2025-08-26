import express, {Request, Response} from "express";

const app = express();

// default endpoint to test
app.get("/",(req: Request, res: Response) =>{
    res.send("server is up and running");
});

// adds one or more IPs to the blacklist or whitelist.
app.post("/api/firewall/ip",(req: Request, res: Response) =>{});

// Removes one or more IPs from the blacklist or whitelist
app.delete("/api/firewall/ip",(req: Request, res: Response) =>{});

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


export default app;