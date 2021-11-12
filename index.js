const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hliqw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const ProductCollection = client.db("MotorMania").collection("Products");

    // get API
    app.get('/product', async (req, res) => {
        const result = await ProductCollection.find({}).toArray();
        res.send(result);
        console.log(result);
    });

    // add package
    app.post("/addProduct", async (req, res) => {
        console.log(req.body);
        const result = await ProductCollection.insertOne(req.body);
        console.log(result);
    });

    // delete Product

    app.delete("/deleteProduct/:id", async (req, res) => {
        console.log(req.params.id);
        const result = await ProductCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
        res.send(result);
    });
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