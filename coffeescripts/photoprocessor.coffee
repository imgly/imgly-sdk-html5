###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Perf           = require "./vendor/perf.coffee"
Queue          = require "./vendor/queue.coffee"
Utils          = require "./utils.coffee"
IdentityFilter = require "./operations/filters/primitives/identity.coffee"
CropOperation  = require "./operations/crop.coffee"
EventEmitter   = require("events").EventEmitter

class PhotoProcessor extends EventEmitter
  ###
    @param {imglyUtil} app
  ###
  constructor: (@app) ->
    @canvas = null
    @operationChain = new IdentityFilter @app
    @operationStack = [@operationChain]
    @operationChainNeedsRender = true
    @cachedPreviewImageData = null
    @previewOperation = null
    @rendering = false

  setCanvas: (@canvas) -> return
  setSourceImage: (@sourceImage) -> return

  ###
    @params {ImglyKit.Operations.Operation} operation
  ###
  setPreviewOperation: (operation) ->
    operation.setContext @canvas.getContext()

    @previewOperation = operation

    return unless operation.renderPreview
    @renderPreview()

  unsetPreviewOperation: ->
    @previewOperation = null

    @renderPreview()

  acceptPreviewOperation: ->
    return unless @previewOperation

    @operationChainNeedsRender = true

    # Invalidate cache of last operation
    @operationStack[@operationStack.length - 2]?.invalidateCache()

    if @previewOperation instanceof CropOperation
      @resizedPreviewImageData = null

    @operationChain = @operationChain.compose @previewOperation
    @operationStack.push @previewOperation
    @previewOperation = null
    @renderPreview()

    @emit "operation_chain_changed"

  ###
    Render the full size final image
  ###
  renderImage: (options, callback) ->
    p = new Perf "imglyPhotoProcessor#renderFullImage()", debug: @app.options.debug
    p.start()

    unless options.maxSize or options.size
      dimensions =
        width: @sourceImage.width
        height: @sourceImage.height

      imageData = Utils.getImageDataForImage @sourceImage
    else if options.maxSize
      [width, height] = options.maxSize.split "x"
      options =
        image:
          width: @sourceImage.width
          height: @sourceImage.height
        container:
          width: width - ImglyKit.canvasContainerPadding * 2
          height: height - ImglyKit.canvasContainerPadding * 2

      dimensions = Utils.calculateCanvasSize options
      imageData = Utils.getResizedImageDataForImage @sourceImage, dimensions, smooth: true
    else if options.size
      [width, height] = options.size.split "x"

      if width and not height
        scale = @sourceImage.height / @sourceImage.width
        height = width * scale
      else if height and not width
        scale = @sourceImage.width / @sourceImage.height
        width = height * scale

      dimensions =
        width: parseInt width
        height: parseInt height

      imageData = Utils.getResizedImageDataForImage @sourceImage, dimensions, smooth: true

    @render imageData, preview: false, (err, imageData) =>
      return callback err if err?

      if imageData.width isnt dimensions.width or
        imageData.height isnt dimensions.height
          # We need to resize
          imageData = Utils.getResizedImageDataForImageData imageData, dimensions, smooth: true

      callback null, imageData

  ###
    Renders a preview
  ###
  renderPreview: (callback) ->
    @render null, preview: true, callback

  ###
    Render preview or image
  ###
  render: (imageData, options, callback) ->
    ###
      Make sure we are not rendering multiple previews at a time
    ###
    return if @rendering
    @rendering = true

    p = new Perf "imglyPhotoProcessor#render({ preview: #{options.preview} })", debug: @app.options.debug
    p.start()

    imageData = if options.preview
      @renderOperationChainPreview imageData
    else
      @operationChain.apply imageData

    # Apply potential preview operation and cache preview
    Queue(imageData)
      .then((imageData) =>
        if typeof @operationChain is "function"
          @operationChain.filter.cacheImageData imageData
        else
          @operationChain.cacheImageData imageData

        # Operation chain rendered, cache the data
        if options.preview and @operationChainNeedsRender
          @cachedPreviewImageData = imageData
          @operationChainNeedsRender = false

        if @previewOperation and options.preview
          @previewOperation.apply(imageData)
        else
          imageData
      ).then((imageData) =>
        if options.preview
          @canvas.renderImageData imageData

        callback? null, imageData
        @rendering = false
        p.stop true
        imageData
      )

  renderOperationChainPreview: (imageData) ->
    unless @operationChainNeedsRender
      # Just return the cached data if we don't need to re-render the entire
      # stack
      return Utils.cloneImageData(@cachedPreviewImageData)
    else
      # Get dimensions that fit our preview canvas while taking
      # crop operations into account
      dimensions = @calculateMinimumPreviewDimensions @sourceImage

      # If we don't have a cached version of the resized preview image, then
      # resize it
      unless @resizedPreviewImageData?
        imageDimensions =
          width: dimensions.width * (window.devicePixelRatio or 1)
          height: dimensions.height * (window.devicePixelRatio or 1)
        @resizedPreviewImageData = imageData = Utils.getResizedImageDataForImage @sourceImage, imageDimensions, smooth: true
      # Otherwise use cached data of appropriate size
      else
        imageData = Utils.cloneImageData @resizedPreviewImageData
      @operationChain.apply imageData

  ###
    Checks whether the current operation chain allows an undo action
  ###
  isUndoPossible: ->
    @operationStack[@operationStack.length - 2]?.hasCache()

  ###
    Calculates the minimum dimensions of the initial picture. The dimensions
    might be larger than the canvas itself (to keep the quality when cropping)
  ###
  calculateMinimumPreviewDimensions: (image) ->
    originalWidth = @sourceImage.width
    originalHeight = @sourceImage.height

    initialDimensions = @canvas.getDimensionsForImage @sourceImage
    initialWidth = initialDimensions.width
    initialHeight = initialDimensions.height

    for operation in @operationStack when operation instanceof CropOperation
      { start, end } = operation.options
      cropSize = end.clone().subtract start

      maxCropFactor = Math.max 1 / cropSize.x, 1 / cropSize.y

      initialWidth *= maxCropFactor
      initialHeight *= maxCropFactor

    initialWidth = Math.min initialWidth, originalWidth
    initialHeight = Math.min initialHeight, originalHeight

    return width: initialWidth, height: initialHeight

  ###
    Undos the last operation
  ###
  undo: ->
    return unless @isUndoPossible()

    lastOperation = @operationStack.pop()
    currentOperation = @operationStack[@operationStack.length - 1]

    # Update the canvas to render the cached image data of the
    # current operation
    if currentOperation.cachedImageData?
      @canvas.renderImageData currentOperation.cachedImageData

    if @operationStack.length is 1
      # If we're back to the first operation, reset
      @reset()
    else
      # Create the current operation by calling `compose` on the previous
      # operation.
      previousOperation = @operationStack[@operationStack.length - 2]
      @operationChain = previousOperation.compose currentOperation.constructor

      @operationChainNeedsRender = true

    @emit "operation_chain_changed"

  ###
    Resets all UI elements
  ###
  reset: ->
    @operationChain = new IdentityFilter @app
    @operationStack = [@operationChain]
    @previewOperation = null
    @rendering = false
    @operationChainNeedsRender = true
    @resizedPreviewImageData = null

module.exports = PhotoProcessor
