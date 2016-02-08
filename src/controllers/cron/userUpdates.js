import {
  Mailgun
}
from 'mailgun';
import async from 'async';
const mg = new Mailgun(process.env.MAILGUN_API_KEY);
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
    if (subscription.user && subscription.media) {
      numSubsFound++;
      var params = {
        MessageBody: JSON.stringify({
          subscription: subscription
        }),
        QueueUrl: process.env.QUEUE_URL
      };
      updateSubsQueue.push(params);
    }
  }).on('end', () => {
    if (numSubsFound) {
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
    } else {
      console.log('\nStream ended. There were ' + numSubsFound + ' subscriptions changed.');
      next();
    }
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
        let subscription = messageBody.subscription;
        mg.sendText('mark.francis.reid@gmail.com', subscription.user.localAuth.email,
          subscription.media.title.toUpperCase() + ' IS HERE!',
          'Watch here: ' + subscription.media.url, (err) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log('Mail sent to: ' + subscription.user.localAuth.email + '. Finished at', new Date());
            }
            sqs.deleteMessage(sqsDeleteParams, (err, data) => {
              if (err) {
                console.log(err.stack);
              }
              subscription.emailSent = true;
              Subscription.findOne({
                _id: subscription._id
              }).exec((err, doc) => {
                if (err) {
                  next(err);
                } else {
                  doc.emailSent = true;
                  doc.save(next);
                }
              });
            });
          }
        );
      } else {
        setTimeout(() => {
          next();
        }, 2000)
      }
    }
  });
};
