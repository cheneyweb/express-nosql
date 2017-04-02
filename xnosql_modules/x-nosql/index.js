const express = require('express')
const router = express.Router()
// 持久化相关
const mongodb = require(__dirname + '/mongodb/mongodb.js')
const ObjectId = require('mongodb').ObjectID
// 日志相关
const log = require('tracer').colorConsole()

// 配置路由与实体对象的绑定
// 创建实体对象
router.post('/*/create', function(req, res) {
    mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    let r = mongodb.insert(req.modelName, req.body)
    r.then(result => {
        res.send(result.insertedId)
    }).catch(error => {
        log.err(error.message)
    })
})
// 更新实体对象(根据ID替换)
router.post('/*/update', function(req, res) {
    mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    var query = { '_id': ObjectId(req.body._id) }
    delete req.body._id
    let r = mongodb.update(req.modelName, query, { $set: req.body })
    r.then(result => {
        res.send(result.result.nModified.toString())
    }).catch(error => {
        log.error(error.message)
    })
})
// 复杂查询实体对象
router.post('/*/query', function(req, res) {
    mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    let r = mongodb.find(req.modelName, req.body)
    r.then(result => {
        res.send(result)
    }).catch(error => {
        log.error(error.message)
    })
})
// 销毁实体对象(删除时需要登录认证权限)
router.get('/*/destroy/:id', function(req, res) {
    mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    var query = { '_id': ObjectId(req.params.id) }
    let r = mongodb.remove(req.modelName, query)
    r.then(result => {
        res.send(result.result.n.toString())
    }).catch(error => {
        log.error(error.message)
    })
})
// 获取实体对象
router.get('/*/get/:id', function(req, res) {
    mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    log.info(req.params.id)
    var query = { '_id': ObjectId(req.params.id) }
    let r = mongodb.findOne(req.modelName, query)
    r.then(result => {
        res.send(result)
    }).catch(error => {
        log.error(error.message)
    })
})

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

module.exports = router
