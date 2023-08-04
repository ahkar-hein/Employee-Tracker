// import required package.
const inquirer = require('inquirer');
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employee_tracker_db',
});


// Connect to the database and start the application
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
});