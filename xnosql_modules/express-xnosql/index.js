const express = require('express')
const router = express.Router()
// 持久化相关
const MongoClient = require('mongodb').MongoClient
const mongodb = require(__dirname + '/mongodb/mongodb.js')
const ObjectId = require('mongodb').ObjectID
// 日志相关
const log = require('tracer').colorConsole()

// 连接数据库
router.initConnect = function (dburl) {
    MongoClient.connect(dburl, function (err, database) {
        if (err) throw err
        mongodb.db = database
        router.mongodb = mongodb
        global.mongodb = mongodb
    })
}

// 配置路由与实体对象的绑定
// 创建实体对象
router.post('/:modelName/create', function (req, res) {
    // mongodb.dburl = router.dburl
    let r = mongodb.insert(req.params.modelName, req.body)
    r.then(result => {
        res.send(result.insertedId)
    }).catch(error => {
        log.err(error.message)
    })
})
// 更新实体对象(根据ID替换)
router.post('/:modelName/update', function (req, res) {
    // mongodb.dburl = router.dburl
    var query = { '_id': ObjectId(req.body._id) }
    delete req.body._id
    let r = mongodb.update(req.params.modelName, query, { $set: req.body })
    r.then(result => {
        res.send(result.result.nModified.toString())
    }).catch(error => {
        log.error(error.message)
    })
})
// 复杂查询实体对象
router.post('/:modelName/query', function (req, res) {
    // mongodb.dburl = router.dburl
    let r = mongodb.find(req.params.modelName, req.body)
    r.then(result => {
        res.send(result)
    }).catch(error => {
        log.error(error.message)
    })
})
// 销毁实体对象(删除时需要登录认证权限)
router.get('/:modelName/destroy/:id', function (req, res) {
    // mongodb.dburl = router.dburl
    req.modelName = req.path.split('/')[1]
    var query = { '_id': ObjectId(req.params.id) }
    let r = mongodb.remove(req.params.modelName, query)
    r.then(result => {
        res.send(result.result.n.toString())
    }).catch(error => {
        log.error(error.message)
    })
})
// 获取实体对象
router.get('/:modelName/get/:id', function (req, res) {
    // mongodb.dburl = router.dburl
    var query = { '_id': ObjectId(req.params.id) }
    let r = mongodb.findOne(req.params.modelName, query)
    r.then(result => {
        res.send(result)
    }).catch(error => {
        log.error(error.message)
    })
})

module.exports = router
