const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/astrology', async(req, res) => {
  try {
    const data = await client.query(`
    select 
    astrology.id,
    astrology.ruling_planet,
    astrology.mode_fixed,
    astrology.chill_level
    from astrology
    join signs
    on signs.id = astrology.signs_id
    order by signs.sign desc
    
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.get('/signs', async(req, res) => {
  try {
    const data = await client.query('SELECT * from signs');
  
    res.json(data.rows);
  } catch(e) {
  
    res.status(500).json({ error: e.message });
  }
});


app.get('/astrology/:id', async(req, res) => {
  try {
    const astrologyId = req.params.id;

    const data = await client.query(`
    SELECT
    astrology.id,
    astrology.ruling_planet,
    astrology.mode_fixed,
    astrology.chill_level
    from astrology
    join signs
    on signs.id = astrology.signs_id
    WHERE signs.id = $1
    `,
    [astrologyId]
    );
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


//STILL NEEDED AFTER JOIN???
app.put('/astrology/:id', async(req, res) => {
  try {

    const newSign = req.body.sign;
    const rulingPlanet = req.body.ruling_planet;
    const modeFixed = req.body.mode_fixed;
    const chillLevel = req.body.chill_level;
    const newOwnerId = req.body.owner_id;


    const data = await client.query(`
      UPDATE astrology,
      SET sign = $1, 
      ruling_planet = $2,
      mode_fixed = $3
      chill_level = $4
      owner_id = $5
      WHERE astrology.id = $5
      RETURNING *
    `, 
   
    [newSign, rulingPlanet, modeFixed, chillLevel, newOwnerId, req.params.id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/astrology', async(req, res) => {
  try {
    const newSignId = req.body.sign_id;
    const rulingPlanet = req.body.ruling_planet;
    const modeFixed = req.body.mode_fixed;
    const chillLevel = req.body.chill_level;
    
    const data = await client.query(`
    INSERT INTO astrology (sign, ruling_planet, mode_fixed, chill_level)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [newSignId, rulingPlanet, modeFixed, chillLevel,]);
    res.json(data.rows[0]);
  } catch(e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/astrology/:booger', async(req, res) => {
  try {
    const astrologyId = req.params.booger;

 
    const data = await client.query(`
      DELETE from astrology 
      WHERE astrology.id=$1
    `, 
    
    [astrologyId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
