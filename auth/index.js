const { router } = require("./router");
const { basicStrategy, JwtStrategy } = require("./strategies");

module.exports = { router, basicStrategy, JwtStrategy };
