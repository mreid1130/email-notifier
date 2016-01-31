import primewireScraper from './primewire.js';
import redis from 'redis';
import {
  Mailgun
}
from 'mailgun';

let client = redis.createClient();
const mg = new Mailgun(process.env.MAILGUN_API_KEY);

const checkPrimewire = () => {
  const emails = ['mark.francis.reid@gmail.com']
  primewireScraper((err, swUrl) => {
    if (err) {
      console.log(err.stack);
    } else {
      if (swUrl) {
        mg.sendText('mark.francis.reid@gmail.com', emails,
          'STAR WARS IS HERE!',
          'Watch here: ' + swUrl, (err) => {
            if (err) {
              console.log(err.stack);
            }
            client.set('swtfa', swUrl);
          });
      }
    }
  })
};

// check site every hour
setInterval(() => {
  client.get('swtfa', (err, key) => {
    if (!key) {
      checkPrimewire();
    }
  });
}, 1000 * 60 * 60);
