const http = require('http');
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const server = http.createServer(app);

const io = require("socket.io")(server);

const vendorRoutes = require("./api/routes/vendors");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require('./api/routes/user');
const testRoutes = require('./api/routes/test');

const port = process.env.PORT || 3000;

mongoose.connect(
  "mongodb://peter:" + process.env.MONGO_ATLAS_PW + "@cluster0-shard-00-00-9xx0c.mongodb.net:27017,cluster0-shard-00-01-9xx0c.mongodb.net:27017,cluster0-shard-00-02-9xx0c.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useMongoClient: true
  }
);

mongoose.Promise = global.Promise;


app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/vendors", vendorRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);
app.use("/test", testRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

server.listen(port);
