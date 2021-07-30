import express from 'express';
import { addContact, getAllContacts } from '../controllers/contact';
import { accessAuthorization } from '../middleware'


const router = express.Router();

router.get('/', accessAuthorization, getAllContacts);
router.post('/add', accessAuthorization, addContact);

export default router;