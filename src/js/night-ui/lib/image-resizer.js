/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default {
  resize (image, dimensions) {
    const newCanvas = document.createElement('canvas')
    newCanvas.width = dimensions.x
    newCanvas.height = dimensions.y

    const context = newCanvas.getContext('2d')
    context.drawImage(image,
      0, 0,
      image.width, image.height,
      0, 0,
      dimensions.x, dimensions.y)

    return newCanvas
  }
}
