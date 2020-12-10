const { response } = require("../app");
const db = require('./postgres.js');

module.exports = {
    async insert (name, email, password) {
        try {
            const { rows } = await db.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [name, email, password]
            );
            return rows;
        } catch(e) {
            console.log("error while inserting new user " + e);
        }
    },
    async getByID(id) {
        try {
            db.query('SELECT * FROM users WHERE id = $1', [id])
        } catch (e) {
            console.log("error while fetching user " + username + " " + e);
        }
    },
    async getByUsername(username) {
        try {
            const  { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            return rows;
        } catch(e) {
            console.log("error while getting user " + username + " " + e);
        }
        
    },
    async getByEmail(email) {
        try {
            const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            return rows;
        } catch(e) {
            console.log("error while getting user with email " + email + " " + e);
        }
    },
    async getByEmailOrUsername(username, email) {
        const { rows } = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2', 
            [username, email]
        );
        return rows;
    },

    async delete(id) {
        db.query('DELETE FROM users WHERE id = $1', [id]);
    },
};