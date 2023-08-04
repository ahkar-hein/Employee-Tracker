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

function mainMenu() {
    inquirer
        .prompt([
            {
                name: 'action',
                type: 'list',
                message: 'Choose an option:',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Exit',
                ],
            },
        ])
        //Will add switch case later
}

// Connect to the database and start the application
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
});