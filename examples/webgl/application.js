/* global PhotoEditorSDK, Image */
window.onload = function () {
  var myImage = new Image()
  myImage.addEventListener('load', function () {
    /*
     * Initialize Renderer
     */
    var renderer = new PhotoEditorSDK.Renderer('webgl', {
      image: myImage,
      additionalOperations: {
        // noise: NoiseOperation
      }
    }, {
      filters: {
        additionalFilters: {
          // night: NightFilter
        }
      },
      stickers: {
        additionalStickers: {
          // foo: 'foo.png',
          // bar: 'bar.png'
        }
      }
    })

    /**
     * Initialize the UI
     */
    var editor = new PhotoEditorSDK.UI.NightReact(renderer, {
      container: document.querySelector('#container'),
      assets: {
        baseUrl: '/build/assets',
        resolver: function (path) {
          return path
        }
      },
      operations: 'all',
      additionalControls: [
        // {
        //   canvasControls: NoiseCanvasControls,
        //   controls: NoiseControl
        // }
      ]
    })
    window.editorComponent = editor.run()

    /*
     * We have a 'Render' button which (on click) will request the rendered
     * image from PhotoEditorSDK and add it to the DOM
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
