'use strict'
const path = require('path');
const loginView = path.resolve('views/login.html');
const userService = require('../services/userService.js');
const areNullOrUndefined = require('../lib/validate.js');

function redirectToLoginPage(req, res, next) {
    res.sendFile(loginView);
}

async function registerNewUserAccount(req, res, next) {
    const { uname, email, passwd } = req.body;
    if (areNullOrUndefined(uname, email, passwd)) {
        res.status(400).send("Malformed Request");
    }
    try {
        console.log("awaiting user service");
        let user = await userService.createUser(uname, email, passwd);
        res.send(user);
    } catch(e) {
        console.log(e);
        res.status(409).send(e);
    }
}

async function authenticate(req, res, next) {
    const { uname, password } = req.body;
    if (areNullOrUndefined())
    let [username, password] = credentials.split(':');
    try {
        let user = await getUserByCredentials({ username, password });
        res.send(user);
    } catch {
        res.sendStatus(401);
    }
};

module.exports = {
    authenticate,
    redirectToLoginPage,
    registerNewUserAccount,
}