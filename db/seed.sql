INSERT INTO department(name) 
VALUES 
("Operation"),
("Accountant"),
("Sale"),
("Engineering"),
("Legal");

INSERT INTO role(title,salary,department_id)
VALUES
("Software Engineer", 180000, 4),
("Account Manager", 170000, 2),
("Software Engineer Manager", 240000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
("Adam", "Hein", 3, null),
("Ahkar", "Hein", 1, 1);

 





