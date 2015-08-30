/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const blockPrefix = 'pesdk-night-'

export default {
  _elementClass (block, element) {
    return element ? `${block}__${element}` : block
  },

  _modifierClass (block, modifier) {
    return modifier ? `${block}--${modifier}` : block
  },

  _prefixBlock (block) {
    return `${blockPrefix}${block}`
  },

  elementClass (block) {
    const prefixedBlock = this._prefixBlock(block)
    return (elements) => {
      if (elements == null) {
        return prefixedBlock
      }
      return elements
        .trim().split(/\s+/)
        .map((element) => this._elementClass(prefixedBlock, element))
        .join(' ')
    }
  },

  modifierClass (block) {
    const prefixedBlock = this._prefixBlock(block)
    return (modifiers) => {
      if (modifiers == null) {
        return prefixedBlock
      }
      return modifiers
        .trim().split(/\s+/)
        .map((modifier) => this._modifierClass(prefixedBlock, modifier))
        .join(' ')
    }
  }
}
