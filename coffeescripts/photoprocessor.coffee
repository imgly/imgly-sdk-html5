###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Perf           = require "./vendor/perf.coffee"
Queue          = require "./vendor/queue.coffee"
Utils          = require "./utils.coffee"
IdentityFilter = require "./operations/filters/primitives/identity.coffee"

class PhotoProcessor
  ###
    @param {imglyUtil} app
  ###
  constructor: (@app) ->
    @canvas = null
    @operationChain = new IdentityFilter
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

    @operationChain = @operationChain.compose @previewOperation
    @previewOperation = null
    @renderPreview()

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

    @render imageData, preview: false, callback

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
      # Get dimensions that fit our preview canvas
      dimensions = @canvas.getDimensionsForImage @sourceImage

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
    Resets all UI elements
  ###
  reset: ->
    @operationChain = new IdentityFilter
    @previewOperation = null
    @rendering = false
    @operationChainNeedsRender = true
    @resizedPreviewImageData = null

module.exports = PhotoProcessor
