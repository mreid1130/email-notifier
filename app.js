import 'dotenv/config';
import express from 'express';
import cron from './src/controllers/cron';
import http from 'http';

const app = express();

app.set('port', (process.env.PORT || 5000));

app.get('*', (req, res) => {
  res.send('pong');
});

const host = (process.env.NODE_ENV === 'production' ? 'star-wars-notifier.herokuapp.com' : 'localhost')
const port = (process.env.NODE_ENV === 'production' ? null : app.get('port'));
setInterval(() => {
  let start = new Date().getTime();
  console.log('Pinging server...')
  http.get({
    host: host,
    path: '/ping',
    port: port
  }, (res) => {
    let responseTime = new Date().getTime() - start;
    console.log('Server response in', responseTime, 'milliseconds');
  })
}, 5000)

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
