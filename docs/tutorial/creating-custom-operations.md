# Creating custom operations

Operations are extendable JavaScript classes with an `identifier`, an
`availableOptions` object and two private functions: `_renderWebGL` and
`_renderCanvas` which will perform the drawing operations. Operations are
extendable via the `.extend()` function.

Here is an example that can change the brightness of the image:

```js
var BrightnessOperation = ImglyKit.Operation.extend({
  /**
   * Runs a GLSL pixel shader that changes the brightness of every pixel
   * @param  {WebGLRenderer} renderer
   */
  _renderWebGL: function (renderer) {
    renderer.runShader(null, this.fragmentShader, {
      uniforms: {
        u_brightness: { type: "f", value: this._options.brightness }
      }
    });
  },

  /**
   * Changes the brightness of every pixel in the image data array
   * @param  {CanvasRenderer} renderer
   */
  _renderCanvas: function (renderer) {
    var canvas = renderer.getCanvas();
    var context = renderer.getContext();
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var brightness = this._options.brightness;

    for (var index = 0; index < canvas.width * canvas.height; index += 4) {
      imageData.data[index] = imageData.data[index] + brightness * 255;
      imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255;
      imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255;
    }

    context.putImageData(imageData, 0, 0);
  }
}, {
  identifier: "brightness",
  availableOptions: {
    brightness: { type: "number", default: 0 }
  },
  fragmentShader: "precision mediump float;\nvarying vec2 v_texCoord;\nuniform sampler2D u_image;\n\nuniform float u_brightness;\nvoid main() {\n  vec4 texColor = texture2D(u_image, v_texCoord);\n  gl_FragColor = vec4((texColor.rgb + vec3(u_brightness)), texColor.a);\n}"
})
```

You can then use the operation like any built-in operation.
