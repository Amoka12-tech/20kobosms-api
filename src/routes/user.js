import express from 'express';
import { getUser } from '../controllers/user';
import { accessAuthorization } from '../middleware'


const router = express.Router();

router.get('/:id', accessAuthorization, getUser);

export default router;