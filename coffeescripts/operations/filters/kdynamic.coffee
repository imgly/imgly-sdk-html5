###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter     = require "./filter.coffee"
ToneCurve  = require "./primitives/tonecurve.coffee"
Saturation = require "./primitives/saturation.coffee"
class KDynamicFilter extends Filter
  @preview: "kdynamic.png"
  @displayName: "KDynamic"

  apply: (new ToneCurve @app,
      rgbControlPoints: [
        [0, 0],
        [17 / 255, 27 / 255],
        [46 / 255, 69 / 255],
        [90 / 255, 112 / 255],
        [156 / 255, 200 / 255],
        [203 / 255, 243 / 255],
        [1, 1]
      ]
    ).compose(Saturation, saturation: 0.7)

module.exports = KDynamicFilter
