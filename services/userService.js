'use strict'
const userModel = require('../models/userModel.js');
const crypt = require('./cryptService.js');
const vjs = require('../lib/validate.js');

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

async function createUser(username, email, password) {
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


async function fetchUserByEmail(username) {
    try {
        let user = await userModel.getByUsername(username);
        return user;
    } catch(e) {
       return undefined;
    }
}

async function authenticate(username, password) {
    let user = await findUser(username);
    if (user && crypt.compare(password, user.password)) {
        delete user.password;
        return user;
    } else throw new Error(`Invalid password provided for user ${user.username}`);
}

// async function userExists(username, email) {
//     try {
    
//     }
// }

module.exports = {
    fetchUser,
    createUser,
    authenticate,
}