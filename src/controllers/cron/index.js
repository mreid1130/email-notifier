import checkMedia from './checkMedia';
import {
  queueSubscriptions,
  sendMail
}
from './userUpdates';
import cron from 'cron';

// check for new media every hour at the 30 minute mark
new cron.CronJob('* 30 * * * *', () => {
  console.log('Checking for media at', new Date());
  checkMedia((err) => {
    if (err) {
      console.log(err.stack);
    }
    console.log('Done checking for new media at', new Date());
  });
}, null, true, 'America/Los_Angeles');

// queue subscriptions every hour at the 0 minute mark
new cron.CronJob('* 00 * * * *', () => {
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
