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
    @listItems = [
      {
        name: "Heart"
        cssClass: "sticker-heart"
        method: "useSticker"
        arguments: ["stickers/sticker-heart.png"]
        pixmap: "stickers/sticker-heart.png"
        default: true
      },
      {
        name: "NyanCat"
        cssClass: "sticker-nyanCat"
        method: "useSticker"
        arguments: ["stickers/sticker-nyanCat.png"]
        pixmap: "stickers/sticker-nyanCat.png"
      },
      {
        name: "NyanCat"
        cssClass: "sticker-nyanCat"
        method: "useSticker"
        arguments: ["stickers/sticker-nyanCat.png"]
        pixmap: "stickers/sticker-nyanCat.png"
      }
    ]

  ###
    @param {jQuery.Object} canvasControlsContainer
  ###
  hasCanvasControls: true
  setupCanvasControls: (@canvasControlsContainer) ->
    @stickerContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-sticker-container")
      .appendTo @canvasControlsContainer

    # Crosshair / anchor control
    @crosshair = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-sticker-crosshair")
      .appendTo @stickerContainer

    # Resize knob control
    @resizeKnob = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-knob")
      .css
        left: 120
      .appendTo @stickerContainer

    @handleCrosshair()
    @handleResizeKnob()

  ###
    Move the sticker around by dragging the crosshair
  ###
  handleCrosshair: ->
    canvasRect = new Rect(0, 0, @canvasControlsContainer.width(), @canvasControlsContainer.height())

    minimumWidth  = 0
    minimumHeight = 0

    minContainerPosition = new Vector2(0, -20)
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
          
        # Since the resize knob resides relative to the anchor, we have to move
        # it, too
        @resizeKnob.css
          left: @operationOptions.scale

        # Refactor: Resize button offset should be ready from operationOptions.resizeButtonOffset
        # When moving the anchor so that the resize knob would have been pushed off the right boundary,
        # set down the scale
        if @stickerContainer.position().left + @operationOptions.scale > @canvasControlsContainer.width() + 20
          @operationOptions.scale = @canvasControlsContainer.width() - @stickerContainer.position().left + 20
          
        # When moving the anchor, we could get over the right boundary, to make
        # sure that this does not happen
        
        # Set the sticker position in the operation options, so the operation
        # knows where to place the image.
        @operationOptions.stickerPosition = new Vector2()
          .copy(currentContainerPosition)

        # Update the operation options
        @operation.setOptions @operationOptions
        @emit "renderPreview"
    
      $(document).mouseup =>
        $(document).off "mousemove"
        $(document).off "mouseup"

  ###
    Handles the dragging of resize knob
  ###
  handleResizeKnob: ->
    canvasRect = new Rect(0, 0, @canvasControlsContainer.width(), @canvasControlsContainer.height())
    # Refactor: Resize button offset should be ready from operationOptions.resizeButtonOffset
    minContainerPosition = new Vector2(20, 0)
    maxContainerPosition = new Vector2(canvasRect.width, canvasRect.height)

    @resizeKnob.mousedown (e) =>
      initialMousePosition  = new Vector2 e.clientX, e.clientY
      initialKnobPosition = new Vector2(@resizeKnob.position().left, @resizeKnob.position().top)
      initialContainerPosition = new Vector2(@stickerContainer.position().left, @stickerContainer.position().top)
      
      $(document).mouseup (e) =>
        $(document).off "mouseup"
        $(document).off "mousemove"

      $(document).mousemove (e) =>
        currentMousePosition = new Vector2 e.clientX, e.clientY

        mousePositionDifference = new Vector2()
          .copy(currentMousePosition)
          .substract(initialMousePosition)

        # Do not let the user drag the knob over the right boundary of image
        # Refactor: Resize button offset should be ready from operationOptions.resizeButtonOffset
        ajdustedMaxContainerPosition = new Vector2()
          .copy(maxContainerPosition)
          .substract(new Vector2 @stickerContainer.position().left - 20, 0)

        currentKnobPosition = new Vector2()
          .copy(initialKnobPosition)
          .add(mousePositionDifference)
          .clamp(minContainerPosition, ajdustedMaxContainerPosition)
          
        @resizeKnob.css
          left: currentKnobPosition.x

        @operationOptions.scale = @resizeKnob.position().left
        @operation.setOptions @operationOptions
        @emit "renderPreview"

module.exports = UIControlsStickers
