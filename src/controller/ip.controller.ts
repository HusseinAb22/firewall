import express, {Request, Response} from "express";
import { ipValidationSchema } from "../validation/product.validation";
import { addIpRules, deleteIpRules } from "../db/ip.queries";
import {mode} from "../interfaces/mode.interface";
import { logger } from "../config/logger";

const router = express.Router();

// adds one or more IPs to the blacklist or whitelist.
router.post("/ip", async (req: Request, res: Response) => {
    try {
        const { error, value } = ipValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: string | string[], mode: mode };
        const ipsToInsert: string[] = Array.isArray(values) ? values : [values];
        const insertedIps = await addIpRules(ipsToInsert, mode);
        logger.info('POST /api/firewall/ip endpoint was accessed.');
        res.status(201).json({
            type: "ip",
            mode: mode,
            values: insertedIps,
            status: "success"
        });
    } catch (err:any) {
        logger.error(`Error in /api/firewall/ip POST: ${err.message}`);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// Removes one or more IPs from the blacklist or whitelist
router.delete("/ip",async (req: Request, res: Response) =>{
     try {
        const { error, value } = ipValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: string | string[], mode: mode };
        const ipsToDelete: string[] = Array.isArray(values) ? values : [values];
        const deletedIps = await deleteIpRules(ipsToDelete, mode);

        logger.info('POST /api/firewall/ip endpoint was accessed.');
        res.status(200).json({
            type: "ip",
            mode: mode,
            values: deletedIps,
            status: "success"
        });
    } catch (err:any) {
        logger.error(`Error in /api/firewall/ip DELETE: ${err.message}`);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

export default router;