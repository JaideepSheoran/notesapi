const env = require('dotenv');
const express = require('express');
const app = express();
var cookieParser = require('cookie-parser');
env.config({ path: './config.env' });
app.use(cookieParser());
app.use(express.json()); // middleware
// Creating DB Connection
require('./db/conn');
// End Here


app.use(require('./router/auth'));

app.all('*', (req, res) => {
    res.status(404).send('<h1>404! Page not found</h1>');
});


app.listen(process.env.PORT, () => {
    console.log(`Working at port ${process.env.PORT}`);
})