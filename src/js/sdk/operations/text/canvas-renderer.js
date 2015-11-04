/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from '../../lib/math/vector2'

export default class TextCanvasRenderer {
  constructor (operation, renderer) {
    this._operation = operation
    this._renderer = renderer
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the text operation using Canvas2d
   * @return {Promise}
   */
  render () {
    return new Promise((resolve, reject) => {
      const texts = this._operation.getTexts()
      texts.forEach((text) => {
        this._renderText(text)
      })
      resolve()
    })
  }

  /**
   * Renders the given text using canvas2d
   * @param  {String} text
   * @return {Promise}
   * @private
   */
  _renderText (text) {
    let canvas = null
    return text.render(this._renderer)
      .then((_canvas) => {
        canvas = _canvas
        return this._renderTextToCanvas(text, canvas)
      })
  }

  /**
   * Renders the given text to the output canvas
   * @param  {String} text
   * @param  {CanvasElement} canvas
   * @return {Promise}
   * @private
   */
  _renderTextToCanvas (text, canvas) {
    const outputCanvas = this._renderer.getCanvas()
    const context = this._renderer.getContext()

    const canvasDimensions = new Vector2(
      outputCanvas.width,
      outputCanvas.height
    )

    return new Promise((resolve, reject) => {
      const textPosition = text.getPosition()
      const textRotation = text.getRotation()
      const textAnchor = text.getAnchor()

      const textDimensions = new Vector2(
        canvas.width,
        canvas.height
      )

      const absoluteTextPosition = textPosition.clone()
        .multiply(canvasDimensions)
      const absoluteTextAnchor = textAnchor.clone()
        .multiply(textDimensions)

      context.save()

      context.translate(
        absoluteTextPosition.x,
        absoluteTextPosition.y
      )
      context.rotate(textRotation)

      context.drawImage(canvas,
        -absoluteTextAnchor.x,
        -absoluteTextAnchor.y)

      context.restore()

      resolve()
    })
  }

  /**
   * Resets... nothing.
   */
  reset () {

  }
}
