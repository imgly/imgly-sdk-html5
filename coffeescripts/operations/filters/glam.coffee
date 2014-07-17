###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
Grayscale = require "./primitives/grayscale.coffee"
Contrast  = require "./primitives/contrast.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
class GlamFilter extends Filter
  @preview: 'glam.png'
  @displayName: 'Glam'

  apply: (new Grayscale)
    .compose(Contrast, contrast: 0.1)
    .compose(ToneCurve,
      redControlPoints: [
        [0, 0],
        [94 / 255, 74 / 255],
        [181 / 255, 205 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 0],
        [0.5, 0.5],
        [1, 1]
      ]
      blueControlPoints: [
        [0, 0],
        [102 / 255, 73 / 255],
        [227 / 255, 213 / 255],
        [1, 1]
      ]
    )

module.exports = GlamFilter
