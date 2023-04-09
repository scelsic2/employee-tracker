// inquirer prompts:
    // view all departments, x
    // view all roles, x
    // view all employees, x 
    // add a department, x
    // add a role, x
    // add an employee, x
    // update an employee role x

    const inquirer = require("inquirer");
    
    const startUpChoices = [
        {type: "list",
        name: "listOfChoices",
        message: "Choose from the following options:",
        choices: ["View all Departments", "View all Roles", "View all Employees", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee Role"]}
    ]

    function init () {
        inquirer.prompt(startUpChoices);
    }

    init();