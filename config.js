exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://arbitrator-hamster-48873.netlify.com";

exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || "mongodb://localhost:27017/movie-data";
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || "avengers";
exports.JWT_SECRET = process.env.JWT_EXPIRY || "7d";
