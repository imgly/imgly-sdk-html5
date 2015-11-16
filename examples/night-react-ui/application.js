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
    })

    /**
     * Initialize the UI
     */
    var editor = new PhotoEditorSDK.UI.NightReact(renderer, {
      container: document.querySelector('#container'),
      responsive: true,
      assets: {
        baseUrl: '/build/assets',
        resolver: function (path) {
          return path
        }
      },
      language: 'en',
      operations: 'all',
      controlsOptions: {

      },
      additionalControls: [
        // {
        //   canvasControls: NoiseCanvasControls,
        //   controls: NoiseControl
        // }
      ],
      webcam: false
    })
    window.editorComponent = editor.run()
    window.editor = editor
  })

  myImage.src = 'test.jpg'
}
