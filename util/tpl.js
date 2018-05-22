/*
 * 模板文件
 * 封装一个消息回复的模板
 * 同时在消息模板中对消息类型做判断
 */
'use strict'

const ejs = require('ejs')
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
exports = module.exports = {
	xmlToJson: xmlToJson
};