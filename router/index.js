const router = require('koa-router')();
const rawBody = require('raw-body')
const tpl = require('../util/tpl')
const config = require('../config/config')
const Wechat = require('../wechat/wechat')
const wechat = new Wechat(config)
const wexinReply = require('../wechat/reply')
const sha1 = require('sha1')
const ejs = require('ejs')

//生成随机字符串
var createNonce = function () {
    return Math.random().toString(36).substr(2, 15)
}
//生成时间戳
var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000)
}
var _sign = function (noncestr, ticket, timestamp, url) {
    var params = [
        'jsapi_ticket=' + ticket,
        'noncestr=' + noncestr,
        'timestamp=' + timestamp + '',
        'url=' + url
    ];
    var str = sha1(params.sort().join('&'));   //将参数排序然后用&进行字符串连接
    return str;
}

function sign(ticket, url) {
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr,ticket, timestamp, url);
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

router.get('/', async (ctx, next) => {
    const signature = ctx.query.signature || ''
    const nonce = ctx.query.nonce || ''
    const timestamp = ctx.query.timestamp || ''
    const echostr = ctx.query.echostr || ''

    const token = config.token || ''
    const str = [token,timestamp,nonce].sort().join('')   
    const sha = sha1(str)

    ctx.body = (sha === signature) ? echostr + '' : 'failed'

})
router.get('/movie', async (ctx, next) => {
    var access_token = wechat.access_token;
    var ticket = await wechat.fetchTicket(access_token);
    
    var params = sign(ticket.ticket, ctx.href);
    ctx.body = ejs.render(tpl.temTpl, params);
    return next;
})
router.post('/', async (ctx) => {
    //通过raw-body模块接收接口传过来的xml数据
    var data = await rawBody(ctx.req,{length:ctx.length,limit:'1mb',encoding:ctx.charset});
    var jsonObj = tpl.xmlToJson(data);
   
    var reply = await wexinReply.reply(jsonObj.xml);
    ctx.status = 200;
    ctx.type = 'application/xml';
    ctx.body = reply;
    return;
})

module.exports = router