import env from 'dotenv';
env.config();
import jwt from "jsonwebtoken";

const accessAuthorization = (req, res, next) => {
    const header = req.headers.authorization;

    if(header){
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.SECRET, (err, authorizedData) => {
            if(err) {
                res.status(403).json({status: false, message: "session_expired"})
		        return;
            }

            if(!authorizedData) {
                console.log('an error occured in token verification!')
		        res.status(403).json({status: false, message: "session_expired"})
		        return;
            }

            req.userId = authorizedData?.id;
            next();
        })
    }else{
        console.log('Authorization-Token is required');
        res.status(403).json({ status: false, message: 'session_expired' });
        return;
    }
};

module.exports = {
    accessAuthorization
};