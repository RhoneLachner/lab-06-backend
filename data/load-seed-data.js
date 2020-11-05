const client = require('../lib/client');
// import our seed data:
const astrology = require('./astrology.js');
const signs = require('./signs.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');



run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      signs.map(item => {
        return client.query(`
                    INSERT INTO signs (sign)
                    VALUES ($1)
                    RETURNING *;
                `,
        [item.sign]);
      })
    );
    
    await Promise.all(
      astrology.map(astrology => {
        return client.query(`
                    INSERT INTO astrology (sign_id, ruling_planet, mode_fixed, chill_level, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [astrology.sign_id, astrology.ruling_planet, astrology.mode_fixed, astrology.chill_level, user.id]);
      })
    );


    
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
