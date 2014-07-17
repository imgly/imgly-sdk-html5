###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter   = require "./filters/filter.coffee"
Contrast = require "./filters/primitives/contrast.coffee"
class ContrastOperation extends Filter
  ###
    @param {ImglyKit} app
    @param {Object} options
  ###
  constructor: (@app, @options={}) ->
    super
    @options.amount ?= 0
    @filter = new Contrast @app, contrast: @options.amount

  apply: (imageData) -> @filter.apply imageData

  ###
    @param {Integer} contrast
  ###
  setContrast: (contrast) ->
    @options.amount = contrast
    @filter.setContrast contrast

module.exports = ContrastOperation
