

function regenerate(req, next) {
    
}

function generate(req) {

}

function load(store, sessionId) {

    returns newSession
}


function createSession(req, session) {
    let expires = session.cookie.expires;
    let originalMaxAge = session.cookie.originalMaxAge;

    session.cookie = makeCookie(session.cookie);

    req.session = makeSession(req, session);
    return req.session;
}