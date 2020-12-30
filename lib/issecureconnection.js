'use strict'

module.exports = function isConnectionSecure(req, trustProxy) {
    // socket is https server
    if (req.connection && req.connection.encrypted) {
      return true;
    }
  
    // do not trust proxy
    if (trustProxy === false) {
      return false;
    }
  
    // no explicit trust; try req.secure from express
    if (trustProxy !== true) {
      return req.secure === true
    }
  
    // read the proto from x-forwarded-proto header
    var header = req.headers['x-forwarded-proto'] || '';
    var index = header.indexOf(',');
    var proto = index !== -1
      ? header.substr(0, index).toLowerCase().trim()
      : header.toLowerCase().trim()
  
    return proto === 'https';
}