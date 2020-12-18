'use strict'
const userModel = require('../models/user.js');
const crypt = require('./crypt.js');
const vjs = require('../lib/validate.js');
const { getByID } = require('../models/user.js');
const { getDiffieHellman } = require('crypto');

const validate = {
    password: vjs.createPolicy(
        vjs.type.string,
        vjs.value.ofLengthInRange(10, 129),
    ),
    username: vjs.createPolicy(
        vjs.type.string,
        vjs.value.ofLengthInRange(0, 26), 
    ),
    email: vjs.createPolicy(
        vjs.type.emailAddress,
        vjs.value.ofLengthInRange(0, 129),
    )
}

async function insert(username, email, password) {
    if (!(validate.password(password) && validate.email(email) && validate.username(username))) {
        throw new Error('Invalid Value: Cannot create user ' + username + ' with email ' + email + ' and password ' + password);
    }

    let usersWithUsername = await userModel.getByUsername(email);
    if (usersWithUsername.length > 0) throw new Error('Username is already in use');

    const hashedPassword = await crypt.hash(password);
    const user = await userModel.insert(username, email, hashedPassword);
    delete user.password;
    return user;
}

const findBy = {
    async credentials(username, password) {
        let user = await findUser(username);
        if (user && crypt.compare(password, user.password)) {
            delete user.password;
            return user;
        } else {
            return null;
        }
    },
    async username(username) {
        try {
            let user = await userModel.getByUsername(username);
            delete user.password;
            return user;
        } catch(e) {
            return null;
        }
    },
    async id(userID) {
        try {
            let user = await userModel.getByID(userID);
            delete user.password;
            return user;
        } catch(e) {
            return null;
        }
    },
    // async email(emailAddress) {
    //     try 
    // }
}

module.exports = {
    findBy,
    insert,
}