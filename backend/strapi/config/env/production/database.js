module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // Parse the URL, but fall back to PG* parts if you want
      connectionString: env('DATABASE_URL'),
      host:                 env('PGHOST'),
      port:                 env.int('PGPORT', 5432),
      database:             env('PGDATABASE'),
      user:                 env('PGUSER'),
      password:             env('PGPASSWORD'),
      // Railway’s Postgres uses SSL by default
      ssl: env.bool('DATABASE_SSL', true) && { rejectUnauthorized: false },
    },
    // Knex pool settings
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
    // Give Knex more time to grab a connection
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
