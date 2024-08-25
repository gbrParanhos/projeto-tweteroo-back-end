import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import 'dotenv/config';

const server = express();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

server.use(json());
mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message));

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server Running in port ${port}`);
})