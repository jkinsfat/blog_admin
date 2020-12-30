'use strict'
const { randomBytes } = require('crypto');

module.exports = function generateUID(bytes) {
    let byteBuffer = randomBytes(bytes);
    return byteBuffer.toString('base64')
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}