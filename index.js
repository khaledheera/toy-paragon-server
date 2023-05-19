const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mcevyaf.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const dollCollection = client.db('toyParagon').collection('dollCategory');
    

    app.get('/category', async (req, res) => {
        const dolls = dollCollection.find();
        const result = await dolls.toArray();
        res.send(result);
    })

    app.get('/category/:id',async(req,res)=>{
      const id = req.params.id;
      const details = { _id: new ObjectId(id) }
      const result = await dollCollection.findOne(details);
            res.send(result);

    })

    app.post('/addToys',async(req,res)=>{
      const newToy=req.body
      const newToys=await dollCollection.insertOne(newToy)
      res.send(newToys)
    })
    app.get('/allToys',async(req,res)=>{
      const toys=await dollCollection.find({}).toArray()
      res.send(toys)
    })


    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email);
      const dolls= await dollCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(dolls);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Toy Paragon is Running ')
  })
  
  app.listen(port, () => {
    console.log(`Toy Paragon  server is running on port: ${port}`);
  })