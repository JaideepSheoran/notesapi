const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('dotenv');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    phone : {
        type: Number,
        required: true
    },
    work : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    token: {
        type: String
    }
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.getAuthToken = async function(){
    try {
        this.token = await jwt.sign({_id : this._id}, process.env.TOKEN);
        await this.save();
        return this.token;
    } catch (error) {
        console.log(error);
    }
};

const User = mongoose.model('USER', userSchema);

module.exports = User;
