// backend/strapi/config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080),
  url: env('PUBLIC_URL'),
  app: {
    // Strapi’s session middleware needs this array of keys:
    keys: env.array('APP_KEYS'),
  },
});
