###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveSoftColorOverlayFilter extends Filter
  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        imageData.data[index] = Math.max @options.r, imageData.data[index]
        imageData.data[index + 1] = Math.max @options.g, imageData.data[index + 1]
        imageData.data[index + 2] = Math.max @options.b, imageData.data[index + 2]
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimitiveSoftColorOverlayFilter
