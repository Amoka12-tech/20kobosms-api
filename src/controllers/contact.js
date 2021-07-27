import initializeDb from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const addContact = async (req, res) => {
    const userId = req.userId;
    const { name, phone, group } = req.body;
    const id = uuidv4();
    try {
        //First check if db for user contact exist;
        const checkDB = `SELECT FROM addressbook WHERE phoneNumber='${phone}'`;
        const checkDbData = await initializeDb().query(checkDB);
        if(checkDbData.length > 0){
            const ownerName = checkDbData[0].fullName;
            throw (`User already exist with name ${ownerName}`);
        }else{
            //Number not found in address book add it;
            const insertPhoneQry = `INSERT INTO addressbook (_id, fullName, phoneNumber, userId) VALUES ('${id}','${name}','${phone}','${userId}')`;
            const insertPhone = await initializeDb().query(insertPhoneQry);
            if(insertPhone.affectedRows > 0){
                const phoneData = {
                    id: id,
                    name: name,
                    phone: phone,
                    userId: userId,
                };
                res.status(200).json(phoneData);
            }else{
                throw('Oops! Something happend phone Number not saved, try again or contact admin');
            }
        }
    } catch (error) {
        res.status.json({ message : error.message });
    }
};