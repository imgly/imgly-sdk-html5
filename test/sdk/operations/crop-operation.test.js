/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let kit, image

beforeEach(function () {
  kit = SpecHelpers.initRenderer()
  image = kit.getImage()
})

describe('CropOperation', function () {
  describe('#render', function () {
    describe('with both start and end set', function () {
      it('should correctly resize the canvas', function (done) {
        const operation = kit.createOperation('crop', {
          start: new PhotoEditorSDK.Vector2(0.1, 0.1),
          end: new PhotoEditorSDK.Vector2(0.9, 0.9)
        })
        kit.operationsStack.push(operation)

        kit.export(PhotoEditorSDK.RenderType.IMAGE)
          .then(function (result) {
            result.width.should.equal(image.width * 0.8)
            result.height.should.equal(image.height * 0.8)

            done()
          })
          .catch(function (err) {
            done(err)
          })
      })
    })

    describe('with `numberFormat` set to `absolute`', function () {
      it('should correctly resize the canvas', function (done) {
        const operation = kit.createOperation('crop', {
          start: new PhotoEditorSDK.Vector2(100, 100),
          end: new PhotoEditorSDK.Vector2(400, 400),
          numberFormat: 'absolute'
        })
        kit.operationsStack.push(operation)

        kit.export(PhotoEditorSDK.RenderType.IMAGE)
          .then(function (result) {
            result.width.should.equal(300)
            result.height.should.equal(300)

            done()
          })
          .catch(function (err) {
            throw err
          })
      })
    })
  })
})
