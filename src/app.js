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

const tweetSchema = joi.object({
  username: joi.string().required(),
  tweet: joi.string().required()
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

server.post('/tweets', async (req, res) => {
  const tweet = req.body;
  const validation = tweetSchema.validate(tweet, { abortEarly: false });
  
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }
  
  try{
    const userExist = await db.collection('users').findOne({ username: tweet.username });
    if (!userExist) return res.status(401).send('Usuário Inválido.')
    const tweetCreated = await db.collection('tweets').insertOne(tweet);
    const newTweet = await db.collection('tweets').findOne({ _id: tweetCreated.insertedId });
    res.status(201).send(newTweet);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server Running in port ${port}`);
})