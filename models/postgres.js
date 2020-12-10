const e = require('express');

'use strict'
const pgBlogConfig = require('../config/postgres.config.js').blog;
const Pool = require('pg').Pool
const pool = new Pool(pgBlogConfig);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
});

module.exports = {
    async query(text, params, withDiagnostics) {
        let response;
        if (withDiagnostics) {
            const start = Date.now();
            response = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('executed query', {text, duration, rows: response.rowCount });
        } else {
            response = await pool.query(text, params);
        }
        return response;
    }, 

    async getClient(withDiagnostics) {
        const client = await pool.connect();

        if (withDiagnostics) {
            const query = client.query;
            const release = client.release;
            //Set 5 second timeout after which we will log clients last query.
            const timeout = setTimeout(() => {
                console.error('A Client has been checked out for more than 5 seconds');
                console.error(`The last executed query on this client was ${client.lastQuery}`);
            }, 5000);

            client.query = (...args) => {
                client.lastQuery = args;
                return query.apply(client, args);
            }
            client.release = () => {
                clearTimeout(timeout);
                client.query = query;
                client.release = release;
                return release.apply(client);
            }
        }
        return client;
    }
}
  