module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('PGHOST'),
      port: env.int('PGPORT', 5432),
      database: env('PGDATABASE'),
      user: env('PGUSER'),
      password: env('PGPASSWORD'),
      ssl: env.bool('DATABASE_SSL', false)
    },
    debug: false,
  },
});
