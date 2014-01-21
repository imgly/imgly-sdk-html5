###
  imglyKit
  Copyright (c) 2013 img.ly
###
Slider = require "./base/slider.coffee"
class UIControlsContrast extends Slider
  name: "Contrast"
  cssClass: "contrast"
  valueSetMethod: "setContrast"
  displayButtons: true

module.exports = UIControlsContrast
