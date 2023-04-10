const inquirer = require("inquirer");
const mysql = require("mysql2");
// const mysqlPassword = process.env.mysqlPassword;
const cTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee_tracker_db"
})
    
const startUpChoices = [
    {type: "list",
    name: "listOfChoices",
    message: "Choose from the following options:",
    choices: ["View all Departments", "View all Roles", "View all Employees", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee Role", "Exit"]}
]

function init () {
        inquirer.prompt(startUpChoices)
            .then(function(userInput){
                console.log("You selected:");
                console.log(userInput.listOfChoices);

                if (userInput.listOfChoices == "View all Departments"){
                    connection.query(
                        `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
                        function(err, results, fields) {
                            console.table(results);
                        }
                    )
                }
                else if (userInput.listOfChoices == "View all Roles"){
                    connection.query(
                        `SELECT roles.title, roles.role_id, departments.dept_name, roles.salary FROM departments INNER JOIN roles ON roles.dept_id = departments.dept_id ORDER BY roles.title ASC;`,
                        function(err, results, fields) {
                            console.table(results);
                        }
                    )
                }

                else if (userInput.listOfChoices == "View all Employees"){
                    connection.query(
                        `SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, departments.dept_name, roles.salary, employees.manager_id FROM employees JOIN ROLES ON employees.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id ORDER BY employees.last_name ASC;`,
                        function(err, results, fields) {
                            console.table(results);
                        }
                    )
                }

                else if (userInput.listOfChoices == "Add a Department"){
                    console.log("Add a Department worked")
                }

                else if (userInput.listOfChoices == "Add a Role"){
                    console.log("Add a Role worked")
                }

                else if (userInput.listOfChoices == "Add an Employee"){
                    console.log("Add an Employee worked")
                }

                else if (userInput.listOfChoices == "Update an Employee Role"){
                    console.log("Update an Employee Role worked") 
                }

                else if(userInput.listOfChoices == "Exit") {
                   process.exit();
                }
                init();
            });
}

init();
