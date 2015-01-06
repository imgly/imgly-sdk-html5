/* global ImglyKit */
"use strict";
window.onload = function() {

  var image = new Image();
  image.src = "test.jpg";

  image.onload = function () {
    /*
     * Initialize ImglyKit
     */
    var kit = new ImglyKit({
      image: image, // Has to be an instance of Image!
      renderer: "webgl", // Defaults to "webgl", uses "canvas" as fallback
      assetsUrl: "src/assets", // The URL / path where all assets are
      ui: false // Disable the UI, we use the low level API here
    });

    /*
     * An instance of ImglyKit holds an array called `operationStack`. Push
     * some operations into this stack so that they will be used when doing
     * the final rendering.
     *
     * An ImglyKit.Operation constructor takes two arguments: A reference to
     * the ImglyKit instance as well as some options. The FiltersOperation
     * for example takes a `filters` option which can be one of the 28
     * existing filters.
     */
    kit.operationsStack.push(new ImglyKit.Operations.FiltersOperation(kit, {
      filter: "gobblin"
    }));

    /*
     * Some operations take vectors as options. The CropOperation for example
     * takes a start and an end vector. The `numberFormat` option ("relative"
     * or "absolute") specifies whether you wouldd like to use relative
     * values (between 0 and 1) or absolute / pixel values.
     */
    kit.operationsStack.push(new ImglyKit.Operations.CropOperation(kit, {
      start: new ImglyKit.Vector2(0.1, 0.1),
      end: new ImglyKit.Vector2(0.9, 0.9),
      numberFormat: "relative"
    }));

    /*
     * Render the final image. The first argument of `image` is the output
     * type which can either be "dataurl" (a data url that can be sent to
     * a server using AJAX) or "image" (an Image object which has the data url
     * as the source).
     *
     * ImglyKit#render returns a Promise
     */
    kit.render("image")
      .then(function (image) {
        // `image` is now an instance of `Image` which can be appended
        // to the document body
        document.body.appendChild(image);
      })
      .catch(function (err) {
        // Rendering failed for some reason
        console.error(err);
      });
  };
};
