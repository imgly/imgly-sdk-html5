/* jshint unused: false */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import PrimitivesStack from './primitives-stack'

/**
 * Base class for filters. Extendable via {@link ImglyKit.Filter#extend}
 * @class
 * @alias ImglyKit.Filter
 */
class Filter {
  constructor (intensity = 1.0) {
    this._intensity = intensity
    this._stack = new PrimitivesStack(intensity)
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () { return null }

  /**
   * Specifies whether this filter is an identity filter
   * @return {Boolean}
   */
  static get isIdentity () { return false }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    this._stack.render(renderer)
  }

  /**
   * Sets the intensity to the given value
   * @param {Number} intensity
   */
  setIntensity (intensity) {
    this._intensity = intensity
    this._stack.setIntensity(intensity)
  }
}

/**
 * To create an {@link ImglyKit.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require('../../lib/extend')

// Exposed classes
Filter.PrimitivesStack = PrimitivesStack
Filter.Primitives = {}
Filter.Primitives.Saturation = require('./primitives/saturation')
Filter.Primitives.LookupTable = require('./primitives/lookup-table')
Filter.Primitives.ToneCurve = require('./primitives/tone-curve')
Filter.Primitives.SoftColorOverlay = require('./primitives/soft-color-overlay')
Filter.Primitives.Desaturation = require('./primitives/desaturation')
Filter.Primitives.X400 = require('./primitives/x400')
Filter.Primitives.Grayscale = require('./primitives/grayscale')
Filter.Primitives.Contrast = require('./primitives/contrast')
Filter.Primitives.Glow = require('./primitives/glow')
Filter.Primitives.Gobblin = require('./primitives/gobblin')
Filter.Primitives.Brightness = require('./primitives/brightness')

export default Filter
