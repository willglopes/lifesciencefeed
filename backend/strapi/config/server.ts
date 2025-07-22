module.exports = ({ env } ) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080),
  url: env('PUBLIC_URL', 'https://lifesciencefeed.railway.app' ),
});


/*
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
*/