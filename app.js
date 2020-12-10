const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const loginRouter = require('./routes/loginRouter.js');

app.use(express.static(path.join(__dirname, './public/')));
app.use('/', loginRouter);
app.disable('x-powered-by');
module.exports = app;