require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//enable body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Middleware to see (help visualize as I learn) request object items for GET and POST
app.use((req, res, next) => { 
  console.log({
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });
  next();
});

// URL shortner \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//Helper function to validate URL format
function isValidUrl (urlString) {
  try {
    const url = new URL(urlString);
    //must be http or https protocol
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

const urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // validate the URL
  if (!isValidUrl (originalUrl)) {
    return res.json({error: 'invalid url'});
  }

  // check if URL already exists in database
  const existingUrl = Object.keys(urlDatabase).find(
    key => urlDatabase[key] === originalUrl
  );
 
  if (existingUrl) {
    return res.json({
      original_url : originalUrl,
      short_url : parseInt(existingUrl)
    });
  } 

  //create new short URL
  const shortUrl = urlCounter;
  urlDatabase[shortUrl] = originalUrl;
  urlCounter++;

  res.json({
    original_url : originalUrl,
    short_url : shortUrl
  })
  
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  console.log('shortUrl: ', shortUrl);
  console.log('urlDatabase: ', shortUrl);

  const originalUrl= urlDatabase[shortUrl];
  console.log('Found URL:', originalUrl);

  if (!originalUrl) {
    return res.json({
      error: 'No short URL found'
    });
   }
    res.redirect(originalUrl);
 
});

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

