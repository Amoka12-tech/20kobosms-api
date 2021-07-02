import bycrpt from 'bcryptjs';
import initializeDb from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import sendMailMessage from '../services/sendMail';
import jwt from 'jsonwebtoken';

export const getUser = async (req, res) => {
    const { id } = req.params;
    const selectUser = `SELECT * FROM users WHERE _id='${id}'`;
    try {
        await initializeDb().beginTransaction();
        const userData = await initializeDb().query(selectUser);
        if(userData.length > 0){
            res.status(200).json(userData[0]);
        }else{
            res.status(400).json({status: false});
        }
    } catch (error) {
        if(error){
            await initializeDb().rollback();
            res.status(500).json({message: 'Database Error'});
        }
    } finally {
        await initializeDb().close();
    }
};