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
    @options.scale = 1.0 # 100% scale
    @options.sticker = "stickers/sticker-heart.png"

    @options.stickerImageWidth = 100
    @options.stickerImageHeight = 100

    @options.stickerPosition = new Vector2(20, 20)
  ###
    @param {String} sticker
  ###
  useSticker: (sticker) ->
    @options.sticker = sticker

  apply: (imageData) ->
    # Scale our options
    # scaledFontSize = @options.fontSize * imageData.height
    # paddingVector  = new Vector2(@options.paddingLeft, @options.paddingTop)
    # scaledStart    = new Vector2()
    #   .copy(@options.start)
    #   .add(paddingVector)
    #   .multiplyWithRect(imageData)

    #console.log(@options)
    #console.log "apply"
    
    Queue.promise((resolve, reject) =>
      # DRAW IMAGE HERE
      stickerImage = new Image()
      stickerImage.onload = -> resolve stickerImage
      stickerImage.src = @app.buildAssetsPath(@options.sticker)
    ).then (stickerImage) =>
      # Create a new context out of the image data
      canvas  = Utils.newCanvasFromImageData imageData
      context = canvas.getContext "2d"

      #console.log @options
      
      # Draw sticker image
      context.drawImage(
        # Image to be used
        stickerImage,
        # The x coordinate where to start clipping
        0,
        # The y coordinate where to start clipping
        0,
        # The width of the clipped image
        stickerImage.width,
        # The height of the clipped image
        stickerImage.height,
        # The x coord. where to place image on target canvas
        @options.stickerPosition.x,
        # The y coord. where to place image on target canvas
        @options.stickerPosition.y,
        # The width of the image to use (stretch)
        stickerImage.width * @options.scale,
        # The height of the image to use (stretch)
        stickerImage.height * @options.scale
      )

      #console.log "scale: " + @options.scale
      # Return the new image data
      context.getImageData 0, 0, imageData.width, imageData.height
