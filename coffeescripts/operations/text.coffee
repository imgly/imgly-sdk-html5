###
  imglyKit
  Copyright (c) 2013 img.ly
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
    @options.color = "#ffffff"

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
    context.fillStyle    = @options.color
    context.textBaseline = "hanging"

    # Default line height is roughly 1.1
    lineHeight = @options.lineHeight

    # Render the text line per line
    for line, lineNum in @options.text.split("\n")
      lineOffset = lineNum * scaledFontSize * lineHeight
      context.fillText line, scaledStart.x, scaledStart.y + @options.paddingLeft + lineOffset

    # Return the new image data
    context.getImageData 0, 0, imageData.width, imageData.height

module.exports = FontOperation
