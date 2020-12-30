const indexRouter = require("../routes");

'use strict'
const path = require('path');

function home(req, res, next) {
    // let header = req.headers.authorization || '';
    // let [type, token] = header.split(' ');
    // if (type === 'Bearer') {

    // }
    console.log('hello');
    res.sendFile(path.resolve('views/index.html'));
}

module.exports = {
    home
}