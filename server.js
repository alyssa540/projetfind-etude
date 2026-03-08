const express=require("express");
const  cors=require("cors");
const connectDB=require('./config/db_connect');
const app = express();
require('dotenv').config();


// connect to DB
connectDB();



// routes
app.use(express.json());
app.use(cors());
app.use("/user",require("./routes/user"));
app.use('/api/auth', require('./routes/user'));// Tes routes actuelles
app.use("/api/products", require("./routes/product")); // Nouvelles routes catalogue
app.use("/api/orders", require("./routes/order")); // Nouvelles routes commandes
app.use("/api/articles", require("./routes/article"));
app.use("/api/comments", require("./routes/comment"));
//server
const PORT=process.env.PORT;
app.listen(PORT,(err)=> err ?
console.log(err) : console.log("server is running"));