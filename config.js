exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://arbitrator-hamster-48873.netlify.com";

exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || "mongodb://localhost/movie-data";
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_SECRET = process.env.JWT_EXPIRY || "7d";
