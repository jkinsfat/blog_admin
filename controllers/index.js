const indexRouter = require("../routes");

'use strict'

function home(req, res, next) {
    let header = req.headers.authorization || '';
    let [type, token] = header.split(' ');
    if (type === 'Bearer') {

    }
}

module.exports = {
    home
}