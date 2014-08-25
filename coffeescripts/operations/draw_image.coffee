###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Operation = require "./operation.coffee"
Utils     = require "../utils.coffee"
Queue     = require "../vendor/queue.coffee"
Vector2   = require "../math/vector2.coffee"
Rect      = require "../math/rect.coffee"

module.exports = class DrawImageOperation extends Operation
  constructor: (@app, @options={}) ->
    super
    @options.resizeButtonOffset = 20
    @options.scale = @options.resizeButtonOffset + 100
    @options.stickerImageWidth = 100
    @options.stickerImageHeight = 100

    # There is an architectural problem that needs refactoring in the future,
    # but for now we have to store the initial sticker image and the canvas
    # size in the operation.
    @options.sticker = "stickers/sticker-glasses-nerd.png"
    @options.widthRange = 570
    @options.heightRange = 427
    
  ###
    @param {String} sticker
  ###
  useSticker: (sticker) ->
    @options.sticker = sticker
    @emit "updateOptions", @options

  apply: (imageData) ->
    Queue.promise((resolve, reject) =>
      # DRAW IMAGE HERE
      stickerImage = new Image()
      stickerImage.onload = -> resolve stickerImage
      stickerImage.src = @app.buildAssetsPath(@options.sticker)
    ).then (stickerImage) =>
      ratio = stickerImage.height / stickerImage.width
      @options.stickerImageWidth = (@options.scale - @options.resizeButtonOffset)
      @options.stickerImageHeight = (@options.scale - @options.resizeButtonOffset) * ratio

      # Create a new context out of the image data
      canvas  = Utils.newCanvasFromImageData imageData
      context = canvas.getContext "2d"

      # This is assuming the initial position is at the center of the target image
      unless @options.stickerPosition?
        @options.stickerPosition = new Vector2(canvas.width / 2, canvas.height / 2)

      scaling = canvas.width / @options.widthRange

      # Draw sticker image
      context.drawImage(
        # Image to be used
        stickerImage,
        # The x coordinate where to start clipping
        #0,
        # The y coordinate where to start clipping
        #0,
        # The width of the clipped image
        #stickerImage.width,
        # The height of the clipped image
        #stickerImage.height,
        # The x coord. where to place image on target canvas
        @options.stickerPosition.x * scaling,
        # The y coord. where to place image on target canvas
        @options.stickerPosition.y * scaling,
        # The width of the image to use (stretch)
        @options.stickerImageWidth * scaling,
        # The height of the image to use (stretch)
        @options.stickerImageHeight * scaling
      )

      # Return the new image data
      context.getImageData 0, 0, imageData.width, imageData.height
