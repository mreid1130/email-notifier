import 'dotenv/config';
import express from 'express';
import cron from './src/controllers/cron'

const app = express();

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
