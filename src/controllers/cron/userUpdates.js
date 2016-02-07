import {
  Mailgun
}
from 'mailgun';
const sqs = new AWS.SQS();
const params = {
  QueueUrl: process.env.QUEUE_URL
};
const Subscription = mongoose.model('Subscription');

export function queueSubscriptions(next) {
  var stream = Subscription.find({
    mediaFound: true,
    emailSent: false
  }).populate('user media').stream();
  var numSubsFound = 0;
  var numSubsProcessed = 0;
  var updateSubsQueue = [];

  stream.on('data', (subscription) => {
    numSubsFound++;
    if (subscription.user && subscription.media) {
      var params = {
        MessageBody: JSON.stringify({
          user: subscription.user,
          media: subscription.media
        }),
        QueueUrl: process.env.QUEUE_URL
      };
      updateSubsQueue.push(params);
    }
  }).on('end', () => {
    console.log('\nStream ended. There were ' + numSubsFound + ' subscriptions changed.  Now sending them to queue.');
    async.eachLimit(updateSubsQueue, 100, (sqsMessage, callback) => {
      numSubsProcessed++;
      sqs.sendMessage(sqsMessage, callback);
    }, (err) => {
      if (err) {
        console.log(err.stack);
        next(err, '\nError occurred while sending to queue. Error is: \n' + err.stack + '. \nNumber of subscriptions: ' + numSubsFound + '. \nNumber of queued subscriptions: ' + numSubsProcessed + '.');
      } else {
        console.log('\n\nFinished sending all ' + numSubsProcessed + ' subscriptions to queue.');
        next(err, '\nNumber of subscriptions: ' + numSubsFound + '. \nNumber of queued subscriptions: ' + numSubsProcessed + '.');
      }
    });
  }).on('error', (err) => {
    console.log('\nStream errored.\n');
    console.log(err.stack);
    next(err, '\nError occurred while streaming.  Error is: \n' + err.stack + '. \nNumber of subscriptions: ' + numSubsFound + '. \nNumber of queued subscriptions: ' + numSubsProcessed + '.');
  }).on('close', (err) => {
    console.log('\nStream closed.\n');
  });
};


export function sendMail(next) {
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log(err.stack);
      next(err);
    } else {
      if (data.Messages) {
        let messageBody = '';
        const sqsDeleteParams = {
          QueueUrl: process.env.QUEUE_URL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        try {
          messageBody = JSON.parse(data.Messages[0].Body);
        } catch (err) {
          return next(err);
        }
        let media = messageBody.media;
        let user = messageBody.user;
        mg.sendText('mark.francis.reid@gmail.com', user.localAuth.email,
          media.title.toUpperCase() + ' IS HERE!',
          'Watch here: ' + media.url, (err) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log('Mail sent to: ' + user.localAuth.email + '. Finished at', new Date());
            }
            next(err);
          }
        );
      }
    }
  });
};
