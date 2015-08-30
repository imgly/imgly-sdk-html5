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
  block (blockName) {
    const fn = () => {
      return `${blockPrefix}${blockName}`
    }

    fn.element = (elementName) => {
      return this._element(blockName, elementName)
    }

    fn.modifier = (modifierName) => {
      return `${blockPrefix}${blockName}--${modifierName}`
    }

    return fn
  },

  _element (blockName, elementName) {
    const fn = () => {
      return `${blockPrefix}${blockName}__${elementName}`
    }

    fn.modifier = (modifierName) => {
      return `${blockPrefix}${blockName}__${elementName}--${modifierName}`
    }

    return fn
  }
}
