/* global PhotoEditorSDK, describe, it, beforeEach */
/* eslint-disable no-new */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import path from 'path'
import fs from 'fs'
import canvas from 'canvas'

let image, kit

describe('PhotoEditorSDK', function () {
  describe('#export', function () {

    beforeEach(function () {
      image = new canvas.Image()
      let imagePath = path.resolve(__dirname, 'assets/test.png')
      let buffer = fs.readFileSync(imagePath)
      image.src = buffer

      kit = new PhotoEditorSDK.Renderer('canvas', {
        image: image
      })
    })

    describe('validations', function () {

      describe('when an invalid render type is given', function () {

        it('should throw an error', function () {
          return kit.export('invalid')
            .should.be.rejectedWith(null, 'Invalid render type')
        })

      })

      describe('when an invalid image format is given', function () {

        it('should throw an error', function () {
          return kit.export(null, 'invalid')
            .should.be.rejectedWith(null, 'Invalid image format')
        })

      })

    }) // validations

    describe('without any operations on the stack', function () {
      it('should return a promise', function () {
        return kit.export()
          .should.be.fulfilled
      })
    })

  }) // #render

})
