import express from "express";
import auth from './auth';
import user from './user';

const router = express();


    router.use('/auth', auth);
    router.use('/user', user);



export default router;