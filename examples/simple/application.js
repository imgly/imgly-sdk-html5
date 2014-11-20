"use strict";
window.onload = function() {
  /*
   * Initialize ImglyKit with a DOM container and the configuration object
   */
  var container = document.getElementById("container");
  var config = {

  };
  var imglyKit = new ImglyKit(container, config);

  /*
   * We have a "Render" button which (on click) will request the rendered
   * image from ImglyKit and add it to the DOM.
   */
  var button = document.getElementById("render-button");
  button.addEventListener("click", function (e) {
    e.preventDefault();
    var image = imglyKit.render("image")
  });

};
