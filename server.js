let express = require("express");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
let fs = require("fs");
let MongoClient = require("mongodb").MongoClient;
let bodyParser = require("body-parser");
let app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Hello from user-api");
});

console.log('process env:', process.env);

let mongoUrlDocker = `mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PWD}@${process.env.DB_URL}`;

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = process.env.DB_NAME;

app.post("/user", function (req, res) {
  let userObj = req.body;

  console.log("Request received:", req.body);

  MongoClient.connect(
    mongoUrlDocker,
    mongoClientOptions,
    function (err, client) {
      if (err) throw err;

      const userId = uuidv4();

      let db = client.db(databaseName);
      userObj["userid"] = userId;

      db.collection("users").insertOne(req.body, function (err, result) {
        if (err) throw err;
        client.close();

        console.log("result:", result.ops);
        res.send(result.ops[0]);
      });
    }
  );
});

app.get("/user/:userId", function (req, res) {
  let response = {};
  // Connect to the db
  MongoClient.connect(
    mongoUrlDocker,
    mongoClientOptions,
    function (err, client) {
      if (err) throw err;

      let db = client.db(databaseName);

      let myquery = { userid: req.params.userId };

      db.collection("users").findOne(myquery, function (err, result) {
        if (err) throw err;
        response = result;
        client.close();

        // Send response
        res.send(response ? response : {});
      });
    }
  );
});

app.patch('/user/:userId', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
     userObj['userid'] = req.params.userId;

    let myquery = { userid: req.params.userId };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function (err, result) {
      if (err) throw err;
      client.close();

      res.send(result);
    });
  });
});


app.delete('/user/:userId', function (req, res) {

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: req.params.userId };

    db.collection("users").deleteOne(myquery, function (err, result) {
      if (err) throw err;
      client.close();

      res.send(result);
    });
  });
});


app.get('/user', function (req, res) {

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    db.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      client.close();
      res.send(result);
    });
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
