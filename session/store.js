const generateUID = require('../lib/generateuid.js');
const { makeSession, hash } = require('./session.js');
const { makeCookie, setExpiration } = require('./cookie.js');

const save = store =>  async (session) => {
    await store.set(session); 
    //error handling?
    return session;
}

const reload = store => async (session) => {
    const req = session.req;
    const store = req.sessionStore;

    try {
        let session = await store.get(sessionId);
    } catch(err) {
        next(err);
    }
    if (!session) throw new Error('failed to load session');

    //const reloadedSession = store.createSession(req, session);
    return reloadedSession;
}

const destroy = store => async (session) => {
    await store.destroy(session.sessionId);
    delete session.req.session;
    return session;
}

const regenerate = (store, cookieOptions, trustProxy) => async(req) => {
    await destroy(store)(req.sessionId);
    return generate(cookieOptions, trustProxy)(req);
}

const generate = (cookieOptions, trustProxy) => (req) => {
    const sessionId = generateUID(24);
    const cookie = makeCookie(
        cookieOptions.secure === 'auto' ?
        {...cookieOptions, secure: isSecureConnection(req, trustProxy)} :
        cookieOptions
    );
    const session = makeSession(sessionId, cookie, req);
    return session;
};

//Given a session, constructs a new session with the same session id, same cookie settings, and provided request object.
// New session contains the new request object. 
function inflate(req, savedSession) {
    let savedExpiration = savedSession.cookie.expires;
    let savedMaxAgeStart = savedSession.cookie.maxAgeStart;
    let inflatedCookie = makeCookie(savedSession.cookie);
    
    if (typeof expires === 'string') {
        setExpiration.byMilliseconds(inflatedCookie, savedExpiration);
    }
    //keep maxAgeStart intact
    inflatedCookie.maxAgeStart = savedMaxAgeStart;

    let inflatedSession = makeSession(savedSession.sessionId, inflatedCookie, req);
    return inflatedSession;
}
async function touch() {
    return true;
}
function makeStore(store, cookieOptions, trustProxy, storeImplementsTouch) {
    return {
        ...store,
        reload: reload(store),
        destroy: destroy(store),
        regenerate: regenerate(store),
        generate: generate(cookieOptions, trustProxy),
        inflate,
        touch
    }
}

module.exports = {
    makeStore,
}