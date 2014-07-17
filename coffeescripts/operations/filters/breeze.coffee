###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "./filter.coffee"
ToneCurveFilter = require "./primitives/tonecurve.coffee"
Desaturation = require "./primitives/desaturation.coffee"
class BreezeFilter extends Filter
  @preview: "breeze.png"
  @displayName: "Breeze"

  apply: (new Desaturation @app, desaturation: 0.5)
  .compose(ToneCurveFilter,
    redControlPoints: [
      [0, 0],
      [170 / 255, 170 / 255],
      [212 / 255, 219 / 255],
      [234 / 255, 242 / 255],
      [1, 1]
    ]
    greenControlPoints: [
      [0, 0],
      [170 / 255, 168 / 255],
      [234 / 255, 231 / 255],
      [1, 1]
    ]
    blueControlPoints: [
      [0, 0],
      [170 / 255, 170 / 255],
      [212 / 255, 208 / 255],
      [1, 1]
    ]
  )

module.exports = BreezeFilter
