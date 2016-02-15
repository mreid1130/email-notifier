import {
  queueSubscriptions,
  sendMail,
  checkUserMedia
}
from './userUpdates';
import cron from 'cron';
import primewireScraper from '../primewire.js';

new cron.CronJob('00 */5 * * * *', () => {
  console.log('Starting primewire scraper run at', new Date());
  primewireScraper((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Primewire scraper run completed at', new Date());
  });
}, null, true, 'America/Los_Angeles');

// queue subscriptions every hour at the 0 minute mark
new cron.CronJob('00 */2 * * * *', () => {
  console.log('Queueing subscriptions at', new Date());
  queueSubscriptions((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Done queueing subscriptions at', new Date());
  });
}, null, true, 'America/Los_Angeles');

// update user created media every 10 minutes
new cron.CronJob('30 */10 * * * *', () => {
  console.log('Updating custom user media at', new Date());
  checkUserMedia((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Done updating user media at', new Date());
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
};

receiveQueueMessage();
