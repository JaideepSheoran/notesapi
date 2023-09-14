const env = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
var cookieParser = require('cookie-parser');
env.config({ path: './config.env' });

const allowedOrigins = ['https://inotes-react.web.app'];


app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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