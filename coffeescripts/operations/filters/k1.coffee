###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter     = require "./filter.coffee"
ToneCurve  = require "./primitives/tonecurve.coffee"
Saturation = require "./primitives/saturation.coffee"
class K1Filter extends Filter
  @preview: 'k1.png'
  @displayName: 'K1'

  apply: (new ToneCurve @app,
      rgbControlPoints: [
        [0, 0],
        [53 / 255, 32 / 255],
        [91 / 255, 80 / 255],
        [176 / 255, 205 / 255],
        [1, 1]
      ]
    )
    .compose(Saturation, saturation: 0.9)

module.exports = K1Filter
