use robot-pi

db.createCollection("clients");
db.createCollection("status_updates");


db.clients.insertMany([
  {
      "_id" : ObjectId("666a713aafd17975d31e0fc4"),
      "status" : "online",
      "_class" : "com.example.videocall.model.Client",
      "password" : "robotpi"
  },
  {
      "_id" : ObjectId("666a7141afd17975d31e0fc6"),
      "status" : "offline",
      "_class" : "com.example.videocall.model.Client",
      "password" : "robotpi"
  },
  {
      "_id" : ObjectId("666a77f92f04c47df5822081"),
      "status" : "offline",
      "password" : "robotpi",
      "_class" : "com.example.videocall.model.Client"
  },
  {
      "_id" : ObjectId("666a7dd9ddb968704dbeb55e"),
      "status" : "online",
      "password" : "robotpi",
      "_class" : "com.example.videocall.model.Client"
  }
]);

db.status.insertMany( [
{
    "_id" : ObjectId("66786f9ab0ead29c887abdfd"),
    "clientId" : "666a7dd9ddb968704dbeb55e",
    "bodyTemperature" : 36.6,
    "pulseRate" : NumberInt(72),
    "timestamp" : ISODate("2024-06-23T18:55:22.895+0000")
},
{
    "_id" : ObjectId("6678c760b0ead29c887abdfe"),
    "clientId" : "666a7dd9ddb968704dbeb55e",
    "bodyTemperature" : 36.7,
    "pulseRate" : NumberInt(73),
    "timestamp" : ISODate("2024-06-24T01:09:52.714+0000")
},
{
    "_id" : ObjectId("6678e5fbb0ead29c887abdff"),
    "clientId" : "666a7141afd17975d31e0fc6",
    "bodyTemperature" : 36.2,
    "pulseRate" : NumberInt(83),
    "timestamp" : ISODate("2024-06-24T03:20:27.948+0000")
},
{
    "_id" : ObjectId("6678e607b0ead29c887abe00"),
    "clientId" : "666a77f92f04c47df5822081",
    "bodyTemperature" : 36.2,
    "pulseRate" : NumberInt(103),
    "timestamp" : ISODate("2024-06-24T03:20:39.071+0000")
},
]);