const bcrypt = require('bcrypt');
const { cost, minor } = require('../config/bcrypt.config.js');

function makeHashingFunction(cost, minor) {
    return async data => await bcrypt.hash(data, bcrypt.genSaltSync(cost, minor));
}

module.exports = {
    hash: makeHashingFunction(cost, minor),
    compare: async (data, encrypted) => await bcrypt.compare(data, encrypted),
}