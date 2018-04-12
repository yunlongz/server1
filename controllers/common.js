var CONF = require('../config.js')
const Koa = require('koa')
var request = require('sync-request');
var xlsx = require('node-xlsx')
var nodemailer = require('nodemailer');
var fs = require('fs');  
const path = require('path')
var mailTransport = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: '18111551564@163.com',
    pass: 'ccb123456'
  },
});


var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: CONF.mysql.host,
    user: CONF.mysql.user,
    password: CONF.mysql.pass,
    database: CONF.mysql.db,
    port: 3306
  }
})

async function getToken(ctx, next) {

  let data = {};
  let code = ctx.request.query.code
  let APPID = "wx6e130c2c3eeaf493"
  let SECRET = "1478acf95e84cb65b4fc8c2e6d62409e"
  // let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`
  let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`

  // await request(url, function (error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     console.log(body) // Show the HTML for the baidu homepage.
  //     console.log(response) // Show the HTML for the baidu homepage.
  //     ctx.response.body = JSON.parse(body);
  //   }
  // })
  data = request('GET', url);

  return ctx.response.body = data.getBody('utf8')

}
//获取数据库数据，生成excel，发送邮件
function buildXlsx() {
  var data = [{
    name: 'sheet1',
    data: [
      [
        'A',
        'B'

      ],
      [
        '1',
        '2'
      ]
    ]
  }, {
    name: 'sheet2',
    data: [
      [
        'A',
        'B'
      ],
      [
        '3',
        '4'
      ]
    ]
  }]

  var buffer = xlsx.build(data);
  console.log(path.join(__dirname))
  console.log(__dirname)
  fs.writeFile(path.join(__dirname)+'/result.xlsx', buffer, function (err) {
    if (err) throw err;
    sendMail()
    console.log('has finished');
  });
}

function sendMail() {
  var options = {
    from: '"Fred Foo 👻" <18111551564@163.com>',
    to: '107291628@qq.com',
    // cc         : ''  //抄送
    // bcc      : ''    //密送
    subject: '一封来自Node Mailer的邮件',
    text: '一封来自Node Mailer的邮件',
    html: '<h1>你好，这是一封来自NodeMailer的邮件！</h1><p><img src="cid:00000001"/></p>',
    attachments:
    [
      {
        filename: 'result.xlsx',            // 改成你的附件名
        path: path.join(__dirname) + '/result.xlsx',  // 改成你的附件路径
        cid: '00000001'                 // cid可被邮件使用
      },
    ]
  };

  mailTransport.sendMail(options, function (err, msg) {
    if (err) {
      console.log(err);
      // res.render('index', { title: err });
    }
    else {
      console.log(msg);
      // res.render('index', { title: "已接收：" + msg.accepted });
    }
  });

}

async function sendMailToManager(ctx, next) {
  let data = { ddd: "fuck" }
  await knex('userinfo').select()
    .catch(function (e) {
      console.error('---------->', e);
    })
    .then(function (res) {
      data.result = res
      console.log(res)
      buildXlsx()
    });
  return ctx.response.body = data;
}


module.exports = {
  getToken,
  sendMailToManager
}