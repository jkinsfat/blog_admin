const { randomBytes } = require('crypto');

function pick(object, keys) {
    return keys.reduce((obj, key) => {
        if (object && object.hasOwnProperty(key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
}

function generateUID(bytes) {
    let byteBuffer = crypto.randomBytes(bytes);
    return byteBuffer.toString('base64')
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function makeCookie(options) {
    const { maxAge, maxAgeStart } = options;
    const defaultCookie = {
        path: '/',
        maxAge: maxAge,
        httpOnly: true,
        maxAgeStart: maxAgeStart,
    }
    const completeCookie = {
        ...defaultCookie, ...options
    }
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
        cookie.maxAgeStart = cookie.maxAge;
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
