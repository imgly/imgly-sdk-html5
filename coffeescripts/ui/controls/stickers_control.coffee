###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###

List    = require "./base/list.coffee"
Vector2 = require "../../math/vector2.coffee"
Rect    = require "../../math/rect.coffee"

class UIControlsStickers extends List
  singleOperation: true
  displayButtons: true
  hasCanvasControls: true
  cssClassIdentifier: "sticker"

  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  ###
  constructor: (@app, @ui, @controls) ->
    super
    @operationClass = require "../../operations/draw_image.coffee"
    @stickerImageScaleStep = 0.025 # 2.5% image scale step = minimum size
    @maximumImageSize = 2.0 # 200% Maximum image scale
    @listItems = [
      {
        name: "Heart"
        cssClass: "sticker-heart"
        method: "useSticker"
        arguments: ["stickers/sticker-heart.png"]
        default: true
      },
      {
        name: "NyanCat"
        cssClass: "sticker-nyanCat"
        method: "useSticker"
        arguments: ["stickers/sticker-nyanCat.png"]
      }
    ]

  ###
    Update input position
  ###
  updateCanvasControls: ->
    canvasWidth  = @canvasControlsContainer.width()
    canvasHeight = @canvasControlsContainer.height()

  ###
    @param {jQuery.Object} canvasControlsContainer
  ###
  setupCanvasControls: (@canvasControlsContainer) ->
    @stickerContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-sticker-container")
      .appendTo @canvasControlsContainer

    #
    # Size buttons
    #
    @stickerSizeButtonsContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-sticker-size-container")
      .appendTo @stickerContainer

    for control in ["Smaller", "Bigger"]
      @["stickerSize#{control}Button"] = $("<div>")
        .addClass(
          ImglyKit.classPrefix + "canvas-sticker-size-" + control.toLowerCase()
        )
        .appendTo @stickerSizeButtonsContainer

      @["stickerSize#{control}Button"].on "click", @["onStickerSize#{control}Click"]

    #
    # Crosshair / anchor control
    #
    @crosshair = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-sticker-crosshair")
      .appendTo @stickerContainer

    @handleCrosshair()
    
  ###
    Gets called as soon as the user clicks the button
    to increase font size
  ###
  onStickerSizeBiggerClick: (e) =>
    @operationOptions.scale += @stickerImageScaleStep
    @operationOptions.scale = @maximumImageSize if @operationOptions.scale > @maximumImageSize
    @operation.setOptions @operationOptions
    @emit "renderPreview"
    @updateCanvasControls()

  ###
    Gets called as soon as the user clicks the button
    to reduce font size
  ###
  onStickerSizeSmallerClick: (e) =>
    @operationOptions.scale -= @stickerImageScaleStep
    @operationOptions.scale = @stickerImageScaleStep if @operationOptions .scale < @stickerImageScaleStep
    @operation.setOptions @operationOptions
    @emit "renderPreview"
    @updateCanvasControls()

  ###
    Move the text input around by dragging the crosshair
  ###
  handleCrosshair: ->
    canvasRect = new Rect(0, 0, @canvasControlsContainer.width(), @canvasControlsContainer.height())

    minimumWidth  = 50
    minimumHeight = 50

    minContainerPosition = new Vector2(0, 0)
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight)

    @crosshair.mousedown (e) =>
      # We need the initial as well as the updated mouse position
      initialMousePosition = new Vector2(e.clientX, e.clientY)
      currentMousePosition = new Vector2().copy initialMousePosition

      # We need the initial as well as the updated container position
      initialContainerPosition = new Vector2(@stickerContainer.position().left, @stickerContainer.position().top)
      currentContainerPosition = new Vector2().copy initialContainerPosition

      $(document).mousemove (e) =>
        currentMousePosition.set e.clientX, e.clientY

        # mouse difference = current mouse position - initial mouse position
        mousePositionDifference = new Vector2()
          .copy(currentMousePosition)
          .substract(initialMousePosition)

        # updated container position = initial container position - mouse difference
        currentContainerPosition
          .copy(initialContainerPosition)
          .add(mousePositionDifference)
          .clamp(minContainerPosition, maxContainerPosition)

        # Move the DOM object
        @stickerContainer.css
          left: currentContainerPosition.x
          top:  currentContainerPosition.y
          width: @operationOptions.stickerImageWidth
          height: @operationOptions.stickerImageHeight
        
        #console.log @stickerContainer
        
        # Set the sticker position in the operation options, so the operation
        # knows where to place the image.
        @operationOptions.stickerPosition = new Vector2()
          .copy(currentContainerPosition)

        # Update the operation options
        @operation.setOptions @operationOptions
        @emit "renderPreview"
        @updateCanvasControls()
    
      $(document).mouseup =>
        $(document).off "mousemove"
        $(document).off "mouseup"

module.exports = UIControlsStickers
