###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveX400Filter extends Filter
  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3
        gray -= 0.2
        gray = Math.max(0.0, Math.min(1.0, gray))
        gray += 0.15
        gray *= 1.4

        gray *= 255
        imageData.data[index] = gray
        imageData.data[index + 1] = gray
        imageData.data[index + 2] = gray
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimitiveX400Filter
