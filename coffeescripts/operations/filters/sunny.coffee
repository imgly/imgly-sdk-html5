###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"

contrastPoints = [
  [0, 0],
  [55 / 255, 20 / 255],
  [158 / 255, 191 / 255],
  [1, 1]
]

class SunnyFilter extends Filter
  @preview: 'sunny.png'
  @displayName: 'Sunny'

  apply: (new ToneCurve @app,
      redControlPoints: [
        [0, 0],
        [62 / 255, 82 / 255],
        [141 / 255, 154 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 39 / 255],
        [56 / 255, 96 / 255],
        [192 / 255, 176 / 255],
        [1, 1]
      ]
      blueControlPoints: [
        [0, 0],
        [174 / 255, 99 / 255],
        [1, 235 / 255]
      ]
    )
    .compose(ToneCurve,
      redControlPoints: contrastPoints
      greenControlPoints: contrastPoints
      blueControlPoints: contrastPoints
    )

module.exports = SunnyFilter
