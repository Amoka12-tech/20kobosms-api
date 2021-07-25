import express from 'express';
import { login, register, verify, recoverAccount, changePassword } from '../controllers/auth';

const router = express.Router();

router.post('/register', register);
router.get('/verify/:id/:otp', verify);
router.post('/login', login);
router.get('/recover/:email', recoverAccount);
router.post('/changePassword', changePassword);

export default router;