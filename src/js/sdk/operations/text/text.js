/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Configurable from '../../lib/configurable'
import Utils from '../../lib/utils'
import Color from '../../lib/color'
import Vector2 from '../../lib/math/vector2'
import Promise from '../../vendor/promise'

export default class Text extends Configurable {
  constructor (operation, options) {
    super(options)

    // A unique ID that we use to identify this text object
    this.id = Utils.getUUID()

    this._operation = operation

    this._canvas = null
    this._dirty = true
  }

  /**
   * Gets called when options have been changed
   * @private
   */
  _onOptionsChanged () {
    this._dirty = true
  }

  /**
   * Renders this text and returns a canvas
   * @param {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    if (!this._dirty) return Promise.resolve(this._canvas)

    const textOptions = this._calculateFontSizeAndLineHeight(renderer)
    const { boundingBox, lines } = this._calculateText(renderer, textOptions)
    return this._renderText(renderer, boundingBox, lines, textOptions)
      .then(() => {
        this._dirty = false
        return this._canvas
      })
  }

  /**
   * Applies the text options on the given context
   * @param  {Object} textOptions
   * @private
   */
  _applyTextOptions (textOptions) {
    this._context.font = this._options.fontWeight + ' ' +
      textOptions.fontSize + 'px ' +
      this._options.fontFamily
    this._context.textBaseline = 'top'
    this._context.textAlign = this._options.alignment
    this._context.fillStyle = this._options.color.toRGBA()
  }

  /**
   * Calculates the actual font size and line height
   * @param  {Renderer} renderer
   * @return {Promise}
   * @private
   */
  _calculateFontSizeAndLineHeight (renderer) {
    const outputCanvas = renderer.getCanvas()
    const outputCanvasDimensions = new Vector2(outputCanvas.width, outputCanvas.height)

    this._canvas = document.createElement('canvas')
    this._context = this._canvas.getContext('2d')

    const fontSize = this._options.fontSize * outputCanvasDimensions.y
    const lineHeight = this._options.lineHeight * fontSize

    return { fontSize, lineHeight }
  }

  /**
   * Calculates the bounding box and new lines according to max width
   * @param  {Renderer} renderer
   * @param  {Object} textOptions
   * @return {Object}
   * @private
   */
  _calculateText (renderer, textOptions) {
    const outputCanvas = renderer.getCanvas()
    const outputCanvasDimensions = new Vector2(outputCanvas.width, outputCanvas.height)

    // Calculate max width
    let { maxWidth } = this._options
    let numberFormat = this._operation.getNumberFormat()
    if (numberFormat === 'relative') {
      maxWidth *= outputCanvasDimensions.x
    }

    // Apply text options
    this._applyTextOptions(textOptions)

    // Calculate bounding box
    let boundingBox = new Vector2()
    let lines = this._options.text.split('\n')
    if (typeof maxWidth !== 'undefined') {
      // Calculate the bounding box
      boundingBox.x = maxWidth
      const output = this._buildOutputLines(maxWidth)
      lines = output.lines
      boundingBox.x = output.width
    } else {
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        boundingBox.x = Math.max(boundingBox.x, this._context.measureText(line).width)
      }
    }

    // Calculate boundingbox height
    boundingBox.y = textOptions.lineHeight * lines.length

    return { boundingBox, lines }
  }

  /**
   * Renders the text
   * @param  {Renderer} renderer
   * @param  {Vector2} boundingBox
   * @param  {Array.<String>} lines
   * @param  {Object} textOptions
   * @return {Promise}
   * @private
   */
  _renderText (renderer, boundingBox, lines, textOptions) {
    return new Promise((resolve, reject) => {
      // Resize the canvas
      this._canvas.width = boundingBox.x
      this._canvas.height = boundingBox.y

      // Update the context
      this._context = this._canvas.getContext('2d')

      // Render background color
      this._context.fillStyle = this._options.backgroundColor.toRGBA()
      this._context.fillRect(0, 0, boundingBox.x, boundingBox.y)

      // Apply text options
      this._applyTextOptions(textOptions)

      // Draw lines
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        this._renderTextLine(line, textOptions.lineHeight * lineNum)
      }

      resolve()
    })
  }

  /**
   * Iterate over all lines and split them into multiple lines, depending
   * on the width they need
   * @param {Number} maxWidth
   * @return {Array.<string>}
   * @private
   */
  _buildOutputLines (maxWidth) {
    var inputLines = this._options.text.split('\n')
    var outputLines = []
    var currentChars = []
    let width = 0

    for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
      var inputLine = inputLines[lineNum]
      var lineChars = inputLine.split('')

      if (lineChars.length === 0) {
        outputLines.push('')
      }

      for (var charNum = 0; charNum < lineChars.length; charNum++) {
        var currentChar = lineChars[charNum]
        currentChars.push(currentChar)
        var currentLine = currentChars.join('')
        var lineWidth = this._context.measureText(currentLine).width
        width = Math.max(width, lineWidth)

        if (lineWidth > maxWidth && currentChars.length === 1) {
          outputLines.push(currentChars[0])
          currentChars = []
        } else if (lineWidth > maxWidth) {
          // Remove the last word
          var lastWord = currentChars.pop()

          // Add the line, clear the words
          outputLines.push(currentChars.join(''))
          currentChars = []

          // Make sure to use the last word for the next line
          currentChars = [lastWord]
        } else if (charNum === lineChars.length - 1) {
          // Add the line, clear the words
          outputLines.push(currentChars.join(''))
          currentChars = []
        }
      }

      // Line ended, but there's words left
      if (currentChars.length) {
        outputLines.push(currentChars.join(''))
        currentChars = []
      }
    }

    return { lines: outputLines, width }
  }

  /**
   * Draws the given line onto context at the given Y position
   * @param  {String} text
   * @param  {Number} y
   * @private
   */
  _renderTextLine (text, y) {
    if (this._options.alignment === 'center') {
      this._context.fillText(text, this._canvas.width / 2, y)
    } else if (this._options.alignment === 'left') {
      this._context.fillText(text, 0, y)
    } else if (this._options.alignment === 'right') {
      this._context.fillText(text, this._canvas.width, y)
    }
  }
}

Text.prototype.availableOptions = {
  fontSize: { type: 'number', default: 0.1 },
  lineHeight: { type: 'number', default: 1.1 },
  fontFamily: { type: 'string', default: 'Times New Roman' },
  fontWeight: { type: 'string', default: 'normal' },
  alignment: { type: 'string', default: 'left', available: ['left', 'center', 'right'] },
  verticalAlignment: { type: 'string', default: 'top', available: ['top', 'center', 'bottom'] },
  color: { type: 'color', default: new Color(1, 0, 0, 1) },
  backgroundColor: { type: 'color', default: new Color(0, 0, 0, 0) },
  position: { type: 'vector2', default: new Vector2(0, 0) },
  anchor: { type: 'vector2', default: new Vector2(0, 0) },
  rotation: { type: 'number', default: 0 },
  text: { type: 'string', required: true },
  maxWidth: { type: 'number', default: 1.0 }
}
