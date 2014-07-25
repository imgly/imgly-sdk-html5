### How to integrate the img.ly SDK Kit into your web application

Copy the imgly.concat.js and all assets to the appropriate folders of your web
application. You will need a target div that serves as a container for the
img.ly SDK editor.

Stripped down to the bare minimum you need to know: You can invoke the Img.ly
SDK by creating an ImglyKit object while passing it the target container:

```
    // Initialize ImglyKit and run it
    // with the image
    imgly = new ImglyKit({
      container: "#container"
    });
```

Once you have done this, you can start editing images by passing them Image
objects with run():

```
  image = new Image()
  image.src = "imgage.jpg";
  image.onload = function () {
    imgly.run(image);
  }
```

That's basically it. Everything else is optional.

In order to see full working examples, check the example/-folder which contains
all necessary files in order to use the Img.ly SDK.

### Added new assets, for example stickers or fonts
In coffeescripts/ui/controls/ you will find the files stickers_control.coffee
and text.coffee. In these files you will encounter the property @listItems. You
can extend or replace these lists.

In short, here is a quick explanation of what each property does:
* name: A name for this sticker.
* cssClass: The css appendix used to style this item.
* method: The internal method that will be called when triggering this item.
* arguments: The argument passed to the method mentioned above. In this case, that's the picture that's supposed to be load as the sticker.
* pixmap: A pixmap that will be passed as an inline style that servers as a preview of the sticker.
* tooltip: A tooltip that will appear when the user hovers over an item.
* default: When set to true, this item will be triggered right from the start.

```
    @listItems = [
      {
        name: "Nerd glasses"
        cssClass: "sticker-glasses-nerd"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-nerd.png"]
        pixmap: "stickers/sticker-glasses-nerd.png"
        tooltip: "Nerd glasses"
        default: true
      },
      {
        name: "Normal glasses"
        cssClass: "sticker-glasses-normal"
        method: "useSticker"
        arguments: ["stickers/sticker-glasses-normal.png"]
        pixmap: "stickers/sticker-glasses-normal.png"
        tooltip: "Normal glasses"
      },
      [...]
```

In the exact same way, this works for fonts:
```
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
      [...]
```

On a side note, there is currently a bug that will be fixed soon within upcoming
refactoring actions. In addition to specifying the default action with the
default: true flag, you have to load the image directly in the corresponding
operation, in this case operations/draw_image.coffee in the constructor:

```
    @options.sticker = "stickers/sticker-heart.png" # <- Set this to the default
```

And for fonts in operations/text.coffee:
```
    @options.font  = "Helvetica"
    @options.text  = "Text"
    @options.color = "#ffffff"
```

