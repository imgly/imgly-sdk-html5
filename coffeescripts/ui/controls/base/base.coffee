###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
EventEmitter = require("events").EventEmitter
class UIControlsBase extends EventEmitter
  allowMultipleClick: true
  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  ###
  constructor: (@app, @ui, @controls) ->
    @domCreated = false
    @options ?= {}
    @options.backButton ?= true
    @options.showList   ?= true

  ###
    @param {imglyUtil.Operations.Operation}
  ###
  setOperation: (@operation) -> return

  ###
    @param {Object} options
  ###
  init: (options) -> return

  ###
    Handle visibility
  ###
  show: (cb) -> @wrapper.fadeIn "fast", cb
  hide: (cb) -> @wrapper.fadeOut "fast", cb

  ###
    Returns to the default view
  ###
  reset: ->
    return

  ###
    Create "Back" and "Done" buttons
  ###
  createButtons: ->
    @buttons ?= {}

    ###
      "Back" Button
    ###
    if @options.backButton
      back = $("<div>")
        .addClass(ImglyKit.classPrefix + "controls-button-back")
        .appendTo @wrapper

      back.click =>
        @emit "back"

      @buttons.back = back

    ###
      "Done" Button
    ###
    done = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-button-done")
      .appendTo @wrapper

    done.click =>
      @emit "done"

    @buttons.done = done

  remove: ->
    @wrapper.remove()

module.exports = UIControlsBase
