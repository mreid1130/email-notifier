import primewireScraper from './primewire.js';
import redis from 'redis';
import {
  Mailgun
}
from 'mailgun';

let client = redis.createClient(process.env.REDIS_URL);
const mg = new Mailgun(process.env.MAILGUN_API_KEY);

const checkPrimewire = () => {
  const emails = ['mark.francis.reid@gmail.com', 'tosharmila@gmail.com', 'sethmlassen@gmail.com'];
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
            console.log('SWTFA found. Finished at', new Date());
            client.set('swtfa', swUrl);
          });
      } else {
        console.log('Nothing found. Finished at', new Date());
      }
    }
  })
};

// check site every hour
setInterval(() => {
  client.get('swtfa', (err, key) => {
    if (!key) {
      console.log('Checking for SWTFA at', new Date());
      checkPrimewire();
    }
  });
}, 1000 * 60);
