var path = require('path')
var fs = require('fs')
var canvas = require('canvas')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.should()
chai.use(chaiAsPromised)

global.chaiAsPromised = chaiAsPromised
global.expect = chai.expect
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion
global.assert = chai.assert

var PhotoEditorSDK = require('../../src/js/sdk/photoeditorsdk')
global.PhotoEditorSDK = PhotoEditorSDK

global.SpecHelpers = {
  initRenderer () {
    let image = new canvas.Image()
    let imagePath = path.resolve(__dirname, '../sdk/assets/test.png')
    let buffer = fs.readFileSync(imagePath)
    image.src = buffer

    return new PhotoEditorSDK.Renderer('canvas', {
      image: image
    })
  }
}

/**
 * Since node.js does not know about webpack's loader syntax
 * (loaderName!./path/to/module), we need to do some monkey patching...
 */
var Module = require('module')
var originalResolve = Module._resolveFilename
Module._resolveFilename = function (filename, parent) {
  if (filename.indexOf('raw!') === 0) {
    filename = filename.slice(4)
  }
  return originalResolve.call(this, filename, parent)
}

/*
 * Load GLSL shaders as strings
 */
var EXTENSIONS = ['.frag', '.vert']
EXTENSIONS.forEach(function (extension) {
  require.extensions[extension] = function (_module, filename) {
    return fs.readFileSync(filename)
  }
})
