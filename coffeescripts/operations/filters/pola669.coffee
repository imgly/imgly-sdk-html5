###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
Contrast = require "./primitives/contrast.coffee"
Saturation = require "./primitives/saturation.coffee"

class Pola669Filter extends Filter
  @preview: 'pola669.png'
  @displayName: 'Pola 669'

  apply: (new ToneCurve @app,
      redControlPoints: [
        [0, 0],
        [56 / 255, 18 / 255],
        [196 / 255, 209 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 38 / 255],
        [71 / 255, 84 / 255],
        [1, 1]
      ]
      blueControlPoints: [
        [0, 0],
        [131 / 255, 133 / 255],
        [204 / 255, 211 / 255],
        [1, 1]
      ]
    )
    .compose(Saturation, saturation: -0.2)
    .compose(Contrast, contrast: 0.5)


module.exports = Pola669Filter
