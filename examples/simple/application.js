"use strict";
window.onload = function() {
  /*
   * Find the container
   */
  var container = document.getElementById("container");

  /*
   * Initialize ImglyKit
   */
  var kit = new ImglyKit(container);

  /*
   * Make sure only the filters operation is active
   */
  kit.operations.select({ only: "filters" });

  /*
   * Run the kit
   */
  kit.run();

  /*
   * We have a "Render" button which (on click) will request the rendered
   * image from ImglyKit, upload it to a server and also add it to the DOM
   */
  var button = document.getElementById("render-button");
  button.addEventListener("click", function (e) {
    e.preventDefault();

    // This will render the image with 100 pixels in width while
    // respecting the aspect ratio
    // Possible render types: image, data-url
    var image = kit.render("image", "100x");
    document.body.appendChild(image);

    // We will also upload it to a server
    kit.upload("/api/upload", "100x")
      .then(function (response) {
        console.log(response);
      });
  });

};
