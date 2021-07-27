import express from "express";
import auth from './auth';
import user from './user';
import contact from './contact';

const router = express();


    router.use('/auth', auth);
    router.use('/user', user);
    router.use('/contact', contact);



export default router;