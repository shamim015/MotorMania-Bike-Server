const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hliqw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const database = client.db("MotorMania")
    const ProductCollection = database.collection("products");
    const UserProductsCollection = database.collection("userProducts");
    const usersCollection = database.collection("users");
    const ReviewCollection = database.collection("addReview");

    // get API
    app.get('/products', async (req, res) => {
        const result = await ProductCollection.find({}).toArray();
        res.send(result);
    });

    // GET SINGLE Product 
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await ProductCollection.findOne(query);
        res.json(product);
    })

    // add products
    app.post("/addProducts", async (req, res) => {
        console.log(req.body);
        const result = await ProductCollection.insertOne(req.body);
        console.log(result);
    });

    // userProducts API
    app.post("/userProducts", async (req, res) => {
        const result = await UserProductsCollection.insertOne(req.body);
        res.json(result);
    });

    app.get('/userProducts', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const cursor = UserProductsCollection.find(query);
        const userProduct = await cursor.toArray();
        res.json(userProduct);
    });

    // delete Product
    app.delete("/userProducts/:id", async (req, res) => {
        const id = req.query.id;
        const query = { _id: ObjectId(id) };
        const result = await UserProductsCollection.deleteOne(query);
        res.json(result);
    });

    // users API
    app.post('/users', async (req, res) => {
        const result = await usersCollection.insertOne(req.body);
        res.json(result);
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

    // admin API
    app.put('/users', async (req, res) => {
        const user = req.body;
        console.log('put', user);
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);

    })
    // Add Review ....review
    app.post('/addReview', async (req, res) => {
        const result = await ReviewCollection.insertOne(req.body);
        res.json(result);
    });

    app.get('/AllReview', async (req, res) => {
        const result = await ReviewCollection.find({}).toArray();
        res.send(result);
    });

    // client.close();
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});