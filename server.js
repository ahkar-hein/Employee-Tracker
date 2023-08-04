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

// Function to promisify the database query
function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function viewDepartments() {
    try {
        const results = await queryAsync('SELECT * FROM department');
        console.table(results);
        mainMenu();
    } catch (err) {
        console.error('Error while fetching departments:', err);
        mainMenu();
    }
}
async function viewRoles() {
    try {
        const results = await queryAsync('SELECT * FROM role');
        console.table(results);
        mainMenu();
    } catch (err) {
        console.error('Error while fetching roles:', err);
        mainMenu();
    }
}

async function viewEmployees() {
    try {
        const results = await queryAsync(`
        SELECT emp.id AS employee_id, emp.first_name AS First_Name, emp.last_name AS Last_Name, 
        role.title AS Title, dept.name AS Department, role.salary AS Salary, manager.first_name AS Manager 
        FROM employee AS emp 
        LEFT JOIN employee AS manager ON emp.manager_id = manager.id 
        LEFT JOIN role ON emp.role_id = role.id 
        LEFT JOIN department AS dept ON role.department_id = dept.id
      `);
        console.table(results)
        mainMenu();
    } catch (err) {
        console.error('Error while fetching employees:', err);
        mainMenu();
    }
}

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
        .then((answers) => {
            switch (answers.action) {
                case 'View all departments':
                    viewDepartments();
                    break;
                case 'View all roles':
                    viewRoles();
                    break;
                case 'View all employees':
                    viewEmployees();
                    break;
                case 'Exit':
                    db.end();
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    mainMenu();
            }
        });
}

// Connect to the database and start the application
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
    mainMenu();
});