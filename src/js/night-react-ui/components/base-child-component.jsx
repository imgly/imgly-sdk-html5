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
import ReactBEM from '../lib/react-bem'

export default class BaseChildComponent extends React.Component {
  /**
   * Binds the instance methods with the given names
   * to the class context
   * @param  {Array.<String>} ...fnNames
   * @private
   */
  _bindAll (...fnNames) {
    fnNames.forEach((name) => {
      if (typeof this[name] !== 'function') {
        throw new Error(`_bindAll: ${this.constructor.name}.${name} is not a function.`)
      }
      this[name] = this[name].bind(this)
    })
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Object} [interpolationOptions]
   * @return {String}
   */
  _t (key, interpolationOptions) {
    return this.context.ui.translate(key, interpolationOptions)
  }

  /**
   * A helper method for UI.helpers.assetPath
   * @param {?} ...args
   * @private
   */
  _getAssetPath (...args) {
    return this.context.ui.helpers.assetPath(...args)
  }

  /**
   * Method we are using for rendering
   * @return {ReactBEM.element}
   */
  renderWithBEM () {

  }

  /**
   * Transforms the ReactBEM.element returned by `renderWithBEM` into
   * React.Element objects with proper class names
   * @return {React.Element}
   */
  render () {
    return ReactBEM.transform(this.renderWithBEM())
  }
}

BaseChildComponent.contextTypes = {
  ui: React.PropTypes.object,
  renderer: React.PropTypes.object,
  options: React.PropTypes.object
}
