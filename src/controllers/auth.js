import User from '../models/User';
import bycrpt from 'bcryptjs';
import initializeDb from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import sendMailMessage from '../services/sendMail';
import jwt from 'jsonwebtoken';
import { json } from 'body-parser';

export const register = async (req, res) => {
    const { fullName, phoneNumber, email, password } = req.body;
    try {
        const newPassword = await bycrpt.hash(password, 12);
        const otp = Math.floor((Math.random() * 1324) + 1090);
        const id = uuidv4();
        console.log('Incoming: ', req.body);

        await initializeDb().beginTransaction();
        const selectUser = `SELECT * FROM users WHERE email='${email}'`;
        const selectNewUser = `SELECT * FROM users WHERE _id='${id}' AND status='not_verify'`;
        const insertUser = `INSERT INTO users (_id, email, password, fullName, phoneNumber, code) VALUES ('${id}', '${email}', '${newPassword}', '${fullName}', '${phoneNumber}', '${otp}')`;

        //Check if user exist
        const foundUser = await initializeDb().query(selectUser);
        await initializeDb().commit();
        if (foundUser.length > 0) {
            res.status(202).json({ message: 'exist' });
        } else {
            const newUser = await initializeDb().query(insertUser);
            if (newUser.affectedRows > 0) {
                const userData = await initializeDb().query(selectNewUser);
                await initializeDb().commit();
                //Mail Body
                const receiver = userData[0].email;
                const subject = '20kobo SMS Confirm Registration'
                const mailMessage = `<h1>20kobo SMS</h1><br />
                                     <p>Please Complete your registration with this link 
                                     <a href='http://localhost:3001/v1/auth/verify/${id}/${otp}'>Verify</a> <br />
                                     <h3> OR </h3> <br />
                                     Use this OTP: ${otp}
                                     </p>`;
                sendMailMessage(receiver, subject, mailMessage);
                res.status(200).json(userData);
            } else {
                res.status(500).json({ message: 'Interner server error' });
            }
        }
    } catch (error) {
        if (error) {
            await initializeDb().rollback();
            res.status(400).json({ message: error.sqlMessage });
        }
    } finally {
        await initializeDb().close();
    }
};

