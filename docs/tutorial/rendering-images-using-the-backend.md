# Rendering images using the backend

With the img.ly SDK you're not limited to the UI. You can also use the backend
to apply operations on an image and render an output image.

To apply operations on an image, push operation instances to the `operationsStack`:

```js
var kit = new ImglyKit({
  image: myImage,
  ui: {
    enabled: false // Disable the UI
  }
});

// Instantiate a filters operation, pass the ImglyKit instance and
// an `options` object with a `filter` property
var a15Filter = new ImglyKit.Operations.Filters(kit, {
  filter: ImglyKit.Filters.A15
});

// Push it to the stack
kit.operationsStack.push(a15Filter);

// Instantiate a brightness operation and push it to the stack as well
var brightness = new ImglyKit.Operations.Brightness(kit, {
  brightness: 0.5
});
kit.operationsStack.push(brightness);

// Render and append the image
kit.render("image", "image/png")
  .then(function (image) {
    document.body.appendChild(image);
  });
```

See the [documentation](http://sdk.img.ly/docs/html5) for information on all
operations and their available options.
