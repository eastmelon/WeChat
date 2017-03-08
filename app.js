/**
 * Created by hudw on 2017/3/6.
 */
//var http=require('express');
//var url=require("url");
//var http=require('http');
/*var fs=require("fs");
http.createServer(function(req,res){
    var urlStr=url.parse(req.url);

    switch (urlStr.pathname){
        case "/":
            sendData(__dirname+"/views/index.html",req,res);
            break;
        default :
            break;
    }

}).listen(80);
function sendData(path,req,res){
    fs.readFile(path,function(err,data){
        if(err){
            res.writeHead(404,{
                'Content-Type': 'text/html'
            });
            res.end('页面不存在');
        }else{
            res.writeHead(200,{
                'Content-Type': 'text/html'
            });
            setTimeout(function(){
                res.end(data);
            },5000);
        }
    });
}*/


/**
 * Created by hudw on 2017/2/27.
 */
/*
 * 程序入口文件
 * */
//加载express模块
var express=require('express');

//加载模板模块
var swig=require('swig');

//创建app应用
var app=express();
var users=[];
var bodyParser=require('body-parser');

//设置静态文件托管
//当前用户访问的url以/public开始，那么直接返回对应__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));
//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的目录,第一个必须是views 第二个是目录
app.set('views','./views');
//第一个参数必须是view engine ,第二个和app engine这个方法中定义的模板引擎的名称（第一个参数）是一致的
app.set('view engine','html');
//方便开发时候的调试，取消缓存
swig.setDefaults({cache:false})

/*
 * 模块划分
 * */

/*app.use(bodyParser.urlencoded({extended:true}));*/
app.use('/',require('./router/main'));
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
server.listen(process.env.PORT || 5000);
//socket部分
io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称
        };
    })
    socket.on('postMsg', function(msg,color) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('showMes', socket.nickname, msg,color);
    });
    socket.on('img', function(imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        console.log("img")
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
    socket.on('disconnect', function() {
        //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
});
//断开连接的事件
