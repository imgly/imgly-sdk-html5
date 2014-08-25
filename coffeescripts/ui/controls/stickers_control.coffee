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
        name: "Nerd glasses"
        cssClass: "sticker-glasses-nerd"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-nerd.png"]
        pixmap: "stickers/sticker-glasses-nerd.png"
        tooltip: "Nerd glasses"
        default: true
      },
      {
        name: "Normal glasses"
        cssClass: "sticker-glasses-normal"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-normal.png"]
        pixmap: "stickers/sticker-glasses-normal.png"
        tooltip: "Normal glasses"
      },
      {
        name: "Green shutter glasses"
        cssClass: "sticker-glasses-shutter-green"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-shutter-green.png"]
        pixmap: "stickers/sticker-glasses-shutter-green.png"
        tooltip: "Green shutter glasses"
      },
      {
        name: "Yellow shutter glasses"
        cssClass: "sticker-glasses-shutter-yellow"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-shutter-yellow.png"]
        pixmap: "stickers/sticker-glasses-shutter-yellow.png"
        tooltip: "Yellow shutter glasses"
      },
      {
        name: "Sunglasses"
        cssClass: "sticker-glasses-sun"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-sun.png"]
        pixmap: "stickers/sticker-glasses-sun.png"
        tooltip: "Sunglasses"
      },
      {
        name: "Cap"
        cssClass: "sticker-hat-cap"
        method: "useSticker"
        arguments: ["stickers/sticker-hat-cap.png"]
        pixmap: "stickers/sticker-hat-cap.png"
        tooltip: "Cap"
      },
      {
        name: "Party hat"
        cssClass: "sticker-hat-party"
        method: "useSticker"
        arguments: ["stickers/sticker-hat-party.png"]
        pixmap: "stickers/sticker-hat-party.png"
        tooltip: "Party hat"
      },
      {
        name: "Sheriff's' hat"
        cssClass: "sticker-hat-sheriff"
        method: "useSticker"
        arguments: ["stickers/sticker-hat-sheriff.png"]
        pixmap: "stickers/sticker-hat-sheriff.png"
        tooltip: "Sheriff's hat'"
      },
      {
        name: "Cylinder"
        cssClass: "sticker-hat-cylinder"
        method: "useSticker"
        arguments: ["stickers/sticker-hat-cylinder.png"]
        pixmap: "stickers/sticker-hat-cylinder.png"
        tooltip: "Cylinder"
      },
      {
        name: "Heart"
        cssClass: "sticker-heart"
        method: "useSticker"
        arguments: ["stickers/sticker-heart.png"]
        pixmap: "stickers/sticker-heart.png"
        tooltip: "Heart"
      },
      {
        name: "Mustache 1"
        cssClass: "sticker-mustache1"
        method: "useSticker"
        arguments: ["stickers/sticker-mustache1.png"]
        pixmap: "stickers/sticker-mustache1.png"
        tooltip: "Mustache 1"
      },
      {
        name: "Mustache 2"
        cssClass: "sticker-mustache2"
        method: "useSticker"
        arguments: ["stickers/sticker-mustache2.png"]
        pixmap: "stickers/sticker-mustache2.png"
        tooltip: "Mustache 2"
      },
      {
        name: "Mustache 3"
        cssClass: "sticker-mustache3"
        method: "useSticker"
        arguments: ["stickers/sticker-mustache3.png"]
        pixmap: "stickers/sticker-mustache3.png"
        tooltip: "Mustache 3"
      },
      {
        name: "Long mustache"
        cssClass: "sticker-mustache-long"
        method: "useSticker"
        arguments: ["stickers/sticker-mustache-long.png"]
        pixmap: "stickers/sticker-mustache-long.png"
        tooltip: "Long mustache"
      },
      {
        name: "Pipe"
        cssClass: "sticker-pipe"
        method: "useSticker"
        arguments: ["stickers/sticker-pipe.png"]
        pixmap: "stickers/sticker-pipe.png"
        tooltip: "Pipe"
      },
      {
        name: "Snowflake"
        cssClass: "sticker-snowflake"
        method: "useSticker"
        arguments: ["stickers/sticker-snowflake.png"]
        pixmap: "stickers/sticker-snowflake.png"
        tooltip: "Snowflake"
      },
      {
        name: "Star"
        cssClass: "sticker-star"
        method: "useSticker"
        arguments: ["stickers/sticker-star.png"]
        pixmap: "stickers/sticker-star.png"
        tooltip: "Star"
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
    

    # console.log "need @operation"
    
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
          
        # Width and height range information needed for scaling appropriately when
        # the target canvas is different in size than UI canvas
        #canvasRangeOptions = new Array
        @operationOptions.widthRange = @canvasControlsContainer.width()
        @operationOptions.heightRange = @canvasControlsContainer.height()
        #@operation.setOptions canvasRangeOptions

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
