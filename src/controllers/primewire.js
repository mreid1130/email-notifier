// scrapes primewire.ag, looking for SWTFA.

import cheerio from 'cheerio';
import request from 'request';
import async from 'async';

export default (media, next) => {
  let mediaUrl;
  let found = false;
  async.waterfall([
    (callback) => {
      request('http://www.primewire.ag/index.php?sort=featured', callback);
    }, (res, body, callback) => {
      const $ = cheerio.load(body, {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true
      });
      $('.index_container .index_item').each((i, elem) => {
        // checks all titles to check for a name match
        if ($(elem).find('a:nth-of-type(1)').attr('title').replace(/^Watch /, '').match(new RegExp(media.title), 'gi')) {
          // if found, set the mediaUrl
          mediaUrl = 'http://primewire.ag' + $(elem).find('a:nth-of-type(1)').attr('href');
        }
      });
      if (mediaUrl) {
        request(mediaUrl, callback);
      } else {
        callback(null, null, null);
      }
    }, (res, body, callback) => {
      if (res && body) {
        const $ = cheerio.load(body, {
          lowerCaseTags: true,
          lowerCaseAttributeNames: true
        });
        // the first 'real' link is the third in the list of tables. check to see the quality of the rip.
        if ($('.actual_tab table.movie_version:nth-of-type(3) tr:nth-of-type(1) td:nth-of-type(1) span').attr('class') === 'quality_dvd') {
          found = true;
        }
        callback(null);
      } else {
        callback(null);
      }
    }
  ], (err) => {
    if (found) {
      next(err, mediaUrl);
    } else {
      next(err, null);
    }
  });
}
