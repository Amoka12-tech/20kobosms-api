import User from '../models/User';
import bycrpt from 'bcryptjs';
import initializeDb from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import sendMailMessage from '../services/sendMail';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const {fullName, phoneNumber, email, password } = req.body;
    try {
        const newPassword = await bycrpt.hash(password, 12);
        const otp = Math.floor((Math.random() * 1324) + 1090);
        const id = uuidv4();
        console.log('Incoming: ',req.body);
        
        await initializeDb().beginTransaction();
        const selectUser = `SELECT * FROM users WHERE email='${email}'`;
        const selectNewUser = `SELECT * FROM users WHERE _id='${id}' AND status='not_verify'`;
        const insertUser = `INSERT INTO users (_id, email, password, fullName, phoneNumber, code) VALUES ('${id}', '${email}', '${newPassword}', '${fullName}', '${phoneNumber}', '${otp}')`;

        //Check if user exist
        const foundUser = await initializeDb().query(selectUser);
        await initializeDb().commit();
        if(foundUser.length > 0){
            res.status(202).json({message : 'exist'});
        }else{
            const newUser = await initializeDb().query(insertUser);
            if(newUser.affectedRows > 0){
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
            }else{
                res.status(500).json({message: 'Interner server error'});
            }
        }
    } catch (error) {
        if(error){
            await initializeDb().rollback();
            res.status(400).json({message: error.sqlMessage});
        }
    } finally{
        await initializeDb().close();
    }
};

export const verify = async (req, res) => {
    const {id, otp} = req.params;
    const selectUser = `SELECT * FROM users WHERE _id='${id}' OR email='${id}' AND code='${otp}'`;
    const updateUser = `UPDATE users SET status='verified' WHERE _id='${id}' OR email='${id}'`;
    try {
        //Verify if user hold otp
        await initializeDb().beginTransaction();
        const userData = await initializeDb().query(selectUser);
        if(userData.length > 0){
            const isVerified = await initializeDb().query(selectUser);
            if(isVerified[0].status === 'not_verify'){
                await initializeDb().query(updateUser);
                const newUserData = await initializeDb().query(selectUser);
                //Sign in user
                const newData = newUserData[0];
                const token = jwt.sign({ email: newData.email, id: newData._id }, process.env.SECRET, { expiresIn: '48h' });

                res.status(200).json({ status: true, data: { token, newData } });
            }else{
                res.status(203).json({message: 'Account verified'});
            }
        }else{
            res.status(203).json({status: false});
        }
    } catch (error) {
        if(error){
            await initializeDb().rollback();
            res.status(500).json({message: error.sqlMessage})
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
        if(userData.length === 0)
            res.status(400).json({ status: false, message: 'You details does not match an account' });
        
        //Check if account is verified
        if(userData[0].status !== 'verified')
            res.status(400).json({ status: false, message: 'Account not verified', data: userData[0] });

        //Check Password
        const isPasswordCorrect = await bycrpt.compare(password, userData[0].password);
        if(!isPasswordCorrect)
            res.status(400).json({ status: false, message: 'Your password did not match the account' });

        const token = jwt.sign({ email: userData[0].email, id: userData[0]._id }, process.env.SECRET, { expiresIn: '48h' });

        const newData = userData[0];
        res.status(200).json({ status: true, data: { token, newData } });
    } catch (error) {
        await initializeDb().rollback();
    } finally{
        await initializeDb().close();
    };
};