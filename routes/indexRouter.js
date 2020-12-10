'use strict'
const path = require('path');
const indexRouter = require('express').Router();
const indexPath = path.resolve('views/index.html');

indexRouter.all('*', (req, res) => {
    res.sendFile(indexPath);
});

module.exports = indexRouter;