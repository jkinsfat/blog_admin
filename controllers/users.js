'user strict'
const userService = require('../services/users.js');

async function registerUserAccount(req, res, next) {
    const { uname, email, passwd } = req.body;
    if (areNullOrUndefined(uname, email, passwd)) {
        res.status(400).send("Malformed Request");
    }
    try {
        console.log("awaiting user service");
        let user = await userService.insert(uname, email, passwd);
        res.send(user);
    } catch(e) {
        console.log(e);
        res.status(409).send(e);
    }
}

module.exports = {
    registerUserAccount
}