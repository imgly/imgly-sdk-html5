###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Operation = require "./operation.coffee"
Utils     = require "../utils.coffee"
Vector2   = require "../math/vector2.coffee"
class CropOperation extends Operation
  renderPreview: false
  constructor: (@app, @options={}) ->
    super
    @options.start ?= new Vector2(0.1, 0.1)
    @options.end   ?= new Vector2(0.9, 0.9)
    @options.ratio ?= 0

  setRatio: (ratio) =>
    @options.ratio = ratio
    @setSize "custom"

  setSize: (size) ->
    {width, height} = @app.ui.getCanvas().getImageData()
    @options.size = size

    # Set the default values
    @options.start.set 0.1, 0.1
    @options.end.set   0.9, 0.9

    switch size
      when "square"
        @options.ratio = 1
      when "4:3"
        @options.ratio = 4 / 3
      when "16:9"
        @options.ratio = 16 / 9
      when "free"
        @options.ratio = 0

    if @options.ratio
      if width / height <= @options.ratio
        @options.start.x = 0.1
        @options.end.x   = 0.9
        h = 1 / height * (width / @options.ratio * 0.8)
        @options.start.y = ( 1 - h ) / 2
        @options.end.y   = 1 - @options.start.y
      else
        @options.start.y = 0.1
        @options.end.y   = 0.9
        w = 1 / width * (@options.ratio * height * 0.8)
        @options.start.x = ( 1 - w ) / 2
        @options.end.x   = 1 - @options.start.x

    @emit "updateOptions", @options

  setStart: (x, y) ->
    @options.start.x = x
    @options.start.y = y

  setEnd: (x, y) ->
    @options.end.x = x
    @options.end.y = y

  apply: (imageData) ->
    {width, height} = imageData

    canvas = Utils.newCanvasFromImageData imageData
    context = canvas.getContext "2d"

    x = width * @options.start.x
    y = height * @options.start.y

    w = width * (@options.end.x - @options.start.x)
    h = height * (@options.end.y - @options.start.y)

    context.getImageData(
      x, y,
      w, h
    )

module.exports = CropOperation
