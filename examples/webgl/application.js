/* global ImglyKit, Image */
window.onload = function () {
  var myImage = new Image()
  myImage.addEventListener('load', function () {
    /*
     * Initialize Renderer
     */

    var renderer = new ImglyKit.Renderer('webgl', {

    })

    /**
     * Initialize the UI
     */
    var editor = new ImglyKit.UI.NightReact(renderer, {
      container: document.querySelector('#container'),
      assets: {
        baseUrl: '/build/assets',
        resolver: function (path) {
          return path
        }
      },
      operations: [
        'crop',
        'rotation',
        'flip',
        'text',
        'noise'
      ],
      additionalOperations: [
        // NoiseOperation
      ],
      additionalControls: [
        // {
        //   canvasControls: NoiseCanvasControls,
        //   controls: NoiseControl
        // }
      ]
    })
    editor.run()

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
      renderer.render('image', 'image/png')
        .then(function (image) {
          document.body.appendChild(image)
        })
    })

    window.editor = editor
  })

  myImage.src = 'test.jpg'
}
