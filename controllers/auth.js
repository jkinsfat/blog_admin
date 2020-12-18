'use strict'
const path = require('path');
const auth = require('../lib/auth.js');
const loginView = path.resolve('../views/login.html');
const userService = require('../services/users.js');
const areNullOrUndefined = require('../lib/validate.js');
const signature = process.env.SIGNATURE;

function redirectToLoginPage(req, res, next) {
    res.sendFile(loginView);
}

async function getUserByToken(token) {
    let userID = token.userId;
    let user = await userService.findBy.id(userID);
    return user;
}

const basicAuth = auth.basicAuth(userService.findBy.credentials);

const tokenAuth = auth.tokenAuth(getUserByToken);

const createToken = auth.createToken(signature);
const grantToken = auth.grantToken(userService.findBy.credentials, createToken);

module.exports = {
    basicAuth,
    tokenAuth,
    grantToken,
    redirectToLoginPage,
}