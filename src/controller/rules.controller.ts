import express, {Request, Response} from "express";
import { getIpRulesByMode, updateIpRulesStatus } from "../db/ip.queries";
import { getUrlRulesByMode, updateUrlRulesStatus } from "../db/url.queries";
import { getPortRulesByMode, updatePortRulesStatus } from "../db/port.queries";
import { RuleUpdateResult } from "../interfaces/ruleUpdateResult.interface";

const router = express.Router();

// retrieves all current firewall rules for IPs, URLs, and ports in both blacklist and white list
router.get("/rules", async (req: Request, res: Response) => {
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
router.put("/rules", async (req: Request, res: Response) => {
    try {
        const { ips, urls, ports } = req.body;
        const updatedRules:RuleUpdateResult[] = [];

        const updatePromises = [];

        if (ips && ips.ids && ips.ids.length > 0) {
            updatePromises.push(updateIpRulesStatus(ips.ids, ips.mode, ips.active));
        }
        if (urls && urls.ids && urls.ids.length > 0) {
            updatePromises.push(updateUrlRulesStatus(urls.ids, urls.mode, urls.active));
        }
        if (ports && ports.ids && ports.ids.length > 0) {
            updatePromises.push(updatePortRulesStatus(ports.ids, ports.mode, ports.active));
        }

        const results = await Promise.all(updatePromises);
        results.forEach(result => updatedRules.push(...result));

        if (updatedRules.length > 0) {
            return res.status(200).json({
                message: "Successfully updated rule statuses.",
                updated: updatedRules
            });
        } else {
            return res.status(404).json({
                message: "No matching rules found to update."
            });
        }
    } catch (err) {
        console.error('API endpoint error during rule update:', err);
        res.status(500).json({
            message: "An unexpected error occurred."
        });
    }
});

export default router;