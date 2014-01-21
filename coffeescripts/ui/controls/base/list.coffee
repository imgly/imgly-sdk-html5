###
  imglyKit
  Copyright (c) 2013 img.ly
###
Base  = require "./base.coffee"
Utils = require "../../../utils.coffee"
class UIControlsBaseList extends Base
  displayButtons: false
  singleOperation: false
  init: ->
    @createList()
    unless @allowMultipleClick
      @optionSelected = false

    @list.hide() unless @options.showList

    ###
      Add the list elements
    ###
    for option in @listItems
      ((option) =>
        # If no name is given, display a space
        unless option.name?
          return $("<li>")
            .addClass(imglyKit.classPrefix + "controls-item-space")
            .appendTo @list

        # If the `cssClass` property is present, use it. Otherwise, generate
        # a class from the `name` property
        cssClass = option.cssClass or Utils.dasherize(option.name)

        item = $("<li>")
          .addClass(imglyKit.classPrefix + "controls-item")
          .addClass(imglyKit.classPrefix + "controls-item-" + cssClass)
          .appendTo @list

        item.click (e) =>
          unless @allowMultipleClick
            return if @optionSelected
            @optionSelected = true

          @handleOptionSelect option, item

        if option.default?
          item.click()
      )(option)

  ###
    @param {imglyKit.Operations.Operation}
  ###
  setOperation: (@operation) ->
    @updateOptions @operation.options
    @operation.on "updateOptions", (o) => @updateOptions o

  ###
    @params {Object} options
  ###
  updateOptions: (@operationOptions) -> return

  ###
    @param {Object} option
    @param {jQuery.Object} item
  ###
  handleOptionSelect: (option, item) ->
    @setAllItemsInactive()

    activeClass = imglyKit.classPrefix + "controls-list-item-active"
    item.addClass activeClass

    if @singleOperation
      option.operation = @operationClass

    if not @singleOperation or (@singleOperation and not @sentSelected)
      @emit "select", option
      @sentSelected = true

    if option.method
      @operation[option.method].apply @operation, option.arguments

    if @operation? and @operation.renderPreview
      @emit "renderPreview"

  ###
    Create controls DOM tree
  ###
  createList: ->
    @wrapper = $("<div>")
      .addClass(imglyKit.classPrefix + "controls-wrapper")
      .attr("data-control", @constructor.name)
      .appendTo @controls.getContainer()

    @list = $("<ul>")
      .addClass(imglyKit.classPrefix + "controls-list")
      .appendTo @wrapper

    if @cssClassIdentifier?
      @list.addClass(imglyKit.classPrefix + "controls-list-" + @cssClassIdentifier)

    if @displayButtons
      @list.addClass(imglyKit.classPrefix + "controls-list-with-buttons")
      @list.width(@controls.getContainer().width() - @controls.getHeight() * 2)

      @createButtons()

  ###
    Reset active states
  ###
  reset: ->
    unless @allowMultipleClick
      @optionSelected = false

    @setAllItemsInactive()

  ###
    Sets all list items to inactive state
  ###
  setAllItemsInactive: ->
    activeClass = imglyKit.classPrefix + "controls-list-item-active"
    @list.find("li").removeClass activeClass


module.exports = UIControlsBaseList
