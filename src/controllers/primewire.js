// scrapes primewire.ag, looking for SWTFA.

import cheerio from 'cheerio';
import request from 'request';
import async from 'async';
import redis from 'redis';
let Subscription = mongoose.model('Subscription');
let redisClient = redis.createClient(process.env.HEROKU_REDIS_URL);
let Media = mongoose.model('Media');

export default (next) => {
  let mediaUrl;
  let found = false;
  let mediaList = [];
  async.waterfall([
    (callback) => {
      request('http://www.primewire.ag/index.php?sort=featured', callback);
    }, (res, body, callback) => {
      const $ = cheerio.load(body, {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true
      });
      $('.index_container .index_item').each((i, elem) => {
        let url = 'http://primewire.ag' + $(elem).find('a:nth-of-type(1)').attr('href');
        let name = $(elem).find('a:nth-of-type(1)').attr('title').replace(/^Watch /, '').replace(/(\(\d{4}\))/g, '').trim();
        let shortname = 'primewire-' + name.replace(/\s|\W/g, '');
        mediaList.push({
          url: url,
          name: name,
          shortname: shortname
        });
      });
      async.eachSeries(mediaList, (movie, cb) => {
        console.log(movie.name);
        var media;
        async.waterfall([
          (cb1) => {
            Media.findOne({
              shortname: movie.shortname,
              title: movie.name
            }).exec(cb1);
          }, (doc, cb1) => {
            if (!doc) {
              media = new Media({
                title: movie.name,
                shortname: movie.shortname
              });
            } else {
              console.log(doc);
              media = doc;
            }
            if (media.found) {
              return cb1(null, null, null);
            }
            request(movie.url, cb1);
          }, (res, body, cb1) => {
            if (res && body) {
              const $ = cheerio.load(body, {
                lowerCaseTags: true,
                lowerCaseAttributeNames: true
              });
              // the first 'real' link is the third in the list of tables. check to see the quality of the rip.
              if ($('.actual_tab table.movie_version:nth-of-type(3) tr:nth-of-type(1) td:nth-of-type(1) span').attr('class') === 'quality_dvd') {
                media.found = true;
                media.foundAt = new Date();
                media.url = movie.url;
              }
              async.parallel([
                (cb2) => {
                  media.save(cb2);
                }, (cb2) => {
                  if (media.found) {
                    Subscription.update({
                      emailSent: false,
                      updating: false,
                      mediaFound: false,
                      media: media
                    }, {
                      mediaFound: true
                    }, {
                      multi: true
                    }).exec(cb2);
                  } else {
                    cb2();
                  }
                }, (cb2) => {
                  if (media.found) {
                    redisClient.set(media.shortname, media.url, cb2);
                  } else {
                    cb2();
                  }
                }
              ], cb1)
            } else {
              cb1(null);
            }
          }
        ], cb);
      }, callback);
    }
  ], next);
}
