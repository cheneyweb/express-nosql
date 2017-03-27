var express = require('express');
var router = express.Router();
var passport = require(__dirname + '/../auth/passport_config.js');
// 持久化相关
// var MongoClient = require('mongodb').MongoClient;
// var dburl = require('config').get('db').get('url');
var mongodb = require(__dirname + '/../mongodb/mongodb.js');
var ObjectId = require('mongodb').ObjectID;
// 日志相关
var log = require('tracer').colorConsole({ level: require('config').get('log').level });

// 配置路由与实体对象的绑定
// 创建实体对象
router.post('/xnosql/*/create', function(req, res) {
    req.modelName = req.path.split('/')[2];
    let r = mongodb.insert(req.modelName, req.body);
    r.then(result => {
        res.send(result.insertedId);
    }).catch(error => {
        log.err(error.message);
    });
});
// 更新实体对象(根据ID替换)
router.post('/xnosql/*/update', function(req, res) {
    req.modelName = req.path.split('/')[2];
    var query = { '_id': ObjectId(req.body._id) };
    delete req.body._id;
    let r = mongodb.update(req.modelName, query, { $set: req.body });
    r.then(result => {
        res.send(result.result.nModified.toString());
    }).catch(error => {
        log.error(error.message);
    });
});
// 复杂查询实体对象
router.post('/xnosql/*/query', function(req, res) {
    req.modelName = req.path.split('/')[2];
    let r = mongodb.find(req.modelName,req.body);
    r.then(result => {
        res.send(result);
    }).catch(error => {
        log.error(error.message);
    });
});
// 销毁实体对象(删除时需要登录认证权限)
router.get('/xnosql/*/destroy/:id', function(req, res) {
    req.modelName = req.path.split('/')[2];
    var query = { '_id': ObjectId(req.params.id) };
    let r = mongodb.remove(req.modelName,query);
    r.then(result => {
        res.send(result.result.n.toString());
    }).catch(error => {
        log.error(error.message);
    });
});
// 获取实体对象
router.get('/xnosql/*/get/:id', function(req, res) {
    req.modelName = req.path.split('/')[2];
    log.info(req.params.id);
    var query = { '_id': ObjectId(req.params.id) };
    let r = mongodb.findOne(req.modelName,query);
    r.then(result => {
        res.send(result);
    }).catch(error => {
        log.error(error.message);
    });
});

// 登录认证
router.post('/user/login', passport.authenticate('local', { failureFlash: true }), function(req, res) {
    // log.info(req.user);
    res.send("success");
});

// 认证测试
router.get('/user/testauth', passport.authenticateMiddleware(), function(req, res) {
    res.send('允许访问');
});

// function ucfirst(str) {
//     str = str.toLowerCase();
//     str = str.replace(/\b\w+\b/g, function(word) {
//         return word.substring(0, 1).toUpperCase() + word.substring(1);
//     });
//     return str;
// }

// function transJavaStyle(str) {
//     var re = /_(\w)/g;
//     return str.replace(re, function($0, $1) {
//         return $1.toUpperCase();
//     });
// }

module.exports = router;
