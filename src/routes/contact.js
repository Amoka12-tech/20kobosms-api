import express from 'express';
import { addContact } from '../controllers/contact';
import { accessAuthorization } from '../middleware'


const router = express.Router();

router.post('/add', accessAuthorization, addContact);

export default router;