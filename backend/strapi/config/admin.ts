// backend/strapi/config/admin.js
module.exports = ({ env }) => ({
  // Admin panel JWT secret
  auth: { secret: env('ADMIN_JWT_SECRET') },

  // API token salt
  apiToken: { salt: env('API_TOKEN_SALT') },

  // Transfer token salt
  transfer: { token: { salt: env('TRANSFER_TOKEN_SALT') } },
});