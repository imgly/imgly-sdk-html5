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

