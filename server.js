// import required package.
const inquirer = require('inquirer');
const mysql = require('mysql2');
const Table = require('cli-table3');

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
// Create async function for view all department.
async function viewDepartments() {
    // try/Catch condition for sql query.
    try {
        const results = await queryAsync('SELECT id as ID, name as Department FROM department'); //Select id and name from department table.

        // Format the data without the index column
        const formattedResults = results.map(({ ID, ...rest }) => ({ ID: ID, ...rest }));
        // Create a new table without the index column
        const table = new Table({ head: Object.keys(formattedResults[0]), style: { 'padding-left': 0, 'padding-right': 0 } });
        // Push the rows into the table
        formattedResults.forEach((row) => {
            table.push(Object.values(row));
        });
        // Display the table
        console.log(table.toString());
        mainMenu();
    } catch (err) {
        // display the error if catch error
        console.error('Error while fetching departments:', err);
        // execute the mainMenu function
        mainMenu();
    }
}
// Async function for view all roles
async function viewRoles() {
    try {
        // SQL query for select id, title, salary and department name from role and make a inner join with department
        // Then make an on condition with department id from role is equal to id from department table.
        const results = await queryAsync(`SELECT r.id as ID, r.title as Title, r.salary as Salary, d.name as Department  FROM role as r
        INNER JOIN department as d
        on r.department_id = d.id;`);

        const formattedResults = results.map(({ ID, ...rest }) => ({ ID: ID, ...rest }));
        const table = new Table({ head: Object.keys(formattedResults[0]), style: { 'padding-left': 0, 'padding-right': 0 } });

        formattedResults.forEach((row) => {
            table.push(Object.values(row));
        });
        console.log(table.toString());
        mainMenu();
    } catch (err) {
        console.error('Error while fetching roles:', err);
        mainMenu();
    }
}
// Async function for view all employees
async function viewEmployees() {
    try {
        // This query work select everything from employee, title and salary from role table and department name from department table.
        // Then, Make a self join for employee table to get manager id and name for employee who have manager and left join for role and department table
        // to get title, salary and department name.
        const results = await queryAsync(`
        SELECT emp.id AS Employee_id, emp.first_name AS First_Name, emp.last_name AS Last_Name, 
        role.title AS Title, dept.name AS Department, role.salary AS Salary, manager.first_name AS Manager 
        FROM employee AS emp 
        LEFT JOIN employee AS manager ON emp.manager_id = manager.id 
        LEFT JOIN role ON emp.role_id = role.id 
        LEFT JOIN department AS dept ON role.department_id = dept.id
      `);
        const formattedResults = results.map(({ Employee_id, ...rest }) => ({ Emplyoyee_ID: Employee_id, ...rest }));
        const table = new Table({ head: Object.keys(formattedResults[0]), style: { 'padding-left': 0, 'padding-right': 0 } });

        formattedResults.forEach((row) => {
            table.push(Object.values(row));
        });
        console.log(table.toString());

        mainMenu();
    } catch (err) {
        console.error('Error while fetching employees:', err);
        mainMenu();
    }
}
// Async function for add new department
async function addDepartment() {
    try {
        // Create the inquirer prompt for add new department
        const answers = await inquirer.prompt([
            {
                name: 'name',
                type: 'input',
                message: 'Enter the name of the department:',
            },
        ]);
        // this query for insert new department name into department table. ? mean there is a variables where ? placed.
        await queryAsync('INSERT INTO department (name) VALUES (?)', [answers.name]);
        console.log('Department added successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error while adding department:', err);
        mainMenu();
    }
}
// This is async function for add new role
async function addRole() {
    try {
        // First, getting id and name from department table for user choice when adding the new role.
        const departments = await queryAsync('SELECT id, name FROM department');
        // inquirer prompt for add new role
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
                // This code transforms an array of department objects into a new array of objects with 'name' and 'value' properties.
                choices: departments.map((department) => ({ name: department.name, value: department.id })),
            },
        ]);
        // Then, insert query that inserting title, salary and department id into role table.
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
// This is async functon for addEmployee
async function addEmployee() {
    try {
        // first, getting id, title from role table.
        const roles = await queryAsync('SELECT id, title FROM role');
        // Then, id, first_name, last_name from employee table for employee who has manager.
        const employees = await queryAsync('SELECT id, first_name, last_name FROM employee');
        // inquirer prompt for add new employee
        const answers = await inquirer.prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'Enter the first name of the employee:',
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Enter the last name of the employee:',
            },
            {
                name: 'role_id',
                type: 'list',
                message: 'Choose the role for the employee:',
                choices: roles.map((role) => ({ name: role.title, value: role.id })),
            },
            {
                name: 'manager_id',
                type: 'list',
                message: 'Choose the manager for the employee:',
                choices: employees.map((employee) => ({
                    // if employee doesn't have manager, manager id insert as null, otherwise, employee id is going to be inserted.
                    name: employee.id === null ? 'No Manager' : `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
        ]);
        // Insert query for new employee
        await queryAsync('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
            answers.first_name,
            answers.last_name,
            answers.role_id,
            answers.manager_id,
        ]);
        console.log('Employee added successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error while adding employee:', err);
        mainMenu();
    }
}
// Async function for upadate Employee role.
async function updateEmployeeRole() {
    try {
        // getting id, firstname, lastname from employee
        const employees = await queryAsync('SELECT id, first_name, last_name FROM employee');
        // getting id, title from role
        const roles = await queryAsync('SELECT id, title FROM role');
        // prompt for update employee role
        const answers = await inquirer.prompt([
            {
                name: 'employee_id',
                type: 'list',
                message: 'Choose the employee to update:',
                // display employee name list that come from database by using map methods.
                choices: employees.map((employee) => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
            {
                name: 'new_role_id',
                type: 'list',
                message: 'Choose the new role for the employee:',
                // display role title list that come from database by using map methods.
                choices: roles.map((role) => ({ name: role.title, value: role.id })),
            },
        ]);
        // Update query for new employee
        await queryAsync('UPDATE employee SET role_id = ? WHERE id = ?', [answers.new_role_id, answers.employee_id]);
        console.log('Employee role updated successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error while updating employee role:', err);
        mainMenu();
    }
}
//function for mainMenu
function mainMenu() {
    // Prompt the mainMenu list and make a user choice
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
            // switch case conditon and execute the relevant function that based on the user choice.
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
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
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
    console.log(`
    #######  ##   ##  ######   ####      #####   ###  ### #######  #######  
    ##   #  ### ###   ##  ##   ##      ### ###   ##  ##   ##   #   ##   #  
    ##      #######   ##  ##   ##      ##   ##    ####    ##       ##      
    ####    ## # ##   #####    ##      ##   ##     ##     ####     ####    
    ##      ##   ##   ##       ##      ##   ##     ##     ##       ##      
    ##   #  ##   ##   ##       ##  ##  ### ###     ##     ##   #   ##   #  
   #######  ### ###  ####     #######   #####     ####   #######  #######  
                                                                           
    # ##### ######     ###      ####   ### ###  #######  ######   
   ## ## ##  ##  ##   ## ##    ##  ##   ## ##    ##   #   ##  ##  
      ##     ##  ##  ##   ##  ##        ####     ##       ##  ##  
      ##     #####   ##   ##  ##        ###      ####     #####   
      ##     ## ##   #######  ##        ####     ##       ## ##   
      ##     ## ##   ##   ##   ##  ##   ## ##    ##   #   ## ##   
     ####   #### ##  ##   ##    ####   ### ###  #######  #### ##              
`);
    mainMenu();
});