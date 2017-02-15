var path = require('path')
//var url = require('url')
//var chalk = require('chalk')
//var request = require('request')
var express = require('express')
var httpProxy =require("http-proxy-middleware")

var app = express()

app.use("/css",express.static(path.join(__dirname, '/css')))
app.use("/img",express.static(path.join(__dirname, '/img')))
app.use("/js",express.static(path.join(__dirname, '/js')))
app.use("/template",express.static(path.join(__dirname, '/template')))
app.use("/csvTemplate",express.static(path.join(__dirname, '/csvTemplate')))
app.use('/', httpProxy('/migration',{target: 'http://localhost:8080', changeOrigin: true}));

app.get('/', function(req, res, next) {
    res.sendfile('orgSelect.html');
});
app.get('/openMove.html', function(req, res, next) {
    res.sendfile('openMove.html');
});
app.get('/openStep.html', function(req, res, next) {
    res.sendfile('openStep.html');
});
app.get('/orgSelect.html', function(req, res, next) {
    res.sendfile('orgSelect.html');
});
var port = 3000

app.listen(port)
