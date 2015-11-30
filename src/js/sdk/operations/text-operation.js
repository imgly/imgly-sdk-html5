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
import Vector2 from '../lib/math/vector2'
import Text from './text/text'

import TextWebGLRenderer from './text/webgl-renderer'
import TextCanvasRenderer from './text/canvas-renderer'

/**
 * An operation that can draw text on the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.TextOperation
 * @extends PhotoEditorSDK.Operation
 */
class TextOperation extends Operation {
  constructor (...args) {
    super(...args)
    this._renderers = {}
  }

  /**
   * Returns a serialized version of the given option
   * @param {String} optionName
   * @return {*} optionName
   * @private
   */
  _serializeOption (optionName) {
    // Since `texts` is an array of configurables, we need
    // to serialize them as well
    if (optionName === 'texts') {
      return this._options.texts.map((text) => {
        return text.serializeOptions()
      })
    }
    return super._serializeOption(optionName)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when this operation has been marked as dirty
   * @protected
   */
  _onDirty () {
    for (let id in this._renderers) {
      this._renderers[id].reset()
    }
  }

  // -------------------------------------------------------------------------- TEXT CREATION

  /**
   * Creates a new text object and returns it
   * @param  {Object} options
   * @return {Text}
   */
  createText (options) {
    return new Text(this, options)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Crops this image using WebGL
   * @param  {WebGLRenderer} renderer
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    if (!this._renderers[renderer.id]) {
      this._renderers[renderer.id] = new TextWebGLRenderer(this, renderer)
    }

    return this._renderers[renderer.id].render()
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas (renderer) {
    if (!this._renderers[renderer.id]) {
      this._renderers[renderer.id] = new TextCanvasRenderer(this, renderer)
    }

    return this._renderers[renderer.id].render()
  }

  /**
   * Returns the text object at the given position on the canvas
   * @param  {BaseRenderer} renderer
   * @param  {Vector2} position
   * @return {Text}
   */
  getTextAtPosition (renderer, position) {
    const canvas = renderer.getCanvas()
    const canvasDimensions = new Vector2(canvas.width, canvas.height)

    let intersectingText = null
    this._options.texts.slice(0).reverse()
      .forEach((text) => {
        if (intersectingText) return

        const absoluteTextPosition = text.getPosition()
          .clone()
          .multiply(canvasDimensions)
        const relativeClickPosition = position
          .clone()
          .subtract(absoluteTextPosition)
        const clickDistance = relativeClickPosition.len()
        const radians = Math.atan2(
          relativeClickPosition.y,
          relativeClickPosition.x
        )
        const newRadians = radians - text.getRotation()

        const x = Math.cos(newRadians) * clickDistance
        const y = Math.sin(newRadians) * clickDistance

        const textDimensions = text.getBoundingBox(renderer)

        if (x > -0.5 * textDimensions.x &&
            x < 0.5 * textDimensions.x &&
            y > 0 &&
            y < textDimensions.y) {
          intersectingText = text
        }
      })
    return intersectingText
  }

  /**
   * Sets this operation to dirty, so that it will re-render next time
   * @param {Boolean} dirty = true
   */
  setDirty (dirty) {
    super.setDirty(dirty)
    if (dirty) {
      const texts = this.getTexts()
      texts.forEach((text) => text.setDirty(true))
    }
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TextOperation.identifier = 'text'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
TextOperation.prototype.availableOptions = {
  texts: {
    type: 'array', default: [],
    setter: function (texts) {
      texts = texts.map((text, i) => {
        if (text instanceof Text) return text

        // Update texts if they already exist
        if (this._options.texts[i]) {
          this._options.texts[i].set(text)
          return this._options.texts[i]
        }

        return new Text(this, text)
      })
      return texts
    }
  }
}

export default TextOperation
