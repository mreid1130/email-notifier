import async from 'async';
const User = mongoose.model('User');

export default (app) => {
  app.get('/users', (req, res) => {
    User.find().exec((err, docs) => {
      if (err) {
        res.send({
          error: err.message
        });
      } else {
        res.send(docs);
      }
    });
  });
};
