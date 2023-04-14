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

// tutoring 13APR2023
inquirer.prompt(startUpChoices)
.then(result => {
  // console.log("RES: ", result)
  switch (result.listOfChoices) {
    case "View all Departments":
      viewDept();
      break;
    case "View all Roles":
      viewRoles();
      break;
    case "View all Employees":
      viewEmp();
      break;
    case "Add a Department":
      addDept();
      break;
    case "Add a Role":
      addRole();
      break;
    case "Add an Employee":
      addEmp();
      break;
    case "Update an Employee Role":
      updateRole();
      break;

    default:
      process.exit()
  }
})

  // asynchcronus coding
  // const result = await connection.promise().query(
  //   `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`
  // )
  // console.log(result[0])
  //

function viewDept() {
  return connection.promise().query(
    `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`
  )
  .then(res => console.table(res[0]))
  .catch(err => console.log(err))
};

function viewRoles() {
  return connection.promise().query(
    `SELECT roles.title, roles.role_id, departments.dept_name, roles.salary FROM departments INNER JOIN roles ON roles.dept_id = departments.dept_id ORDER BY roles.title ASC;`
  )
  .then(res => console.table(res[0]))
  .catch(err => console.log(err))
};

function viewEmp() {
  return connection.promise().query(
    `SELECT a.emp_id, a.first_name, a.last_name, roles.title, departments.dept_name, roles.salary, b.first_name AS manager_first_name, b.last_name AS manager_last_name FROM employees a JOIN roles ON a.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id LEFT JOIN employees b ON a.manager_id = b.emp_id ORDER BY a.last_name ASC;`
  )
  .then(res => console.table(res[0]))
  .catch(err => console.log(err))
};

function addDept () {
  const addDept = [
    {name: "deptName",
    message: "Enter department name:"}
  ];

  inquirer.prompt(addDept).then(function(deptInput) {
    return connection.promise().query(
      `INSERT INTO departments (dept_name) VALUES ("${deptInput.deptName}");`
    )
    .then(res => console.log("Department " + deptInput.deptName + " successfully added"))
    .catch(err => console.log(err))
  })

}

