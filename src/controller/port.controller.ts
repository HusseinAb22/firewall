import express, {Request, Response} from "express";
import { portValidationSchema } from "../validation/product.validation";
import { addPortRules, deletePortRules } from "../db/port.queries";
import { PortInterface } from "../interfaces/port.interface";
import { logger } from "../config/logger";


const router = express.Router();
// adds one or more ports to the blacklist whitelist.
router.post("/port", async (req: Request, res: Response) => {
    try {
        const { error, value } = portValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: number | number[], mode: PortInterface['mode'] };
        const portsToInsert: number[] = Array.isArray(values) ? values : [values];

        const insertedPorts = await addPortRules(portsToInsert, mode);

        logger.info('POST /api/firewall/port endpoint was accessed.');
        res.status(201).json({
            type: "port",
            mode: mode,
            values: insertedPorts,
            status: "success"
        });
    } catch (err) {
        logger.error(`Error in /api/firewall/port DELETE: ${err}`);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

// removes one or more ports from the blacklist or whitelist
router.delete("/port", async (req: Request, res: Response) => {
    try {
        const { error, value } = portValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: number | number[], mode: PortInterface['mode'] };
        const portsToDelete: number[] = Array.isArray(values) ? values : [values];

        const deletedPorts = await deletePortRules(portsToDelete, mode);

        logger.info('DELETE /api/firewall/port endpoint was accessed.');
        res.status(200).json({
            type: "port",
            mode: mode,
            values: deletedPorts,
            status: "success"
        });
        
    } catch (err) {
        logger.error(`Error in /api/firewall/port DELETE: ${err}`);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

export default router;