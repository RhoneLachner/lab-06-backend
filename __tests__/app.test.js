require('dotenv').config();

const { execSync } = require('child_process');
const { SIGINT } = require('constants');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test.only('returns astrology', async() => {

      const expectation = [
        {
          id: 1,
          sign: 'taurus',
          ruling_planet: 'venus',
          mode_fixed: true, 
          chill_level: 10,
          owner_id: 1
        },
        {
          id: 2,
          sign: 'aquarius',
          ruling_planet: 'uranus',
          mode_fixed: true, 
          chill_level: 3,
          owner_id: 1
        },
        {
          id: 3,
          sign: 'leo',
          ruling_planet: 'sun',
          mode_fixed: true, 
          chill_level: 5,
          owner_id: 1
        },
        {
          id: 4,
          sign: 'scorpio',
          ruling_planet: 'pluto',
          mode_fixed: true, 
          chill_level: 0,
          owner_id: 1
        },
      ];

      const data = await fakeRequest(app)
        .get('/astrology/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    //GET TEST
    test.only('returns a single astrology sign', async() => {
      const expectation = {
        
        id: 1,
        sign_id: 'taurus',
        ruling_planet: 'venus',
        mode_fixed: true, 
        chill_level: 10,
        owner_id: 1
        
      };
  
      const data = await fakeRequest(app)
        .get('/astrology/1')
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(data.body).toEqual(expectation);
    });

    //POST TEST
    test.only('adds an astrology sign item to the DB and returns it', async() => {
      const expectation = {
        id: 5,
        //SHOULD SIGN_ID BE A NUMBER NOW????????
        sign_id: 'gemini',
        ruling_planet: 'mercury',
        mode_fixed: false, 
        chill_level: 0,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/astrology')
        .send({
          sign_id: 'gemini',
          ruling_planet: 'mercury',
          mode_fixed: false, 
          chill_level: 0,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allSigns = await fakeRequest(app)
        .get('/astrology')
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectation);
      expect(allSigns.body.length).toEqual(5);

    });


    //PUT TEST
    test.only('adds an astrology sign item to the DB and returns it', async() => {
   
      const data = await fakeRequest(app)
        .put('/astrology/1')
        .send({
          sign_id: 'gemini',
          ruling_planet: 'mercury',
          mode_fixed: false, 
          chill_level: 0,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);
    
      const signItem = await fakeRequest(app)
        .get('/astrology/1')
        .expect('Content-Type', /json/)
        .expect(200);
    
    
      expect(data.body).toEqual(signItem[0]);
    
    
    });


    //DELETE TEST
  
    test.only('deletes an astrology item by id', async() => {
      const data = await fakeRequest(app)
        .delete('/astrology/4')
        .expect('Content-Type', /json/)
        .expect(200);

      const allSigns = await fakeRequest(app)
        .get('/astrology')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual('');
      expect(allSigns.body.length).toEqual(3);
    });


  });
});
