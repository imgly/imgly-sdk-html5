/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const Vector2 = PhotoEditorSDK.Vector2

export default {
  /**
   * Returns the inner dimensions (size - padding) of the given
   * DOM element
   * @param  {DOMElement} element
   * @return {Vector2}
   */
  getInnerDimensionsForElement (element) {
    let size = new Vector2(element.offsetWidth, element.offsetHeight)
    const computedStyle = window.getComputedStyle(element, null)
    size.x -= parseInt(computedStyle.getPropertyValue('padding-left'), 10)
    size.x -= parseInt(computedStyle.getPropertyValue('padding-right'), 10)
    size.y -= parseInt(computedStyle.getPropertyValue('padding-top'), 10)
    size.y -= parseInt(computedStyle.getPropertyValue('padding-bottom'), 10)
    return size
  },

  /**
   * Gets the x and y position for the given event.
   * @param {Event} e
   * @return {Vector2}
   */
  getEventPosition (e) {
    let x = e.pageX
    let y = e.pageY
    if (e.type.indexOf('touch') !== -1) {
      x = e.touches[0].pageX
      y = e.touches[0].pageY
    }
    return new Vector2(x, y)
  },

  /**
   * Creates a canvas with a transparency pattern
   * @return {Canvas}
   */
  createTransparentPatternCanvas () {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = 10
    canvas.height = 10

    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#cccccc'
    context.fillRect(0, 0, canvas.width / 2, canvas.height / 2)
    context.fillRect(
      canvas.width / 2, canvas.height / 2,
      canvas.width, canvas.height
    )

    return canvas
  }
}
