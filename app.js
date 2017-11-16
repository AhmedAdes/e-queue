﻿var express = require("express");
var http = require("http");
var path = require("path");
var compression = require("compression");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var favicon = require("serve-favicon");
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

var sql = require("mssql");
var con = require("./SQLConfig.js");
const pool = new sql.ConnectionPool(con.config);
//store the connection
sql.globalPool = pool;
var app = express();

// all environments
app.set("port", 2525);

app.set("views", path.join(__dirname, "public/dist"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(cors());
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

var stylus = require("stylus");
app.use(stylus.middleware(path.join(__dirname, "public/dist")));
app.use(express.static(path.join(__dirname, "public/dist")));

// development only
//if ('development' == app.get('env')) {
//    app.use(express.errorHandler());
//}

var index = require("./routes/index.js");
var login = require("./routes/login.js");
var user = require("./routes/users.js");

app.use("/", index);
app.use("/api/auth", login);
app.use("/api/users", user);

pool.connect(err => {
  if (err) {
    console.log("Failed to open a SQL Database connection.", err.stack);
  } else {
    http.createServer(app).listen(app.get("port"), function() {
      console.log("Express server listening on port " + app.get("port"));
    });
  }
});

pool.on("error", function(err) {
  console.log("Sql Connection Error.", err);
});