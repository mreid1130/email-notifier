import async from 'async';
const User = mongoose.model('User');
const Media = mongoose.model('Media');
const Subscription = mongoose.model('Subscription');

export default (app) => {
  app.post('/subscribe', (req, res) => {
    var user;
    var media;
    var subscription;
    if (!req.body || !req.body.userEmail || !req.body.shortname || !req.body.title) {
      res.status(400).send('Missing parameters');
    } else {
      async.waterfall([
        (callback) => {
          User.findOne({
            localAuth: {
              email: req.body.userEmail
            }
          }).exec(callback);
        }, (doc, callback) => {
          if (!doc) {
            user = new User({
              localAuth: {
                email: req.body.userEmail
              }
            });
          } else {
            user = doc;
          }
          Media.findOne({
            title: req.body.title,
            shortname: req.body.shortname
          }).exec(callback);
        }, (doc, callback) => {
          if (!doc) {
            return callback(new Error('media not found'));
          } else {
            media = doc;
          }
          Subscription.findOne({
            user: user,
            media: media
          }).exec(callback);
        }, (doc, callback) => {
          if (doc) {
            return callback(new Error('already subscribed to this media'))
          } else {
            subscription = new Subscription({
              user: user,
              media: media,
              mediaFound: media.found
            });
          }
          async.parallel([
            (cb) => {
              user.save(cb);
            }, (cb) => {
              subscription.save(cb);
            }
          ], callback);
        }
      ], (err) => {
        if (err) {
          res.status(400).send({
            error: err.message
          });
        } else {
          res.send('subscription creation complete');
        }
      });
    }
  });
};
