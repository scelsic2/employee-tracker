DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;
USE employee_tracker_db;

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (dept_id)
);

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    dept_id INT NOT NULL,
    PRIMARY KEY (role_id),
    FOREIGN KEY (dept_id) REFERENCES departments (dept_id)
);

CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NULL REFERENCES employees,
    PRIMARY KEY (emp_id),
    FOREIGN KEY (role_id) REFERENCES roles (role_id),
    FOREIGN KEY (manager_id) REFERENCES employees (emp_id)
)