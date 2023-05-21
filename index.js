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
   
    const indexKeys = { name: 1, subCategory: 1 };
    const indexOptions = { name: "dollCategory" }; 
    const result = await dollCollection.createIndex(indexKeys, indexOptions);
    

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
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;
      const toys=await dollCollection.find({}).skip(skip).limit(limit).toArray()
      res.send(toys)
    })


    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email);
      const dolls= await dollCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(dolls);
    });

    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const toys = { _id: new ObjectId(id) }
      const result = await dollCollection.deleteOne(toys);
      res.send(result);
  })

  app.get("/getToysByText/:text", async (req, res) => {
    const text = req.params.text;
    const result = await dollCollection
      .find({
        $or: [
          { name: { $regex: text, $options: "i" } },
          { subCategory: { $regex: text, $options: "i" } },
        ],
      })
      .toArray();
    res.send(result);
  });

  app.put("/updateMyToys/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    console.log(body);
    const filter = { _id: new ObjectId(id) };
    const updateMyToys = {
      $set: {
        price: body.price,
        quantity: body.quantity,
        description: body.description,
      },
    };
    const result = await dollCollection.updateOne(filter, updateMyToys);
    res.send(result);
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