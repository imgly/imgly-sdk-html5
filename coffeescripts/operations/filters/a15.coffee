###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter     = require "./filter.coffee"
Contrast   = require "./primitives/contrast.coffee"
Brightness = require "./primitives/brightness.coffee"
ToneCurve  = require "./primitives/tonecurve.coffee"
class A15Filter extends Filter
  @preview: '15.png'
  @displayName: '15'

  apply: (new Contrast @app, contrast: -0.37)
    .compose(Brightness, brightness: 0.12)
    .compose(ToneCurve,
      redControlPoints: [
        [0, 38 / 255],
        [94 / 255, 94 / 255],
        [148 / 255, 142 / 255],
        [175 / 255, 187 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 0],
        [77 / 255, 53 / 255],
        [171 / 255, 190 / 255],
        [1, 1]
      ]
      blueControlPoints: [
        [0, 10 / 255],
        [48 / 255, 85 / 255],
        [174 / 255, 228 / 255],
        [1, 1]
      ]
    )

module.exports = A15Filter
