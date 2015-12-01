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
 * @alias PhotoEditorSDK.Operations.BrightnessOperation
 * @extends PhotoEditorSDK.Operation
 */
class BrightnessOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._stack = new PrimitivesStack()
    this._primitive = new BrightnessPrimitive({
      brightness: this._options.brightness
    })
    this._stack.add(this._primitive)
  }
  /**
   * Renders the brightness using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the brightness using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the brightness (all renderers supported)
   * @param {Renderer} renderer
   * @private
   */
  _render (renderer) {
    this._primitive.options.brightness = this._options.brightness
    this._stack.setDirty(true)
    return this._stack.render(renderer)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrightnessOperation.identifier = 'brightness'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrightnessOperation.prototype.availableOptions = {
  brightness: { type: 'number', default: 0 }
}

export default BrightnessOperation
