"use strict";
window.onload = function() {
  /*
   * Find the container
   */
  var container = document.getElementById("container");

  /*
   * Globally register some custom operations, in this case
   * the stickers operation. See the documentation on how to
   * create a custom operation.
   */

  var StickersOperation = Operation.extend({});
  ImglyKit.operations.register(StickersOperation);

  /*
   * Initialize ImglyKit
   */
  var kit = new ImglyKit(container);

  /*
   * Make sure only the filters operation is active
   */
  kit.operations.select({ only: "filters" });

  /*
   * Operations can be customized. See the API reference for information
   * on their specific APIs
   *
   * Here we make sure that the "filters" operation only shows
   * the "A15" and "Goblin" filters.
   */

  var operation = kit.operations.find("filters");
  filtersOperation.selectFilters({ only: "a15,goblin" });

  kit.operations.configure("filters", function (filtersOperation) {
    filtersOperation.selectFilters({ only: "a15,goblin" });
  });

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
