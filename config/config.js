const path = require('path')
const ticket_file = path.join(__dirname, '../util/ticket.txt')
const util = require('../util/accessTxt')
const config = {
    port: '8000',

    appID:'wx3074860ea77cc336',
    appSecret:'8445cfbec50cfa2b771d49b3c6eb986d',
    token:'muzishuiji',
    //获取access_token
    getAccessToken: function () {
        return util.readFileAsync(wechat_file)
    },
    //保存access_token
    saveAccessToken: function (data) {
        data = JSON.stringify(data)
        return util.writeFileAsync(wechat_file, data)
    },
    //获取ticket
    getTicket: function () {
        return util.readFileAsync(ticket_file)
    },
    //保存ticket
    saveTicket: function (data) {
        data = JSON.stringify(data)
        return util.writeFileAsync(ticket_file, data)
    },
}

module.exports = config