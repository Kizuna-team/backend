const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) =>
{
    console.log('ggg');
    const token = req.headers['authorization']?.split(' ')[1];
    console.log(token);
    if(!token){
        return res.status(401).json({ message: '未帶 token'});
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        req.user = decoded;
        next();
    }catch(err){
        res.status(401).json({message: 'token 無效或過期', reason: err.message});
    }
    console.log("驗證成功，用戶資訊：", req.user);

}

module.exports = authMiddleware;