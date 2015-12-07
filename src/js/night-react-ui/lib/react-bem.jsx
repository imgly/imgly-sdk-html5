/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import React from 'react'
import Classnames from 'classnames'
import BEM from './bem'

function flatten (arr) {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] instanceof Array) {
      result = result.concat(flatten(arr[i]))
    } else {
      result.push(arr[i])
    }
  }
  return result
}

const BEM_TYPES = {
  b: 'block',
  e: 'element',
  m: 'modifier'
}

export default {
  /**
   * Parses the given ReactBEM specifier and returns an array of
   * BEM information (type, name, pass)
   * @param  {string} specifier
   * @return {Array.<Object>}
   * @private
   */
  _parseBemSpecifier (specifier) {
    if (!specifier) return []

    const parts = specifier.split(' ')
    let data = parts.map((part) => {
      const match = part.match(/^(\$)?([bem])\:(.*)$/i)
      if (!match) {
        throw new Error('Invalid BEM specifier: ' + part)
      }

      let pass = typeof match[1] !== 'undefined'
      let type = BEM_TYPES[match[2]]
      let name = match[3]
      return { type, name, pass }
    })
    return data
  },

  /**
   * Returns the BEM info for the given node
   * @param  {Object} node
   * @return {Object}
   * @private
   */
  _getBemInfoForNode (node) {
    const isBemNode = node.type === 'bem'
    const specifier = isBemNode ? node.props.specifier : node.props.bem

    if (isBemNode && !specifier) {
      throw new Error('<bem> elements should always have a `specifier` property')
    }

    const data = this._parseBemSpecifier(specifier)

    // <bem> nodes pass all bem information to the children
    if (isBemNode) {
      data.forEach((obj) => {
        obj.pass = true
      })
    }

    return { data, isBemNode }
  },

  /**
   * Used in React.Component's `render` method
   *
   * @param  {String} type
   * @param  {Object} props
   * @param  {Array.<Object>} [...children]
   * @return {Object}
   */
  createElement (type, props, ...children) {
    props = props || {}
    children = children
      .filter((child) =>
        child !== null && typeof child !== 'undefined'
      )
    return { type, props, children }
  },

  /**
   * Checks whether we can apply a bem class to the given node
   * @param  {?}  node
   * @return {Boolean}
   * @private
   */
  _isNodeBEMable (node) {
    return node !== null && typeof node === 'object' && !React.isValidElement(node)
  },

  /**
   * Sets the BEM class for the given node. Iterates through its
   * children and sets their BEM class as well
   * @param  {Object} node
   * @return {Object}
   * @private
   */
  _applyBEMClasses (node) {
    if (!this._isNodeBEMable(node)) return node

    let classNames = node.props.className ? [node.props.className] : []

    // Prepare BEM objects
    const bemInfo = this._getBemInfoForNode(node)
    let ownBemObject = node.props.__bemObject
    let childrenBemObject = node.props.__bemObject
    bemInfo.data.forEach((obj) => {
      if (obj.type === 'block') {
        ownBemObject = BEM.block(obj.name)
        if (obj.pass) {
          childrenBemObject = BEM.block(obj.name)
        }
        classNames.push(ownBemObject.str)
      } else if (obj.type === 'element') {
        if (!ownBemObject) {
          throw new Error('Tried to create an element, but no parent block has been found.')
        }

        ownBemObject = ownBemObject.element(obj.name)
        if (obj.pass) {
          childrenBemObject = childrenBemObject.element(obj.name)
        }
        classNames.push(ownBemObject.str)
      } else if (obj.type === 'modifier') {
        if (!ownBemObject) {
          throw new Error('Tried to create a modifier, but no parent block has been found.')
        }

        if (obj.pass) {
          childrenBemObject = childrenBemObject.modifier(obj.name)
        }
        classNames.push(ownBemObject.modifier(obj.name).str)
      }
    })

    // Apply classname (if necessary)
    const className = Classnames(classNames)
    if (className) {
      node.props.className = className
    }

    node.children = flatten(node.children)

    // Pass `childrenBemObject` to child nodes
    node.children.forEach((child) => {
      if (!this._isNodeBEMable(child)) return
      child.props.__bemObject = childrenBemObject
    })

    // Apply BEM objects to children
    node.children = node.children.map((child) => {
      return this._applyBEMClasses(child)
    })

    node.children = flatten(node.children)

    // Remove unnecessary props
    delete node.props.__bemObject

    if (bemInfo.isBemNode) {
      if (node.children instanceof Array && node.children.length === 1) {
        node = node.children[0]
      } else {
        node = node.children
      }
    }

    return node
  },

  /**
   * Transforms the given ReactBEM element and its children into
   * actual ReactJS elements
   * @param  {Object} node
   * @return {React.Element}
   */
  _transformToReact (node) {
    if (!this._isNodeBEMable(node)) return node

    node.children = node.children.map((child) => {
      return this._transformToReact(child)
    })

    return React.createElement(node.type, node.props, ...node.children)
  },

  /**
   * Transforms the given ReactBEM object and its children
   * @param  {Object} root
   * @return {React.Element}
   */
  transform (root) {
    root = this._applyBEMClasses(root)

    // Root node should be a single node, not an array. Returning the array
    // here will cause React to throw an error saying that this is a no-go
    if (root instanceof Array) {
      return root
    }

    root = this._transformToReact(root)
    return root
  }
}
