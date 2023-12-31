const env = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
var cookieParser = require('cookie-parser');
env.config({ path: './config.env' });


app.use(cookieParser());
app.use(express.json());
app.set('trust proxy', 1);

app.use(cors({
    origin: ['https://inotes-react.web.app', 'http://localhost:3000'],
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