/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @alias ImglyKit.Filter.PrimitivesStack
 */
class PrimitivesStack {
  constructor (...args) {
    /**
     * The stack of {@link ImglyKit.Filter.Primitive} instances
     * @type {Array}
     * @private
     */
    this._stack = []
  }

  /**
   * Adds the given primitive to the stack
   * @param {ImglyKit.Filter.Primitive} primitive
   */
  add (primitive) {
    this._stack.push(primitive)
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    for (var i = 0; i < this._stack.length; i++) {
      var primitive = this._stack[i]
      primitive.render(renderer)
    }
  }
}

export default PrimitivesStack
