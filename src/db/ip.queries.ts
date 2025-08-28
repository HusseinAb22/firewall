// src/db/ip.queries.ts
import pool from "../config/db.config";
import { IPInterface } from "../interfaces/ip.interface";

// post ipps
export async function addIpRules(ips: string[], mode: IPInterface['mode']) {
    const client = await pool.connect();
    try {
        const insertPromises = ips.map(currentIp => {
            const queryText = 'INSERT INTO ip_rules(ip, mode) VALUES($1, $2) ON CONFLICT (ip) DO NOTHING RETURNING *';
            const queryValues = [currentIp, mode];
            return client.query(queryText, queryValues);
        });
        const results = await Promise.all(insertPromises);
        return results.map(result => result.rows[0]).filter(data => data);
    } finally {
        client.release();
    }
}
// delete ips
export async function deleteIpRules(ips: string[], mode: IPInterface['mode']){
    const client = await pool.connect();
    try{
        const deletePromises = ips.map(currentIp =>{
            // Corrected DELETE query
            const queryText = 'DELETE FROM ip_rules WHERE ip=$1 AND mode=$2 RETURNING *';
            const queryValues= [currentIp, mode];
            return client.query(queryText,queryValues);
        });
        const result = await Promise.all(deletePromises);
        // The result of a DELETE query has a row count, but not necessarily a row
        // So, we'll return the count of deleted rows.
        return result.map(res => res.rowCount);
    } finally{
        client.release();
    }
}
//get all
export async function getIpRulesByMode(mode: 'blacklist' | 'whitelist') {
    const client = await pool.connect();
    try {
        const queryText = 'SELECT id, ip as value FROM ip_rules WHERE mode = $1';
        const result = await client.query(queryText, [mode]);
        return result.rows;
    } finally {
        client.release();
    }
}