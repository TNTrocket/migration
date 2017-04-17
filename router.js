/**
 * Created by zzhpp00 on 2017/3/20.
 */
var express = require('express')
// var mongo = require('mongodb')
// var host = "localhost"
// var port = mongo.CoreConnection.DEFAULT_PORT
var router = express.Router()

router.get('/', function(req, res, next) {
    res.sendfile('orgSelect.html');
});
router.get('/openMove.html', function(req, res, next) {
    res.sendfile('openMove.html');
});
router.get('/openStep.html', function(req, res, next) {
    res.sendfile('openStep.html');
});
router.get('/orgSelect.html', function(req, res, next) {
    res.sendfile('orgSelect.html');
});
router.all('/migration/getOrgList.do',function (req, res, next) {
    var objectJson = {
        code:0,
        data:{
            list:[{
                orgName:"lol.cn",
                openMigration:false,
                orgId:"aa"
            }]
        }
    };
    res.json(objectJson);
});
router.all("/migration/getDomainsByOrgId.do",function (req, res, next) {
    var objectJson = {
        code:0,
        data:{
            list:["lol.cn"]
        }
    };
    res.json(objectJson);
});

router.all("/migration/getOperatorList.do",function (req, res, next) {
    var objectJson = {
        code:0,
        data:{
            list:[]
        }
    };
    res.json(objectJson);
});
router.all("/migration/testMigrationServer.do",function (req, res, next) {
    var objectJson = {
        code:0
    };
    res.json(objectJson);
});
router.all("/migration/openMigration.do",function (req, res, next) {
    var objectJson = {
        code:0
    };
    res.json(objectJson);
});
router.all("/migration/summaryMigrationUserProgress.do",function (req, res, next) {
    var objectJson = {
        code:0,
        data:{
            migrationToMoveCount:0,
            migrationMovingCount:0,
            migrationFinishCount:0,
            migrationShutDownCount:0,
            migrationFailCount:0,
            finishCount:0
        }
    };
    res.json(objectJson);
});
router.all("/migration/listMigrationUsers.do",function (req, res, next) {
    var objectJson = {
        code:0,
        data:{
            total:0
        }
    };
    res.json(objectJson);
});
router.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(error);
});

router.use(function (error,req,res,next) {
    console.log(error.status);
    res.status(error.status || 500);
    res.render('error', {
        message: error.message,
        error: {}
    });
})

module.exports = router