# Photo editor integration

## The HTML site

To integrate the img.ly photo editor into your website, you'll have to include
the CSS file for the UI as well as the img.ly SDK JavaScript file:

```html
<!-- ImglyKit CSS / JS -->
<link rel="stylesheet" href="../../build/css/imglykit-night-ui.css" />
<script src="../../build/js/imglykit.js"></script>
```

The photo editor will be placed into a container DOM element. It will
automatically fill the container size.

```html
<div id="container" style="width: 640px; height: 480px;"></div>
```

## Initializing the photo editor

We will now initialize the photo editor using JavaScript. But before we
initialize it, we will have to load an image that we can pass to the editor.

```html
<script>
  var image = new Image();
  image.src = "image.jpg";

  image.onload = function () {

  };
</script>
```

The `image.onload` function will be called as soon as the image has been
loaded. Let's initialize the SDK and pass some additional information:

```html
<script>
  var image = new Image();
  image.src = "image.jpg";

  image.onload = function () {
    var container = document.querySelector("#container");
    var kit = new ImglyKit({
      image: image,
      assetsUrl: "/imglykit/assets", // Change this to where your assets are
      container: container,
      ui: true // UI is disabled per default
    });
    kit.run();
  };
</script>
```

Et voilà - we can now see the editor and can start editing it.
