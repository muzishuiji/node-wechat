//文件读取的js
'use strict'

var fs = require('fs')
var Promise = require('bluebird')

//异步读取文件
exports.readFileAsync = function (fpath, encoding) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fpath, encoding, function (err) {
            if(err) reject(err)
            else resolve()
        })  
    })
}

//异步写入文件
exports.writeFileAsync = function (fpath, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(fpath, content, function (err) {
            if(err) reject(err)
            else resolve(content)
        })
    })
}