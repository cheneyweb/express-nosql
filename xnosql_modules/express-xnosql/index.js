// 路由相关
const express = require('express')
const router = express.Router()
// 持久化相关
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const mongodb = require(__dirname + '/mongodb/mongodb.js')
const ObjectId = require('mongodb').ObjectID
// 日志相关
const log = require('tracer').colorConsole()

/**
 * 初始化数据库连接，加载所有中间件路由
 */
router.init = function (app, options) {
    MongoClient.connect(options.mongodbUrl, function (err, database) {
        if (err) throw err
        mongodb.db = database.db(options.mongodbUrl.substring(options.mongodbUrl.lastIndexOf('/') + 1, options.mongodbUrl.length))
        router.mongodb = mongodb
        global.mongodb = mongodb
    })
    const middlewareDir = `${process.cwd()}${options.middlewareDir || '/src/middleware/'}`
    const controllerRoot = options.xnosqlRoot || '/xnosql'
    const afterRouterArr = []
    fs.readdirSync(middlewareDir).forEach(function (filename) {
        if (filename.startsWith('pre')) {
            let router = require(`${middlewareDir}/${filename}`)
            app.use(controllerRoot, router)
        }
    })
    log.info('xnosql所有前置路由已加载')
    app.use(controllerRoot, router)
    log.info('xnosql所有执行路由已加载')
    fs.readdirSync(middlewareDir).forEach(function (filename) {
        if (filename.startsWith('after')) {
            afterRouterArr.push(filename.split('-')[1].split('.')[0])
            let router = require(`${middlewareDir}/${filename}`)
            app.use(controllerRoot, router)
        }
    })
    router.afterRouterArr = afterRouterArr
    log.info('xnosql所有后置路由已加载')
}
// 配置路由与实体对象的绑定
// 创建实体对象
router.post('/:model_name/create', async function (req, res, next) {
    try {
        const result = await mongodb.insert(req.params.model_name, req.body)
        if (router.afterRouterArr.indexOf(req.params.model_name) != -1) {
            res.result = okRes(result.insertedId)
        } else {
            res.send(okRes(result.insertedId))
        }
        return next()
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 更新实体对象(根据ID替换)
router.post('/:model_name/update', async function (req, res, next) {
    try {
        const query = { '_id': ObjectId(req.body._id) }
        delete req.body._id
        const result = await mongodb.update(req.params.model_name, query, { $set: req.body })
        if (router.afterRouterArr.indexOf(req.params.model_name) != -1) {
            res.result = okRes(result.result.nModified.toString())
        } else {
            res.send(okRes(result.result.nModified.toString()))
        }
        return next()
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 复杂查询实体对象
router.post('/:model_name/query', async function (req, res, next) {
    try {
        const result = await mongodb.find(req.params.model_name, req.body)
        if (router.afterRouterArr.indexOf(req.params.model_name) != -1) {
            res.result = okRes(result)
        } else {
            res.send(okRes(result))
        }
        return next()
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 销毁实体对象(删除时需要登录认证权限)
router.get('/:model_name/destroy/:id', async function (req, res, next) {
    try {
        const query = { '_id': ObjectId(req.params.id) }
        const result = await mongodb.remove(req.params.model_name, query)
        if (router.afterRouterArr.indexOf(req.params.model_name) != -1) {
            res.result = okRes(result.result.n.toString())
        } else {
            res.send(okRes(result.result.n.toString()))
        }
        return next()
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})
// 获取实体对象
router.get('/:model_name/get/:id', async function (req, res, next) {
    try {
        const query = { '_id': ObjectId(req.params.id) }
        const result = await mongodb.findOne(req.params.model_name, query)
        if (router.afterRouterArr.indexOf(req.params.model_name) != -1) {
            res.result = okRes(result)
        } else {
            res.send(okRes(result))
        }
        return next()
    } catch (error) {
        log.error(error)
        res.send(errRes('路由服务异常'))
    }
})

function okRes(res, next) {
    return { err: false, res: res }
}
function errRes(res, next) {
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
