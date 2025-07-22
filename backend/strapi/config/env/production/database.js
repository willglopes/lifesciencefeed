// config/env/production/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: env('DATABASE_URL'),
    ssl: { rejectUnauthorized: false },
    pool: { min: 0, max: 5 },
  },
  settings: {
    forceMigration: true,
    runMigrations: true,
  },
});
console.log('DATABASE_URL is:', env('DATABASE_URL'));