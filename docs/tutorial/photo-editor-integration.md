# Photo editor integration

## The HTML site

To integrate the img.ly photo editor into your website, you'll have to include
the CSS file for the UI as well as the img.ly SDK JavaScript file:

```html
<!-- ImglyKit CSS / JS -->
<link rel="stylesheet" href="/imglykit/css/imglykit-night-ui.css" />
<script src="/imglykit/build/js/imglykit.js"></script>
```

The photo editor will be placed into a container DOM element. It will
automatically fill the container size, so let's set this to 640x480 pixels.

```html
<div id="container" style="width: 640px; height: 480px;"></div>
```

## Initializing the photo editor

We will now initialize the photo editor using JavaScript. But before we
initialize it, we will have to load an image that we can pass to the editor.

> :exclamation: *Notice:* Since v2.0.0-beta4 you don't need to pass an
> `image` option as long as you're not using the UI. When no `image` option
> is passed, the default UI will display a `new` button as well as a
> drag-and-drop area for loading pictures from the hard drive.

```html
<script>
  window.onload = function() {
    var image;

    image = new Image();
    image.src = "image.jpg";

    image.onload = function () {

    };
  };
</script>
```

The `image.onload` function will be called as soon as the image has been
loaded. Let's initialize the SDK and pass some additional information:

```html
<script>
  window.onload = function() {
    var image, container, kit;

    image = new Image();
    image.src = "image.jpg";

    image.onload = function () {
      container = document.querySelector("div#container");
      kit = new ImglyKit({
        image: image,
        container: container,
        assetsUrl: "/imglykit/assets", // Change this to where your assets are
        ui: {
          enabled: true // UI is disabled per default
        }
      });
      kit.run();
    };
  };
</script>
```

Et voilà - we can now see the editor and start editing our photo.

![](http://fs1.directupload.net/images/150305/yo2vpug4.png)

## Rendering to an image or DataURL

Since the photo editor is always rendering to a canvas, we can't simply
right-click the canvas and "Save image as...". What a bummer!
But luckily we have added a render function that will allow us to render
the canvas to an image or to a DataURL.

Let's add a render button to our website:

```html
<button id="render">Render an image</button>
```

Now, let's listen to click events on the render button, ask the SDK to render
an image and append the image to our body:

```html
<script>
  window.onload = function() {
    // all the previous code...

    var button = document.querySelector("button#render");
    button.addEventListener("click", function () {
      kit.render("image", "image/png")
        .then(function (image) {
          document.body.appendChild(image);
        });
    });
  };
</script>
```

Easy, right? Now, whenever we click the "Render an image" button, it will
render an image and append it to the DOM.
