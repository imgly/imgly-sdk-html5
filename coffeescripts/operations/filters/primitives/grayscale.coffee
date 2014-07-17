###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimtiveGrayscaleFilter extends Filter
  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721

        imageData.data[index] = luminance
        imageData.data[index + 1] = luminance
        imageData.data[index + 2] = luminance
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimtiveGrayscaleFilter
