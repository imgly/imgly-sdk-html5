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

/**
 * Base class for primitives. Extendable via {@link ImglyKit.Filter.Primitive#extend}
 * @class
 * @alias ImglyKit.Filter.Primitive
 */
class Primitive {
  constructor (options) {
    options = options || {}

    this._glslPrograms = {}
    this._options = options
  }

  /**
   * Renders the primitive
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    if (renderer.identifier === 'webgl') {
      this.renderWebGL(renderer)
    } else {
      this.renderCanvas(renderer)
    }
  }

  /**
   * Renders the primitive (WebGL)
   * @param  {CanvasRenderer} renderer
   */
  /* istanbul ignore next */
  renderWebGL (renderer) {
    /* istanbul ignore next */
    throw new Error('Primitive#renderWebGL is abstract and not implemented in inherited class.')
  }

  /**
   * Renders the primitive (Canvas2D)
   * @param  {CanvasRenderer} renderer
   */
  renderCanvas (renderer) {
    /* istanbul ignore next */
    throw new Error('Primitive#renderCanvas is abstract and not implemented in inherited class.')
  }

  get options () {
    return this._options
  }
}

export default Primitive
