'use strict'
const loginRouter = require('express').Router();
const bodyParser = require('body-parser');
//Create parser for application/json type data
const jsonParser = bodyParser.json();
//Create parser for application/x-www-form-urlencoded type data
const urlEncodedParser = bodyParser.urlencoded({extended: false});
const loginController = require('../controllers/loginController.js');

loginRouter.get('/', loginController.redirectToLoginPage);
loginRouter.post('/auth', urlEncodedParser, loginController.authenticate);
loginRouter.post('/users', urlEncodedParser, loginController.registerNewUserAccount);

module.exports = loginRouter;