'use strict'
const userRouter = require('express').Router();
const userController = require('../controllers/users.js');

const bodyParser = require('body-parser');
//Create parser for application/json type data
const jsonParser = bodyParser.json();
//Create parser for application/x-www-form-urlencoded type data
const urlEncodedParser = bodyParser.urlencoded({extended: false});


userRouter.post('/', urlEncodedParser, userController.registerUserAccount);

module.exports = userRouter;