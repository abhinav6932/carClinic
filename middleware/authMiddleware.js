const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
    const token=req.session.userId
    if(!token){
        return res.json({
            message:"not logged in"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
    }
    catch(error){
        res.json({
            message:"invalid token"
        })
    }

};

module.exports = authMiddleware;
