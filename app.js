// 系统配置
const config = require('config')
const port = config.server.port
const controllerRoot = config.server.controllerRoot
// 应用服务
const express = require('express')
const bodyParser = require('body-parser')
const xnosql = require(__dirname + '/xnosql_modules/express-xnosql/index.js')
// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })

// 初始化应用服务器
const app = express()
app.use(bodyParser.json())
// 使用路由统一控制
xnosql.initConnect(config.db.url)
app.use(controllerRoot, xnosql)

// 开始服务监听
app.listen(port)
log.info(`XNosql应用启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
log.info(`[POST]http://host:${port}/xnosql/MODEL/create`)
log.info(`[POST]http://host:${port}/xnosql/MODEL/update`)
log.info(`[POST]http://host:${port}/xnosql/MODEL/query`)
log.info(`[GET]http://host:${port}/xnosql/MODEL/get/:id`)
log.info(`[GET]http://host:${port}/xnosql/MODEL/destroy/:id`)