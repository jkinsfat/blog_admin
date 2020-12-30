const { resetExpiration } = require('./cookie.js').setExpiration.reset;
const crypto = require('crypto');

function makeSession(sessionId, cookie, req, userData) {
    let session = Object.assign({}, {cookie}, userData);
    Object.defineProperty(session, 'req', {value: req});
    Object.defineProperty(session, 'sessionId', {value: sessionId});  
    return session;
}

function touch(session) {
    resetExpiration(session.cookie);
    return session;
}

function hash(session) {
    let sessionString = JSON.stringify(session, function(key, val) {
        if (this === session && key === 'cookie') {
            return;
        }
        return val;
    });

    return crypto.createHash('sha1').update(sessionString, 'utf8').digest('hex');
}

const isIdentical = sessionA => {
    const hashOfA = hash(sessionA);
    const sessionAId = sessionA.sessionId;
    return (currentSession) => sessionAId === currentSession.sessionId && hashOfA === hash(currentSession);
}

module.exports = {
    makeSession,
    touch, 
    hash,
    isIdentical
}

