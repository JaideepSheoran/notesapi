const jwt = require('jsonwebtoken');
const env = require('dotenv');
const User = require('../model/userSchema');

const authuser = async (req, res, next) => {
    try {
        if(!req.cookies.Token) throw new Error("Token Not Found");
        const token = req.cookies.Token;
        const verifyToken = await jwt.verify(token, process.env.TOKEN);
        const rootUser = await User.findOne({_id : verifyToken._id});
        if (!rootUser) {
            throw new Error("User Not Found");
        }
        
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
    } catch (error) {
        res.status(401).send('No token provided');
    }
}

module.exports = authuser;