###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
Contrast = require "./primitives/contrast.coffee"
Saturation = require "./primitives/saturation.coffee"

class PolaFilter extends Filter
  @preview: 'pola.png'
  @displayName: 'Pola'

  apply: (new ToneCurve @app,
      redControlPoints: [
        [0, 0],
        [94 / 255, 74 / 255],
        [181 / 255, 205 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 0],
        [34 / 255, 34 / 255],
        [99 / 255, 76 / 255],
        [176 / 255, 190 / 255],
        [1, 1]
      ]
      blueControlPoints: [
        [0, 0],
        [102 / 255, 73 / 255],
        [227 / 255, 213 / 255],
        [1, 1]
      ]
    )
    .compose(Saturation, saturation: -0.2)
    .compose(Contrast, contrast: 0.5)


module.exports = PolaFilter
