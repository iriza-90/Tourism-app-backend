const jwt = require('jsonwebtoken');
require('dotenv').config();

function JwtGenerator(payload){
   
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1hr"})
}

module.exports = JwtGenerator;