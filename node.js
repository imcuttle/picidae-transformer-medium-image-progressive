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

exports.use = function (opt) {
  var opts = opt.sizeOptions || {}
  return 'picidae-transformer-calc-image-size?' + JSON.stringify(opts)
}

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
        if (properties.src) {
          var old = properties.src
          if (isUrlString(properties.src) && properties['width'] && properties['height']) {
            // properties['data-progressive-src'] =
            properties['data-src'] = old
            properties.src = progressImageUrlGetter(properties.src)
          }
          else if (options.enableLocalThumbnail && !properties.src.startsWith('/')) {
            var filepath = nps.resolve(dirname, properties.src)
            if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
              if (!properties['width'] || !properties['height']) {
                // var size = sizeOf(fs.readFileSync(filepath))
                // properties['width'] = size.width
                // properties['height'] = size.height
                return
              }
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