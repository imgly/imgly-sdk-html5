###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Operation = require "./operation.coffee"
Utils     = require "../utils.coffee"
class OrientationOperation extends Operation
  ###
    @param {ImglyKit} app
    @param {Object} options
  ###
  constructor: (@app, @options={}) ->
    super

    @options.rotation ?= 0

    @options.flipVertically   ?= false
    @options.flipHorizontally ?= false

  flipVertically: ->
    @options.flipVertically = !@options.flipVertically

  flipHorizontally: ->
    @options.flipHorizontally = !@options.flipHorizontally

  rotateRight: ->
    @options.rotation += 90
    if @options.rotation is 360
      @options.rotation = 0

    if @options.flipHorizontally isnt @options.flipVertically
      @options.flipHorizontally = !@options.flipHorizontally
      @options.flipVertically   = !@options.flipVertically

  rotateLeft: ->
    @options.rotation -= 90
    if @options.rotation is -360
      @options.rotation = 0

    if @options.flipHorizontally isnt @options.flipVertically
      @options.flipHorizontally = !@options.flipHorizontally
      @options.flipVertically   = !@options.flipVertically

  apply: (imageData) ->
    if Math.abs(@options.rotation) is 90 or
      Math.abs(@options.rotation) is 270
        w = imageData.height
        h = imageData.width
    else
      w = imageData.width
      h = imageData.height

    # Create rotated canvas
    canvas = Utils.newCanvasWithDimensions
      width:  w
      height: h

    # Get context
    context = canvas.getContext("2d")

    rotated = false
    flipped = false

    if @options.rotation isnt 0
      imageData = @rotateImageData context, imageData
      rotated = true

    if @options.flipHorizontally or @options.flipVertically
      imageData = @flipImageData context, imageData
      flipped = true

    if rotated or flipped
      context.getImageData(0, 0, w, h)
    else
      imageData

  ###
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  ###
  flipImageData: (context, imageData) ->
    # Save translation matrix
    context.save()

    # Translate the context
    scaleX = 1
    scaleY = 1
    translateX = 0
    translateY = 0

    if @options.flipHorizontally
      scaleX = -1
      translateX = context.canvas.width

    if @options.flipVertically
      scaleY = -1
      translateY = context.canvas.height

    context.translate translateX, translateY
    context.scale scaleX, scaleY

    # Create an in-memory canvas for the image data
    # so that we can draw it while its affected by
    # the transformation matrix
    imageDataCanvas = Utils.newCanvasFromImageData imageData
    context.drawImage imageDataCanvas, 0, 0

    # Restore old translation matrix
    context.restore()

    return context.getImageData 0, 0, context.canvas.width, context.canvas.height

  ###
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  ###
  rotateImageData: (context, imageData) ->
    # Save translation matrix
    context.save()

    # Translate the context
    context.translate context.canvas.width / 2, context.canvas.height / 2

    # Rotate the context
    context.rotate @options.rotation * (Math.PI / 180)

    # Create an in-memory canvas for the image data
    # so that we can draw it while its affected by
    # the transformation matrix
    imageDataCanvas = Utils.newCanvasFromImageData imageData
    context.drawImage imageDataCanvas, -imageData.width / 2, -imageData.height / 2

    # Restore old translation matrix
    context.restore()

    return context.getImageData 0, 0, context.canvas.width, context.canvas.height

module.exports = OrientationOperation
