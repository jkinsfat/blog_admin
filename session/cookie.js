const pick = require('../lib/pick.js');

function makeCookie(options) {
    const { maxAge, maxAgeStart } = options;
    const defaultCookie = {
        path: '/',
        maxAge: maxAge,
        httpOnly: true,
        secure: false,
        maxAgeStart: maxAgeStart,
    }
    const completeCookie = {
        ...defaultCookie, ...options
    }
    return completeCookie;
}

const setExpiration = {
    byDate: function(cookie, date) {
        cookie.expires = date;
        cookie.maxAgeStart = cookie.maxAge;
        return cookie;
    },
    byMilliseconds: function(cookie, ms) {
        cookie.expires = new Date(Date.now() + ms);
        cookie.maxAgeStart = cookie.maxAge;
        return cookie;
    },
    reset: function(cookie) {
        cookie.maxAge = cookie.maxAgeStart;
        return cookie;
    }
}

function serialize(cookie, name, val) {
    return cookie.serialize(name, val, data);
}

function extractData(cookie) {
    return pick( cookie, 
        'maxAgeStart',
        'expires',
        'secure',
        'httpOnly',
        'domain',
        'path',
        'sameSite'
    );
}

module.exports = {
    makeCookie,
    setExpiration,
    serialize,
    extractData
}
