
const path = require('path')
//我们需要把上传素材的函数导入
const config = require('../config/config')
const menu = require('./menu')
const Wechat = require('./wechat')
const wechat = new Wechat(config)

setTimeout(async ()=> {
    await wechat.deleteDefineMenu();
    await wechat.createDefineMenu(menu);
    return;
}, 0)

exports.reply = async function(obj) {
    var message = obj;
    var now = new Date().getTime();
    var reply = '';
    //判断消息类型是否是事件推送
    if(message.MsgType === 'event') {
        reply = '';
        //判断事件类型是否为关注
        if(message.Event === 'subscribe') { //订阅
            if(message.EventKey) {
                console.log('扫二维码进来: ' + message.EventKey + ' ' + message.Ticket);
            }
            //ejs模板中的<%= %>是转义的, <%- %>是保留原格式的
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[后台回复 [1]: 木子水吉最棒棒~\n后台回复 [2]: 木子水吉最优秀~\n后台回复 [3]: 木子水吉最漂亮~\n后台回复 [4]: 木子水吉我爱你~\n后台回复 [首页]: 进入电影首页~\n后台回复 [登录]: 进行微信登录绑定~\n后台回复 [游戏]: 进入游戏页面~\n后台回复 [电影名字]: 查询电影信息~\n后台回复 [语音]: 查询电影信息~\n也可以点击 <a href="http://www.baidu.com">  语音查电影</a>\n]]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'unsubscribe') { //取消订阅
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'LOCATION') {  //定位
            console.log('你上报的位置是: '+ message.Latitude + '/' + message.Longitude + '-' + message.Precision)
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'CLICK') { //点击
            var movieList = {}
            if(message.EventKey == 'rselfmenu_1_0') {
                console.log('排行榜')
                movieList = await wechat.searchMovies('3', '');

            } else {
                console.log('喜剧');
                movieList = await wechat.searchMovies('1', message.EventKey);
            }
            if(movieList && movieList.length > 0) {
                reply = '<xml>' +
                '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
                '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
                '<CreateTime>'+ now +'</CreateTime>' +
                '<MsgType><![CDATA[news]]></MsgType>' +
                '<ArticleCount>5</ArticleCount>' +
                '<Articles>';
                movieList.subjects.forEach(element => {
                    reply += 
                    '<item>' +
                    '<Title><![CDATA['+ element.title + ']]></Title>' +
                    '<Description><![CDATA[导演: '+ element.directors[0].name +' 分类: '+ element.genres[0] + ',' + element.genres[1] + ' 年份: '+ element.year +']]></Description>' +
                    '<PicUrl><![CDATA['+ element.images.large + ']]></PicUrl>' +
                    '<Url><![CDATA['+ element.alt + ']]></Url>' +
                    '</item>';
                });
                reply += '</Articles></xml>';
            } else {
                reply += '<xml>' +
                '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
                '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
                '<CreateTime>'+ now +'</CreateTime>' +
                '<Content><![CDATA[嘤嘤嘤~~~没找到客官想要的电影~~~]]></Content>' + 
                '<MsgType><![CDATA[text]]></MsgType></xml>';
            }

        }
        else if(message.Event === 'SCAN') {  //扫描
            console.log('看到你扫了一下奥: ' + message.EventKey + message.Ticket);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[你扫了我公众号的二维码奥~]]></Content>' +
            '</xml>'; 
        }
        else if(message.Event === 'scancode_push') {  //扫描推送
            console.log('扫描推送: ' + message.ScanCodeInfo.ScanType + message.ScanCodeInfo.ScanResult);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA['+ + message.ScanCodeInfo.ScanResult + ']]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'scancode_waitmsg') {  //扫描推送等待
            console.log('扫描推送等待: ' + message.ScanCodeInfo.ScanType + message.ScanCodeInfo.ScanResult);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[' + message.ScanCodeInfo.ScanResult +']]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'pic_sysphoto') {  //系统拍照发图
            //MsgId: 6493717817254345000, MediaId: 'alN6kSj799alQpR6pcsCYYqCnP_C5MvZaG-1CWcp1KRSWeKyLM2-N-Hgbvs0Qdz9'
            //PicUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/xP9q8PjjV6BiaFVJdAR07iaC4ggSdjZGxz5rt6giakxFtnRichms4G7wIicXsFicRiaCVr0xp9ibzZdmrica46DeRDSECUg/0
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' + 
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[哇,你拍的照片好美呀!]]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'pic_photo_or_album') {  //拍照或者相册发图
            //MsgId: 6493718384190028000, MediaId: 'XEDiMg3NfmjVhR1eV3a8s8DgJ7NzIzzBzwce3DBk2dCMFH5Bg1s-RIbxqzw_szbP'
            //PicUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/xP9q8PjjV6BiaFVJdAR07iaC4ggSdjZGxz9DwHDia0Z41ThE36Hicz9A5Mrdo0yAU42HMJoAIUbhOveticPBZjwO9oQ/0'
            
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[哇,你拍的照片好美呀!]]></Content>' +
            '</xml>'; 
        }
        else if(message.Event === 'pic_weixin') {  //微信相册发图
            //MsgId: 6493718878111267000,, MediaId: 'hPTpCanfp7tnM7GDKeJoqOSKc3f-URaL8uVNzZWeW6Ed-1_224nLd0L3ImCLuUJP'
            //PicUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/xP9q8PjjV6BiaFVJdAR07iaC4ggSdjZGxzDymtYhN7lzRVOLVQ3Mhlyr0DJI6bdJp6WV92aKK3JiawiaJaibgWQmwibw/0'
            
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[哇,你拍的照片好美呀!]]></Content>' +
            '</xml>';  
        }
        else if(message.Event === 'location_select') {  //弹出地理位置选择器
            console.log('纬度: ' + message.SendLocationInfo.Location_X);
            console.log('经度: ' + message.SendLocationInfo.Location_Y);
            console.log('精确度: ' + message.SendLocationInfo.Scale);
            console.log('字符串信息: ' + message.SendLocationInfo.Label);
            console.log('朋友圈的名字: ' + message.SendLocationInfo.Poiname);
            reply = '';  
        }
        else if(message.Event === 'VIEW') {
            console.log('您点击了菜单中的链接: ' + message.EventKey);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[再见]]></Content>' +
            '</xml>';  
        }
    } else if(message.MsgType === 'text') {
        var content = message.Content;
        reply = '';
        if(content === 1) {
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[木子水吉最棒棒~]]></Content>' +
            '</xml>'; 
        } else if(content === 2) {
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[木子水吉最优秀~]]></Content>' +
            '</xml>'; 
        } else if(content === 3) {
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' + 
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[木子水吉最漂亮~]]></Content>' +
            '</xml>'; 
        } else if(content === 4) {
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' + 
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[木子水吉我爱你~]]></Content>' +
            '</xml>';
        } else if(content === 5) {   //设置消息模板
            var formData =  {
                "industry_id1":"1",
                "industry_id2":"2"
            };
            var data = await wechat.setMessTemplate(formData);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>';
        } else if(content === 7) {   //获取消息模板
            var data = await wechat.getMessTemplate();
            console.log(data.primary_industry); 
            console.log(data.secondary_industry);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>'; 
        } else if(content === 8) {   //获取消息模板ID
            var formData =  {
                "template_id_short":"TM00015"
            };
            var data = await wechat.getMessTemplateID(formData);
            console.log(data);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>'; 
        } else if(content === 9) {   //获取消息模板
            var data = await wechat.fetchMessTempList();
            console.log(data);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>';
        } else if(content === 10) {  //获取用户列表 and 删除模板消息
            var userData = await wechat.getUserList(null);
            var openIDArray = userData.data.openid;
            console.log(JSON.stringify(userData));
            var formData =  {
                "template_id":"nL_Hp_Pe14hCfT4QA21azPsdpI2JXiFDnq3JnOrEVNw"
            };
            var data = await wechat.delMessTemp(formData);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA['+ message.MsgType +']]></MsgType>' +
            '<Content><![CDATA[]]></Content>' +
            '</xml>' ;
        } else if(content === 11) {  //获取用户列表
            var userData = await wechat.getUserList(null);
            var openIDArray = userData.data.openid;
            console.log(JSON.stringify(openIDArray));
            var data = await wechat.sendMessTemp(openIDArray[0]);
            reply = '';  
        } else if(content === 12) {  //回复图片消息
            
            // var material = yield wechat.uploadMaterial('image', path.join(__dirname, '../static/uuu.jpg'))
            // console.log(material.media_id)
            var media_id = 'Tc9ca2n2zImUWrDRryayFudyghZkVCjq2kKgapuUND6-6znzgP2En0qG8G8yYkSL';
            // var imgUrl = yield wechat.fetchMaterial(media_id, 'image')
            // var imgUrl = 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E7%BE%8E%E5%9B%BE&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&cs=3571154061,2999728292&os=1604817333,1936603707&simid=65975211,785940635&pn=60&rn=1&di=115991132400&ln=1985&fr=&fmq=1511830816507_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=1e&objurl=http%3A%2F%2Ffile28.mafengwo.net%2FM00%2F93%2F57%2FwKgB6lPqFBCAB2MvAAYQQOdA_o061.jpeg&rpstart=0&rpnum=0&adpicid=0'
            reply ='<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[image]]></MsgType>' +
            '<Image>' +
            '<MediaId><![CDATA['+ media_id +']]></MediaId>' +
            '</Image>' +
            '</xml>';
        } else if(content === 13) {  //回复视频消息
            
            // var material = yield wechat.uploadMaterial('video', path.join(__dirname, '../static/3.mp4'))
            var media_id = 'Yo0todNU8aYO-jxmaZ_5RfHbBAY5g_dY2tu2Gw5LW1DtCqC7iAgnlFy06hucSZld'
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[video]]></MsgType>' +
            '<Video>' +
            '<MediaId><![CDATA[' + media_id + ']]></MediaId>' +
            '<Title><![CDATA[听听看]]></Title>' +
            '<Description><![CDATA[这是不是一个视频呢?]]></Description>' + 
            '</Video>' +
            '</xml>'; 
            console.log(reply);
        } else if(content === 14) {  //回复音乐消息
            
            // var material = yield wechat.uploadMaterial('voice', path.join(__dirname, '../static/yujian.mp3'))
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[video]]></MsgType>' +
            '<Music>' +
            '<Title><![CDATA[遇见你的时候星星都落在我头上]]></Title>' +  
            '<Description><![CDATA[很开心遇见你]]></Description>' +
            '<MusicUrl><![CDATA[www.baidu.com]]></MusicUrl>' +
            '<ThumbMediaId><![CDATA[PSyzgQNJrGmZ39Zf1HPOwy3QYqONhVofcg-g5i5tPOmzMG4Svee8E6cac_4xD5qP]]></ThumbMediaId>' +
            '</Music>'
            '</xml>';
            console.log(reply);
        } else if(content === 15) {  //回复图文消息
            // console.log("media_id_1", 'UKtTh7jexfgzswpbeXaI8vl7OSMoUkJ69GsqX1hUOaldiNQHFxU34jr_rzCB59QJ')
            // console.log("media_id_2", 'dmsiJyr8TRu17slpfH75LIvLi8Wy7kvCDO57R-R62HesMIkUZUNF7DSuA92f8HBK')
            // console.log("media_id_3", 'OWE7rxGe2WFqPfMjEbr-DX7hzGCn0M7LcCzjjcExp1-fSybgA83DJ9onEhrGLs_p')
            // console.log("media_id_4", 'e-JvUo2XEh7h3xdqMPm3M4BCcdmvNH-l1KCgUN1bzS9D9Y_PoRB5OmBl8GifDUOZ')
            // var material = yield wechat.fetchMaterial('dmsiJyr8TRu17slpfH75LIvLi8Wy7kvCDO57R-R62HesMIkUZUNF7DSuA92f8HBK', 'image')
            // console.log(material);
            reply = '<xml>' +
            '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
            '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
            '<CreateTime>'+ now +'</CreateTime>' +
            '<MsgType><![CDATA[news]]></MsgType>' +
            '<ArticleCount>2</ArticleCount>' +
            '<Articles>' +
            '<item>' +
            '<Title><![CDATA[图文一]]></Title>' +
            '<Description><![CDATA[这是第一个图文]]></Description>' +
            '<PicUrl><![CDATA[https://api.weixin.qq.com/cgi-bin/media/get?&access_token=SpPuFdUZJLi0Lv2Z5SVVw8m1y5kLDYZFP8io2rg3VP_HpDncpL_228wT47FFQWU7nkBuNYGNL1zv_v4ly_FvZWAnalUyHT-MhcdyZq8GSfYxk_DlmNA2zmrtXjrMHJBXAKYiAGAEOC&media_id=UKtTh7jexfgzswpbeXaI8vl7OSMoUkJ69GsqX1hUOaldiNQHFxU34jr_rzCB59QJ]]></PicUrl>' +
            '<Url><![CDATA[www.baidu.com]]></Url>' +
            '</item>' +
            '<item>' +
            '<Title><![CDATA[图文二]]></Title>' +
            '<Description><![CDATA[这是图文二的描述]]></Description>' +
            '<PicUrl><![CDATA[https://api.weixin.qq.com/cgi-bin/media/get?&access_token=SKwBrFM1Sw8DcN6Jv5TVhSX0BAQYYRf2fdNxgNptVLEOoUkXyM-n-4yoxUyJS4bL5V63cV1WQQ-7ceHzpTVOdhm8wicgssbu3IVYdc1jhmsPKOjAHAYTX&media_id=dmsiJyr8TRu17slpfH75LIvLi8Wy7kvCDO57R-R62HesMIkUZUNF7DSuA92f8HBK]]></PicUrl>' +
            '<Url><![CDATA[www.muzishuiji.github.com]]></Url>' +
            '</item>' +
            '</Articles>' +
            '</xml>';
        } else if(content === 16) {  //上传永久图文素材
            var imgPath1 = path.join(__dirname, '../static/1.png');
            var imgPath2 = path.join(__dirname, '../static/7.png');
            //上传永久图文素材的图片路径的获取
            // var imgUrl1 = yield wechat.getMaterialImgUrl(imgPath1)
            // var imgUrl2 = yield wechat.getMaterialImgUrl(imgPath2)
            // console.log("imgUrl1", 'http://mmbiz.qpic.cn/mmbiz_jpg/393l5OIf4ruUbA1qyz2TkvSnh4pqMDFAj3krFmKoUCicnV9PaPGQ3gDjrew7ZvhCKiaibr2MyneB0384GAGd8plbg/0')
            // console.log("imgUrl2", 'http://mmbiz.qpic.cn/mmbiz_jpg/393l5OIf4ruUbA1qyz2TkvSnh4pqMDFAjqlukpm8OPfbOjh2abIlY1t3NiabgB9gh4vtnzyOJaqdVLhiaHkzgPLg/0')
            //上传永久图文素材
            //首先获取一个永久素材的图片的media_id
            // var perImgId1 = yield wechat.uploadMaterial('image', imgPath1, {})
            // var perImgId2 = yield wechat.uploadMaterial('image', imgPath2, {})
            // console.log("perImgId1", { media_id: 'TH4XgB4RG5AAkADTZaafLP1z76CBaqbyh5pKgdqXgnA',
            // url: 'http://mmbiz.qpic.cn/mmbiz_jpg/393l5OIf4ruUbA1qyz2TkvSnh4pqMDFAj3krFmKoUCicnV9PaPGQ3gDjrew7ZvhCKiaibr2MyneB0384GAGd8plbg/0?wx_fmt=jpeg' })
            // console.log("perImgId2", { media_id: 'TH4XgB4RG5AAkADTZaafLKXohf9w5ZMewmU9CQmcDI8',
            // url: 'http://mmbiz.qpic.cn/mmbiz_jpg/393l5OIf4ruUbA1qyz2TkvSnh4pqMDFAjqlukpm8OPfbOjh2abIlY1t3NiabgB9gh4vtnzyOJaqdVLhiaHkzgPLg/0?wx_fmt=jpeg' })
            var articles = { 
                "articles": [{               
                    "title": '夕阳西下,映照晚霞',          
                    "thumb_media_id": 'TH4XgB4RG5AAkADTZaafLP1z76CBaqbyh5pKgdqXgnA',         
                    "author": '木子水吉',           
                    "digest": '这个图片描绘的是一副夕阳西下的场景,这场景美轮美奂,给人一种如临仙境的美感.',           
                    "show_cover_pic": 1,         
                    "content": '这个图片描绘的是一副夕阳西下的场景,这场景美轮美奂,给人一种如临仙境的美感.让人应接不暇,忍不住驻足观赏,流连忘返.',          
                    "content_source_url": 'www.muzishuiji.github.com'   
                    },
                    {               
                        "title": '花娇艳如你',          
                        "thumb_media_id": 'TH4XgB4RG5AAkADTZaafLKXohf9w5ZMewmU9CQmcDI8',         
                        "author": '木子水吉',           
                        "digest": '这是一朵其貌不扬却沁人心脾的花',           
                        "show_cover_pic": 1,         
                        "content": '这朵花给我的感觉很棒,没有牡丹的雍容华贵,玫瑰的娇艳美丽,它有着它独有的魅力与气质,征服了我',          
                        "content_source_url": 'www.muzishuiji.github.com'   
                    },
                    //若新增的是多图文素材，则此处应还有几段articles结构
                ]
            };
            var articles = await wechat.uploadMaterial('news', articles, {});
            //一个永久图文素材的media_id
            //console.log('articles', 'TH4XgB4RG5AAkADTZaafLMkr0doJ4eNH_OdjMYbGook')
            reply = ''
        } else if(content === 17) {  //群发消息 之上传图文消息素材
            var imgPath1 = path.join(__dirname, '../static/1.png');
            var imgPath2 = path.join(__dirname, '../static/7.png');
            var perImgId1 = await wechat.uploadMaterial('image', imgPath1);
            var perImgId2 = await wechat.uploadMaterial('image', imgPath2);
            var articles = {
                "articles": [
                    {
                        "thumb_media_id": perImgId1.media_id,  //这个id需要时新增临时素材的id
                        "author":"muzishuiji",
                        "title":"群发图文素材一",
                        "content_source_url":"www.qq.com",
                        "content":"<p><a data-miniprogram-appid='wx31372c6d3f9419a2' data-miniprogram-path='pages/index/index' href=''><img data-src='http://mmbiz.qpic.cn/mmbiz_jpg/393l5OIf4ruUbA1qyz2TkvSnh4pqMDFAj3krFmKoUCicnV9PaPGQ3gDjrew7ZvhCKiaibr2MyneB0384GAGd8plbg/0'></a></p>",
                        "digest":"群发图文简介一",
                        "show_cover_pic":1
                    },
                    {
                        "thumb_media_id": perImgId2.media_id,   //这个id需要时新增临时素材的id
                        "author":"muzishuiji",
                        "title":"群发图文素材二",
                        "content_source_url":"www.qq.com",
                        "content":"<p><a data-miniprogram-appid='wx31372c6d3f9419a2' data-miniprogram-path='pages/index/index' href=''>点击文字跳转cnode小程序</a></p>",
                        "digest":"群发图文简介二",
                        "show_cover_pic":1
                    }
                ]
            }
            var articles = await wechat.uploadNewsQunfa(articles);
            console.log(articles);
            //一个永久图文素材的media_id
            // console.log('articles', { type: 'news',
            // media_id: 'y0JCw_7TAAtXINHSp6l6ZARbLBPHDtBUVFiznen9rl1W1c_mwSDikyXd8x1oKbCD',
            // created_at: 1511918970 })

        } else if(content === 18) {  //群发消息 根据用户标签进行群发
            //群发图文消息
            var postData1 = {
                "filter":{
                "is_to_all":false,
                "tag_id":2   //标签id,需要先获取标签id
                },
                "mpnews":{
                "media_id":"y0JCw_7TAAtXINHSp6l6ZARbLBPHDtBUVFiznen9rl1W1c_mwSDikyXd8x1oKbCD"
                },
                "msgtype":"mpnews",
                'title': '消息的标题',
                'description': '消息的描述',
                //'thumb_media_id': '视频缩略图的媒体id'
                "send_ignore_reprint": 1  //图文消息判定为被转载时,是否继续转发, 0为停止转发, 1位继续转发
            }
            //群发文本消息
            var postData2 = {
                "filter":{
                "is_to_all":false,
                "tag_id":2
                },
                "text":{
                "content":"这是一个群发的消息"
                },
                "msgtype":"text"
            }
            //群发音频,语音
            var postData3 = {
                "filter":{
                "is_to_all":false,
                "tag_id":2
                },
                "voice":{
                "media_id":"123dsdajkasd231jhksad"
                },
                "msgtype":"voice"
            }
            //群发图片
            var postData4 = {
                "filter":{
                "is_to_all":false,
                "tag_id":2
                },
                "image":{
                "media_id":"Tc9ca2n2zImUWrDRryayFudyghZkVCjq2kKgapuUND6-6znzgP2En0qG8G8yYkSL"
                },
                "msgtype":"image"
            }
            //群发视频
            var postData5 = {
                "filter":{
                "is_to_all":false,
                "tag_id":2
                },
                "mpvideo":{
                    //注意这里的视频id是通过https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=ACCESS_TOKEN 接口获得
                "media_id":"IhdaAQXuvJtGzwwc0abfXnzeezfO0NgPK6AQYShD8RQYMTtfzbLdBIQkQziv2XJc"
                },
                "msgtype":"mpvideo"
            }
            //群发卡券消息
            var postData6 = {
                "filter":{
                "is_to_all":false,
                "tag_id":"2"
                },
            "wxcard":{              
                        "card_id":"123dsdajkasd231jhksad"         
                        },
                "msgtype":"wxcard"
            }
            // var message = yield wechat.sendMessByTag(postData1)  //通过用户标签群发
            //返回数据{"errcode":0,"errmsg":"send job submission success","msg_id":34182, "msg_data_id": 206227730}
            var message = await wechat.sendMessByTag(postData1);  //通过用户标签群发
            

        } else if(content === 19) {  //群发消息 根据openID列表进行群发
            //群发图文消息
            var postData1 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
                "mpnews":{
                "media_id":"y0JCw_7TAAtXINHSp6l6ZARbLBPHDtBUVFiznen9rl1W1c_mwSDikyXd8x1oKbCD"
                },
                "msgtype":"mpnews"
            }
            //群发文本消息
            var postData2 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
                "text":{
                "content":"朱燕琼,你吼啊"
                },
                "msgtype":"text"
            }
            //群发音频,语音
            var postData3 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
                "voice":{
                "media_id":"123dsdajkasd231jhksad"
                },
                "msgtype":"voice"
            }
            //群发图片
            var postData4 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
                "image":{
                "media_id":"Tc9ca2n2zImUWrDRryayFudyghZkVCjq2kKgapuUND6-6znzgP2En0qG8G8yYkSL"
                },
                "msgtype":"image"
            }
            //群发视频
            var postData5 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
                "mpvideo":{
                    //注意这里的视频id是通过https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=ACCESS_TOKEN 接口获得
                "media_id":"IhdaAQXuvJtGzwwc0abfXnzeezfO0NgPK6AQYShD8RQYMTtfzbLdBIQkQziv2XJc"
                },
                "msgtype":"mpvideo"
            }
            //群发卡券消息
            var postData6 = {
                "touser":[
                    "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                    "ocOnc05kAOW76dKmHAUgwnXelH5M"
                ],
            "wxcard":{              
                        "card_id":"123dsdajkasd231jhksad"         
                        },
                "msgtype":"wxcard"
            }
            var message = await wechat.sendMessByOpenID(postData2);  //通过用户标签群发
            //返回数据:{ "errcode":0,"errmsg":"send job submission success","msg_id":34182, "msg_data_id": 206227730}
            console.log(message) 
        } else if(content === 20) {  //群发消息 删除群发消息
        var deleteData = {
                "msg_id":3147483649,
                //"article_idx":2
        }
            var message = await wechat.deleteMessByID(deleteData);  //通过用户标签群发
            //返回数据:{ "errcode":0,"errmsg":"send job submission success","msg_id":34182, "msg_data_id": 206227730}
            console.log(message); 
        } else if(content === 21) {  //群发消息 根据预览群发消息的接口
            //群发图文消息
            var postData1 = {
                "touser": "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                "mpnews":{
                //    "media_id":"y0JCw_7TAAtXINHSp6l6ZARbLBPHDtBUVFiznen9rl1W1c_mwSDikyXd8x1oKbCD"
                "media_id":"EZoAPsbKAbMUVHx_IdaOTkiNZJS6vkbpJWeOch138vEJDKdL8M3_WyJEIjCorsA8",
                },
                "msgtype":"mpnews"
            }
            //群发文本消息
            var postData2 = {
                "touser": "ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                "text":{
                "content":"朱燕琼,你吼啊"
                },
                "msgtype":"text"
            }
            var postData3 = {
                "touser":"ocOnc0_IhtGYRHSiNUfCSk4ZPSME",
                "image":{      
                        "media_id":"ocOnc0_IhtGYRHSiNUfCSk4ZPSME"
                        },
                "msgtype":"image" 
            }
            var message = await wechat.priviewMess(postData2);
            console.log(message) ;
        } else if(content === 22) {  //创建自定义菜单
            var message = await wechat.createDefineMenu(menu);
            //返回数据:{ errcode: 0, errmsg: 'preview success' }
            console.log(message); 
        } else if(content === 23) {  //用户管理 生成带参数的二维码
            var dataTempQr = {"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}
            var strTempQr = {"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_str": "test"}}}
            var dataPermQr = {"action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {"scene_id": 123}}}
            var strPermQr = {"action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {"scene_str": "test"}}}
            //返回{"ticket":"gQH47joAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2taZ2Z3TVRtNzJXV1Brb3ZhYmJJAAIEZ23sUwMEmm3sUw==","expire_seconds":60,"url":"http:\/\/weixin.qq.com\/q\/kZgfwMTm72WWPkovabbI"}
            var qrCodeTicket = await wechat.createQrCodeTicket(dataTempQr);
            var qrCode = await wechat.createQrCode(encodeURI(qrCodeTicket));
            console.log(qrCode);
        } else if(content === 24) {  //用户管理 长连接转成短连接
            var urlData = {
                action:"long2short",
                long_url: "http://wap.koudaitong.com/v2/showcase/goods?alias=128wi9shh&spm=h56083&redirect_count=1"
            }
            //返回{"errcode":0,"errmsg":"ok","short_url":"http:\/\/w.url.cn\/s\/AvCo6Ih"}
            var chengeResult = await wechat.changeToShort(urlData);
            
            console.log(chengeResult) ;
        } else if(content === 25) {  //语义化接口
            var yuyiData = {
                "query":"寻龙诀",      
                "city":"杭州",        
                "category": "movie",        
                "appid":"wx3074860ea77cc336",       
                "uid":"ocOnc0_IhtGYRHSiNUfCSk4ZPSME"    
            } 
            //返回{"errcode":0,"errmsg":"ok","short_url":"http:\/\/w.url.cn\/s\/AvCo6Ih"}
            var sematicResult = await wechat.semanticPrefix(yuyiData);
            // reply=JSON.stringify(sematicResult);
            console.log(JSON.stringify(sematicResult));
        }
    } else if(message.MsgType === 'image') {
        reply = '<xml>' +
        '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
        '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
        '<CreateTime>'+ now +'</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        '<Content><![CDATA[哇~~~,你发的图片好美奥~]]></Content>' +
        '</xml>';
        
    } else if(message.MsgType === 'voice') {
        var content = message.Recognition;
        console.log(content);
        reply = '<xml>' +
        '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
        '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
        '<CreateTime>'+ now +'</CreateTime>';
        
        var movieList = movieList = await wechat.searchMovies('1', content);
        if(movieList && movieList.length > 0) {
            reply += '<MsgType><![CDATA[news]]></MsgType>' +
            '<ArticleCount>5</ArticleCount>' +
            '<Articles>';
            movieList.subjects.forEach(element => {
                reply += 
                '<item>' +
                '<Title><![CDATA['+ element.title + ']]></Title>' +
                '<Description><![CDATA[导演: '+ element.directors[0].name +' 分类: '+ element.genres[0] + ',' + element.genres[1] + ' 年份: '+ element.year +']]></Description>' +
                '<PicUrl><![CDATA['+ element.images.large + ']]></PicUrl>' +
                '<Url><![CDATA['+ element.alt + ']]></Url>' +
                '</item>';
            });
            reply += '</Articles></xml>';
        } else {
            reply += '<Content><![CDATA[嘤嘤嘤~~~没找到客官想要的电影~~~]]></Content>' + 
                    '<MsgType><![CDATA[text]]></MsgType></xml>';
        }
        
    }
    
    return reply;
}
    