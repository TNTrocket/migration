var path = require('path')
var express = require('express')
var router = require("./router")
var app = express();
app.use("/css",express.static(path.join(__dirname, '/css')))
app.use("/img",express.static(path.join(__dirname, '/img')))
app.use("/js",express.static(path.join(__dirname, '/js')))
app.use("/template",express.static(path.join(__dirname, '/template')))
app.use("/csvTemplate",express.static(path.join(__dirname, '/csvTemplate')))
var port = 3000
app.use(router);
app.listen(port);
