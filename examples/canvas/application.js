/* global ImglyKit */
"use strict";
window.onload = function() {

  /*
   * Initialize ImglyKit
   */
  var kit = new ImglyKit({
    renderer: "canvas", // Defaults to "webgl", uses "canvas" as fallback
    assetsUrl: "../../build/assets", // The URL / path where all assets are
    container: document.querySelector("#container"),
    ui: {
      enabled: true
    },
    renderOnWindowResize: true // Our editor's size is relative to the window size
  });

  kit.run();

  /*
   * We have a "Render" button which (on click) will request the rendered
   * image from ImglyKit and add it to the DOM
   */
  var button = document.getElementById("render-button");
  button.addEventListener("click", function (e) {
    e.preventDefault();

    // This will render the image with 100 pixels in width while
    // respecting the aspect ratio
    // Possible render types: image, data-url
    var image = kit.render("image", "image/png")
      .then(function (image) {
        document.body.appendChild(image);
      });
  });
};
