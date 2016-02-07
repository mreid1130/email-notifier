import async from 'async';
const Media = mongoose.model('Media');

export default (app) => {
  app.get('/media', (req, res) => {
    Media.find().exec((err, docs) => {
      if (err) {
        res.send({
          error: err.message
        })
      } else {
        res.send(docs);
      }
    })
  });
};
