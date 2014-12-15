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
      image: image,
      renderer: "webgl",
      assetsUrl: "/src/assets",
      container: document.getElementById("container"),
      ui: true
    });
  };
};
