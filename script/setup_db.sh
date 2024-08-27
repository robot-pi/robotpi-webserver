use robot-pi

db.createCollection("users");
db.users.createIndex({ "username": 1 }, { unique: true });

db.createCollection("patient_doctor_relationship");
db.patient_doctor_relationship.createIndex({ "patient_id": 1, "doctor_id": 1 }, { unique: true });

db.createCollection("robots");
db.robots.createIndex({ "robot_name": 1 }, { unique: true });

db.createCollection("robot_patient_relationship");
db.robot_patient_relationship.createIndex({ "robot_id": 1, "patient_id": 1 }, { unique: true });

db.createCollection("patient_bio_status");
db.patient_bio_status.createIndex({ "patient_id": 1, "timestamp": 1 });

db.users.insertOne({
    "_id": ObjectId("60d5ec49f16a2b3f8b3c3e34"),
    "username": "doctor1",
    "password": "robotpi",
    "role": "doctor",
    "availability_status": "available"
});

db.users.insertOne({
    "_id": ObjectId("60d5ec49f16a2b3f8b3c3e36"),
    "username": "patient1",
    "password": "robotpi",
    "role": "patient",
    "availability_status": "unavailable"
});


db.patient_doctor_relationship.insertOne({
    "patient_id": ObjectId("60d5ec49f16a2b3f8b3c3e36"),
    "doctor_id": ObjectId("60d5ec49f16a2b3f8b3c3e34")
});

db.robots.insertOne({
    "_id": ObjectId("60d5ec49f16a2b3f8b3c3e37"),
    "robot_name": "Robot_A",
    "status": "active"
});

db.robot_patient_relationship.insertOne({
    "robot_id": ObjectId("60d5ec49f16a2b3f8b3c3e37"),
    "patient_id": ObjectId("60d5ec49f16a2b3f8b3c3e36"),
    "status": "active"
});

db.patient_bio_status.insertOne({
    "patient_id": ObjectId("60d5ec49f16a2b3f8b3c3e36"),
    "timestamp": ISODate("2024-06-30T08:30:00Z"),
    "heart_rate": 72,
    "blood_pressure": "120/80",
    "temperature": 36.6,
    "oxygen_level": 98.5,
    "other_metrics": {
        "glucose_level": 90,
        "respiration_rate": 16
    }
});

