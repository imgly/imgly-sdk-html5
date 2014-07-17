###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Controls     = require "./controls.coffee"
Canvas       = require "./canvas.coffee"
EventEmitter = require("events").EventEmitter

class UI extends EventEmitter
  ###
    @param {imglyUtil} app
  ###
  constructor: (@app) ->
    @initialized = false

  ###
    @returns {ImglyKit.UI.Canvas}
  ###
  getCanvas: -> @canvas

  ###
    @returns ImglyKit.UI.Controls.Base
  ###
  getCurrentControls: -> @controls.getCurrentControls()

  ###
    Initializes all UI elements
  ###
  init: ->
    @controls = new Controls @app, this
    @controls.on "preview_operation", (operation) =>
      @emit "preview_operation", operation
    @controls.on "back", =>
      @emit "back"
    @controls.on "done", =>
      @emit "done"

    @canvas   = new Canvas   @app, this,
      height: @controls.getHeight()

    @initialized = true

  ###
    Resets the controls
  ###
  resetControls: ->
    @controls.reset()

module.exports = UI
