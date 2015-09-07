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

/**
 * An operation that can flip the canvas
 *
 * @class
 * @alias ImglyKit.Operations.FlipOperation
 * @extends ImglyKit.Operation
 */
class FlipOperation extends Operation {
  constructor (...args) {
    super(...args)

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      uniform bool u_flipVertical;
      uniform bool u_flipHorizontal;

      void main() {
        vec2 texCoord = vec2(v_texCoord);
        if (u_flipVertical) {
          texCoord.y = 1.0 - texCoord.y;
        }
        if (u_flipHorizontal) {
          texCoord.x = 1.0 - texCoord.x;
        }
        gl_FragColor = texture2D(u_image, texCoord);
      }
    `
  }

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    renderer.runShader(null, this.fragmentShader, {
      uniforms: {
        u_flipVertical: { type: 'f', value: this._options.vertical },
        u_flipHorizontal: { type: 'f', value: this._options.horizontal }
      }
    })
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    var canvas = renderer.getCanvas()
    var context = renderer.getContext()

    var scaleX = 1, scaleY = 1
    var translateX = 0, translateY = 0

    if (this._options.horizontal) {
      scaleX = -1
      translateX = canvas.width
    }

    if (this._options.vertical) {
      scaleY = -1
      translateY = canvas.height
    }

    // Save the current state
    context.save()

    // Apply the transformation
    context.translate(translateX, translateY)
    context.scale(scaleX, scaleY)

    // Create a temporary canvas so that we can draw the image
    // with the applied transformation
    var tempCanvas = renderer.cloneCanvas()
    context.drawImage(tempCanvas, 0, 0)

    // Restore old transformation
    context.restore()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FlipOperation.prototype.identifier = 'flip'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FlipOperation.prototype.availableOptions = {
  horizontal: { type: 'boolean', default: false },
  vertical: { type: 'boolean', default: false }
}

export default FlipOperation
