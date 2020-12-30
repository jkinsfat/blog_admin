'use strict'
const { debug } = require("console");
const isSecureConnection = require('../lib/issecureconnection.js');
const generateUID = require('../lib/generateuid.js');
const signature = require('../lib/cookiesignature.js');
const CookieHeader = require('cookie');
const parseUrl = require('parseurl');
const onHeaders = require('on-headers');
const Cookie = require('./cookie.js');
const Session = require('./session.js');
const Store = require('./store.js');
const SessionDB = require('./sessiondb.js');
const issecureconnection = require("../lib/issecureconnection.js");
const { isIdentical } = require("./session.js");
const defer = typeof setImmediate === 'function' ?
    setImmediate :
    function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

function createSessionManagerSettings(options) {
    options = options || {};
    const cookieOptions = options.cookie || {};

    return {
        cookieOptions,
        generateId: options.genid || generateUID,
        cookieName: options.name || 'connect.sid',
        store: Store.makeStore(options.store, cookieOptions, options.proxy),
        trustProxy: options.proxy,
        resaveInitializedSessions: options.resave,
        hasRollingSessions: !!options.rolling,
        saveUninitializedSession: options.saveUninitialized,
        secret: options.secret,
        destroy: options.destroy || true,
        storeImplementTouch: typeof options.store.touch === 'function',
    }
}

function SessionManager(options) {
    const settings = createSessionManagerSettings(options);
    const SessionStore = settings.store;

    return {
        route: async function(req, res, next) {
            //If session exists on request, execute callback.
            if (req.session) {
                next();
                return;
            }
            //check if the pathname is mismatched.
            const originalPath = parseUrl.original(req).pathname || '/';
            if (originalPath.indexOf(settings.cookieOptions.path || '/') !== 0) return next();

            //check if secret is in options or given by client?
            if (!settings.secret && !req.secret) next(new Error('Secret is required to establish sessions'));
            const secrets = settings.secret || [req.secret];

            //get the session ID from the cookie
            const clientSessionId = unsignSessionCookieValue(getCookieValue(req, settings.cookieName), settings.secret);
            //initialize session data on request object
            setUninitializedSessionData(req, clientSessionId);

            //When Headers are set, determines if session cookie should be set and does so accordingly. 
            onHeaders(res, handleSessionOnHeaders(req, settings.cookieOptions, settings.trustProxy, SessionStore));

            //Add proxy end function to manage sessions when response is ended
            req.ended = false;
            res.end = makeEndProxy(req, res, next, settings);

            
            let savedSession;
            //Search for a session iff request has a valid signed sessionId
            if (clientSessionId) {
                try {
                    savedSession = await SessionStore.get(clientSessionId);
                } catch(err) {
                    if (err.code !== 'ENOENT') {
                        console.log('Error %j');
                        next(err);
                    } 
                }
            }
            let sessionData = savedSession ? 
                SessionStore.inflate(req, savedSession) :
                SessionStore.generate(req);
            
            req.sessionId = req._exchange.sessionId = sessionData.sessionId;
            req.session = sessionData;
            
            req._exchange.isUnmodified = isIdentical(sessionData);
            if (savedSession && settings.resaveInitalizedSessions) {
                req._exchange.isSaved = isIdentical(sessionData);
            }
            console.log(sessionData);
            next();
        },
        //touch: SessionStore.touch,
        save: SessionStore.save,
        reload: SessionStore.reload,
        destroy: SessionStore.destroy,
        //regenerate: SessionStore.regenerate,
    }
}

function setUninitializedSessionData(req, cookieSessionId) {
    req.sessionId = cookieSessionId;
    req.session = null;
    req._exchange = {
        cookieId: cookieSessionId,
        isUnmodified: session => true,
        isLastSaved: session => false,
        touched: false,
    }
}

function getCookieValue(req, cookieName) {
    const cookieHeader = req.headers.cookie;
    
    if (cookieHeader) {
        const parsedCookieHeader = CookieHeader.parse(cookieHeader);
        if (parsedCookieHeader.hasOwnProperty(cookieName)) {
            return parsedCookieHeader[cookieName];
        }
    }
    return null;
}

function unsignSessionCookieValue(signedCookieValue, secrets) {
    if (signedCookieValue && signedCookieValue.substr(0, 2) === 's:') {
        const unsignedSession = unsignCookie(signedCookieValue.slice(2), secrets);
        if (unsignedSession) {
            return unsignedCookieVaue;
        } else {
            console.log('Cookie signature invalid');
        }
    } else {
        console.log('Cookie unsigned');
    }
    return null;
}

function serializeCookie(cookieName, cookieValue, cookieOptions) {
    return CookieHeader.serialize(cookieName, cookieValue, cookieOptions);
}

function setCookieOnHeader(res, cookieData) {
    //If other cookies already exist, append new cookie. 
    //Otherwise set header to new cookie.
    let prevData = res.getHeader('Set-Cookie') || [];
    let cookieHeader = Array.isArray(prevData) ?
        prevData.concat(cookieData) : 
        [prevData, cookieData];
    res.setHeader('Set-Cookie', cookieHeader);
    return res;
}

