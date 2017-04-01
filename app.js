// 系统配置
const config = require('config')
const port = config.get('server').port
const controllerRoot = config.get('server').controllerRoot
// 应用服务
const express = require('express')
const bodyParser = require('body-parser')
const router = require(__dirname + '/xnosql_modules/router/router.js')
// 认证相关
const expressSession = require('express-session')
const passport = require(__dirname + '/xnosql_modules/auth/passport_config.js')
const flash = require('connect-flash')
// 日志相关
const log = require('tracer').colorConsole({ level: require('config').get('log').level })

// 初始化应用服务器
const app = express()
app.use(bodyParser.json())
app.use(expressSession({
    secret: 'cheneyxu',
    resave: false,
    saveUninitialized: false
}))
// 初始化调用 passport
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// 使用路由统一控制(目前支持以下5种RESTful请求)
/**
 * [POST]http://host:port/xnosql/model/create
 * [POST]http://host:port/xnosql/model/update
 * [POST]http://host:port/xnosql/model/query
 * [GET]http://host:port/xnosql/model/get/:id
 * [GET]http://host:port/xnosql/model/destroy/:id
 */
app.use(controllerRoot, router);

// 开始服务监听
app.listen(port, function() {
    log.info(`XNosql服务已启动,执行环境:${process.env.NODE_ENV},端口:${port}...`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/create`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/update`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/query`)
    log.info(`[GET]http://host:${port}/xnosql/MODEL/get/:id`)
    log.info(`[GET]http://host:${port}/xnosql/MODEL/destroy/:id`)
})