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
        showWebcamButton: false,
        export: {
          type: ImglyKit.ImageFormat.JPEG
        }
      },
      renderOnWindowResize: true // Our editor's size is relative to the window size
    })

    kit.ui.selectOperations('brush')

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
          // document.body.appendChild(image)
        })
    })

    window.kit = kit
  })

  myImage.src = 'test.jpg'
}
