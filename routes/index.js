'use strict'
const path = require('path');
const indexRouter = require('express').Router();
const indexController = require('../controllers/index.js');

indexRouter.all('*', indexController.home);

module.exports = indexRouter;