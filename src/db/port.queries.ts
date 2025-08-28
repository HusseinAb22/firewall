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

//get all ports
export async function getPortRulesByMode(mode: 'blacklist' | 'whitelist') {
    const client = await pool.connect();
    try {
        const queryText = 'SELECT id, port as value FROM port_rules WHERE mode = $1';
        const result = await client.query(queryText, [mode]);
        return result.rows;
    } finally {
        client.release();
    }
}

//update port rule 
export async function updatePortRulesStatus(ids: number[], mode: string, active: boolean) {
    const client = await pool.connect();
    try {
        const queryText = `
            UPDATE port_rules
            SET active = $1
            WHERE id = ANY($2) AND mode = $3
            RETURNING id, port as value, active
        `;
        const queryValues = [active, ids, mode];
        const result = await client.query(queryText, queryValues);
        return result.rows;
    } finally {
        client.release();
    }
}