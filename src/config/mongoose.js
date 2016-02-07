import fs from 'fs';

global.mongoose = require('mongoose').connect(process.env.MONGO_URL);
global.mongoose.connection.on('error', (err) => {
  console.log(err.stack);
});

fs.readdirSync(__dirname + '/../models').forEach((filename) => {
  if (filename.indexOf('.js')) {
    // need to use Node's require to dynamically import these models
    require('../models/' + filename);
  }
});