function getDepartments () {
  return connection.promise().query(
    `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
  )
  .then(res => {
    return res[0].map(choice => {
      return choice.dept_name
    })
  })
  .catch(err => console.log(err))
}

function addRole () {
  return getDepartments().then(choices => {
    
    const addRole = [
      {name: "roleTitle",
        message: "Enter a job title:"},
      {name: "roleSalary",
        message: "Enter a salary:"},
      {type: "list",
        name: "selectDept",
        message: "Select the department this role belongs to:",
        choices: choices}
    ]
  
    inquirer.prompt(addRole).then(function(userChoices) {
      return connection.promise().query(
        `SELECT dept_id from DEPARTMENTS WHERE dept_name=?`, [userChoices.selectDept]
      )
      .then(res => {
        const dept_id = res[0][0].dept_id;
        return connection.promise().query(
          `INSERT INTO roles (title, salary, dept_id) VALUES (?, ?, ?);`, [userChoices.roleTitle, userChoices.roleSalary, dept_id]
        )
        .then(res => console.log("Role " + userChoices.roleTitle + " successfully added."))
        .catch(err => console.log(err))
      });
    });
  })
}

function getRole () {
  return connection.promise().query(
    `SELECT title, role_id FROM roles;`,
  )
  .then(res => {
    return res[0].map(choice => {
      return choice.title
    })
  })
  .catch(err => console.log(err))
}

function getManager () {
  return connection.promise().query(
    `SELECT emp_id, last_name FROM employees;`,
  )
  .then(res => {
    return res[0].map(choice => {
      return choice.last_name
    })
  })
  .catch(err => console.log(err))
}

function addEmp () {
  //let roles = null;
  //let managers = null;

  getRole().then(roleChoices => {
    //roles = rolesResponse;
    getManager().then(managerChoices => {

      const addEmp = [
        {name: "firstName",
          message: "Enter the employee's first name:"},
        {name: "lastName",
          message: "Enter the employee's last name:"},
        {type: "list",
          name: "selectRole",
          message: "Select this employee's role:",
          choices: roleChoices},
        {type: "list",
          name: "selectManager",
          message: "Select this employee's manager:",
          choices: managerChoices}
      ]

      inquirer.prompt(addEmp).then(function(userChoices) {
        connection.promise().query(
          `SELECT role_id from roles WHERE title=?`, [userChoices.selectRole]
        ).then(roleResult => {
          connection.promise().query(
            `SELECT emp_id from employees WHERE last_name=?`, [userChoices.selectManager]
          ).then(employeeResult => {

            const role_id = roleResult[0][0].role_id;
            const emp_id = employeeResult[0][0].emp_id;
            return connection.promise().query(
              `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`, [userChoices.firstName, userChoices.lastName, role_id, emp_id]
            )
            .then(res => console.log("Employee " + userChoices.firstName + userChoices.lastName + " successfully added."))
            .catch(err => console.log(err))

          })
        })
      });

    })
  });
}

function updateRole() {
  getRole().then(roleChoices => {
    //roles = rolesResponse;
    getManager().then(lastNameChoices => {

      const addEmp = [
        {type: "list",
          name: "lastName",
          message: "Enter the employee's last name:",
          choices: lastNameChoices},
        {type: "list",
          name: "selectRole",
          message: "Select a new role for the employee:",
          choices: roleChoices},
      ]

      inquirer.prompt(addEmp).then(function(userChoices) {
        connection.promise().query(
          `SELECT emp_id from employees WHERE last_name=?`, [userChoices.lastName]
        ).then(employeeResult => {
          connection.promise().query(
            `SELECT role_id from roles WHERE title=?`, [userChoices.selectRole]
          ).then(roleResult => {

            const role_id = roleResult[0][0].role_id;
            //console.log(role_id)

            const emp_id = employeeResult[0][0].emp_id;
            return connection.promise().query(
              `UPDATE employees SET role_id=? WHERE emp_id=?;`, [role_id, emp_id]
            )
            .then(res => console.log(userChoices.lastName + "'s role updated successfully"))
            .catch(err => console.log(err))

          })
        })
      });

    })
  });
}

// --------------------ATTEMPT ONE--------------------
// } else if (userInput.listOfChoices == "Add an Employee") {
  //       //async function empInit() {
  //       const empChoices = connection.query(
  //         `SELECT last_name, emp_id FROM employees;`,
  //         function (err, empChoices) {
  //           const formattedChoices = empChoices.map((empChoice) => {
  //             console.log("Manager: " + [empChoice.last_name]);
  //             return { name: empChoice.last_name, value: empChoice.emp_id };
  //           });
  //           return formattedChoices;
  //         }
  //       );
  //       console.log(empChoices);
  
  //       const roleChoices = connection.query(
  //         `SELECT title, role_id FROM roles; `,
  //         function (err, roleChoices) {
  //           const formattedChoices = roleChoices.map((roleChoice) => {
  //             console.log("Role: " + [roleChoice.title])
  //             return { name: roleChoice.title, value: roleChoice.role_id };
  //           });
  //           return formattedChoices;
  //         }
  //       );
  //       // const allRoles = await getAllRoles();
  //       // console.log(roleChoices);
  //       // const allManagers = await getAllManagers();
  //       const addEmp = [
  //         {name: "empManager",
  //           message: "From the choices below, type in the employee's manager:\n"},
  //           // type: "list",
  //           // choices: allManagers},
  //         {name: "empRole",
  //           message: "From the choices above, type in the employee's role:\n",},
  //         { name: "firstName", message: "Enter the employee's first name:" },
  //         { name: "lastName", message: "Enter the employee's last name:" },
  //       ];
  
  //       inquirer.prompt(addEmp).then(async function (empInput) {
  //         // console.log(empInput);
  
  //         const [manager] = await connection
  //           .promise()
  //           .query(`SELECT emp_id from employees WHERE last_name=?`, [
  //             empInput.empManager,
  //           ]);
  //         // console.log(manager);
  
  //         const [role] = await connection
  //           .promise()
  //           .query(`SELECT role_id from roles WHERE title=?`, [empInput.empRole]);
  //         // console.log(role);
  
  //         if (manager === false) {
  //           console.log("Manager not found.");
  //           return;
  //         }
  
  //         if (role === false) {
  //           console.log("Role not found.");
  //           return;
  //         }
  //         console.log("Employee " + empInput.lastName + " successfully added.");
  
  //         connection.query(
  //           `SELECT emp_id from employees where last_name=? `,
  //           [empInput.empManager],
  //           function (err, results, fields) {
  //             if (err) {
  //               console.log("");
  //               console.log("Manager lookup error.");
  //             }
  
  //             connection.query(
  //               `SELECT role_id from ROLES where title = ? `,
  //               [empInput.empRole],
  //               function (err, results, fields) {
  //                 if (err) {
  //                   console.log("");
  //                   console.log("Role lookup error.");
  //                 }
  //                 // results is an array, and I know that all id's are unique so, there will only be 1 item in my array, which is why I can use 0.
  //                 else {
  //                   // console.table(results);
  //                   let emp_id = results[0].emp_id;
  //                   let title = results[0].title;
  //                   connection.query(
  //                     `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`,
  //                     [
  //                       empInput.firstName,
  //                       empInput.lastName,
  //                       employees.role_id,
  //                       employees.manager_id,
  //                     ],
  //                     function (err, results, fields) {
  //                       if (err) {
  //                         console.log(err);
  //                       }
  //                       //console.table(results);
  //                     }
  //                   );
  //                 }
  //               }
  //             );
  //           }
  //         );
  //       });
  //       //}
  //       //empInit();













// const addDept = [{ name: "deptName", message: "Enter department name:" }];
//       //function deptInit() {
//       inquirer.prompt(addDept).then(function (deptInput) {
//         console.log(
//           "Department " + deptInput.deptName + " successfully added."
//         );
//         connection.query(
//           `INSERT INTO departments (dept_name) VALUES ("${deptInput.deptName}");`

// function init() {
//   inquirer.prompt(startUpChoices).then(async function (userInput) {

//     if (userInput.listOfChoices == "View all Departments") {
//       connection.query(
//         `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
//         function (err, results, fields) {
//           console.log("");
//           console.table(results);
//         }
//       );

//     } else if (userInput.listOfChoices == "View all Roles") {
//       connection.query(
//         `SELECT roles.title, roles.role_id, departments.dept_name, roles.salary FROM departments INNER JOIN roles ON roles.dept_id = departments.dept_id ORDER BY roles.title ASC;`,
//         function (err, results, fields) {
//           console.log("");
//           console.table(results);
//         }
//       );
//     }

//     // In order to join a table with itself, I have to reference 2 instances of the table. Below says emp_id instance 1, first_name instance 1, last_name instance 1. I don't need a second instance of roles.title, departments.dept_name, or roles.salary for this to work, so I just refer to them like normal. Then I have to call instance 2 of first name and use AS to set the column header that will print. Then I have to call the second instance of the last_name and use AS to set the column header that will print. I need the first instance of the role ID because I'm linking the employee's role, NOT the manager's role. I link up my dept_ids. Then I want to join with the second instance of employees, so I tell it that I want the manager_id from the first instance to equal the employee_id of the second instance.
//     else if (userInput.listOfChoices == "View all Employees") {
//       connection.query(
//         `SELECT a.emp_id, a.first_name, a.last_name, roles.title,
//         departments.dept_name, roles.salary,
//         b.first_name AS manager_first_name,
//         b.last_name AS manager_last_name
//         FROM employees a
//         JOIN roles ON a.role_id = roles.role_id
//         JOIN departments ON roles.dept_id = departments.dept_id
//         LEFT JOIN employees b ON a.manager_id = b.emp_id
//         ORDER BY a.last_name ASC`,
//         function (err, results, fields) {
//           console.log("");
//           console.table(results);
//         }
//       );

//     } else if (userInput.listOfChoices == "Add a Department") {
//       const addDept = [{ name: "deptName", message: "Enter department name:" }];
//       //function deptInit() {
//       inquirer.prompt(addDept).then(function (deptInput) {
//         console.log(
//           "Department " + deptInput.deptName + " successfully added."
//         );
//         connection.query(
//           `INSERT INTO departments (dept_name) VALUES ("${deptInput.deptName}");`
//         );
//       });
//       //}
//       //deptInit();
//     } else if (userInput.listOfChoices == "Add a Role") {
//       //async function roleInit() {
//       const choices = connection.query(
//         `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
//         function (err, choices) {
//           const formattedChoices = choices.map((choice) => {
//             // console.log("");
//             console.log([choice.dept_name]);
//             return { name: choice.dept_name, value: choice.dept_id };
//           });
//           return formattedChoices;
//         }
//       );

//       // const allDepts = getAllDepts();
//       //   console.log(allDepts)
//       const addRole = [
//         {
//           name: "roleDept",
//           message:
//             "From the choices below, type in a department this role will belong to:\n",
//             // type: "list",
//             // choices: [allDepts]
//         },
//         { name: "roleTitle", message: "Enter a job title:" },
//         { name: "roleSalary", message: "Enter a salary:" },
//       ];

//       inquirer.prompt(addRole).then(async function (roleInput) {
//         // console.log(roleInput);

//         const [department] = await connection
//           .promise()
//           .query(`SELECT dept_id from DEPARTMENTS WHERE dept_name=?`, [
//             roleInput.roleDept,
//           ]);
//         // console.log(department);

//         if (department === false) {
//           console.log("Department not found.");
//           return;
//         }
//         console.log("Role " + roleInput.roleTitle + " successfully added.");
//         connection.query(
//           `select dept_id from departments where dept_name = ? `,
//           [roleInput.roleDept],
//           function (err, results, fields) {
//             if (err) {
//               console.log("");
//               console.log("Department lookup error.");
//             }
//             // results is an array, and I know that all id's are unique so, there will only be 1 item in my array, which is why I can use 0.
//             else {
//               // console.table(results);
//               let dept_id = results[0].dept_id;
//               connection.query(
//                 `INSERT INTO roles (title, salary, dept_id) VALUES (?, ? , ?);`,
//                 [roleInput.roleTitle, roleInput.roleSalary, dept_id],
//                 function (err, results, fields) {
//                   if (err) {
//                     console.log(err);
//                   }
//                   //console.table(results);
//                 }
//               );
//             }
//           }
//         );
//       });
//       //}
//       //roleInit();
//     } else if (userInput.listOfChoices == "Add an Employee") {
//       //async function empInit() {
//       const empChoices = connection.query(
//         `SELECT last_name, emp_id FROM employees;`,
//         function (err, empChoices) {
//           const formattedChoices = empChoices.map((empChoice) => {
//             console.log("Manager: " + [empChoice.last_name]);
//             return { name: empChoice.last_name, value: empChoice.emp_id };
//           });
//           return formattedChoices;
//         }
//       );
//       console.log(empChoices);

//       const roleChoices = connection.query(
//         `SELECT title, role_id FROM roles; `,
//         function (err, roleChoices) {
//           const formattedChoices = roleChoices.map((roleChoice) => {
//             console.log("Role: " + [roleChoice.title])
//             return { name: roleChoice.title, value: roleChoice.role_id };
//           });
//           return formattedChoices;
//         }
//       );
//       // const allRoles = await getAllRoles();
//       // console.log(roleChoices);
//       // const allManagers = await getAllManagers();
//       const addEmp = [
//         {name: "empManager",
//           message: "From the choices below, type in the employee's manager:\n"},
//           // type: "list",
//           // choices: allManagers},
//         {name: "empRole",
//           message: "From the choices above, type in the employee's role:\n",},
//         { name: "firstName", message: "Enter the employee's first name:" },
//         { name: "lastName", message: "Enter the employee's last name:" },
//       ];

//       inquirer.prompt(addEmp).then(async function (empInput) {
//         // console.log(empInput);

//         const [manager] = await connection
//           .promise()
//           .query(`SELECT emp_id from employees WHERE last_name=?`, [
//             empInput.empManager,
//           ]);
//         // console.log(manager);

//         const [role] = await connection
//           .promise()
//           .query(`SELECT role_id from roles WHERE title=?`, [empInput.empRole]);
//         // console.log(role);

//         if (manager === false) {
//           console.log("Manager not found.");
//           return;
//         }

//         if (role === false) {
//           console.log("Role not found.");
//           return;
//         }
//         console.log("Employee " + empInput.lastName + " successfully added.");

//         connection.query(
//           `SELECT emp_id from employees where last_name=? `,
//           [empInput.empManager],
//           function (err, results, fields) {
//             if (err) {
//               console.log("");
//               console.log("Manager lookup error.");
//             }

//             connection.query(
//               `SELECT role_id from ROLES where title = ? `,
//               [empInput.empRole],
//               function (err, results, fields) {
//                 if (err) {
//                   console.log("");
//                   console.log("Role lookup error.");
//                 }
//                 // results is an array, and I know that all id's are unique so, there will only be 1 item in my array, which is why I can use 0.
//                 else {
//                   // console.table(results);
//                   let emp_id = results[0].emp_id;
//                   let title = results[0].title;
//                   connection.query(
//                     `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`,
//                     [
//                       empInput.firstName,
//                       empInput.lastName,
//                       employees.role_id,
//                       employees.manager_id,
//                     ],
//                     function (err, results, fields) {
//                       if (err) {
//                         console.log(err);
//                       }
//                       //console.table(results);
//                     }
//                   );
//                 }
//               }
//             );
//           }
//         );
//       });
//       //}
//       //empInit();
//     } else if (userInput.listOfChoices == "Update an Employee Role") {
//       console.log("Update an Employee Role worked");
//     } else if (userInput.listOfChoices == "Exit") {
//       process.exit();
//     }
//     // init();
//   });
// }

// async function getAllDepts() {
//   const [allDepts] = await connection.promise().query(`SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`)
//   return allDepts;
// }

// async function getAllDepts() {
//   const result = await connection.promise().query(`SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`);
//   const allDepts = result[0];
// }

// function getAllDepts() {
//   const result = connection.query(`SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`);
//   const allDepts = result[0];
// }

// const choices = connection.query(
//   `SELECT dept_name, dept_id FROM departments ORDER BY dept_name ASC;`,
//   function (err, choices) {
//     const formattedChoices = choices.map((choice) => {
//       // console.log("");
//       console.log([choice.dept_name]);
//       return { name: choice.dept_name, value: choice.dept_id };
//     });
//     return formattedChoices;
//   }
// );

// async function getAllManagers() {
//   const [allManagers] = await connection.promise().query(`SELECT * FROM EMPLOYEES WHERE MANAGER_ID = NULL`)
//   return allManagers;
// };

// async function getAllRoles() {

// }


