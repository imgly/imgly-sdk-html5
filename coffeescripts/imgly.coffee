###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
PhotoProcessor = require "./photoprocessor.coffee"
UI             = require "./ui/ui.coffee"
Utils          = require "./utils.coffee"

window.after = (t, f) -> setTimeout f, t
window.every = (t, f) -> setInterval f, t

class ImglyKit
  @classPrefix: "imgly-"
  @canvasContainerPadding: 15
  
  ###
    @param options.container The container we ImglyKit will run in
    @param options.additionalFonts Array with objects like to specify additional fonts [{
          name: "Lobster",
          cssClass: "lobster"
        },
        {
          name: "Titillium Web",
          cssClass: "titillium-web"
        }]
  ###
  constructor: (@options = {}) ->
    @options.debug ?= false
    @options.assetsPath ?= "/build/assets"
    throw new Error("No container given") unless @options.container?

    # Might be a selector string, use
    # jQuery to resolve it
    @options.container = $(@options.container)
    @options.container.addClass ImglyKit.classPrefix + "container"

    # Set everything up
    @photoProcessor = new PhotoProcessor this
    @ui             = new UI this

  ###
    @returns {Boolean} Whether Canvas and Canvastext is supported or not
  ###
  checkSupport: ->
    if Modernizr.canvas && Modernizr.canvastext
      return true

    error = new Error("Canvas and / or Canvas Text drawing not supported")
    error.name = "NoSupportError"
    error.description = "No Canvas support"
    throw error

  ###
    @returns {jQuery.Object} The jQuery object for the app container
  ###
  getContainer: -> @options.container

  ###
    @returns {Integer} The height of the app container
  ###
  getHeight: -> @options.container.height()

  ###
    @returns {ImglyKit.PhotoProcessor}
  ###
  getPhotoProcessor: -> @photoProcessor

  ###
    @param {String} file path
    @returns {String} assets file path
  ###
  buildAssetsPath: (path) ->
    return @options.assetsPath + "/" + path

  ###
    @param {Image|String} image Data URL or Image object
  ###
  run: (@image) ->
    @checkSupport()

    if @options.ratio?
      @options.initialControls = require "./ui/controls/crop.coffee"
      @options.forceInitialControls = true
      @options.operationOptionsHook = (operation) =>
        operation.setRatio @options.ratio

    # Validate first parameter
    unless typeof @image is "string" or @image instanceof Image
      throw new Error("First parameter needs to be a String or an Image")

    if typeof @image is "string"
      # Make sure its a data string
      if @image.slice(0, 10) isnt "data:image"
        error = new Error("First parameter is a string, but not an image data URL")
        error.name = "InvalidError"
        throw error

      # Turn data url into an Image instance
      dataUrl   = @image
      @image     = new Image()
      @image.src = dataUrl

    if @image.width > 0 and @image.height > 0
      @onImageLoaded()
    else
      @image.onload = @onImageLoaded

  ###
    Gets called as soon as the image has been loaded
    and the image dimensions are available
  ###
  onImageLoaded: =>
    console.log "onImageLoaded"
    ###
      Set up the user interface
    ###
    unless @ui.initialized
      console.log "Initializing UI"
      @ui.init()
      @photoProcessor.setCanvas @ui.getCanvas()

      @ui.on "preview_operation", (operation) =>
        console.log "Setting operation"
        @ui.getCurrentControls()?.setOperation operation
        @photoProcessor.setPreviewOperation operation

      @ui.on "back", =>
        @photoProcessor.unsetPreviewOperation()
        @ui.resetControls()

      @ui.on "done", =>
        @photoProcessor.acceptPreviewOperation()
        @ui.resetControls()
    else
      @photoProcessor.reset()
      @ui.resetControls()

    ###
      Reset everything
    ###
    @reset()

    ###
      Set source image of the photo processor and tell
      it to render it
    ###
    @photoProcessor.setSourceImage @image
    @photoProcessor.renderPreview (err) =>
      ###
        Do we have controls that have to be shown
        on startup?
      ###
      if @options.initialControls
        controls = @ui.controls
        controls.switchToControls @options.initialControls, controls.getCurrentControls(),
          backButton:     !@options.forceInitialControls
          showList:       !@options.forceInitialControls

        if @options.operationOptionsHook?
          @options.operationOptionsHook(controls.getCurrentControls().operation)

  ###
    Resets everything
  ###
  reset: ->
    @photoProcessor.reset()

  ###
    Renders the image and returns a data url
  ###
  renderToDataURL: (format, options={}, callback) ->
    if typeof options is "function"
      callback = options
      options = {}

    @photoProcessor.renderImage options, (err, imageData) =>
      canvas = Utils.newCanvasFromImageData imageData
      callback null, canvas.toDataURL(format)

window.ImglyKit = ImglyKit
