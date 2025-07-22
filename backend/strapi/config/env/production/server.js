// backend/strapi/config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080),
  url: env('PUBLIC_URL'),
  app: {
    // Parse the comma‑separated APP_KEYS into an array
    keys: env.array('APP_KEYS'),
  },
});
