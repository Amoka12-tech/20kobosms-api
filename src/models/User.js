require('dotenv').config();
import mongoose from 'mongoose';
let mysql = require('mysql');
import initializeDb from '../config/db';
import uuid from 'uuid'

export default function(query) {

    //     let data = '';
        
    //     initializeDb().connect(function(err){
    //     console.log('Initializing');
    //     if(err){
    //         data = {error: err.message};
    //     }else{
    //         console.log('Connected');
    //         initializeDb().query(query, function(error, result, doc){
    //             if(error){
    //                 data = {error: error};
    //             }else{
    //                 // console.log('Result: ', result);
    //                 data = {result: result, doc: doc}; 
    //             }
    //         });
    //     }
    // });

    // return data;
};

// initializeDb().connect(function(err){
//     if(err){
//         res.status(401).json({"message": err.message});
//     }else{
        
//         initializeDb().query(selectUser,
//         function(err, result, doc) {
//             if(err){
//                 res.status(500).json({message: err.message});
//             }else{
//                 if(result.length > 0){
//                     //Reject User
//                     console.log(result.length);
//                     res.status(200).json({status: 'exits'});
//                 }else{
//                     initializeDb().query(insertUser,function(err1, result1, doc1){
//                         if(err){
//                             res.status(500).json({message: err1.message});
//                         }else{
//                             // console.log("Result: ",result1);
//                             initializeDb().query(selectNewUser, function(err2, result2, doc){
//                                 if(err2){
//                                     res.status(500).json({message: err1.message});
//                                 }else{
//                                     console.log(result2);
//                                     res.status(200).json({userData: result2});
//                                 }
//                             });                                    
//                         }
//                     });
//                 }
//             }
//         });
        
//     }
// });