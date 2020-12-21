const User = require('../models/user');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');

// this is the method that finds user in DB based on the userId in the URL
// runs every time userId is present in the URL
exports.userById = (req, res, next, id) => {
    User.findById(id)
    // populate followers and following users array
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "User not found"
            });
        };
        // userById is sort of acts like middleware
        // by populating req.profile = user you are able
        // to reference the users information using req.profile
        req.profile = user;
        next();
    })
};

exports.hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if(!authorized) {
        return res.status(403).json({
            error: "User is not authorized to perform this action"
        });
    }
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if(err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json(users);
    }).select("name email updated created role")
};

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile);
};


exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Photo could not be loaded"
            })
        }
        // save user
        let user = req.profile
        user = _.extend(user, fields)
        user.updated = Date.now()

        if(files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }

        user.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: err
                })
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        })
    })
};

exports.userPhoto = (req, res, next) => {
    if(req.profile.photo.data) {
        res.set("Content-Type", req.profile.photo.contentType)
        return res.send(req.profile.photo.data);
    }
    next();
}

exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    user.remove((err, user) => {
        if(err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({messaage: "User deleted successfully"});
    });
};

// follow unfollow
exports.addFollowing = (req, res, next) => {
  
    User.findByIdAndUpdate(
        // users ID
        req.body.userId, 
        // ID of person user is following
        {$push: {following: req.body.followId}}, 
        (err, result) =>{
        if(err) {
            return res.status(400).json({error: err})
        }
        next();
    })
};

exports.addFollower = (req, res) => {
    User.findByIdAndUpdate(
            // ID of person the user is now following
            req.body.followId, 
            // add user to the persons follower list
            {$push: {followers: req.body.userId}}, 
            {new: true}

            )
            .populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, result) => {
                if(err) {
                    return res.status(400).json({
                        error: err
                    })
                }
                result.hashed_password = undefined;
                result.salt = undefined;
                res.json(result);
            })
};

exports.removeFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId, 
        {$pull: {following: req.body.unfollowId}}, 
        (err, result) =>{
        if(err) {
            return res.status(400).json({error: err})
        }
        next();
    })
};


exports.removeFollower = (req, res) => {
    User.findByIdAndUpdate(
            req.body.unfollowId, 
            {$pull: {followers: req.body.userId}}, 
            {new: true}

            )
            .populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, result) => {
                if(err) {
                    return res.status(400).json({
                        error: err
                    });
                }
                result.hashed_password = undefined;
                result.salt = undefined;
                res.json(result)
            });
};

exports.findPeople = (req, res) => {
    let following = req.profile.following
    following.push(req.profile._id)
    // nin === not included
    // retrieve all id's from DB not in user's following array
    User.find({_id: {$nin: following}}, (err, users) => {
        if(err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json(users)
    }).select("name");
};