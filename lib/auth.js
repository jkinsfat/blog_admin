'use strict'
const jwt = require('jsonwebtoken');

const basicAuth = (getUserWithCredentials) => async (req, res, next) => {
    let header = req.headers.authorization || '';
    let [type, payload] = header.split(' ');
    if (type === 'Basic') {
        let credentials = Buffer.from(payload, 'base64').toString('ascii');
        let [username, password] = credentials.split(':');
        let user = await getUserWithCredentials({username, password});
        if (user) {
            req.user = user;
        } else {
            res.sendStatus(401);
            return; 
        }
    }
    next();
};

const tokenAuth = (getUserWithToken) => async (req, res, next) => {
    let header = req.headers.authorization || '';
    let [type, token] = header.split(' ');

    if (type === 'Bearer') {
        let payload = {};
        try {
            payload = jwt.verify(token, signature);
        } catch(e) {
            res.sendStatus(401);
            return;
        }

        let user = getUserWithToken(payload);
        if (user) {
            req.user = user;
        } else {
            res.sendStatus(401);
            return;
        }
    }
    next();
}

const createToken = signature => userID => 
    jwt.sign(
        { userId: userID },
        signature,
        { expiresIn: process.env.EXPIREIN }
    );

const grantToken = (getUserWithCredentials, createToken) => async (req, res) => {
    let { username, password } = req.body;
    let user = await getUserWithCredentials(username, password);
    if (user && user.id) {
        let token = createToken(user.id);
        res.status(201).send(token);
    } else {
        res.sendStatus(422);
    }
};

const requiresAuth = (req, res, next) => {
    console.log(req.user);
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    basicAuth,
    tokenAuth,
    createToken,
    grantToken,
    requiresAuth,
}