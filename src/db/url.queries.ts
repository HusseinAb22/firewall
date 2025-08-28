import pool from "../config/db.config";
import { URLInterface } from "../interfaces/url.interface"; // Assuming you have a URLInterface

//post url
export async function addUrlRules(urls: string[], mode: URLInterface['mode']) {
    const client = await pool.connect();
    try {
        const insertPromises = urls.map(currentUrl => {
            const queryText = 'INSERT INTO url_rules(url, mode) VALUES($1, $2) ON CONFLICT (url) DO NOTHING RETURNING *';
            const queryValues = [currentUrl, mode];
            return client.query(queryText, queryValues);
        });
        const results = await Promise.all(insertPromises);
        return results.map(result => result.rows[0]).filter(data => data); // Filter out nulls from DO NOTHING
    } finally {
        client.release();
    }
}

//delete url
export async function deleteUrlRules(urls: string[], mode: URLInterface['mode']) {
    const client = await pool.connect();
    try {
        const deletePromises = urls.map(currentUrl => {
            const queryText = 'DELETE FROM url_rules WHERE url=$1 AND mode=$2 RETURNING url as value';
            const queryValues = [currentUrl, mode];
            return client.query(queryText, queryValues);
        });
        const result = await Promise.all(deletePromises);
        return result.flatMap(res => res.rows.map(row => row.value));
    } finally {
        client.release();
    }
}

//get all urls 
export async function getUrlRulesByMode(mode: 'blacklist' | 'whitelist') {
    const client = await pool.connect();
    try {
        const queryText = 'SELECT id, url as value FROM url_rules WHERE mode = $1';
        const result = await client.query(queryText, [mode]);
        return result.rows;
    } finally {
        client.release();
    }
}

//update url rule
export async function updateUrlRulesStatus(ids: number[], mode: string, active: boolean) {
    const client = await pool.connect();
    try {
        const queryText = `
            UPDATE url_rules
            SET active = $1
            WHERE id = ANY($2) AND mode = $3
            RETURNING id, url as value, active
        `;
        const queryValues = [active, ids, mode];
        const result = await client.query(queryText, queryValues);
        return result.rows;
    } finally {
        client.release();
    }
}