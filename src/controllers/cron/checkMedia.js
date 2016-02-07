import primewireScraper from '../primewire.js';
import redis from 'redis';
import async from 'async';

export default (next) => {
  let Media = mongoose.model('Media');
  let Subscription = mongoose.model('Subscription');
  let redisClient = redis.createClient(process.env.REDIS_URL);
  let mg = new Mailgun(process.env.MAILGUN_API_KEY);

  async.waterfall([
    (callback) => {
      Media.find({
        found: false
      }).exec(callback);
    }, (docs, callback) => {
      if (docs) {
        async.eachSeries(docs, (media, cb) => {
          checkPrimewire(media, cb);
        }, callback);
      } else {
        callback(new Error('no media unfound'));
      }
    }
  ], next);
};

const checkPrimewire = (media, next) => {
  primewireScraper(media, (err, url) => {
    if (err) {
      console.log(err.stack);
      next(null);
    } else {
      if (url) {
        console.log(media.shortname + ' found. Finished at', new Date());
        media.found = true;
        media.url = url
        media.foundAt = new Date();
        async.parallel([
          (callback) => {
            redisClient.set(media.shortname, url, callback);
          }, (callback) => {
            media.save(callback);
          }, (callback) => {
            Subscription.update({
              emailSent: false,
              updating: false,
              mediaFound: false,
              media: media
            }, {
              mediaFound: true
            }, {
              multi: true
            }).exec(callback);
          }
        ], next);
      } else {
        console.log('Nothing found. Finished at', new Date());
        next(null)
      }
    }
  })
};
