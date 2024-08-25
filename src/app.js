import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import 'dotenv/config';

const server = express();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

server.use(json());
mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message));

const userSchema = joi.object({
  username: joi.string().required(),
  avatar: joi.string().required()
})

server.post('/users', async (req, res) => {
  const user = req.body;
  const validation = userSchema.validate(user, { abortEarly: false });
  
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }
  
  try{
    const userCreated = await db.collection('users').insertOne(user);
    const newUser = await db.collection('users').findOne({ _id: userCreated.insertedId });
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server Running in port ${port}`);
})