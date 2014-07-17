###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Operation = require "./operation.coffee"
Utils     = require "../utils.coffee"
Queue     = require "../vendor/queue.coffee"
Vector2   = require "../math/vector2.coffee"
Rect      = require "../math/rect.coffee"
class FramesOperation extends Operation
  renderPreview: true
  constructor: (@app, @options={}) ->
    super
    @options.frame ?= "black"
    @options.scale ?= 0.1

  ###
    @param {Integer} frame
    @param {Float} scale
  ###
  setFrameOptions: (frame, scale) ->
    @options.frame = frame
    @options.scale = scale

  ###
    @param {ImageData} imageData
    @returns {ImageData}
  ###
  apply: (imageData) ->
    # Load frame from image
    Queue.promise((resolve, reject) =>
      frameImage = new Image()
      frameImage.onload = -> resolve frameImage
      frameImage.src = @app.buildAssetsPath("frames/" + @options.frame + ".png")
    # Process frame image
    ).then (frameImage) =>
      {
        xRepeatAreaStart,
        xRepeatAreaEnd,
        xRepeatMode,
        yRepeatAreaStart,
        yRepeatAreaEnd,
        yRepeatMode,
        frameCanvas
      } = @analyzeFrameImage frameImage

      ###
        Create a canvas and a drawing context out of
        the image data
      ###
      canvas  = Utils.newCanvasFromImageData imageData
      context = canvas.getContext "2d"

      # Calculate the size factor
      upperHeight = yRepeatAreaStart
      lowerHeight = frameCanvas.height - yRepeatAreaEnd
      maxHeight   = Math.max(lowerHeight, upperHeight)

      scaledMaxHeight = imageData.height * @options.scale

      leftWidth    = Math.round(xRepeatAreaStart * (scaledMaxHeight / maxHeight))
      topHeight    = Math.round(scaledMaxHeight * (maxHeight / upperHeight))
      rightWidth   = Math.round((frameCanvas.width - xRepeatAreaEnd) * (scaledMaxHeight / maxHeight))
      bottomHeight = Math.round(scaledMaxHeight * (maxHeight / lowerHeight))

      ###
        Draw corners
      ###

      # Draw upper left corner
      context.drawImage frameCanvas,
        0, 0,
        xRepeatAreaStart, yRepeatAreaStart,
        0, 0,
        leftWidth, topHeight

      # Draw upper right corner
      context.drawImage frameCanvas,
        xRepeatAreaEnd, 0,
        frameCanvas.width - xRepeatAreaEnd, yRepeatAreaStart,
        imageData.width - rightWidth, 0,
        rightWidth, topHeight

      # Draw lower left corner
      context.drawImage frameCanvas,
        0, yRepeatAreaEnd,
        xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd,
        0, imageData.height - bottomHeight,
        leftWidth, bottomHeight

      # Draw lower right corner
      context.drawImage frameCanvas,
        xRepeatAreaEnd, yRepeatAreaEnd,
        frameCanvas.width - xRepeatAreaEnd, frameCanvas.height - yRepeatAreaEnd,
        imageData.width - rightWidth, imageData.height - bottomHeight,
        rightWidth, bottomHeight

      ###
        Draw edges
      ###

      if xRepeatMode is "stretch"
        # Draw upper edge
        context.drawImage frameCanvas,
          xRepeatAreaStart, 0,
          xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart,
          leftWidth, 0,
          imageData.width - leftWidth - rightWidth, topHeight

        # Draw bottom edge
        context.drawImage frameCanvas,
          xRepeatAreaStart, yRepeatAreaEnd,
          xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd,
          leftWidth, imageData.height - bottomHeight,
          imageData.width - leftWidth - rightWidth, bottomHeight
      else if xRepeatMode is "repeat"
        # Draw upper edge
        originalWidth  = xRepeatAreaEnd - xRepeatAreaStart
        originalHeight = yRepeatAreaStart

        height = topHeight
        width  = Math.round(height * (originalWidth / originalHeight))

        repeatCount = Math.ceil(imageData.width / width)
        for i in [0...repeatCount]
          context.drawImage frameCanvas,
            xRepeatAreaStart, 0,
            xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart,
            leftWidth + i * width, 0,
            width, height

        # Draw bottom edge
        originalHeight = frameCanvas.height - yRepeatAreaEnd

        height = bottomHeight
        width  = Math.round(bottomHeight * (originalWidth / originalHeight))

        for i in [0...repeatCount]
          context.drawImage frameCanvas,
            xRepeatAreaStart, yRepeatAreaEnd,
            xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd,
            leftWidth + i * width, imageData.height - bottomHeight,
            width, height

      if yRepeatMode is "stretch"
        # Draw left edge
        context.drawImage frameCanvas,
          0, yRepeatAreaStart,
          xRepeatAreaStart, yRepeatAreaEnd - yRepeatAreaStart,
          0, topHeight,
          leftWidth, imageData.height - topHeight - bottomHeight

        # Draw right edge
        context.drawImage frameCanvas,
          xRepeatAreaEnd, yRepeatAreaStart,
          frameCanvas.width - xRepeatAreaEnd, yRepeatAreaEnd - yRepeatAreaStart,
          imageData.width - rightWidth, topHeight,
          rightWidth, imageData.height - topHeight - bottomHeight

      context.getImageData(0, 0, imageData.width, imageData.height)

  analyzeFrameImage: (frameImage) ->
    # Turn image into imageData
    frameImageData = Utils.getImageDataForImage frameImage

    # Iterate over the first row and find out
    # when repeating or stretching starts
    xRepeatAreaStart = null
    xRepeatAreaEnd   = null
    xRepeatMode      = null
    for x in [0...frameImageData.width]
      index = x * 4

      r = frameImageData.data[index]
      g = frameImageData.data[index + 1]
      b = frameImageData.data[index + 2]
      a = frameImageData.data[index + 3]

      # Stretching
      if r is 255 and g is 255 and b is 255 and a is 255
        xRepeatAreaStart = x - 1 unless xRepeatAreaStart?
        xRepeatMode      = "stretch"

      # Repeating
      if r is 0 and g is 0 and b is 0 and a is 255
        xRepeatAreaStart = x - 1 unless xRepeatAreaStart?
        xRepeatMode      = "repeat"

      # End
      if a isnt 255 and xRepeatAreaStart? and not xRepeatAreaEnd?
        xRepeatAreaEnd   = x - 1

    # Iterate over the first column and find out
    # when repeating or stretching starts
    yRepeatAreaStart = null
    yRepeatAreaEnd   = null
    yRepeatMode      = null
    for y in [0...frameImageData.height]
      index = (frameImageData.width * y) * 4

      r = frameImageData.data[index]
      g = frameImageData.data[index + 1]
      b = frameImageData.data[index + 2]
      a = frameImageData.data[index + 3]

      # Stretching
      if r is 255 and g is 255 and b is 255 and a is 255
        yRepeatAreaStart = y - 1 unless yRepeatAreaStart?
        yRepeatMode      = "stretch"

      # Repeating
      if r is 0 and g is 0 and b is 0 and a is 255
        yRepeatAreaStart = y - 1 unless yRepeatAreaStart?
        yRepeatMode      = "repeat"

      # End
      if a isnt 255 and yRepeatAreaStart? and not yRepeatAreaEnd?
        yRepeatAreaEnd = y - 1

    canvas  = Utils.newCanvasWithDimensions width: frameImage.width - 1, height: frameImage.height - 1
    context = canvas.getContext "2d"
    context.putImageData frameImageData, -1, -1

    return {
      xRepeatAreaStart: xRepeatAreaStart
      xRepeatAreaEnd:   xRepeatAreaEnd
      xRepeatMode:      xRepeatMode
      yRepeatAreaStart: yRepeatAreaStart
      yRepeatAreaEnd:   yRepeatAreaEnd
      yRepeatMode:      yRepeatMode
      frameCanvas:      canvas
    }

module.exports = FramesOperation
