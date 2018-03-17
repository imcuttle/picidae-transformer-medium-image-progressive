import MediumImage from 'medium-image-progressive/dist/react'
import { utils } from 'picidae/exports/html-to-react'

export default function (opt = {}) {
  function shouldProcessNode(node) {
    return node.name === 'img'
           && 'data-progressive-id' in node.attribs
           && !isNaN(node.attribs['data-progressive-id'])
           && node.attribs['width'] && node.attribs['height']
  }

  let array
  global.__picidae__emitter.on('after-img-loader-replace-src', (node, children) => {
    if (shouldProcessNode(node)) {
      replaceNode(node)
    }
  })

  function replaceNode(node) {
    const i = parseInt(node.attribs['data-progressive-id'])
    // node.attribs['data-src'] = node.attribs['src']
    // node.attribs['src'] = array[i]
    node.name = MediumImage
    node.attribs['progressUrl'] = array[i]
    node.attribs['originUrl'] = node.attribs['src']
  }

  return function (pageData) {
    array = pageData.markdown.extra['_progressive_'] || []

    return [
      {
        replaceChildren: false,
        shouldProcessNode,
        processNode: function (node, children = [], index) {
          replaceNode(node)
          return utils.createElement(node, index, node.data, children)
        }
      },
      {
        replaceChildren: false,
        shouldProcessNode: function (node) {
          return node.name === 'img'
                 && node.attribs['width'] && node.attribs['height']
                 && node.attribs['data-src']
                 && node.attribs['src']
        },
        processNode: function (node, children = [], index) {
          node.name = MediumImage
          node.attribs['progressUrl'] = node.attribs['src']
          node.attribs['originUrl'] = node.attribs['data-src']
          return utils.createElement(node, index, node.data, children)
        }
      }
    ]
  }
}
