###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "./filter.coffee"
ToneCurveFilter = require "./primitives/tonecurve.coffee"
Desaturation = require "./primitives/desaturation.coffee"
class LeninFilter extends Filter
  @preview: "lenin.png"
  @displayName: "Lenin"

  apply: (new Desaturation @app, desaturation: 0.4)
  .compose(ToneCurveFilter,
    redControlPoints: [
      [0, 20 / 255],
      [40 / 255, 20 / 255],
      [106 / 255, 111 / 255],
      [129 / 255, 153 / 255],
      [190 / 255, 223 / 255],
      [1, 1]
    ]
    greenControlPoints: [
      [0, 20 / 255],
      [40 / 255, 20 / 255],
      [62 / 255, 41 / 255],
      [106 / 255, 108 / 255],
      [132 / 255, 159 / 255],
      [203 / 255, 237 / 255],
      [1, 1]
    ]
    blueControlPoints: [
      [0, 40 / 255],
      [40 / 255, 40 / 255],
      [73 / 255, 60 / 255],
      [133 / 255, 160 / 255],
      [191 / 255, 297 / 255],
      [203 / 255, 237 / 255],
      [237 / 255, 239 / 255],
      [1, 1]
    ]
  )

module.exports = LeninFilter
