import async from 'async';
const User = mongoose.model('User');
const Media = mongoose.model('Media');
const Subscription = mongoose.model('Subscription');

export default (app) => {
  app.post('/subscribe', (req, res) => {
    var user;
    var media;
    var subscription;
    if (!req.body || !req.body.userEmail || !req.body.media || !req.body.media.shortname || !req.body.media.title) {
      res.status(400).send('Missing parameters');
    } else {
      async.waterfall([
        (callback) => {
          User.findOne({
            email: req.body.userEmail
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
            title: req.body.media.title,
            shortname: req.body.media.shortname
          }).exec(callback)
        }, (doc, callback) => {
          if (!doc) {
            return callback('media not found');
          } else {
            media = doc;
          }
          Subscription.findOne({
            user: user,
            media: media
          }).exec(callback);
        }, (doc, callback) => {
          if (doc) {
            return callback('already subscribed to this media')
          }
          subscription = doc;
          subscription.mediaFound = media.found;
          async.parallel([
            (cb) => {
              user.save(cb);
            }, (cb) => {
              subscription.save(cb);
            }
          ], callback)
        }
      ], (err) => {
        if (err) {
          res.status(400).send({
            error: error
          });
        } else {
          res.send('subscription creation complete');
        }
      });
    }
  });
};
