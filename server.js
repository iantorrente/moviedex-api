require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./moviedex.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  
  //I'm finding that Postman doesn't return an authorization with `req.get('Authorization') so I've been going around that issue by using `req.querry.Authorization` when testing with Postman and then switching it to line 16 after I'm done
  // const authToken = req.query.Authorization;

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  //move to the next middleware
  next();
});

const validGenres = [
  'animation', 'drama', 'romantic', 'comedy', 'spy', 'crime', 'thriller', 'adventure', 'documentary', 'horror', 'action', 'western', 'history', 'biography', 'musical', 'fantasy', 'war', 'grotesque', ''
]

function handleGetMovie(req, res) {
  let response = MOVIEDEX;

  if (req.query.genre && validGenres.includes(req.query.genre.toLowerCase())) {
    response = response.filter(movie => 
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    )
  }

  if (req.query.country) {
    response = response.filter(movie => 
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    );
  }

  if (req.query.avg_vote) {
    response = response.filter(movie => {
      if (movie.avg_vote >= req.query.avg_vote) {
        return movie
      }
    })
  }
  res.json(response);
}

app.get('/movie', handleGetMovie);

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT =  process.env.PORT || 8000

app.listen(PORT, () => {})