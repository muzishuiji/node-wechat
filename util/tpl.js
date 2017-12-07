/*
 * 模板文件
 * 封装一个消息回复的模板
 * 同时在消息模板中对消息类型做判断
 */
'use strict'

const ejs = require('ejs')
const heredoc = require('heredoc')
const fastXmlParser = require('fast-xml-parser')

function xmlToJson(result) {
	var options = {
		attrPrefix : "@_",
		textNodeName : "#text",
		ignoreNonTextNodeAttr : true,
		ignoreTextNodeAttr : true,
		ignoreNameSpace : true,
		ignoreRootElement : false,
		textNodeConversion : true,
		textAttrConversion : false,
		arrayMode : false
	}
	var tObj = fastXmlParser.getTraversalObj(result,options)
	var jsonObj = fastXmlParser.convertToJson(tObj)
	return jsonObj
}

var temTpl = heredoc(function () {/*
<!DOCTYPE html>
	<html>
		<head>
			<title>查电影</title>
			<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
		</head>
		<body style="width:100%;text-align: center;">
			<div id="luyin" >
				<img style="width: 250px;" src="http://img2.imgtn.bdimg.com/it/u=3123382737,2199851626&fm=214&gp=0.jpg" />
			</div>
			<p style="text-align: center;color: #cccccc;font-size: 12px;">点击图片录音</p>
			<p id="title"></p>
			<div id="director"></div>
			<div id="year"></div>
			<div id="poster"></div>
			<script src="https://cdn.bootcss.com/zepto/1.1.7/zepto.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
			<script>
				wx.config({
					debug: true,
					appId: 'wx3074860ea77cc336',
					timestamp: <%= timestamp %>,
					nonceStr: '<%= noncestr %>',
					signature: '<%= signature %>',
					jsApiList: [
						'startRecord',
						'stopRecord',
						'onVoiceRecordEnd',
						'translateVoice',
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareQQ',
						'onMenuShareWeibo',
						'onMenuShareQZone',
					]
				})
				wx.ready(function() {
					var shareContent = {
						title: '',
						desc: '我搜出来了 ',
						link: '',
						imgUrl: '',
						type: 'link',
						success: function () {
							window.alert('分享成功!')
						},
						cancel: function () {
							window.alert('分享失败!')
						} 
					}
					wx.onMenuShareAppMessage(shareContent)
					wx.checkJsApi({
						jsApiList: ['onVoiceRecordEnd'],
						success: function (res) {
							alert(res)
						}
					})
					var slides={}  
					var isRecording = false
					//以幻灯片的方式播放图片
					$('#poster').on('click', function () {
						wx.previewImage(slides)
					})
					$('#luyin').on('click', function () {
						if(!isRecording) {
							isRecording = true
							wx.startRecord({
								cancel: function () {
									alert('那就不能搜罗奥!')
								}
							})
							return
						}
						isRecording = false
						
						wx.stopRecord({
							success: function (res) {
								var localId = res.localId
								wx.translateVoice({
									localId: localId,
									isShowProgressTips: 1,
									success: function (res) {
										var result = res.translateResult
										$.ajax({
											type: 'get',
											url: 'https://api.douban.com/v2/movie/search?q='+ result.substring(0, result.length - 1),
											dataType:'jsonp',
											success: function (data) {
												var subject = data.subjects[0]
												$('#title').html('电影名称: ' + subject.title)
												console.log(subject.title)
												$('#director').html('导演: ' + subject.directors[0].name)
												$('#year').html('上映年份: ' + subject.year)
												$('#poster').html('<p>宣传海报: </p>' + '<img src="'+ subject.images.large +'" />')
												shareContent = {
													title: subject.title,
													desc: '我搜出来了 '+ subject.title,
													link: 'http://e77292a6.ngrok.io/movie',
													imgUrl: subject.images.large,
													type: 'link',
													success: function () {
														window.alert('分享成功!')
													},
													cancel: function () {
														window.alert('分享失败!')
													} 
												}
												wx.onMenuShareAppMessage(shareContent)
												slides = {
													current: subject.images.large,
													urls: []
												}
												data.subjects.forEach(function (item) {
													slides.urls.push(item.images.large)
												})
												
											}
										})
									}
								})
							}
						})
						
						
					})
				})
			</script>
		</body>
	</html>
*/})

exports = module.exports = {
	temTpl: temTpl,
	xmlToJson: xmlToJson
};