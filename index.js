const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6lu5yx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('actionCon').collection('toys');

    app.get('/toys', async(req, res) =>{
      const limit = 20;
      const search = req.query.search;
      // console.log(limit,search);
      const query = {toyName: {$regex: search, $options: 'i'}}
        const cursor = toysCollection.find(query);
        const result = await cursor.limit(limit).toArray();
        res.send(result);
    }) 

    app.get('/toys/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await toysCollection.findOne(query);
        res.send(result);
    })

    app.get('/myToys', async(req, res) =>{
        // console.log(req.query.email);
        const sort = req.query.sortOrder;
        let query = {};
        if(req.query?.email) {
            query = {sellerEmail: req.query.email}
        }
        const options = {
          sort: { "price": sort === 'asc' ? 1 : -1 }
        };
        const result = await toysCollection.find(query, options).toArray();
        res.send(result)
    })

    app.post('/addAToy', async(req, res) =>{
        const newToy = req.body;
        const result = await toysCollection.insertOne(newToy);
        res.send(result);
    })

    app.patch('/toys/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updatedToy = req.body;
        // console.log(updatedToy);
        const updateDoc = {
            $set: {
                price:updatedToy.price,
                quantity:updatedToy.quantity,
                description: updatedToy.description
            },
          }
          const result = await toysCollection.updateOne(filter, updateDoc);
          res.send(result);
    })

    app.delete('/toys/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.deleteOne(query);
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('ActionCon is running!')
})

app.listen(port,() => {
    console.log(`ActionCon server is running on port ${port}`);
})