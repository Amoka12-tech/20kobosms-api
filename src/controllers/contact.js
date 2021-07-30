import initializeDb from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAllContacts = async (req, res) => {
    const userId = req.userId;
    const selectQry = `SELECT * FROM addressbook WHERE userId='${userId}'`;
    try {
        await initializeDb().beginTransaction();
        const contactDatas = await initializeDb().query(selectQry);
        res.status(200).json(contactDatas);
        console.log(contactDatas);
    } catch (error) {
        if(error){
            await initializeDb().rollback();
            res.status(400).json({message : error.message});
        }
        console.log(error);
    } finally {
        await initializeDb().close();
    }
};

export const addContact = async (req, res) => {
    const userId = req.userId;
    const { name, phone, group } = req.body;
    const id = uuidv4();
    try {
        await initializeDb().beginTransaction();
        //First check if db for user contact exist;
        const checkDB = `SELECT * FROM addressbook WHERE userId='${userId}' AND phoneNumber='${phone}'`;
        const checkDbData = await initializeDb().query(checkDB);
        console.log('2',req.body);
        if(checkDbData.length > 0){
            const ownerName = checkDbData[0].fullName;
            throw (`User already exist with name ${ownerName}`);
        }else{
            //Number not found in address book add it;
            const insertPhoneQry = `INSERT INTO addressbook (_id, fullName, phoneNumber, userId, contact_group) VALUES ('${id}','${name}','${phone}','${userId}','${group}')`;
            const insertPhone = await initializeDb().query(insertPhoneQry);
            console.log('3',req.body);
            if(insertPhone.affectedRows > 0){
                const phoneBookQry = `SELECT * FROM addressbook WHERE userId='${userId}' AND phoneNumber='${phone}'`;
                const phoneBookData = await initializeDb().query(phoneBookQry);
                console.log('4',req.body);
                res.status(200).json(phoneBookData);
            }else{
                throw('Oops! Something happend phone Number not saved, try again or contact admin');
            }
        }
    } catch (error) {
        await initializeDb().rollback();
        res.status(400).json({ message : error.message });
    } finally {
        await initializeDb().close();
    }
};