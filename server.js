require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db_connect');
const app = express();
const recommendationRoutes = require('./routes/recommendations');


// connect to DB
connectDB();


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// routes
app.use("/user", require("./routes/user"));
app.use('/api/auth', require('./routes/user'));
app.use("/api/products", require("./routes/product")); 
app.use("/api/orders", require("./routes/order")); 
app.use("/api/articles", require("./routes/article"));
app.use("/api/comments", require("./routes/comment"));
app.use('/api/recommendations', recommendationRoutes);

//server
const PORT = process.env.PORT;
app.listen(PORT, (err) => err ?
  console.log(err) : console.log("server is running on port " + PORT)
);