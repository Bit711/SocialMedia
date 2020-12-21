const mongoose = require('mongoose');
let uuidv1 = require('uuidv1');
console.log(uuidv1());
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, 
        required: true
    },
    email: {
        type: String,
        trim: true, 
        required: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String, 
    created: {
        type: Date, 
        default: Date.now
    },
    updated: Date,
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    },
    // following array
    following: [{
        type: ObjectId,
        ref: "User"
    }],
    // followers array
    followers: [{
        type: ObjectId,
        ref: "User"
    }],
    resetPasswordLink: {
        data: String,
        default: ""
    }, 
    role: {
        type: String, 
        default: "subscriber"
    }
});

// hash password and save hashed version in DB
userSchema.virtual('password')
.set(function(password) {
    this._password = password
    this.salt = uuidv1()
    this.hashed_password = this.encryptPassword(password);
})
.get(function() {
    return this._password
});

// methods
userSchema.methods = {

authenticate: function(plainText) {
    return this.encryptPassword(plainText) == this.hashed_password;
},

    encryptPassword: function(password) {
        if(!password) return "";
        try {
            // sha1 is the encryption
            // salt is the key
            return crypto.createHmac('sha1', this.salt)
                        .update(password)
                        .digest('hex');
        } catch (err) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);