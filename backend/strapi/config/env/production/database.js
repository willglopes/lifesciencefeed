module.exports = ({ env }) => {
  console.log('=== DATABASE CONFIG DEBUG ===');
  console.log('DATABASE_HOST:', env('DATABASE_HOST'));
  console.log('DATABASE_NAME:', env('DATABASE_NAME'));
  console.log('DATABASE_USER:', env('DATABASE_USER'));
  console.log('DATABASE_PORT:', env('DATABASE_PORT'));
  console.log('DATABASE_PASSWORD exists:', !!env('DATABASE_PASSWORD'));
  console.log('==============================');
  
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USER'),
        password: env('DATABASE_PASSWORD'),
        ssl: env.bool('DATABASE_SSL', false)
      },
      debug: false,
    },
  };
};
