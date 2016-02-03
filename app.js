import 'dotenv/config';
import express from 'express';
import cron from './src/controllers/cron';
import http from 'http';

const app = express();

app.set('port', (process.env.PORT || 5000));

// handle any route to ping the server
app.get('*', (req, res) => {
  res.send('pong');
});

// pings server every 30 minutes to keep heroku instance from sleeping
const host = (process.env.NODE_ENV === 'production' ? 'star-wars-notifier.herokuapp.com' : 'localhost')
const port = (process.env.NODE_ENV === 'production' ? null : app.get('port'));
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
}, 15 * 60 * 1000);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
