/* global ImglyKit */
"use strict";
window.onload = function() {

  var image = new Image();
  image.src = "test.png";

  image.onload = function () {
    /*
     * Initialize ImglyKit
     */
    var kit = new ImglyKit({ image: image });

    /*
     * Operations can be customized. See the API reference for information
     * on their specific APIs
     *
     * Here we make sure that the "filters" operation only shows
     * the "A15" and "Goblin" filters.
     */

    var filtersOperation = new ImglyKit.Operations.FiltersOperation(kit, {
      filter: "x400"
    });
    kit.operationsStack.push(filtersOperation);

    kit.render(ImglyKit.RenderType.IMAGE)
      .then(function (image) {
        document.body.appendChild(image);
      });
  };
};
