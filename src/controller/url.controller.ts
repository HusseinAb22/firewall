import express, {Request, Response} from "express";
import { urlValidationSchema } from "../validation/product.validation";
import { addUrlRules, deleteUrlRules } from "../db/url.queries";
import { URLInterface } from "../interfaces/url.interface";

const router = express.Router();


// adds one or more domain names o the blacklist or whitelist
router.post("/url", async (req: Request, res: Response) => {
    try {
        const { error, value } = urlValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: string | string[], mode: URLInterface['mode'] };
        const urlsToInsert: string[] = Array.isArray(values) ? values : [values];

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
router.delete("/url", async (req: Request, res: Response) => {
    try {
        const { error, value } = urlValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details,
            });
        }

        const { values, mode } = value as { values: string | string[], mode: URLInterface['mode'] };
        const urlsToDelete: string[] = Array.isArray(values) ? values : [values];


        const deletedRows = await deleteUrlRules(urlsToDelete, mode);

        // Check if any rows were deleted
        const filteredRows = deletedRows.filter(count => typeof count === 'number');

        const deletedUrls = filteredRows.reduce((sum, count) => sum + count, 0);

        res.status(200).json({
            type: "url",
            mode: mode,
            values: deletedUrls,
            status: "success"
        });

    } catch (err) {
        console.error('API endpoint error for URL:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

export default router;