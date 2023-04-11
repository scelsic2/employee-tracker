const inquirer = require("inquirer");
const mysql = require("mysql2");
// const mysqlPassword = process.env.mysqlPassword;
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "employee_tracker_db",
});

const startUpChoices = [
  {
    type: "list",
    name: "listOfChoices",
    message: "Choose from the following options:",
    choices: [
      "View all Departments",
      "View all Roles",
      "View all Employees",
      "Add a Department",
      "Add a Role",
      "Add an Employee",
      "Update an Employee Role",
      "Exit",
    ],
  },
];

function init() {
  inquirer.prompt(startUpChoices).then(async function (userInput) {
    // console.log("You selected:");
    // console.log(userInput.listOfChoices);

    if (userInput.listOfChoices == "View all Departments") {
      connection.query(
        `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
        function (err, results, fields) {
          console.log("");
          console.table(results);
        }
      );
    } else if (userInput.listOfChoices == "View all Roles") {
      connection.query(
        `SELECT roles.title, roles.role_id, departments.dept_name, roles.salary FROM departments INNER JOIN roles ON roles.dept_id = departments.dept_id ORDER BY roles.title ASC;`,
        function (err, results, fields) {
          console.log("");
          console.table(results);
        }
      );
    }

    // In order to join a table with itself, I have to reference 2 instances of the table. Below says emp_id instance 1, first_name instance 1, last_name instance 1. I don't need a second instance of roles.title, departments.dept_name, or roles.salary for this to work, so I just refer to them like normal. Then I have to call instance 2 of first name and use AS to set the column header that will print. Then I have to call the second instance of the last_name and use AS to set the column header that will print. I need the first instance of the role ID because I'm linking the employee's role, NOT the manager's role. I link up my dept_ids. Then I want to join with the second instance of employees, so I tell it that I want the manager_id from the first instance to equal the employee_id of the second instance.
    else if (userInput.listOfChoices == "View all Employees") {
      connection.query(
        `SELECT a.emp_id, a.first_name, a.last_name, roles.title,
        departments.dept_name, roles.salary,
        b.first_name AS manager_first_name,
        b.last_name AS manager_last_name
        FROM employees a
        JOIN roles ON a.role_id = roles.role_id
        JOIN departments ON roles.dept_id = departments.dept_id
        LEFT JOIN employees b ON a.manager_id = b.emp_id
        ORDER BY a.last_name ASC`,
        function (err, results, fields) {
          console.log("");
          console.table(results);
        }
      );
    } else if (userInput.listOfChoices == "Add a Department") {
      const addDept = [{ name: "deptName", message: "Enter department name:" }];
      function deptInit() {
        inquirer.prompt(addDept).then(function (deptInput) {
          console.log(
            "Department " + deptInput.deptName + " successfully added."
          );
          connection.query(
            `INSERT INTO departments (dept_name) VALUES ("${deptInput.deptName}");`
          );
        });
      }
      deptInit();
    } else if (userInput.listOfChoices == "Add a Role") {
      const choices = await connection
        .promise()
        .query(`SELECT dept_name, dept_id FROM departments;`)
        .then(([choices]) => {
          // console.log(choices);
          const formattedChoices = choices.map((choice) => {
            console.log([choice.dept_name]);
            return { name: choice.dept_name, value: choice.dept_id };
          });
          return formattedChoices;
        });
      // map returns a new array so that we don't get an object
      // console.log(choices);

      async function roleInit() {
        const choices = await connection
        .promise()
        .query(`SELECT dept_name, dept_id FROM departments;`)
        .then(([choices]) => {
          const formattedChoices = choices.map((choice) => {
            return {name: choice.dept_name, value: choice.dept_id}
          })
          return formattedChoices
        })

        const addRole = [
          {name: "roleDept",
          message: "From the choices above, enter a department this role will belong to:"},
          {name: "roleTitle",
          message: "Enter a job title:"},
          {name: "roleSalary",
            message: "Enter a salary:"},
  
        ];

        inquirer.prompt(addRole).then(async function (roleInput) {
          console.log(roleInput);
          
          const [department] = await connection.promise().query(`SELECT dept_id from DEPARTMENTS WHERE dept_name=?`, [roleInput.roleDept]);
          console.log(department);

          if (department === false) {
            console.log("Department not found.");
            return;
          }
          console.log("Role " + roleInput.roleTitle + " successfully added.");
          // function matchDept (roleInput) {
          //   connection.query(`INSERT INTO departments (dept_name) VALUES ("${roleInput.roleDept}")`)
          // }
          connection.query(`select dept_id from departments where dept_name = ? `,
          [roleInput.roleDept], function(err, results, fields) {
            if(err) {
              console.log("");
              console.log("dept lookup error")
            }
            else {
              console.table(results);
              let dept_id = results[0].dept_id;
              connection.query(
                `INSERT INTO roles (title, salary, dept_id) VALUES (?, ? , ?);`,
                [roleInput.roleTitle, roleInput.roleSalary, dept_id],
                function (err, results, fields) {
                  if(err) {
                    console.log(err);
                  }
                  console.log("the last id should be: ");
                  console.table(results);
                }
              );

            }

          })
          // matchDept()
          // connection.query(
          //   `INSERT INTO roles (title, salary, dept_id) VALUES (?, ? , ?)`,
          //   [roleInput.roleTitle, roleInput.roleSalary, roleInput.roleDept]
          //   );
            // ("${roleInput.roleTitle}", "${roleInput.roleSalary})", "${roleInput.roleDept}";`

        });
      }
      roleInit();
    } else if (userInput.listOfChoices == "Add an Employee") {
      console.log("Add an Employee worked");
    } else if (userInput.listOfChoices == "Update an Employee Role") {
      console.log("Update an Employee Role worked");
    } else if (userInput.listOfChoices == "Exit") {
      process.exit();
    }
    // init();
  });
}

init();
