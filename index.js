const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { response } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bjnos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log('uri', uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("connected to db");
        const database = client.db("tourism");
        const resortCollection = database.collection("resort_details");
        const orderCollection = database.collection("orders");

        // const database = client.db("volunteer_network");

        // const workCollection = database.collection("work");

        app.get('/resorts', async (req, res) => {
            const cursor = resortCollection.find({});
            const resorts = await cursor.toArray();
            res.send(resorts);
        });

        app.post("/place-order", async (req, res) => {
            console.log(req.body);
            const result = await orderCollection.insertOne(req.body);
            console.log(result);
            res.json(result);
        });
        app.post("/add-service", async (req, res) => {
            console.log(req.body);
            const result = await resortCollection.insertOne(req.body);
            console.log(result);
            res.json(result);
        });
        app.get("/booking/:serviceId", async (req, res) => {
            const id = req.params.serviceId;
            const query = { _id: ObjectId(id) };
            console.log('query', query);
            const result = await resortCollection.findOne(query);
            res.json(result);
        });
        
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            //console.log(email);
            const query = { email: email };
            //console.log(query);
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });
        app.get('/manageOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.delete("/deleteOrder/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        app.put('/updateOrder/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Running Server");
})

app.listen(port, () => {
    console.log('Running Genius Server on port ', port);
});


//future update
//1. git add, commit, push
//2. save everything and check locally
//3. git push heroku main