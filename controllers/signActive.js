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
//
async function getOpenId(ctx, next) {

  let data = {};
  let code = ctx.request.query.code
  let APPID = "wx6e130c2c3eeaf493"
  let SECRET = "1478acf95e84cb65b4fc8c2e6d62409e"
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`


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

async function getAllSignUsersByOneActivity(ctx, next) {
  let data = {};
  let weekStartDay = ctx.request.query.weekStartDay;
  let weekEndDay = ctx.request.query.weekEndDay;
  let activityName = ctx.request.query.activityName
  await knex('signinfo').innerJoin('userinfo', 'signinfo.userid', 'userinfo.wxopenid').whereBetween('signdate', [weekStartDay, weekEndDay]).andWhere('activityname', activityName).andWhere('status', 1).select().limit(100).then(function (res) {
    data.list = res;
  })
    .catch(function (e) {
      console.error(e);
    });

  await knex('signinfo').select('signdate', knex.raw('COUNT(signdate)')).whereBetween('signdate', [weekStartDay, weekEndDay]).andWhere('activityname', activityName).andWhere('status', 1).groupBy('signdate').then(function (res) {
    // data.totalPage = Math.ceil(res[0]["count(*)"] / 10)
    // data.totalCount = res[0]["count(*)"]
    data.listCount = res
  })
    .catch(function (e) {
      console.error(e);
    });

  return ctx.response.body = data;
  // .whereBetween('votes', [1, 100])
}

async function get(ctx, next) {
  let data = {};
  let currentPage = ctx.request.query.currentPage
  let signdate = ctx.request.query.currentDate
  let activityName = ctx.request.query.activityName
  let wxopenid = ctx.request.query.wxopenid || ''

  let requestData = {
    signdate: ctx.request.query.currentDate,
    activityname: ctx.request.query.activityName,
    status: 1
  }
  if (ctx.request.query.wxopenid) {
    requestData.wxopenid = ctx.request.query.wxopenid
  }
  await knex('signinfo').innerJoin('userinfo', 'signinfo.userid', 'userinfo.wxopenid').where(requestData).select().limit(10).offset(currentPage * 10).orderBy('signdate', 'desc')
    .then(function (res) {
      data.list = res;
    })
    .catch(function (e) {
      console.error(e);
    });

  await knex('signinfo').innerJoin('userinfo', 'signinfo.userid', 'userinfo.wxopenid').where(requestData).select().count().then(function (res) {
    data.totalPage = Math.ceil(res[0]["count(*)"] / 10)
    data.totalCount = res[0]["count(*)"]
  })
    .catch(function (e) {
      console.error(e);
    });

  return ctx.response.body = data;
  // ctx.state.data = data
}
//报名
async function post(ctx, next) {
  let data = {}
  let information = {
    userid: ctx.request.body.userid,
    signdate: ctx.request.body.signdate,
    activityid: ctx.request.body.activityid,
    activityname: ctx.request.body.activityname,
    status: 1
  }

  await knex('signinfo').insert(information)
    .catch(function (e) {
      console.error(e);
    })
    .then(function (res) {
      data.result = res
    });
  return ctx.response.body = data;
}

async function insertUserInfo(ctx, next) {
  let data = {}
  let userInfo = {
    wxopenid: ctx.request.body.wxopenid,
    gender: ctx.request.body.gender,
    avatar_url: ctx.request.body.avatarUrl,
    realname: ctx.request.body.realname,
    department: ctx.request.body.department
  }
  await knex('userinfo').insert(userInfo)
    .catch(function (e) {
      console.error(e);
      data.error = e
    })
    .then(function (res) {
      console.log("sign columns insert success", res)
      data.result = res
    }
    );
  return ctx.response.body = data;
}

async function getUserInfo(ctx, next) {
  let data = {}
  await knex('userinfo').where({
    wxopenid: ctx.request.query.openId
  }).select()
    .catch(function (e) {
      console.error('---------->', e);
    })
    .then(function (res) {
      data.result = res
      console.log("select")

    }
    );
  return ctx.response.body = data;
}
async function isSigned(ctx, next) {
  let data = {}
  await knex('signinfo').where({
    userid: ctx.request.query.openId,
    signdate: ctx.request.query.currentDate,
    activityname: ctx.request.query.activityname
  }).andWhere('status', 1).select()
    .catch(function (e) {
      console.error('---------->', e);
    })
    .then(function (res) {
      data.result = res
      console.log("select")

    }
    );
  return ctx.response.body = data;
}
// 取消报名  
async function cancelSignup(ctx, next) {
  let data = {}
  let requestData = {
    userid: ctx.request.body.wxopenid,
    signdate: ctx.request.body.signDate,
    activityid: ctx.request.body.activityid,
    activityname: ctx.request.body.activityName
  }
  await knex('signinfo').where(requestData).update({
    status: 0
  }).catch(function (e) {
    console.error('---------->', e);
  })
    .then(function (res) {
      data.result = res
      console.log("update")

    });

  return ctx.response.body = data;
}

async function getOwnList(ctx, next) {
  let data = {}
  let requestData = {
    userid: ctx.request.query.wxopenid
  }
  let currentPage = ctx.request.query.currentPage
  await knex('signinfo').innerJoin('userinfo', 'signinfo.userid', 'userinfo.wxopenid').where('signinfo.userid', requestData.userid).select().limit(10).offset(currentPage * 10).orderBy('signdate', 'desc')
    .then(function (res) {
      data.list = res;
    })
    .catch(function (e) {
      console.error(e);
    });

  await knex('signinfo').innerJoin('userinfo', 'signinfo.userid', 'userinfo.wxopenid').where('signinfo.userid', requestData.userid).select().count().then(function (res) {
    data.totalPage = Math.ceil(res[0]["count(*)"] / 10)
    data.totalCount = res[0]["count(*)"]
  })
    .catch(function (e) {
      console.error(e);
    });

  return ctx.response.body = data;
}

async function getServerDate(ctx, next) {
  let data = {
    timestamp: new Date().getTime()
  }
  return ctx.response.body = data
}

async function updateUserInfo(ctx, next) {
  let data = {}
  await knex('userinfo').where('wxopenid', '=', ctx.request.body.wxopenid)
    .update({
      realname: ctx.request.body.realname,
      department: ctx.request.body.department
    }).catch(function (e) {
      console.error('---------->', e);
    }).then(function (res) {
      console.log("update" + ctx.request.body.realname);
      data.result = res;
    });
  return ctx.response.body = data;
}

async function getActivityList(ctx, next) {
  let data = {};
  await knex('activityinfo')
    .orderByRaw('name, activityStartTime, activityid')
    .then((res)=>{
      res.map((item, i)=>{
        if (!data[item.name]) {
          data[item.name] = [];
        }
        data[item.name].push(item);
      })
    });
  return ctx.response.body = data;
}

async function updateActivity(ctx, next) {
  let data = {};
  let reqdata = {};

  for (let key in ctx.request.body) {
    if (key != 'id') {
      if (ctx.request.body[key] && ctx.request.body[key] != '') {
        reqdata[key] = ctx.request.body[key]
      }
    }
  }
  await knex('activityinfo').where('id', '=', ctx.request.body.id)
    .update(reqdata).then((res) => {
      data = res;
    })
  return ctx.response.body = data;
}

async function deleteActivity(ctx, next) {
  let data = {};
  await knex('activityinfo').where('id', '=', ctx.request.body.id)
    .del().then((res) => {
      data = res;
    })
  return ctx.response.body = data;
}

module.exports = {
  get,
  post,
  insertUserInfo,
  getOpenId,
  getUserInfo,
  isSigned,
  getAllSignUsersByOneActivity,
  getServerDate,
  cancelSignup,
  getOwnList,
  updateUserInfo,
  getActivityList,
  updateActivity,
  deleteActivity
}