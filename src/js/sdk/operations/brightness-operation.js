/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import PrimitivesStack from './filters/primitives-stack'
import BrightnessPrimitive from './filters/primitives/brightness'

/**
 * @class
 * @alias ImglyKit.Operations.BrightnessOperation
 * @extends ImglyKit.Operation
 */
class BrightnessOperation extends Operation {
  /**
   * Renders the brightness using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the brightness using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the brightness (all renderers supported)
   * @param {Renderer} renderer
   * @private
   */
  _render (renderer) {
    if (!this._stack) {
      this._stack = new PrimitivesStack()
      this._primitive = new BrightnessPrimitive({
        brightness: this._options.brightness
      })
      this._stack.add(this._primitive)
    }

    // @TODO
    // Primitives should have the same option logic as operations - which
    // should allow us to do `this._primitive.setBrightness`
    this._primitive.options.brightness = this._options.brightness
    this._stack.render(renderer)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrightnessOperation.prototype.identifier = 'brightness'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrightnessOperation.prototype.availableOptions = {
  brightness: { type: 'number', default: 0 }
}

export default BrightnessOperation
