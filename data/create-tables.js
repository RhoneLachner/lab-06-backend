const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );  
                CREATE TABLE signs (
                  id SERIAL PRIMARY KEY,
                  sign VARCHAR(512) NOT NULL
              );            
                CREATE TABLE astrology (
                    id SERIAL PRIMARY KEY NOT NULL,
                    sign_id INTEGER NOT NULL REFERENCES signs(id),
                    ruling_planet VARCHAR(20) NOT NULL,
                    mode_fixed BOOLEAN NOT NULL,
                    chill_level INTEGER NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id)
            );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
