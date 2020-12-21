// bring in express vars
const express = require('express');
const app = express();

//environment
const dotenv = require('dotenv');
dotenv.config();

// bring in middleware
const morgan = require('morgan');

// mongoose
const mongoose = require('mongoose');

// other imports
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// bring in routes (reference entire class)
const postRoutes = require('./routes/post')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

/************END OF BRINGING THINGS IN*********** */

// database
mongoose.connect(process.env.MONGO_URI, 
    { useNewUrlParser: true }
)
.then(() => console.log('DB Connected'))

mongoose.connection.on('error', err => {
    console.log(`DB connection error: ${err.message}`);
});


// middleware
app.use(morgan('dev')); //Prints to console the type of request sent
app.use(bodyParser.json()); // Any request with a body will be parsed
app.use(cookieParser());
app.use(expressValidator()); // Allows to use 'check()' functions
app.use(cors());
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: "Unauthorized" })
    }
});


// port listener
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`A Node Js API is listening on port: ${port}`);
});