const mongoose = require('mongoose');

const DB = process.env.DATABASE;

// console.log(DB);

mongoose.connect(DB).then(() => {
    console.log('CONNECTED OK');
}).catch(() => {
    console.log('Unable to Connect');
})