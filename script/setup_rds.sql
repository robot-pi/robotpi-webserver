CREATE SCHEMA `robot-pi` ;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('manager', 'doctor', 'patient') NOT NULL,
    availability_status ENUM('available', 'unavailable') DEFAULT 'unavailable'
);

CREATE TABLE patient_doctor_relationship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

CREATE TABLE robots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    robot_name VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') NOT NULL
);

CREATE TABLE robot_patient_relationship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT NOT NULL,
    patient_id INT NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    FOREIGN KEY (robot_id) REFERENCES robots(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

CREATE TABLE patient_bio_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    heart_rate INT,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(5, 2),
    oxygen_level DECIMAL(5, 2),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- Inserting data into users table
INSERT INTO users (username, password, role, availability_status) VALUES
('doctor1', 'robotpi', 'doctor', 'available'),
('patient1', 'robotpi', 'patient', 'unavailable'),
('manager1', 'robotpi', 'manager', 'available');

-- Inserting data into patient_doctor_relationship table
INSERT INTO patient_doctor_relationship (patient_id, doctor_id) VALUES
((SELECT id FROM users WHERE username = 'patient1'),
 (SELECT id FROM users WHERE username = 'doctor1'));

-- Inserting data into robots table
INSERT INTO robots (robot_name, status) VALUES
('Robot_A', 'active'),
('Robot_B', 'inactive'),
('Robot_C', 'maintenance');

-- Inserting data into robot_patient_relationship table
INSERT INTO robot_patient_relationship (robot_id, patient_id, status) VALUES
((SELECT id FROM robots WHERE robot_name = 'Robot_A'),
 (SELECT id FROM users WHERE username = 'patient1'),
 'active');

-- Inserting data into patient_bio_status table
INSERT INTO patient_bio_status (patient_id, timestamp, heart_rate, blood_pressure, temperature, oxygen_level) VALUES
((SELECT id FROM users WHERE username = 'patient1'),
 NOW(),
 72,
 '120/80',
 36.6,
 98.5);

 INSERT INTO users (username, password, role, availability_status) VALUES
 ('patient2', 'robotpi', 'patient', 'available'),
 ('patient3', 'robotpi', 'patient', 'unavailable'),
 ('patient4', 'robotpi', 'patient', 'available'),
 ('patient5', 'robotpi', 'patient', 'unavailable');

UPDATE users
SET availability_status = 'unavailable'
WHERE role = 'patient';