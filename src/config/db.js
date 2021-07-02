require('dotenv').config();
import mongoose from 'mongoose';
let mysql = require('mysql');
const util = require('util');

export default function() {
    let connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });

    return {
        query(sql, args) {
            return util.promisify( connection.query )
                .call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        },
        beginTransaction() {
            return util.promisify( connection.beginTransaction )
                .call( connection );
        },
        commit() {
            return util.promisify( connection.commit )
                .call( connection );
        },
        rollback() {
            return util.promisify( connection.rollback )
                .call( connection );
        }
    };
}