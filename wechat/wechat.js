'use strict'
const Promise = require('bluebird')
//该操作可以将原本的request方法封装成一个promise函数
const request = Promise.promisify(require('request'))
const util = require('../util/tpl')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const wechat_file = path.join(__dirname, '../util/accessToken.txt')

var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
   searchMovie: 'https://api.douban.com/v2/movie/search?',                      //搜索电影
   top250: 'https://api.douban.com/v2/movie/top250?',                           //电影排行榜
   access_token: prefix + 'token?grant_type=client_credential',                 //获取access_token
   getWeixinIp: prefix + 'getcallbackip?',                                      //获取微信服务器的ip
   semanticPrefix: 'https://api.weixin.qq.com/semantic/semproxy/search?',       //语义理解接口
   autoreplyInfo: prefix + 'get_current_autoreply_info?',                       //获取公众号的自动回复规则       
   //菜单
   menu: {
    createMenu: prefix + 'menu/create?',                          //创建自定义菜单
    inquiryMenu: prefix + 'menu/get?',                            //自定义菜单查询接口
    deleteMenu: prefix + 'menu/delete?',                          //删除菜单查询接口
    getCofigMess: prefix + 'get_current_selfmenu_info?',          //获取自定义菜单配置信息 
   }, 
   //个性化菜单
   specialMenu: {
    createMenu: prefix + 'menu/addconditional?',                 //创建菜单
    deleteMenu: prefix + 'menu/delconditional?',                 //删除菜单
    testMatch: prefix + 'menu/trymatch?',                        //测试个性化菜单匹配结果
    //个性化菜单的删除,查询都和自定义菜单的删除.查询是同一个接口
   },                 
   //临时素材
   temporary: {
     upload: prefix + 'media/upload?',                                          //上传临时素材
     fetch: prefix + 'media/get?',                                              //获取临时素材
     getImgUrl: prefix + 'media/uploadimg?',                                    //群发消息 上传图文消息内的图片获取url,
     uploadNews: prefix + 'media/uploadnews?',                                  //群发消息 上传图文消息素材
   },
   //永久素材
   permanent: {
       upload: prefix + 'material/add_material?',                               //用于上传图片和视频
       uploadNews: prefix + 'material/add_news?',                               //用于上传图文
       uploadNewsPic: prefix + 'material/uploadimg?',                           //用于上传图文里面的图片
       fetch: prefix + 'material/get_material?',                                //获取永久素材
       delete: prefix + 'material/del_material?',                               //删除永久素材
       modify: prefix + 'material/update_news',                                 //修改永久图文素材
       getCount: prefix + 'material/get_materialcount?',                        //获取永久素材的总数
       batch: prefix + 'material/batchget_material?',                           //获取永久素材的总数
   },
   //标签
   tags: {
       createTag:  prefix + 'tags/create?',                         //创建标签
       inquiryTag: prefix + 'tags/get?',                            //查询用户标签
       editTag: prefix + 'tags/update?',                            //编辑用户标签
       deleteTag: prefix + 'tags/delete?',                          //删除用户标签
       getTagFans: prefix + 'user/tag/get?',                        //获取标签下粉丝列表
       batchTagUers: prefix + 'tags/members/batchtagging?',         //批量为用户创建标签
       batchCancelTag: prefix + 'tags/members/batchuntagging?',     //批量为用户取消标签
       fetchUserTags: prefix + 'tags/getidlist?',                   //获取用户身上的标签列表

   },
   //用户管理
   user: {
    remarkUser: prefix + 'user/info/updateremark?',                 //设置用户备注名
    fetchUserMess: prefix + 'user/info?',                           //获取用户基本信息
    getUserList: prefix + 'user/get?',                              //获取用户列表

   },
   //消息模板
   messTemp: {
       setTemp: prefix + 'template/api_set_industry?',              //设置所属行业
       getTemp: prefix + 'template/get_industry?',                  //获取设置的行业信息
       getTempId: prefix + 'template/api_add_template?',            //获取模板ID
       fetchTempList: prefix +'template/get_all_private_template?', //获取模板列表
       delMessTemp: prefix + 'template/del_private_template?',      //删除模板
       sendTempMess: prefix + 'message/template/send?',             //发送模板消息 
   },
   //群发消息
   message: {
    sendMessByTag: prefix + 'message/mass/sendall?',        //根据用户标签进行群发
    sendMessByOpenID: prefix + 'message/mass/send?',        //根据openID列表进行群发
    deleteMess: prefix + 'message/mass/delete?',            //删除群发
    priviewMess: prefix + 'message/mass/preview?',          //预览接口
   },
   //用户管理
   manage: {
     createQrcodeTicket: prefix + 'qrcode/create?',         //请求二维码的 ticket
     createQrcode: prefix + 'showqrcode?',                  //通过ticket获取二维码
     changeToShort:prefix + 'shorturl?',                    //长连接转成短连接
   },
   ticket: {
       get: prefix + 'ticket/getticket?',                            //获取全局票据
   }
} 

