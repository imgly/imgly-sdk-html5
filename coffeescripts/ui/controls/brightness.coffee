###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Slider = require "./base/slider.coffee"
class UIControlsBrightness extends Slider
  name: "Brightness"
  cssClass: "brightness"
  valueSetMethod: "setBrightness"
  displayButtons: true

module.exports = UIControlsBrightness
