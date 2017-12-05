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
router.post('/:model_name/create', async function (req, res) {
    try {
        const result = await mongodb.insert(req.params.model_name, req.body)
        res.send(okRes(result.insertedId))
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 更新实体对象(根据ID替换)
router.post('/:model_name/update', async function (req, res) {
    try {
        const query = { '_id': ObjectId(req.body._id) }
        delete req.body._id
        const result = await mongodb.update(req.params.model_name, query, { $set: req.body })
        res.send(okRes(result.result.nModified.toString()))
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 复杂查询实体对象
router.post('/:model_name/query', async function (req, res) {
    try {
        const result = await mongodb.find(req.params.model_name, req.body)
        res.send(okRes(result))
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 销毁实体对象(删除时需要登录认证权限)
router.get('/:model_name/destroy/:id', async function (req, res) {
    try {
        const query = { '_id': ObjectId(req.params.id) }
        const result = await mongodb.remove(req.params.model_name, query)
        res.send(okRes(result.result.n.toString()))
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 获取实体对象
router.get('/:model_name/get/:id', async function (req, res) {
    try {
        const query = { '_id': ObjectId(req.params.id) }
        const result = await mongodb.findOne(req.params.model_name, query)
        res.send(okRes(result))
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})

function okRes(res) {
    return { err: false, res: res }
}
function errRes(res) {
    return { err: true, res: res }
}

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
