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

    // get API
    app.get('/products', async (req, res) => {
        const result = await ProductCollection.find({}).toArray();
        res.send(result);
        console.log(result);
    });

    app.get('/userProducts', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const cursor = UserProductsCollection.find(query);
        const userProduct = await cursor.toArray();
        res.json(userProduct);
    });

    // userProducts API
    app.post("/userProducts", async (req, res) => {
        const result = await UserProductsCollection.insertOne(req.body);
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

    // users API
    app.post('/users', async (req, res) => {
        const result = await usersCollection.insertOne(req.body);
        console.log(result);
        res.json(result);
    });

    // admin API
    app.put('/users', async (req, res) => {
        const user = req.body;
        console.log('put', user);
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);

    })

    // add package
    // app.post("/addProduct", async (req, res) => {
    //     console.log(req.body);
    //     const result = await ProductCollection.insertOne(req.body);
    //     console.log(result);
    // });

    // delete Product

    // app.delete("/deleteProduct/:id", async (req, res) => {
    //     console.log(req.params.id);
    //     const result = await ProductCollection.deleteOne({
    //         _id: ObjectId(req.params.id),
    //     });
    //     res.send(result);
    // });
    // GET SINGLE Product
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        console.log('getting specific products', id);
        const query = { _id: ObjectId(id) };
        const product = await ProductCollection.findOne(query);
        res.json(product);
    })

    // client.close();
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})