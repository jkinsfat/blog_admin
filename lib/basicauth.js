'use strict'

const basicAuth = (getUserWithCredentials) => async (req, res, next) => {
    let header = req.headers.authorization || '';
    let [type, payload] = header.split(' ');
    if (type === 'Basic') {
        let credentials = Buffer.from(payload, 'base64').toString('ascii');
        let [username, password] = credentials.split(':');
        let user = await findUserWithCredentials({username, password});
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
            payload = verifyToken(token);
        } catch(e) {
            res.sendStatus(401);
            return;
        }

        let user = findUserByToken(payload);
        if (user) {
            req.user = user;
        } else {
            res.sendStatus(401);
            return;
        }
    }
    next();
}

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
    requiresAuth
}