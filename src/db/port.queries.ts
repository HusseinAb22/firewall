// src/db/port.queries.ts
import pool from "../config/db.config";
import { PortInterface } from "../interfaces/port.interface";

//post method adding a port to db
export async function addPortRules(ports: number[], mode: PortInterface['mode']) {
    const client = await pool.connect();
    try {
        const insertPromises = ports.map(currentPort => {
            const queryText = 'INSERT INTO port_rules(port, mode) VALUES($1, $2) ON CONFLICT (port) DO NOTHING RETURNING *';
            const queryValues = [currentPort, mode];
            return client.query(queryText, queryValues);
        });
        const results = await Promise.all(insertPromises);
        return results.map(result => result.rows[0]).filter(data => data);
    } finally {
        client.release();
    }
}
// delete method / deleting a port from db
export async function deletePortRules(ports: number[], mode: PortInterface['mode']) {
    const client = await pool.connect();
    try {
        const deletePromises = ports.map(currentPort => {
            const queryText = 'DELETE FROM port_rules WHERE port=$1 AND mode=$2 RETURNING *';
            const queryValues = [currentPort, mode];
            return client.query(queryText, queryValues);
        });
        const result = await Promise.all(deletePromises);
        return result.map(res => res.rowCount);
    } finally {
        client.release();
    }
}