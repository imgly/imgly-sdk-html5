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
import SaturationPrimitive from './filters/primitives/saturation'

/**
 * @class
 * @alias ImglyKit.Operations.SaturationOperation
 * @extends ImglyKit.Operation
 */
class SaturationOperation extends Operation {
  /**
   * Renders the saturation using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the saturation using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    this._render(renderer)
  }

  /**
   * Renders the saturation (all renderers supported)
   * @param  {Renderer} renderer
   * @private
   */
  _render (renderer) {
    if (!this._stack) {
      this._stack = new PrimitivesStack()
      this._primitive = new SaturationPrimitive({
        saturation: this._options.saturation
      })
      this._stack.add(this._primitive)
    }

    // @TODO
    // Primitives should have the same option logic as operations - which
    // should allow us to do `this._primitive.setSaturation`
    this._primitive.options.saturation = this._options.saturation
    this._stack.render(renderer)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
SaturationOperation.prototype.identifier = 'saturation'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
SaturationOperation.prototype.availableOptions = {
  saturation: { type: 'number', default: 1.0 }
}

export default SaturationOperation
