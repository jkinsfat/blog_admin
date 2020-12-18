'use strict'
const Router = require('express').Router;
const bodyParser = require('body-parser');
const authController = require('../controllers/auth');
const tokensRouter = Router();

tokensRouter.post('/', bodyParser.json(), authController.grantToken);

module.exports = tokensRouter;