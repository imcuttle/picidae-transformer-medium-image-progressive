import mediumProgress from 'medium-image-progressive'
import { utils } from 'picidae/exports/html-to-react'

export default function (opt = {}) {

  let array
  global.__picidae__emitter.on('after-img-loader-replace-src', (node, children) => {
    if (
      node.name === 'img'
      && 'data-progressive-id' in node.attribs
      && !isNaN(node.attribs['data-progressive-id'])
    ) {
      const i = parseInt(node.attribs['data-progressive-id'])
      console.log(node.attribs['src'], array[i], node)
      node.attribs['data-progressive-src'] = node.attribs['src']
      node.attribs['src'] = array[i]
    }
  })

  return function (pageData) {
    array = pageData.markdown.extra['_progressive_'] || []

    const callbackCollect = this.callbackCollect
    callbackCollect(function (ele) {
      mediumProgress(ele.querySelectorAll('img[data-progressive-src][width][height]'), {
        progressImageUrlGetter: ele => ele.getAttribute('src'),
        originImageUrlGetter: ele => ele.getAttribute('data-progressive-src')
      })
    })

    return [{
      replaceChildren: false,
      shouldProcessNode: function (node) {
        return node.name === 'img'
               && 'data-progressive-id' in node.attribs
               && !isNaN(node.attribs['data-progressive-id'])
      },
      processNode: function (node, children = [], index) {
        const i = parseInt(node.attribs['data-progressive-id'])
        node.attribs['data-progressive-src'] = node.attribs['src']
        node.attribs['src'] = array[i]
        return utils.createElement(node, index, node.data, children)
      }
    }]
  }
}
