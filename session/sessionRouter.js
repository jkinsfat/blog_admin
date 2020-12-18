'use strict'

const { setUncaughtExceptionCaptureCallback } = require("process");

function session(req, res, next) {
    if (req.session) {
        next();
        return;
    }

    if (!storeReady) {

    
    }

    const originalPath = parseUrl.original(req).pathname || '/';
    if (originalPath.indexOf(cookieOptions.path || '/') !== 0) return next();

    //check if secrets

    req.sessionStore = store;

    onHeaders(res, function )
}

function getCookie(req, name, secrets) {
    const header = req.headers.cookie;
    
    if (header) {
        const cookies = cookie.parse(header);

        const raw = cookies[name];
        if (raw) {
            if (raw.substr(0, 2) === 's:') {
                const val = unsigncookie(raw.slice(2), secrets);

                if (val === false) {
                    console.log('cookie signature invalid');
                    val = undefined;
                }
            } else {
                console.log('cookie unsigned');
            }
        }
    }

    return val;
}

function setCookie(res, name, val, secret, options) {
    let signed = 's:' + signature.sign(val, secret);
    let dat = cookie.serialize(name, signed, options);
    
    //If cookies already exist, append new cookie. Otherwise set to new cookie. 
    let prev = res.getHeader('Set-Cookie') || [];
    let header = Array.isArray(prev) ? prev.concat(data) : [prev, data];

    res.setHeader('Set-Cookie', header);
}

function unsignCookie(val, secrets) {
    secrets.forEach( secret => {
        let result = signature.unsign(val, secret);
        if (result !== false) return result;
    });

    return false;
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