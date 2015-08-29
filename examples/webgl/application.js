/* global ImglyKit, Image */
window.onload = function () {
  var myImage = new Image()
  myImage.addEventListener('load', function () {
    /*
     * Initialize ImglyKit
     */
    var kit = new ImglyKit({
      renderer: 'webgl', // Defaults to 'webgl', uses 'canvas' as fallback
      assetsUrl: '../../build/assets', // The URL / path where all assets are
      container: document.querySelector('#container'),
      versionCheck: false,
      image: myImage,
      ui: {
        enabled: true,
        showExportButton: true,
        export: {
          type: ImglyKit.ImageFormat.JPEG
        }
      },
      renderOnWindowResize: true // Our editor's size is relative to the window size
    })

    kit.run()

    /*
     * We have a 'Render' button which (on click) will request the rendered
     * image from ImglyKit and add it to the DOM
     */
    var button = document.getElementById('render-button')
    button.addEventListener('click', function (e) {
      e.preventDefault()

      // This will render the image with 100 pixels in width while
      // respecting the aspect ratio
      // Possible render types: image, data-url
      kit.render('image', 'image/png')
        .then(function (image) {
          var cropOperation = kit.getOperationFromStack('crop')
          var start = cropOperation.getStart()
          var end = cropOperation.getEnd()
          var inputImage = kit.ui.options.image
          var dimensions = end
            .subtract(start)
            .multiply(inputImage.width, inputImage.height)

          console.log('image dimensions', dimensions)

          document.body.appendChild(image)
        })
    })

    window.kit = kit
  })

  myImage.src = 'test.jpg'
}
