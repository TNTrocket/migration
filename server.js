var path = require('path')
//var url = require('url')
//var chalk = require('chalk')
//var request = require('request')
var express = require('express')
var httpProxy =require("http-proxy-middleware")
var router = require("./router")
// var jade = require('jade')
var app = express();
// app.set('view engine', 'jade');
// app.use(express.cookieParser())
// app.use(express.session)
app.use("/css",express.static(path.join(__dirname, '/css')))
app.use("/img",express.static(path.join(__dirname, '/img')))
app.use("/js",express.static(path.join(__dirname, '/js')))
app.use("/template",express.static(path.join(__dirname, '/template')))
app.use("/csvTemplate",express.static(path.join(__dirname, '/csvTemplate')))
// app.use('/', httpProxy('/migration',{target: 'http://localhost:8080', changeOrigin: true}));
var port = 3000
app.use(router);
app.listen(port);
