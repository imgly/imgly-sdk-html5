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
      assetsUrl: "/build/assets", // The URL / path where all assets are
      container: document.querySelector("#container"),
      ui: true // Disable the UI, we use the low level API here
    });

    // kit.ui.registerControl();

    kit.run();
  };
};