export const verify = async (req, res) => {
    const { id, otp } = req.params;
    const selectUser = `SELECT * FROM users WHERE _id='${id}' OR email='${id}' AND code='${otp}'`;
    const updateUser = `UPDATE users SET status='verified' WHERE _id='${id}' OR email='${id}'`;
    try {
        //Verify if user hold otp
        await initializeDb().beginTransaction();
        const userData = await initializeDb().query(selectUser);
        if (userData.length > 0) {
            const isVerified = await initializeDb().query(selectUser);
            if (isVerified[0].status === 'not_verify') {
                await initializeDb().query(updateUser);
                const newUserData = await initializeDb().query(selectUser);
                //Sign in user
                const newData = newUserData[0];
                const token = jwt.sign({ email: newData.email, id: newData._id }, process.env.SECRET, { expiresIn: '48h' });

                res.status(200).json({ status: true, data: { token, newData } });
            } else {
                res.status(203).json({ message: 'Account verified' });
            }
        } else {
            res.status(203).json({ status: false });
        }
    } catch (error) {
        if (error) {
            await initializeDb().rollback();
            res.status(500).json({ message: error.sqlMessage })
        }
    } finally {
        await initializeDb().close();
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const selectUser = `SELECT * FROM users WHERE email='${email}'`;

    try {
        await initializeDb().beginTransaction();
        //Check user
        const userData = await initializeDb().query(selectUser);
        if (userData.length === 0)
            res.status(400).json({ status: false, message: 'You details does not match an account' });

        //Check if account is verified
        if (userData[0].status !== 'verified')
            res.status(400).json({ status: false, message: 'Account not verified', data: userData[0] });

        //Check Password
        const isPasswordCorrect = await bycrpt.compare(password, userData[0].password);
        if (!isPasswordCorrect)
            res.status(400).json({ status: false, message: 'Your password did not match the account' });

        const token = jwt.sign({ email: userData[0].email, id: userData[0]._id }, process.env.SECRET, { expiresIn: '48h' });

        const newData = userData[0];
        res.status(200).json({ status: true, data: { token, newData } });
    } catch (error) {
        await initializeDb().rollback();
    } finally {
        await initializeDb().close();
    };
};

export const recoverAccount = async (req, res ) => {
    const { email } = req.params;
    try {
            const otp = Math.floor((Math.random() * 1324) + 1090);
            await initializeDb().beginTransaction();
            const emailVar = initializeDb().escape(email);
            const selectUser = `SELECT * FROM users WHERE email=${emailVar}`;
        
            //check if user exist
            const userData = await initializeDb().query(selectUser);
            if(userData.length > 0){
                const checkOtp = `SELECT * FROM otpdb WHERE userId='${userData[0]._id}'`;
                const otpData = await initializeDb().query(checkOtp);
                //Check if otp with user Id is found 
                if(otpData.length > 0){
                    const deleteQry = `DELETE FROM otpdb WHERE userId='${userData[0]._id}'`;
                    await initializeDb().query(deleteQry);
                    const insertQry = `INSERT INTO otpdb (userId, code) VALUES ('${userData[0]._id}', '${otp}')`;
                    const otpInsert = await initializeDb().query(insertQry);
                    if(otpInsert.affectedRows > 0){
                        //Mail Body
                        const receiver = userData[0].email;
                        const subject = '20kobo SMS Account Recovery'
                        const mailMessage = `<h1>20kobo SMS</h1><br />
                                            <p>Please complete your account recovery with this link 
                                            <a href='http://localhost:3000/changePassword/${userData[0]._id}/${otp}'>Reset Password</a> <br />
                                            
                                            </p>`;
                        const mailNow = sendMailMessage(receiver, subject, mailMessage);
                        if(!mailNow){
                            throw ('Mail fail try again');
                        }
                    }else{
                        throw ('OTP not registered try again')
                    }
                }else{
                    //Otp not found insert new one
                    const insertQry = `INSERT INTO otpdb (userId, code) VALUES ('${userData[0]._id}', '${otp}')`;
                    const otpInsert = await initializeDb().query(insertQry);
                    if(otpInsert.affectedRows > 0){
                        //Mail Body
                        const receiver = userData[0].email;
                        const subject = '20kobo SMS Account Recovery'
                        const mailMessage = `<h1>20kobo SMS</h1><br />
                                            <p>Please complete your account recovery with this link 
                                            <a href='http://localhost:3000/changePassword/${userData[0]._id}/${otp}'>Reset Password</a> <br />
                                            
                                            </p>`;
                        const mailNow = sendMailMessage(receiver, subject, mailMessage);
                        if(!mailNow){
                            throw ('Mail fail try again');
                        }
                    }else{
                        throw ('OTP not registered try again')
                    }
                }
            }else{
                throw ('User not found');
            }
            await initializeDb().commit();
            res.status(200).json(userData);
    } catch (error) {
        if (error) {
            await initializeDb().rollback();
            if(error?.sqlMessage){
                console.log('Error: ',error.sqlMessage);
                res.status(400).json({ message: error.sqlMessage });
            }else{
                res.status(401).json({ message: error });
            }
        }
    } finally {
        await initializeDb().close();
    }
};

export const changePassword = async (req, res) => {
    const { id, otp, password } = req.body;
    try {
        const userId = initializeDb().escape(id);
        const code = initializeDb().escape(otp);
        const checkOtpQry = `SELECT * FROM otpdb WHERE userId=${userId} AND code=${code}`;
        const otpData = await initializeDb().query(checkOtpQry);
        //if user with the request otp is found
        if(otpData.length > 0){
            const newPassword = await bycrpt.hash(password, 12);
            const updatePassword = `UPDATE users SET password='${newPassword}' WHERE _id=${userId}`;
            const updateUser = await initializeDb().query(updatePassword);
            //check if password is updated
            if(updateUser.affectedRows > 0){
                const deleteOtpQry = `DELETE FROM otpdb WHERE userId=${userId}`;
                await initializeDb().query(deleteOtpQry);
                res.status(200).json({message: "Success"});
            }else{
                throw ('Password not updated try again');
            }
        }else{
            throw ('Invalid OTP for this user');
        }
    } catch (error) {
        if(error?.sqlMessage){
            res.status(400).json({message: error.sqlMessage});
        }else{
            res.status(400).json({message: error?.message});
        }
        await initializeDb().rollback();
    }
}