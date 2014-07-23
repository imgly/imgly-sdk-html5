# Controls

The controls are located in "ui/controls/overview.coffee". Before you decide what you want to do you have to choose wether your control triggers a single operation or a chain of operations.
If you want to add a custom control you have implement it and require it in the list as followed.
We go the easy and start with a single operation - in order to do so the flag singleOperation has to be true. You also have to specify the operation in the @operationClass.

´´´
class UIControlsStickers extends List
  cssClassIdentifier: "sticker"
  singleOperation: true
  displayButtons: true

  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  ###
  constructor: (@app, @ui, @controls) ->
    super

    @operationClass = require "../../operations/draw_image.coffee"

    @listItems = [
      {
        name: "Heart"
        cssClass: "sticker"
        method: "useSticker"
        arguments: ["Heart"]
        default: true
      },
      {
        name: "NyanCat"
        cssClass: "nyanCat"
        method: "useSticker"
        arguments: ["NyanCat"]
      }
    ]
´´´

When the operation is processed an instance of the class specfified in @operationClass will be created and on that instance the method specified in
method with the arguments specified in arguments will be called. The list item where you set default to true will be applied as default.

The option displayButtons will add a back and apply button.

# Operations

Operation are the heart of manipulating the canvas object. If you want to create a custom operation you have to implement it
in the operations folder and the require it by your custom control.

Settings from the UI control, for example the position and size, can be passed
via the @operationOptions variable (which is being set by @operation.setOptions).

What does renderPreview: true really do in class Operation? It allows previews to be rendered, but that is a bit confusing.

# Adding new stickers
Sticker files have follow the naming convention stickers/sticker-{name}.png. In order to add new stickers, the stickerContainer list has to be extended both in coffeescript and in sass.

