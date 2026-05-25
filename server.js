require('dotenv').config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require('./config/db_Connect');
const app = express();
const recommendationRoutes = require('./routes/recommendations');


// connect to DB
connectDB();


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(passport.initialize());
require('./middleware/passport');
app.use("/uploads", express.static("uploads"));

// routes
app.use("/user", require("./routes/user"));
app.use('/api/auth', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use("/api/products", require("./routes/product")); 
app.use("/api/orders", require("./routes/order")); 
app.use("/api/articles", require("./routes/article"));

app.use('/api/recommendations', recommendationRoutes);

//server
const PORT = process.env.PORT;
app.listen(PORT, (err) => err ?
  console.log(err) : console.log("server is running on port " + PORT)
);