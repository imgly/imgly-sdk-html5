###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Operation = require "./operation.coffee"
Utils     = require "../utils.coffee"
Vector2   = require "../math/vector2.coffee"
Rect      = require "../math/rect.coffee"
class FontOperation extends Operation
  renderPreview: false
  constructor: (@app, @options={}) ->
    super
    @options.start = new Vector2(0.2, 0.2)
    @options.width = 300
    @options.font  = "Helvetica"
    @options.text  = "Text"
    @options.color = "rgba(255, 255, 255, 1.0)"
    @options.backgroundColor = "rgba(0, 0, 0, 0.5)"

    @options.fontSize = 0.1
    @options.lineHeight = 1.1

    @options.paddingLeft = 0
    @options.paddingTop = 0

  ###
    @param {String} font
  ###
  setFont: (font) ->
    @options.font = font
    @emit "updateOptions", @options

  apply: (imageData) ->
    # Scale our options
    scaledFontSize = @options.fontSize * imageData.height
    paddingVector  = new Vector2(@options.paddingLeft, @options.paddingTop)
    scaledStart    = new Vector2()
      .copy(@options.start)
      .add(paddingVector)
      .multiplyWithRect(imageData)

    # Create a new context out of the image data
    canvas  = Utils.newCanvasFromImageData imageData
    context = canvas.getContext "2d"

    # Set text options
    context.font         = "normal #{scaledFontSize}px #{@options.font}"
    context.textBaseline = "hanging"

    # Default line height is roughly 1.1
    lineHeight = @options.lineHeight

    # Calculate the bounding box, so we can put a rect under the text
    boundingBoxWidth = 0
    boundingBoxHeight = 0
    for line, lineNum in @options.text.split("\n")
      lineWidth = context.measureText(line).width
      if lineWidth > boundingBoxWidth
        boundingBoxWidth = lineWidth
      boundingBoxHeight += scaledFontSize * lineHeight

    context.fillStyle = @options.backgroundColor
    padding = 10
    context.fillRect scaledStart.x - padding, scaledStart.y - padding, boundingBoxWidth + padding * 2, boundingBoxHeight + padding
    
    context.fillStyle = @options.color
    # Render the text line per line
    for line, lineNum in @options.text.split("\n")
      lineOffset = lineNum * scaledFontSize * lineHeight
      context.fillText line, scaledStart.x, scaledStart.y + @options.paddingLeft + lineOffset

    # Return the new image data
    context.getImageData 0, 0, imageData.width, imageData.height

module.exports = FontOperation
