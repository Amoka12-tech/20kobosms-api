import express from 'express';
import { login, register, verify } from '../controllers/auth';

const router = express.Router();

router.post('/register', register);
router.get('/verify/:id/:otp', verify);
router.post('/login', login);

export default router;