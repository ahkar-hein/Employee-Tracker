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
        const results = await queryAsync(`SELECT r.id as ID, r.title as Title, r.salary as Salary, d.name as Department  FROM role as r
        INNER JOIN department as d
        on r.department_id = d.id;`);
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

async function addDepartment() {
    try {
        const answers = await inquirer.prompt([
            {
                name: 'name',
                type: 'input',
                message: 'Enter the name of the department:',
            },
        ]);
        await queryAsync('INSERT INTO department (name) VALUES (?)', [answers.name]);
        console.log('Department added successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error while adding department:', err);
        mainMenu();
    }
}

async function addRole() {
    try {
        const departments = await queryAsync('SELECT id, name FROM department');
        const answers = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter the title of the role:',
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter the salary for the role:',
            },
            {
                name: 'department_id',
                type: 'list',
                message: 'Choose the department for the role:',
                choices: departments.map((department) => ({ name: department.name, value: department.id })),
            },
        ]);
        await queryAsync('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
            answers.title,
            answers.salary,
            answers.department_id,
        ]);
        console.log('Role added successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error while adding role:', err);
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
                case 'Add a department':
                    addDepartment();
                case 'Add a role':
                    addRole();
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