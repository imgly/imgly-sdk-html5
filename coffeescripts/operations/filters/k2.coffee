###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter           = require "./filter.coffee"
ToneCurve        = require "./primitives/tonecurve.coffee"
SoftColorOverlay = require "./primitives/softcoloroverlay.coffee"
class K2Filter extends Filter
  @preview: "k2.png"
  @displayName: "K2"

  apply: (new ToneCurve @app,
      rgbControlPoints: [
        [0, 0],
        [54 / 255, 33 / 255],
        [77 / 255, 82 / 255],
        [94 / 255, 103 / 255],
        [122 / 255, 126 / 255],
        [177 / 255, 193 / 255],
        [229 / 255, 232 / 255],
        [1, 1]
      ]
    ).compose(SoftColorOverlay, r: 40, g: 40, b: 40)

module.exports = K2Filter
