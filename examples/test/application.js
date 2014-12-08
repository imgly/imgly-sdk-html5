/* global ImglyKit */
"use strict";
window.onload = function() {

  var image = new Image();
  image.src = "test.jpg";

  image.onload = function () {
    /*
     * Initialize ImglyKit
     */
    var kit = new ImglyKit({ image: image, renderer: "canvas", assetsUrl: "/src/assets" });

    /*
     * Operations can be customized. See the API reference for information
     * on their specific APIs
     *
     * Here we make sure that the "filters" operation only shows
     * the "A15" and "Goblin" filters.
     */
    var operation;

    operation = new ImglyKit.Operations.SaturationOperation(kit);
    kit.operationsStack.push(operation);

    kit.render(ImglyKit.RenderType.IMAGE)
      .then(function (image) {
        document.body.appendChild(image);
      });
  };
};
