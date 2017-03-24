// 应用服务
var express = require('express');
var bodyParser = require('body-parser');
var router = require(__dirname + '/../xnosql_modules/router/router.js');
// 认证相关
var expressSession = require('express-session');
var passport = require(__dirname + '/../xnosql_modules/auth/passport_config.js');
var flash = require('connect-flash');
// 日志相关
var log = require('tracer').colorConsole({ level: require('config').get('log').level });

// 初始化应用服务器
var app = express();
app.use(bodyParser.json());
app.use(expressSession({
    secret: 'cheneyxu',
    resave: false,
    saveUninitialized: false
}));
// 初始化调用 passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// 使用路由统一控制(目前支持以下5种RESTful请求)
/**
 * [POST]http://host:port/xnosql/model/create
 * [POST]http://host:port/xnosql/model/update
 * [POST]http://host:port/xnosql/model/query
 * [GET]http://host:port/xnosql/model/get/:id
 * [GET]http://host:port/xnosql/model/destroy/:id
 */
app.use('/', router);

// 开始服务监听
var port = require('config').get('server').port;
var server = app.listen(port, function() {
    var port = server.address().port;
    log.info('##### XNosql 服务正在监听端口:', port);
});