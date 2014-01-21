###
  imglyKit
  Copyright (c) 2013 img.ly
###
Filter     = require "./filters/filter.coffee"
Saturation = require "./filters/primitives/saturation.coffee"
class SaturationOperation extends Filter
  ###
    @param {imglyKit} app
    @param {Object} options
  ###
  constructor: (@app, @options={}) ->
    super
    @options.amount ?= 0
    @filter = new Saturation @app, saturation: @options.amount

  apply: (imageData) -> @filter.apply imageData

  ###
    @param {Integer} saturation
  ###
  setSaturation: (saturation) ->
    @options.amount = saturation
    @filter.setSaturation saturation

module.exports = SaturationOperation
