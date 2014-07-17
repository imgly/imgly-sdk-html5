###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "./filter.coffee"
ToneCurveFilter = require "./primitives/tonecurve.coffee"
Desaturation = require "./primitives/desaturation.coffee"
class QuoziFilter extends Filter
  @preview: "breeze.png"
  @displayName: "Breeze"

  apply: (new Desaturation @app, desaturation: 0.65)
    .compose(ToneCurveFilter,
      redControlPoints: [
        [0, 50 / 255],
        [40 / 255, 78 / 255],
        [118 / 255, 170 / 255],
        [181 / 255, 211 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 27 / 255],
        [28 / 255, 45 / 255],
        [109 / 255, 157 / 255],
        [157 / 255, 195 / 255],
        [179 / 255, 208 / 255],
        [206 / 255, 212 / 255],
        [1, 240 / 255]
      ]
      blueControlPoints: [
        [0, 50 / 255],
        [12 / 255, 55 / 255],
        [46 / 255, 103 / 255],
        [103 / 255, 162 / 255],
        [194 / 255, 182 / 255],
        [241 / 255, 201 / 255],
        [1, 219 / 255]
      ]
    )

module.exports = QuoziFilter
