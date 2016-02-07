import 'dotenv/config';
import express from 'express';
import http from 'http';

import './src/config/mongoose';
import './src/config/aws';
import cron from './src/controllers/cron/index';
import redis from 'redis';

const app = express();

app.set('port', (process.env.PORT || 5000));

// handle any route to ping the server
app.get('/ping', (req, res) => {
  res.send('pong');
});

// routes ==================================================
import routes from './src/controllers/routes/index';
routes(app);

// pings server every 30 minutes to keep heroku instance from sleeping
const host = (process.env.NODE_ENV === 'production' ? 'star-wars-notifier.herokuapp.com' : 'localhost')
const port = (process.env.NODE_ENV === 'production' ? null : app.get('port'));

// ping server every 30 seconds
setInterval(() => {
  const start = new Date().getTime();
  console.log('Pinging server...')
  http.get({
    host: host,
    path: '/ping',
    port: port
  }, (res) => {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      console.log(body);
      let responseTime = new Date().getTime() - start;
      console.log('Server response in', responseTime, 'milliseconds');
    });
  })
}, 30000);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
