require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
let bodyParser = require('body-parser')
let uri =

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number
})

let url = mongoose.model('URL', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let response = {}

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  let data = req.body.url;
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
  response['original_url'] = data;
  let count = 1;

  if(!data.match(urlRegex)){
    response.json({error: 'Invalid URL'})
    return
  }



  try {
    const result = await url.findOne({}).sort({ short: "desc" });
    if (result) {
      count = result.short + 1;
    }

    const savedUrl = await url.findOneAndUpdate(
      { original: data },
      { original:data , short: count },
      { new: true, upsert: true }
    );

    if (savedUrl) {
      response["short_url"] = savedUrl.short;
      res.json(response);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input;

  url.findOne({ short: input })
    .then((result) => {
      if (result != null) {
        res.redirect(result.original);
      } else {
        res.json({ error: 'URL not Found' });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});




app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
