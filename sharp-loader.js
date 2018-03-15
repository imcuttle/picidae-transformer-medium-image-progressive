/**
 * @file sharp-loader
 * @author Cuttle Cong
 * @date 2018/3/15
 * @description 
 */
var loaderUtils = require('picidae/exports/loader-utils')
var imgSize = require('image-size')
var sharp = require('sharp')
var fs = require('fs')

module.exports = function (buffer) {
  if (this.cacheable) {
    this.cacheable()
  }
  var localQuery = loaderUtils.parseQuery(this.query);
  var scale = parseFloat(localQuery.scale || 0.1)

  var callback = this.async()

  var size = imgSize(buffer)
  sharp(buffer)
    .resize(scale * size.width, scale * size.height)
    .toBuffer()
    .then(function (miniBuffer) {
      callback(null, miniBuffer)
    })
    .catch(callback)
}
module.exports.raw = true