function makeSessionCookie(sessionCookieName, sessionCookieValue, secret, cookieOptions) {
    let signedSessionCookieValue = 's:' + signature.sign(sessionCookieValue, secret);
    return serializeCookie(sessionCookieName, signedSessionCookieValue, cookieOptions);
}

function unsignCookie(cookieValue, secrets) {
    secrets.forEach( secret => {
        let result = signature.unsign(cookieValue, secret);
        if (result !== false) return result;
    });

    return false;
}

function isNewSession(req) {
    return req._exchange.cookieId !== req.sessionId;
}

function shouldSetSessionCookie(req, saveUninitializedSession, hasRollingSessions) {
    if (typeof req.sessionID !== 'string') {
        return false;
    }

    if (isNewSession(req) && saveUninitializedSession) {
        return !req._exchange.isUnmodified(req.session);
    } else if (hasRollingSessions) {
        return req.session.cookie.expires != null && !req._exchange.isUnmodified(req.session);
    }
    return false;
}

//If the session data of the request object is unset and the session manager is configured to delete unset session, will return true. Otherwise returns false.
function shouldDestroySession(req, unsetDestroy) {
    return req.sessionId && unsetDestroy && req.session == null;
}

//Sessions should be saved if they are 
function shouldSaveSession(req, saveUninitializedSessions) {
    if (typeof req.sessionId !== 'string') {
        console.log('Cannot save session. Session Id %o is fake', req.sessionId);
        return false;
    }
    if (isNewSession(req) && !saveUninitializedSessions) {
        return !req._exchange.isUnmodified(req.session); 
    } 
    return !req._exchange.isLastSaved(req.session);
}

//Sessions should be touched if they are not new and should not be saved. 
function shouldTouchSession(req) {
    if (typeof req.sessionId !== 'string') {
        console.log('Ignoring session with fake ID %o', req.sessionId);
        return false;
    }
    return !(isNewSession(req) || shouldSaveSession(req));
}

//TODO: clarify function signature
function handleSessionOnHeaders(req, cookieOptions, trustProxy, store) { 
    return async function() {
        let res = this;
        console.log(req.sessionId);
        if (!req.session) {
            console.log('No Session Data');
            return;
        }
        if (!shouldSetSessionCookie(req, saveUninitializedSessions, hasRollingSessions)) {
            return;
        } 

        if (req.session.cookie.secure && !issecureconnection(req, trustProxy)) {
            console.log('Connection Not Secure');
            return;
        }

        if (!req._exchange.touched) {
            await store.touch(session);
            req._exchange.touched = true;
        }

        setCookieOnHeader(
            res, 
            makeSessionCookie(settings.cookieName, req.sessionId, cookieOptions)
        );
    }
}

function makeEndProxy(req, res, next, sessionManagerSettings) {
    const _end = res.end;
    const _write = res.write;
    const storeImplementTouch = sessionManagerSettings.storeImplementTouch;
    const store = sessionManagerSettings.store;

    return async (chunk, encoding, endCallback) => {
        if (req.ended) return false;
        req.ended = true;

        //Returns true is the data was flushed successfully. False if all or part of data was queued in in user memory.
        function write(res, chunk, encoding) {
            //If Response Headers not saved, implicitly generate and save them.
            if (!res._header) res._implicitHeader();
            //If no chunk to write, then the chunk was successfully flushed;
            if (chunk === null) return true;

            let contentLength = Number(res.getHeader('Content-Length'));
            if (!isNaN(contentLength) && contentLength > 0) {
                //If chunk is a string, convert to a buffer. 
                bufferedChunk = !Buffer.isBuffer(chunk) ? Buffer.from(chunk, encoding) : chunk;      
                return _write.call(res, bufferedChunk);
            }
            return _write.call(res, chunk, encoding);
        }

        // Destroy Session 
        if (shouldDestroySession(req)) {
            try {
                await store.destroy(req.sessionId);
            } catch(err) {
                defer(next, err);
            }
            write(res, chunk, encoding);
            _end.call(res, undefined, undefined, endCallback);
        }

        //No session to save
        if (!req.session) {
            return _end.call(res, chunk, encoding, endCallback);
        }

        //Put touched variable in request?/
        if (!req._exchange.touched) {
            req.session = store.touch(req.session);
            req._exchange.touched = true;
        }

        if (shouldSaveSession(req)) {
            try {
                await store.save(req);
                req._exchange.isSaved = isIdentical(req.session);
            } catch(err) {
                defer(next, err);
            }
            write(res, chunk, encoding);
            _end.call(res, undefined, undefined, endCallback);
        } else if (shouldTouchSession(req, storeImplementTouch)) {
            store.touch(req);
            write(res, chunk, encoding);
            _end.call(res, undefined, undefined, endCallback);
        }

        return _end.call(res, chunk, encoding, endCallback);
    }
}

module.exports = SessionManager;