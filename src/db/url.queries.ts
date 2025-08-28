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
            const queryText = 'DELETE FROM url_rules WHERE url=$1 AND mode=$2 RETURNING *';
            const queryValues = [currentUrl, mode];
            return client.query(queryText, queryValues);
        });
        const result = await Promise.all(deletePromises);
        return result.map(res => res.rowCount);
    } finally {
        client.release();
    }
}