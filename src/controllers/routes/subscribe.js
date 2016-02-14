import async from 'async';
const User = mongoose.model('User');
const Media = mongoose.model('Media');
const Subscription = mongoose.model('Subscription');

export default (app) => {
  app.get('/subscriptions', (req, res) => {
    Subscription.find().populate('user media').exec((err, docs) => {
      if (err) {
        res.send({
          error: err.message
        });
      } else {
        res.send(docs);
      }
    });
  });

  app.post('/subscribe', (req, res) => {
    var user;
    var media;
    var subscription;
    if (!req.body || !req.body.userEmail || !req.body.title) {
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
          if (req.body.shortname) {
            Media.findOne({
              shortname: req.body.shortname
            }).exec(callback);
          } else {
            Media.findOne({
              title: req.body.title,
              found: false
            }).exec(callback);
          }
        }, (doc, callback) => {
          if (!doc) {
            if (!req.body.shortname) {
              media = new Media({
                userCreated: true,
                title: req.body.title,
                found: false,
                shortname: req.body.title.replace(/\s|\W/g, '')
              });
            } else {
              return callback(new Error('Error finding media with given title and shortname'));
            }
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
            }, (cb) => {
              media.save(cb);
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
