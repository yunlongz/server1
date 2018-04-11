var CONF = require('../config.js')
const Koa = require('koa')
var request = require('sync-request');

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

async function sendMailToManager(ctx, next) {
  let data = {ddd:"fuck"}
  await knex('userinfo').select()
    .catch(function (e) {
      console.error('---------->', e);
    })
    .then(function (res) {
      data.result = res
      console.log(res)
      
    });
  return ctx.response.body = data;
}


module.exports = {
  getToken,
  sendMailToManager
}