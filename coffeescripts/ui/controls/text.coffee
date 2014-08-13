###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
List    = require "./base/list.coffee"
Vector2 = require "../../math/vector2.coffee"
Rect    = require "../../math/rect.coffee"
class UIControlsText extends List
  displayButtons: true
  singleOperation: true
  hasCanvasControls: true
  cssClassIdentifier: "text"
  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  ###
  constructor: (@app, @ui, @controls) ->
    super
    @initialized = false
    @fontResizePerClick = 3 # in pixels

    @operationClass = require "../../operations/text.coffee"
    @listItems = [
      {
        name: "Helvetica"
        method: "setFont"
        cssClass: "helvetica"
        arguments: ["Helvetica"]
        tooltip: "Helvetica"
        default: true
      },
      {
        name: "Lucida Grande"
        method: "setFont"
        cssClass: "lucida-grande"
        arguments: ["Lucida Grande"]
        tooltip: "Lucida Grande"
      },
      {
        name: "Times New Roman"
        method: "setFont"
        cssClass: "times-new-roman"
        arguments: ["Times New Roman"]
        tooltip: "Times New Roman"
      }
    ]

    if @app.options.additionalFonts?
      for additionalFont in @app.options.additionalFonts
        @listItems.push
          name: additionalFont.name
          method: "setFont"
          cssClass: additionalFont.cssClass
          arguments: [additionalFont.name]

  ###
    Create controls DOM tree
  ###
  createList: ->
    super

    ###
      Color control
    ###
    @textColorControl = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-text-color-button " + ImglyKit.classPrefix + "controls-button-right")
      .appendTo @wrapper

    @textColorPreview = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-text-color")
      .appendTo @textColorControl

    ###
      Background color control
    ###
    @backgroundColorControl = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-background-color-button " + ImglyKit.classPrefix + "controls-button-right")
      .appendTo @wrapper

    @backgroundColorPreview = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-background-color")
      .appendTo @backgroundColorControl
    
    # We need room for one accept button and two color buttons to the right
    @list.css "margin-right", @controls.getHeight() * 3

    @handleColorsControl()
    
  ###
    Handle the colors control
  ###
  handleColorsControl: ->  
    defaultForegroundColor = "rgba(255, 255, 255, 1.0)"
    defaultBackgroundColor = "rgba(0, 0, 0, 0.5)"

    # Initialize color picker for foreground color
    @textColorControl.spectrum(
      color: defaultForegroundColor
      showAlpha: true
      showPalette: true
      showSelectionPalette: true
      palette: [ ]
      showButtons: false
      localStorageKey: "imgly.palette" 
      move: (color) =>
        colorComponents = color.toRgb()
        rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + ","  + colorComponents.b + "," + colorComponents.a + ")"
        @textColorPreview.css(backgroundColor: rgbaString)
        @operationOptions.color = rgbaString
        @operation.setOptions @operationOptions
    )

    # Initialize color picker for background color
    @backgroundColorControl.spectrum(
      color: defaultBackgroundColor
      showAlpha: true
      showPalette: true
      showSelectionPalette: true
      palette: [ ]
      showButtons: false
      localStorageKey: "imgly.palette" 
      move: (color) =>
        colorComponents = color.toRgb()
        rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + ","  + colorComponents.b + "," + colorComponents.a + ")"
        @backgroundColorPreview.css(backgroundColor: rgbaString)
        @textContainer.css(backgroundColor: rgbaString)
        @operationOptions.backgroundColor = rgbaString
        @operation.setOptions @operationOptions
    )
    
    # Initially set default colors
    @textColorPreview.css(backgroundColor: defaultForegroundColor)
    @backgroundColorPreview.css(backgroundColor: defaultBackgroundColor)
    @textContainer.css(backgroundColor: defaultBackgroundColor)
    
    return

  ###
    @param {jQuery.Object} canvasControlsContainer
  ###
  setupCanvasControls: (@canvasControlsContainer) ->
    @textContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-text-container")
      .appendTo @canvasControlsContainer

    #
    # Size buttons
    #
    @fontsizeButtonsContainer = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-text-size-container")
      .appendTo @textContainer

    for control in ["Smaller", "Bigger"]
      @["fontsize#{control}Button"] = $("<div>")
        .addClass(
          ImglyKit.classPrefix + "canvas-text-size-" + control.toLowerCase()
        )
        .appendTo @fontsizeButtonsContainer

      @["fontsize#{control}Button"].on "click", @["onFontsize#{control}Click"]

    #
    # Crosshair / anchor control
    #
    @crosshair = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-text-crosshair")
      .appendTo @textContainer

    @handleCrosshair()

    @textInput = $("<textarea>")
      .addClass(ImglyKit.classPrefix + "canvas-text-input")
      .appendTo(@textContainer)
      .attr(placeholder: "Text")
      .focus()

    @textInputDummy = $("<div>")
      .addClass(ImglyKit.classPrefix + "canvas-text-input-dummy")
      .appendTo @canvasControlsContainer

    @textInput.keyup (e) =>
      @operationOptions.text = @textInput.val()
      @operation.setOptions @operationOptions

      @autoResizeTextInput()
    after 100, =>
      @autoResizeTextInput()

  ###
    Gets called as soon as the user clicks the button
    to increase font size
  ###
  onFontsizeBiggerClick: (e) =>
    canvasHeight = @canvasControlsContainer.height()
    resizeFactor = @fontResizePerClick / canvasHeight # fontResizePerClick is in pixels

    newFontSize = Math.min(@operationOptions.fontSize + resizeFactor, 1)
    @operationOptions.fontSize = newFontSize
    @operation.setOptions @operationOptions

    @updateCanvasControls()

  ###
    Gets called as soon as the user clicks the button
    to reduce font size
  ###
  onFontsizeSmallerClick: (e) =>
    canvasHeight = @canvasControlsContainer.height()
    resizeFactor = @fontResizePerClick / canvasHeight # fontResizePerClick is in pixels

    newFontSize = Math.max(@operationOptions.fontSize - resizeFactor, 0.05)
    @operationOptions.fontSize = newFontSize
    @operation.setOptions @operationOptions

    @updateCanvasControls()

  ###
    Update input position
  ###
  updateCanvasControls: ->
    canvasWidth  = @canvasControlsContainer.width()
    canvasHeight = @canvasControlsContainer.height()

    @textContainer.css
      left: @operationOptions.start.x * canvasWidth
      top: @operationOptions.start.y  * canvasHeight

    @autoResizeTextInput()

  ###
    Move the text input around by dragging the crosshair
  ###
  handleCrosshair: ->
    canvasRect = new Rect(0, 0, @canvasControlsContainer.width(), @canvasControlsContainer.height())

    minimumWidth  = 50
    minimumHeight = 50

    minContainerPosition = new Vector2(0, 0)
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight)

    @crosshair.mousedown (e) =>
      # We need the initial as well as the updated mouse position
      initialMousePosition = new Vector2(e.clientX, e.clientY)
      currentMousePosition = new Vector2().copy initialMousePosition

      # We need the initial as well as the updated container position
      initialContainerPosition = new Vector2(@textContainer.position().left, @textContainer.position().top)
      currentContainerPosition = new Vector2().copy initialContainerPosition

      $(document).mousemove (e) =>
        currentMousePosition.set e.clientX, e.clientY

        # mouse difference = current mouse position - initial mouse position
        mousePositionDifference = new Vector2()
          .copy(currentMousePosition)
          .substract(initialMousePosition)

        # updated container position = initial container position - mouse difference
        currentContainerPosition
          .copy(initialContainerPosition)
          .add(mousePositionDifference)
          .clamp(minContainerPosition, maxContainerPosition)

        # move the dom object
        @textContainer.css
          left: currentContainerPosition.x
          top:  currentContainerPosition.y

        # Update the operation options
        @operationOptions.start = new Vector2()
          .copy(currentContainerPosition)
          .divideByRect(canvasRect)
        @operation.setOptions @operationOptions
        @updateCanvasControls()

      $(document).mouseup =>
        $(document).off "mousemove"
        $(document).off "mouseup"

  ###
    Automatically resizes the text input
  ###
  autoResizeTextInput: =>
    canvasWidth  = @canvasControlsContainer.width()
    canvasHeight = @canvasControlsContainer.height()

    inputWidth   = @textInput.width()
    fontSize     = parseInt(@textInput.css("font-size"))
    comfortZoneX = fontSize * 3
    comfortZoneY = fontSize * 2

    #
    # Calculate paddings
    #
    paddingX = parseInt(@textInputDummy.css("padding-left")) + parseInt(@textInputDummy.css("padding-right"))
    paddingY = parseInt(@textInputDummy.css("padding-top")) + parseInt(@textInputDummy.css("padding-bottom"))

    # We need this to render the text to the context
    # at the right position
    @operationOptions.paddingLeft = (parseInt(@textInputDummy.css("padding-left")) + parseInt(@textContainer.css("border-left-width"))) / canvasWidth
    @operationOptions.paddingTop  = (parseInt(@textInputDummy.css("padding-top"))  + parseInt(@textContainer.css("border-top-width")))  / canvasHeight

    #
    # Calculate maximum width
    #
    maxWidth  = canvasWidth  - @operationOptions.start.x * canvasWidth
    maxHeight = canvasHeight - @operationOptions.start.y * canvasHeight

    #
    # If the text ends with a new line, add a space
    #
    text = @textInput.val()
    if text.match /\n$/i
      text = text + "&nbsp;"
    text = text.replace /\n/g, "<br />"
    text = "&nbsp;" unless text

    #
    # Handle maximum width
    #
    @textInputDummy.css(width: "auto", height: "auto").html text
    if @textInputDummy.width() >= maxWidth
      @textInputDummy.css width: maxWidth
      comfortZoneX = 0
    if @textInputDummy.height() >= maxHeight
      @textInputDummy.css height: maxHeight
      comfortZoneY = 0

    @textInput.css
      width:  Math.min(@textInputDummy.width() + comfortZoneX, maxWidth)
      height: Math.min(@textInputDummy.height() + comfortZoneY, maxHeight)

  ###
    @params {Object} options
  ###
  updateOptions: (@operationOptions) ->
    canvasHeight = @canvasControlsContainer.height()

    $([@textInput.get(0), @textInputDummy.get(0)]).css
      fontSize:   (@operationOptions.fontSize * canvasHeight)
      color:      @operationOptions.color
      fontFamily: @operationOptions.font
      lineHeight: @operationOptions.lineHeight
    @updateCanvasControls()

module.exports = UIControlsText