//进行票据的读写
function Wechat(opts) {
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    //获取access_token
    this.getAccessToken = opts.getAccessToken
    //保存access_token
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchAccessToken()
}

//http請求的處理函數
function httpRequest(options, msg) {
    return new Promise(function (resolve, reject) {
        request(options)
        .then(function (response) {
            var _data = response.body
            if(_data) {
                resolve(_data)
            }else {
                throw new Error(msg + '  error')
            }
        })
        .catch(function (err) {
            reject(err)
        })
    })
}

Wechat.prototype = {

    //在wechat的原型链上增加一个方法,获取access_token
    fetchAccessToken: function () {
        var that = this
        //更新的时候去请求一下获取access_token的接口
        var appID = this.appID
        var appSecret = this.appSecret
        var url = api.access_token + '&appid=' + appID + '&secret=' + appSecret

        return new Promise(function (resolve, reject) {
            fs.readFile(wechat_file, {flag: 'r+', encoding: 'utf8'}, function (err, data) {
                if(err) {
                 console.error(err);
                 reject(err);
                }
                if(data.length !== 0 && eval('('+ data + ')').expires_in > (new Date().getTime()))  {   
                    that.access_token = eval('('+ data + ')').access_token || '';
                    resolve(data);
                } else {
                    request({ url: url,json: true })
                    .then(function (response) {
                        var responseData = response.body;
                        that.access_token = responseData.access_token || '';
                        responseData.expires_in = new Date().getTime() + 7100 * 1000 
                        //flag: 'w'会清空文件然后写入, flag: 'a' 会在文件原有内容后追加写入 ,flag: 'r' 代表读取文件
                        fs.writeFile(wechat_file, JSON.stringify(responseData), {flag: 'w'}, function (err) {
                            if(err) {
                                console.error(err)
                                reject(err)
                            } else {
                                resolve(responseData)
                            }
                        }) 
                    }) 
                    .catch(function (err) {
                        reject(err);
                    })
                    
                }
                
            })

            
        })
    },

    //在wechat的原型链上增加一个方法 搜索电影
    searchMovies: function (sign, name) {
        var that = this;
        var url = ''; 
        if(sign === '1') {
            url = api.searchMovie + 'q='+ name + '&start=0&count=5';   //根据字符串搜索电影
        } else if(sign === '2'){
            url = api.searchMovie + 'tag='+ name + '&start=0&count=5';  //根据分类搜索电影
        } else {
            url = api.top250 + '&start=0&count=5'; 
        }
        var options = { url: url,json: true };
        return httpRequest(options, 'searchMovies');
    },
    //在原型链上增加一个方法,获取微信服务器的IP地址列表
    getWeixinServeIp: function () {
        var that = this,
            url = api.getWeixinIp + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'getWeixinServeIp');
    },

    //在原型链上增加一个方法,创建自定义菜单
    createDefineMenu: function (menu) {
        var that = this,url = api.menu.createMenu + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: menu, json: true};
        return httpRequest(options, 'createDefineMenu');
    },

    //在原型链上增加一个方法,查询自定义菜单
    inquiryDefineMenu: function () {
        var that = this,url = api.menu.inquiryMenu + 'access_token=' + data.access_token;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'inquiryDefineMenu');
    },

    //在原型链上增加一个方法, 删除自定义菜单
    deleteDefineMenu: function () {
        var that = this,url = api.menu.deleteMenu + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true}
        return httpRequest(options, 'deleteDefineMenu');
    },

    //在原型链上增加一个方法, 获取自定义菜单的配置信息
    getConfigMess: function () {
        var that = this,url = api.menu.getCofigMess + 'access_token=' + that.access_token;
        var options ={method: 'GET', url: url, json: true};
        return httpRequest(options, 'getConfigMess');
    },

    //在原型链上增加一个方法,创建个性化菜单
    createSpecialMenu: function (menu) {
        var that = this,url = api.specialMenu.createMenu + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: menu, json: true}
        return httpRequest(options, 'createSpecialMenu');
    },

    //在原型链上增加一个方法, 删除个性化菜单
    deleteSpecialMenu: function (menuId) {
        var that = this,url = api.specialMenu.deleteMenu + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, body: menuId, json: true};
        return httpRequest(options, 'deleteSpecialMenu');
    },

    //在原型链上增加一个方法, 创建用户标签
    createTag: function (tagName) {
        var that = this,url = api.tags.createTag + 'access_token=' + data.access_token;
        var options = { method: 'POST', url: url, body: { access_token: data.access_token,name: tagName }, json: true };
        return httpRequest(options, 'createTag');
    },

    //在原型链上增加一个方法,查询用户标签
    inquiryTags: function () {
        var that = this,url = api.tags.inquiryTag + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true}
        return httpRequest(options, 'inquiryTags');
    },

    //在原型链上增加一个方法, 编辑用户标签
    editTag: function (tagId, tagName) {
        var that = this,url = api.tags.editTag + 'access_token=' + that.access_token;
        var options = { method: 'POST', url: url, body: { tag : { id : tagId, name : tagName } }, json: true }
        return httpRequest(options, 'editTag');
    },

    //在原型链上增加一个方法, 删除用户标签
    deleteTag: function (tagId) {
        var that = this,url = api.tags.deleteTag + 'access_token=' + that.access_token;
        var form = { tags: { id: tagId } }, options = { method: 'POST', url: url, body: form, json: true };
        return httpRequest(options, 'deleteTag');
    },

    //在原型链上增加一个方法, 获取标签下粉丝列表
    getTagFuns: function (tagId, nextOpenId) {
        var that = this,url = api.tags.getTagFans + 'access_token=' + that.access_token;
        var form = { tags: { id: tagId, next_openid: nextOpenId || null } }, options = {method: 'POST', url: url, body: form, json: true};
        return httpRequest(options, 'getTagFuns');
    },

    //在原型链上增加一个方法, 批量为用户创建标签
    batchTagUers: function (tagId, openidList) {
        var that = this, url = api.tags.batchTagUers + 'access_token=' + that.access_token;
        var form = { tagid: tagId, openid_list: openidList || null }, options = {method: 'POST', url: url, body: form, json: true};
        return httpRequest(options, 'batchTagUers');
    },

    //在原型链上增加一个方法, 批量为用户取消标签
    batchCancelTag: function (tagId, openidList) {
        var that = this, url = api.tags.batchCancelTag + 'access_token=' + that.access_token;
        var form = { tagid: tagId, openid_list: openidList || null }, options = {method: 'POST', url: url, body: form, json: true};
        return httpRequest(options, 'batchCancelTag');
    },

    //在原型链上增加一个方法, 获取用户身上的标签列表
    fetchUserTags: function (openId) {
        var that = this, url = api.tags.fetchUserTags + 'access_token=' + that.access_token;
        var form = { openid: openId }, options = {method: 'POST', url: url, body: form, json: true};
        return httpRequest(options, 'fetchUserTags');
    },

    //在原型链上增加一个方法, 设置用户备注名
    remarkUser: function (openId, remark) {
        var that = this, url = api.user.remarkUser + 'access_token=' + that.access_token;
        var options = { method: 'POST', url: url, body: { access_token:  data.access_token,openid: openId,remark: remark }, json: true };
        return httpRequest(options, 'remarkUser');
    },

    //在原型链上增加一个方法, 获取用户基本信息
    fetchUserMess: function (openId, lang) {
        var that = this, url = api.user.fetchUserMess + 'access_token=' + that.access_token + '&openid=' + openId + '&lang=' + lang;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'fetchUserMess');
    },

    //在原型链上增加一个方法, 获取用户列表
    getUserList: function (nextOpenId) {
        var that = this,url = api.user.getUserList + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'getUserList');
    },

    //在wechat的原型链上增加一个上传素材的方法
    uploadMaterial: function (type, material, permanent) {
        //更新的时候去请求一下获取access_token的接口
        var that = this
        //创建一个from对象
        var form = {}
        var uploadUrl = api.temporary.upload
        //通过第三个参数判断上传的素材是临时素材还是永久素材
        if(permanent) {
            //如果是非图文的永久素材上传则使用这个接口
            uploadUrl = api.permanent.upload
            //想让form能够兼容到所有的上传类型,包括图文消息.所以需要一个中间件,来让form来继承permanent对象
            _.extend(form, permanent)
        }

        if( type === 'image' && !permanent) {
            //上传类型为图文消息里面的图片
            uploadUrl = api.temporary.upload
        }
        if(type === 'news') {
            //上传类型为图文消息,material就是一个article数组
            uploadUrl = api.permanent.uploadNews
            form = material
        } else {
            //如果不是图文消息,是图片或者视频的话,那这个就是一个素材路径
            form.media = fs.createReadStream(material)
        }
        //拿到全局票据,构建请求的URL地址
        var url = uploadUrl + '&access_token=' + that.access_token
        //判断是否为永久素材
        if(!permanent) {
            url += '&type=' + type
        } else if(permanent && type != 'news') {
            form.access_token = that.access_token
        }
        var options = {
            method:'POST', 
            url: url, 
            json: true 
        }
        //当上传素材为图文的时候,我们请求上传的就不是form,而是body
        if(type === 'news') {
            options.body = form
        } else {
            options.formData = form
        }
        return httpRequest(options, 'uploadMaterial');
    },

    //在wechat的原型链上增加 群发消息 上传图文消息素材
    uploadNewsQunfa: function (articles) {
        var that = this, url = api.temporary.uploadNews + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: articles, json: true }
        return httpRequest(options, 'uploadNewsQunfa');
    },

    //在wechat的原型链上增加 群发消息 根据用户标签进行群发
    sendMessByTag: function (postData) {
        var that = this, url = api.message.sendMessByTag + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: postData, json: true }
        return httpRequest(options, 'sendMessByTag');
    },

    //在wechat的原型链上增加 群发消息 根据openID列表进行群发
    sendMessByOpenID: function (postData) {
        var that = this, url = api.message.sendMessByOpenID + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: postData, json: true };
        return httpRequest(options, 'sendMessByOpenID');
    },

    //在wechat的原型链上增加 群发消息 删除群发 只能删除图文消息和视频消息
    deleteMessByID: function (postData) {
        var that = this, url = api.message.deleteMess + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: postData, json: true };
        return httpRequest(options, 'deleteMessByID');
    },

    //在wechat的原型链上增加 群发消息 预览消息接口
    priviewMess: function (postData) {  
        var that = this, url = api.message.priviewMess + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: postData,json: true };
        return httpRequest(options, 'priviewMess');
    },

    //在wechat的原型链上增加 上传图文消息的图片获取URL
    getMaterialImgUrl: function (imgPath) {
        var that = this, formData = { media: fs.createReadStream(imgPath) };
        var options = { method:'POST', url: api.temporary.getImgUrl + 'access_token=' + that.access_token, formData: formData, json: true }; 
        return httpRequest(options, 'getMaterialImgUrl');
    },

    //在wechat的原型链上增加一个获取素材的方法
    fetchMaterial: function (mediaId, type, permanent) {
        var that = this, form = {}, fetchdUrl = api.temporary.fetch;
        //通过第三个参数判断上传的素材是临时素材还是永久素材
        if(permanent) { fetchdUrl = api.permanent.fetch; }
        var url = fetchdUrl + '&access_token=' + that.access_token;
        return new Promise(function (resolve, reject) {
            var options = {};
            //判断是否为永久素材
            if(!permanent) {
                if(type === 'video') {
                    url = url.replace('https://', 'http://')
                }
                url += '&media_id='+ mediaId
                options = {method: 'GET', url: url, json: true};
            } else {
                form = {
                    media_id: mediaId,
                    access_token: data.access_token
                }
                options = {method: 'GET', url: url, body: form, json: true};
            }
            if(type === 'news' || type === 'video') {
                return httpRequest(options, 'fetchMaterial');
            } else {
                resolve(url) 
                .catch(function (err) {
                    reject(err);
                })
            }       
        })
    },

    //在wechat的原型链上增加一个删除永久素材的方法
    deletehMaterial: function (mediaId, type) {
        //更新的时候去请求一下获取access_token的接口
        var that = this, deletedUrl = api.permanent.delete, url = deletedUrl + '&access_token=' + that.access_token;
        var options = { method:'POST', url: url, body: {"media_id":mediaId},json: true };  
        return httpRequest(options, 'deletehMaterial');
    },

    //在wechat的原型链上增加一个修改永久素材的方法
    modifyhMaterial: function (mediaId, news) {
        var that = this, form = {}
        _.extend(form, news)
        var url = modifyUrl + '&access_token=' + that.access_token, modifyUrl = api.permanent.modify;
        var options = { method:'POST', url: url, ody: form,json: true };
        return httpRequest(options, 'modifyhMaterial');
    },

    //在wechat的原型链上增加一个获取永久素材的总数
    getCountMaterial: function () {
        //更新的时候去请求一下获取access_token的接口
        var that = this, url = getCountUrl + '&access_token=' + that.access_token;
        var getCountUrl = api.permanent.getCount, options = {method: 'GET', url: url, json: true}
        return httpRequest(options, 'getCountMaterial');
    },

    //在wechat的原型链上增加一个获取永久素材的总数
    getBatchMaterial: function (params) {
        //更新的时候去请求一下获取access_token的接口
        var that = this, batchUrl = api.permanent.batch,form = {};
        form.type = params.type || 'image'
        form.offset = params.offset || 0
        form.count = options.count || 1
        var url = batchUrl + '&access_token=' + that.access_token,
            options = { method: 'POST', url: url, body: form, json: true };
        return httpRequest(options, 'getBatchMaterial');
    },

    //在原型链上增加一个方法 获取全局票据
    fetchTicket: function (access_token) {
        var that = this
        return that.getTicket()
        .then(function (data) {
            try {
                data = JSON.parse(data)
            }
            catch(e) {
                return that.updateTicket()
            }
            if(that.isValidTicket(data)) {
                //如果是有效的token,则将data向下传递
                return Promise.resolve(data)
            } else {
                //如果读取成功,但是读取到的token失效,则也向微信服务器发出请求,更新token
                return that.updateTicket()
            }
        })
        .then(function (data) {
            that.saveTicket(JSON.stringify(data))
            //最终需要返回,将data作为参数传递给下一个回调函数,这里就可以是的上传素材的函数获取到这个data,从而进行素材上传
            return Promise.resolve(data)
        })
        .catch(function (err) {
            Promise.reject(err)
        })
    },

    //在wechat的原型链上增加一个方法 更新全局票据
    updateTicket: function () {
        var that = this, url = api.ticket.get + '&access_token=' + that.access_token + '&type=jsapi';
        
        return new Promise(function (resolve, reject) {
            request({ url: url,json: true })
            .then(function (response) {
                var data = response.body
                var now = (new Date().getTime())
                var expires_in = now + (data.expires_in - 20) * 1000
                data.expires_in = expires_in
                resolve(data)
            }) 
            .catch(function (err) {
                reject(err)
            })
        })
    },

    //在wechat的原型链上增加一个方法 判断全局票据是否合法
    isValidTicket: function (data) {
        if(!data || !data.ticket || !data.expires_in) {
            return false
        }
        var now = new Date().getTime()
        //当前时间小于有效期即为有效
        return (data.ticket  && now < data.expires_in) ? true : false;
    },

    //在原型链上增加一个方法, 消息模板  设置所属行业
    setMessTemplate: function (postData) {
        var that = this, url = api.messTemp.setTemp + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: postData, json: true};
        return httpRequest(options, 'setMessTemplate');
    },

    //在原型链上增加一个方法, 消息模板  获取设置的行业信息
    getMessTemplate: function () {
        var that = this, url = api.messTemp.getTemp + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true}
        return httpRequest(options, 'getMessTemplate');
    },

    //在原型链上增加一个方法, 消息模板  获取模板ID
    getMessTemplateID: function (formData) {
        var that = this, url = api.messTemp.getTempId + 'access_token=' + data.access_token;
        var options = {method: 'POST', url: url, body: formData, json: true};
        return httpRequest(options, 'getMessTemplateID');
    },

    //在原型链上增加一个方法, 消息模板  获取模板列表
    fetchMessTempList: function () {
        var that = this, url = api.messTemp.fetchTempList + 'access_token=' + that.access_token;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'fetchMessTempList');
    },

    //在原型链上增加一个方法, 消息模板  删除模板
    delMessTemp: function (postData) {
        var that = this, url = api.messTemp.delMessTemp + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: postData, json: true};
        return httpRequest(options, 'delMessTemp');
    },

    //在原型链上增加一个方法, 消息模板  发送模板消息
    sendMessTemp: function (userID) {
        var that = this, form =  { "touser": userID, "template_id":"-TN_DiqZp1SmgCJf-viHohGEPtysBP-P5fWYTprJqiM", "data":{} },
            url = api.messTemp.sendTempMess + 'access_token=' + that.access_token,
            options = {method: 'POST', url: url, body: form, json: true};
        return httpRequest(options, 'sendMessTemp');
    },

    //在原型链上增加一个方法 用户管理 生成带参数的二维码的tiket
    createQrCodeTicket: function (qrData) {
        var that = this, url = api.manage.createQrcodeTicket + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: qrData, json: true};
        return httpRequest(options, 'createQrCodeTicket');
    },

    //在原型链上增加一个方法 用户管理 根据ticket获取带参数的二维码
    createQrCode: function (ticket) {
        var that = this, url = api.manage.createQrcode + 'ticket=' + ticket;
        var options = {method: 'GET', url: url, json: true};
        return httpRequest(options, 'createQrCode');
    },

    //在原型链上增加一个方法 用户管理 长连接转成短连接
    changeToShort: function (urlData) {
        var that = this, url = api.manage.changeToShort + 'access_token=' + that.access_token;
        var options = {method: 'POST', url: url, body: urlData, json: true};
        return httpRequest(options, 'changeToShort');
    },

    //在原型链上增加一个方法 语义理解接口
    semanticPrefix: function (yuyiData) {
        var url = api.semanticPrefix + 'access_token=' + that.access_token,
            that = this
            options = {method: 'POST', url: url, body: yuyiData, json: true};
        return httpRequest(options);
    }

}



module.exports = Wechat