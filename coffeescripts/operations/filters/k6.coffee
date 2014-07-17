###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
SaturationFilter = require "./primitives/saturation.coffee"
class K6Filter extends SaturationFilter
  @preview: "k6.png"
  @displayName: "K6"

  saturation: 0.5

module.exports = K6Filter
