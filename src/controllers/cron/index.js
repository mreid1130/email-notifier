import {
  queueSubscriptions,
  sendMail
}
from './userUpdates';
import cron from 'cron';
import primewireScraper from '../primewire.js';

new cron.CronJob('* */30 * * * *', () => {
  console.log('Starting primewire scraper run at', new Date());
  primewireScraper((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Primewire scraper run completed at', new Date());
  });
}, null, true, 'America/Los_Angeles');

// queue subscriptions every hour at the 0 minute mark
new cron.CronJob('* */10 * * * *', () => {
  console.log('Queueing subscriptions at', new Date());
  queueSubscriptions((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Done queueing subscriptions at', new Date());
  });
}, null, true, 'America/Los_Angeles');

// recursive call to receive SQS messages
const receiveQueueMessage = () => {
  sendMail((err) => {
    if (err) {
      console.log(err.stack);
    }
    receiveQueueMessage();
  });
}

receiveQueueMessage();
