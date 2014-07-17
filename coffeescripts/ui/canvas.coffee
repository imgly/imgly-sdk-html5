###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Utils = require "../utils.coffee"
class UICanvas
  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
    @param {Integer} options.height Height of the controls

    @todo Get controls height from elsewhere. The options hash
          is probably not a good place for that.
  ###
  constructor: (@app, @ui, @options) ->
    @container = @app.getContainer()
    @init()

  ###
    @returns {CanvasRenderingContext2d}
  ###
  getContext: -> @context

  ###
    @returns {ImageData}
  ###
  getImageData: -> @context.getImageData 0, 0, @canvasDom.width, @canvasDom.height

  ###
    Initializes the container, creates
    the canvas object
  ###
  init: ->
    # Create canvas container
    @canvasContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-container")
      .css
        height: @app.getHeight() - @options.height
      .appendTo @container

    # Create canvas
    @canvas = $("<canvas>")
      .addClass(ImglyKit.classPrefix + "canvas")
      .appendTo @canvasContainer
    @canvasDom = @canvas.get(0)

    # Controls container for cropping etc.
    @controlsContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-controls-container")
      .appendTo @canvasContainer

    # Get drawing context
    @context = @canvasDom.getContext "2d"

  ###
    Resizes the canvas and renders the given imageData

    @param {ImageData} imageData
  ###
  renderImageData: (imageData) ->
    @resizeAndPositionCanvasToMatch imageData
    imageDataCanvas = Utils.newCanvasFromImageData imageData

    @context.clearRect 0, 0, @canvasDom.width, @canvasDom.height
    @context.drawImage imageDataCanvas, 0, 0, imageData.width, imageData.height, 0, 0, @canvasDom.width, @canvasDom.height

  ###
    Resizes the canvas and renders the given image

    @param {Image} image
  ###
  renderImage: (image) ->
    @resizeAndPositionCanvasToMatch image

    @context.clearRect 0, 0, @canvasDom.width, @canvasDom.height
    @context.drawImage image, 0, 0, image.width, image.height, 0, 0, @canvasDom.width, @canvasDom.height

  ###
    Takes an image and returns the new dimensions
    so that it fits into the UI

    @param {Image} image
    @returns {Object} dimensions
    @returns {Integer} dimensions.width
    @returns {Integer} dimensions.height
  ###
  getDimensionsForImage: (image) ->
    options =
      image:
        width: image.width
        height: image.height
      container:
        width: @canvasContainer.width() - ImglyKit.canvasContainerPadding * 2
        height: @canvasContainer.height() - ImglyKit.canvasContainerPadding * 2

    # Find out how big the canvas should be
    return Utils.calculateCanvasSize options

  ###
    @returns {jQuery.Object}
  ###
  getControlsContainer: ->
    return @controlsContainer

  ###
    @param {Mixed} object
    @param {Integer} object.height
    @param {Integer} object.width
  ###
  resizeAndPositionCanvasToMatch: (obj) ->
    options =
      image:
        width: obj.width
        height: obj.height
      container:
        width: @canvasContainer.width() - ImglyKit.canvasContainerPadding * 2
        height: @canvasContainer.height() - ImglyKit.canvasContainerPadding * 2

    # Find out how big the canvas should be
    newCanvasSize = Utils.calculateCanvasSize options

    # Resize and reposition the canvas
    @canvas.css
      width:  newCanvasSize.width
      height: newCanvasSize.height
      top: Math.round (@canvasContainer.height() - newCanvasSize.height) / 2
      left: Math.round (@canvasContainer.width() - newCanvasSize.width) / 2

    # Resize and reposition the controls container
    @controlsContainer.css
      width:  newCanvasSize.width
      height: newCanvasSize.height
      top: @canvas.position().top
      left: @canvas.position().left

    # Set canvas dimension properties to
    # properly render
    @canvasDom.width  = newCanvasSize.width * (window.devicePixelRatio or 1)
    @canvasDom.height = newCanvasSize.height * (window.devicePixelRatio or 1)

  ###
    Clears the context
  ###
  reset: ->
    @context.clearRect 0, 0, @canvas.width, @canvas.height
    @controlsContainer.html ""

module.exports = UICanvas
