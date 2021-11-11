const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxoa3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err =>{
  const productsCollection = client.db('drone_gallery').collection('products');
  const orderCollection = client.db('drone_gallery').collection('orders');
  const usersCollection = client.db('drone_gallery').collection('users');
  const reviewsCollection = client.db('drone_gallery').collection('reviews');

    // post api 
    app.post("/products", (req,res) =>{
      productsCollection.insertOne(req.body).then((result) =>{
        res.send(result.insertedId);
      })
    });
    app.post("/reviews", (req,res) =>{
      reviewsCollection.insertOne(req.body).then((result) =>{
        res.send(result.insertedId);
      })
    });

  // get api 
   app.get('/products', async(req,res) =>{
    const products = await productsCollection.find({}).toArray();
    res.send(products);
  });
   app.get('/reviews', async(req,res) =>{
    const reviews = await reviewsCollection.find({}).toArray();
    res.send(reviews);
  });

//   add order 
  app.post("/myorders", (req,res) =>{
    orderCollection.insertOne(req.body).then((result) =>{
      console.log(result);
      res.send(result);
    })
  });

  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
  })

  app.post('/users', async(req,res) =>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
  })

  app.put('/users', async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
});

app.put('/users/admin', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const updateDoc = { $set: { role: 'admin' } };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.json(result);
  
  })

  app.get('/myorders', async(req,res) =>{
    const orders = await orderCollection.find({}).toArray();
    res.send(orders);
  });

//   // delete my orders 
  app.delete('/myorders/:id', async(req,res) =>{
    const id = req.params.id;
    const query = {_id:id};
    const result = await orderCollection.deleteOne(query);
    res.send(result);
  })
  app.delete('/reviews/:id', async(req,res) =>{
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await reviewsCollection.deleteOne(query);
    res.send(result);
  })

  // get my orders
  // app.get("/mybooking/:email",async (req,res) =>{
  //   console.log(req.params.email);
  //   const result = await orderCollection.find({email: req.params.email}).toArray();
  //   console.log(result);
  // });



 app.get('/', (req, res) => {
  res.send('server is running')
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
});