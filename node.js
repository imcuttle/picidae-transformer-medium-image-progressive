/**
 * @file node
 * @author Cuttle Cong
 * @date 2018/3/13
 * @description
 */
var visit = require('picidae/exports/unist-util-visit')
var u = require('url')
var fs = require('fs')
var nps = require('path')
var sharpLoaderPath = require.resolve('./sharp-loader')

var evalVal = require('./evalVal')

exports.use = 'picidae-transformer-calc-image-size'

function isUrlString(url) {
  return u.parse(url).slashes || url.startsWith('//')
}

function opt(options) {
  return Object.assign({
    enableLocalThumbnail: true,
    thumbnailName: 'thumbnail/[name].[hash:6].[ext]'
  }, options)
}

exports.rehypeTransformer = function rehypeTransformer(options) {
  var picidae = this.picidae()
  var inject = picidae.inject
  var filesMap = picidae.info.filesMap
  var path = picidae.info.path
  var filename = filesMap[path]
  var dirname = nps.dirname(filename)
  var arr = []
  inject('_progressive_', arr)
  options = opt(options)

  let progressImageUrlGetter
  if (options.progressImageUrlGetter) {
    progressImageUrlGetter = evalVal(options.progressImageUrlGetter)
  }
  else {
    progressImageUrlGetter = function (url) {
      return 'http://23.106.151.229:8000/resize/' + encodeURIComponent(url) + '?s=0.1'
    }
  }

  var index = 0
  return function (node) {
    visit(node, 'element', function (ele) {
      if (ele.tagName === 'img') {
        var properties = ele.properties
        if (properties.src/* && properties['width'] && properties['height']*/) {
          var old = properties.src
          if (isUrlString(properties.src)) {
            properties.src = progressImageUrlGetter(properties.src)
            properties['data-progressive-src'] = old
          }
          else if (options.enableLocalThumbnail && !properties.src.startsWith('/')) {
            var filepath = nps.resolve(dirname, properties.src)
            if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
              arr.push({
                PICIDAE_EVAL_CODE: true,
                value: 'require(' + JSON.stringify('!!file-loader?name=' + options.thumbnailName + '!' + sharpLoaderPath + '?scale=.1!' + filepath) + ')'
              })
              properties['data-progressive-id'] = index++
            }
          }
        }
      }
    })
  }
}