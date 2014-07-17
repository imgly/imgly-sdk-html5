###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter     = require "./filters/filter.coffee"
Brightness = require "./filters/primitives/brightness.coffee"
class BrightnessOperation extends Filter
  ###
    @param {ImglyKit} app
    @param {Object} options
  ###
  constructor: (@app, @options = {}) ->
    super
    @options.amount ?= 0
    @filter = new Brightness brightness: @options.amount

  apply: (imageData) -> @filter.apply imageData

  ###
    @param {Integer} brightness
  ###
  setBrightness: (brightness) ->
    @options.amount = brightness
    @filter.setBrightness brightness

module.exports = BrightnessOperation
