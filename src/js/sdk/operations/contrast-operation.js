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
import ContrastPrimitive from './filters/primitives/contrast'

/**
 * @class
 * @alias ImglyKit.Operations.ContrastOperation
 * @extends ImglyKit.Operation
 */
class ContrastOperation extends Operation {
  constructor (...args) {
    super(...args)

    if (!this._stack) {
      this._stack = new PrimitivesStack()
      this._primitive = new ContrastPrimitive({
        contrast: this._options.contrast
      })
      this._stack.add(this._primitive)
    }
  }

  /**
   * Renders the contrast using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the contrast using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    return this._render(renderer)
  }

  /**
   * Renders the contrast (all renderers supported)
   * @param  {Renderer} renderer
   * @private
   */
  _render (renderer) {
    this._primitive.options.contrast = this._options.contrast
    this._stack.setDirty(true)
    return this._stack.render(renderer)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
ContrastOperation.identifier = 'contrast'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
ContrastOperation.prototype.availableOptions = {
  contrast: { type: 'number', default: 1.0 }
}

export default ContrastOperation
