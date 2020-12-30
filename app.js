const path = require('path');
const express = require('express');
const app = express();
const sessionManagerConfig = require('./config/sessionmanager.config.js');

const sessionManager = require('./session/sessionmanager.js')(sessionManagerConfig);
const indexRouter = require('./routes/index.js');
const loginRouter = require('./routes/users.js');
const tokensRouter = require('./routes/tokens.js')
const auth = require('./controllers/auth.js');
app.use(express.static(path.join(__dirname, '/public')));

app.use(sessionManager.route);
app.use('/', indexRouter);
app.use('/tokens', tokensRouter);
app.use(auth.tokenAuth);
app.use(auth.basicAuth);

app.use('/login', loginRouter);
app.disable('x-powered-by');
module.exports = app;