require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, ImglyKit, PhotoProcessor, UI, Utils,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = require("jquery");

PhotoProcessor = require("./photoprocessor.coffee");

UI = require("./ui/ui.coffee");

Utils = require("./utils.coffee");

window.after = function(t, f) {
  return setTimeout(f, t);
};

window.every = function(t, f) {
  return setInterval(f, t);
};

ImglyKit = (function() {
  ImglyKit.classPrefix = "imgly-";

  ImglyKit.canvasContainerPadding = 15;


  /*
    @param options.container The container we ImglyKit will run in
    @param options.additionalFonts Array with objects like to specify additional fonts [{
          name: "Lobster",
          cssClass: "lobster"
        },
        {
          name: "Titillium Web",
          cssClass: "titillium-web"
        }]
   */

  function ImglyKit(options) {
    var _base, _base1;
    this.options = options != null ? options : {};
    this.onImageLoaded = __bind(this.onImageLoaded, this);
    if ((_base = this.options).debug == null) {
      _base.debug = false;
    }
    if ((_base1 = this.options).assetsPath == null) {
      _base1.assetsPath = "/build/assets";
    }
    if (this.options.container == null) {
      throw new Error("No container given");
    }
    this.options.container = $(this.options.container);
    this.options.container.addClass(ImglyKit.classPrefix + "container");
    this.photoProcessor = new PhotoProcessor(this);
    this.ui = new UI(this);
  }


  /*
    @returns {Boolean} Whether Canvas and Canvastext is supported or not
   */

  ImglyKit.prototype.checkSupport = function() {
    var error;
    return true;
    error = new Error("Canvas and / or Canvas Text drawing not supported");
    error.name = "NoSupportError";
    error.description = "No Canvas support";
    throw error;
  };


  /*
    @returns {jQuery.Object} The jQuery object for the app container
   */

  ImglyKit.prototype.getContainer = function() {
    return this.options.container;
  };


  /*
    @returns {Integer} The height of the app container
   */

  ImglyKit.prototype.getHeight = function() {
    return this.options.container.height();
  };


  /*
    @returns {ImglyKit.PhotoProcessor}
   */

  ImglyKit.prototype.getPhotoProcessor = function() {
    return this.photoProcessor;
  };


  /*
    @param {String} file path
    @returns {String} assets file path
   */

  ImglyKit.prototype.buildAssetsPath = function(path) {
    return this.options.assetsPath + "/" + path;
  };


  /*
    @param {Image|String} image Data URL or Image object
   */

  ImglyKit.prototype.run = function(image) {
    var dataUrl, error;
    this.image = image;
    this.checkSupport();
    if (this.options.ratio != null) {
      this.options.initialControls = require("./ui/controls/crop.coffee");
      this.options.forceInitialControls = true;
      this.options.operationOptionsHook = (function(_this) {
        return function(operation) {
          return operation.setRatio(_this.options.ratio);
        };
      })(this);
    }
    if (!(typeof this.image === "string" || this.image instanceof Image)) {
      throw new Error("First parameter needs to be a String or an Image");
    }
    if (typeof this.image === "string") {
      if (this.image.slice(0, 10) !== "data:image") {
        error = new Error("First parameter is a string, but not an image data URL");
        error.name = "InvalidError";
        throw error;
      }
      dataUrl = this.image;
      this.image = new Image();
      this.image.src = dataUrl;
    }
    if (this.image.width > 0 && this.image.height > 0) {
      return this.onImageLoaded();
    } else {
      return this.image.onload = this.onImageLoaded;
    }
  };


  /*
    Gets called as soon as the image has been loaded
    and the image dimensions are available
   */

  ImglyKit.prototype.onImageLoaded = function() {

    /*
      Set up the user interface
     */
    if (!this.ui.initialized) {
      this.ui.init();
      this.photoProcessor.setCanvas(this.ui.getCanvas());
      this.ui.on("preview_operation", (function(_this) {
        return function(operation) {
          var _ref;
          if ((_ref = _this.ui.getCurrentControls()) != null) {
            _ref.setOperation(operation);
          }
          return _this.photoProcessor.setPreviewOperation(operation);
        };
      })(this));
      this.ui.on("back", (function(_this) {
        return function() {
          _this.photoProcessor.unsetPreviewOperation();
          return _this.ui.resetControls();
        };
      })(this));
      this.ui.on("done", (function(_this) {
        return function() {
          _this.photoProcessor.acceptPreviewOperation();
          return _this.ui.resetControls();
        };
      })(this));
    } else {
      this.photoProcessor.reset();
      this.ui.resetControls();
    }

    /*
      Reset everything
     */
    this.reset();

    /*
      Set source image of the photo processor and tell
      it to render it
     */
    this.photoProcessor.setSourceImage(this.image);
    return this.photoProcessor.renderPreview((function(_this) {
      return function(err) {

        /*
          Do we have controls that have to be shown
          on startup?
         */
        var controls;
        if (_this.options.initialControls) {
          controls = _this.ui.controls;
          controls.switchToControls(_this.options.initialControls, controls.getCurrentControls(), {
            backButton: !_this.options.forceInitialControls,
            showList: !_this.options.forceInitialControls
          });
          if (_this.options.operationOptionsHook != null) {
            return _this.options.operationOptionsHook(controls.getCurrentControls().operation);
          }
        }
      };
    })(this));
  };


  /*
    Resets everything
   */

  ImglyKit.prototype.reset = function() {
    return this.photoProcessor.reset();
  };


  /*
    Renders the image and returns a data url
   */

  ImglyKit.prototype.renderToDataURL = function(format, options, callback) {
    if (options == null) {
      options = {};
    }
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    return this.photoProcessor.renderImage(options, (function(_this) {
      return function(err, imageData) {
        var canvas;
        canvas = Utils.newCanvasFromImageData(imageData);
        return callback(null, canvas.toDataURL(format));
      };
    })(this));
  };

  return ImglyKit;

})();

window.ImglyKit = ImglyKit;



},{"./photoprocessor.coffee":58,"./ui/controls/crop.coffee":66,"./ui/ui.coffee":76,"./utils.coffee":77,"jquery":"jquery"}],2:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Rect;

Rect = (function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
    if (this.width == null) {
      this.width = 0;
    }
    if (this.height == null) {
      this.height = 0;
    }
  }


  /*
    @param {Integer} x
    @param {Integer} y
    @param {Integer} width
    @param {Integer} height
   */

  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };


  /*
    @param {Integer} x
    @param {Integer} y
   */

  Rect.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  };


  /*
    @param {Integer} width
    @param {Integer} height
   */

  Rect.prototype.setDimensions = function(width, height) {
    this.width = width;
    this.height = height;
  };


  /*
    @param {ImglyKit.Rect} The vector we want to copy
   */

  Rect.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    return this;
  };

  Rect.prototype.toString = function() {
    return "Rect({ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " })";
  };

  return Rect;

})();

module.exports = Rect;



},{}],3:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Vector2;

Vector2 = (function() {
  function Vector2(x, y) {
    this.x = x;
    this.y = y;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
  }


  /*
    @param {Integer} x
    @param {Integer} y
   */

  Vector2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
  };


  /*
    @returns {Vector2} A clone of this vector
   */

  Vector2.prototype.clone = function() {
    return new Vector2(this.x, this.y);
  };


  /*
    @param {ImglyKit.Vector2} The vector we want to copy
   */

  Vector2.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  };


  /*
    @param {Integer|Vector2} Minimum value
    @param {Integer|Vector2} Maximum value
   */

  Vector2.prototype.clamp = function(minimum, maximum) {
    if (!(minimum instanceof Vector2)) {
      minimum = new Vector2(minimum, minimum);
    }
    if (!(maximum instanceof Vector2)) {
      maximum = new Vector2(maximum, maximum);
    }
    this.x = Math.max(minimum.x, Math.min(maximum.x, this.x));
    this.y = Math.max(minimum.y, Math.min(maximum.y, this.y));
    return this;
  };


  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
   */

  Vector2.prototype.multiplyWithRect = function(multiplier) {
    this.x *= multiplier.width;
    this.y *= multiplier.height;
    return this;
  };


  /*
    @param {Integer|Vector2}
   */

  Vector2.prototype.divide = function(divisor) {
    if (divisor instanceof Vector2) {
      this.x /= divisor.x;
      this.y /= divisor.y;
    } else {
      this.x /= divisor;
      this.y /= divisor;
    }
    return this;
  };


  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
   */

  Vector2.prototype.divideByRect = function(divisor) {
    this.x /= divisor.width;
    this.y /= divisor.height;
    return this;
  };


  /*
    @param {Integer|Vector2}
   */

  Vector2.prototype.subtract = function(subtrahend) {
    if (subtrahend instanceof Vector2) {
      this.x -= subtrahend.x;
      this.y -= subtrahend.y;
    } else {
      this.x -= subtrahend;
      this.y -= subtrahend;
    }
    return this;
  };


  /*
    @param {Rect} The object to substract
   */

  Vector2.prototype.subtractRect = function(subtrahend) {
    this.x -= subtrahend.width;
    this.y -= subtrahend.height;
    return this;
  };


  /*
    @param {Rect} The object to add
   */

  Vector2.prototype.addRect = function(addend) {
    this.x += addend.width;
    this.y += addend.height;
    return this;
  };


  /*
    @param {Integer|Vector2}
   */

  Vector2.prototype.add = function(addend) {
    if (addend instanceof Vector2) {
      this.x += addend.x;
      this.y += addend.y;
    } else {
      this.x += addend;
      this.y += addend;
    }
    return this;
  };

  Vector2.prototype.toString = function() {
    return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
  };

  return Vector2;

})();

module.exports = Vector2;



},{}],4:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Brightness, BrightnessOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Brightness = require("./filters/primitives/brightness.coffee");

BrightnessOperation = (function(_super) {
  __extends(BrightnessOperation, _super);


  /*
    @param {ImglyKit} app
    @param {Object} options
   */

  function BrightnessOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    BrightnessOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Brightness({
      brightness: this.options.amount
    });
  }

  BrightnessOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };


  /*
    @param {Integer} brightness
   */

  BrightnessOperation.prototype.setBrightness = function(brightness) {
    this.options.amount = brightness;
    return this.filter.setBrightness(brightness);
  };

  return BrightnessOperation;

})(Filter);

module.exports = BrightnessOperation;



},{"./filters/filter.coffee":15,"./filters/primitives/brightness.coffee":33}],5:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Contrast, ContrastOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Contrast = require("./filters/primitives/contrast.coffee");

ContrastOperation = (function(_super) {
  __extends(ContrastOperation, _super);


  /*
    @param {ImglyKit} app
    @param {Object} options
   */

  function ContrastOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    ContrastOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Contrast(this.app, {
      contrast: this.options.amount
    });
  }

  ContrastOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };


  /*
    @param {Integer} contrast
   */

  ContrastOperation.prototype.setContrast = function(contrast) {
    this.options.amount = contrast;
    return this.filter.setContrast(contrast);
  };

  return ContrastOperation;

})(Filter);

module.exports = ContrastOperation;



},{"./filters/filter.coffee":15,"./filters/primitives/contrast.coffee":34}],6:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var CropOperation, Operation, Utils, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

CropOperation = (function(_super) {
  __extends(CropOperation, _super);

  CropOperation.prototype.renderPreview = false;

  function CropOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    this.setRatio = __bind(this.setRatio, this);
    CropOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).start == null) {
      _base.start = new Vector2(0.1, 0.1);
    }
    if ((_base1 = this.options).end == null) {
      _base1.end = new Vector2(0.9, 0.9);
    }
    if ((_base2 = this.options).ratio == null) {
      _base2.ratio = 0;
    }
  }

  CropOperation.prototype.setRatio = function(ratio) {
    this.options.ratio = ratio;
    return this.setSize("custom");
  };

  CropOperation.prototype.calculateRatio = function(size) {
    switch (size) {
      case "square":
        this.options.ratio = 1;
        break;
      case "4:3":
        this.options.ratio = 4 / 3;
        break;
      case "16:9":
        this.options.ratio = 16 / 9;
        break;
      case "free":
        this.options.ratio = 0;
    }
  };

  CropOperation.prototype.setSize = function(size) {
    var h, height, w, width, _ref;
    _ref = this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
    this.options.size = size;
    this.options.start.set(0.1, 0.1);
    this.options.end.set(0.9, 0.9);
    this.calculateRatio(size);
    if (this.options.ratio) {
      if (width / height <= this.options.ratio) {
        this.options.start.x = 0.1;
        this.options.end.x = 0.9;
        h = 1 / height * (width / this.options.ratio * 0.8);
        this.options.start.y = (1 - h) / 2;
        this.options.end.y = 1 - this.options.start.y;
      } else {
        this.options.start.y = 0.1;
        this.options.end.y = 0.9;
        w = 1 / width * (this.options.ratio * height * 0.8);
        this.options.start.x = (1 - w) / 2;
        this.options.end.x = 1 - this.options.start.x;
      }
    }
    return this.emit("updateOptions", this.options);
  };

  CropOperation.prototype.setStart = function(x, y) {
    this.options.start.x = x;
    return this.options.start.y = y;
  };

  CropOperation.prototype.setEnd = function(x, y) {
    this.options.end.x = x;
    return this.options.end.y = y;
  };

  CropOperation.prototype.apply = function(imageData) {
    var canvas, context, h, height, w, width, x, y;
    width = imageData.width, height = imageData.height;
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    x = width * this.options.start.x;
    y = height * this.options.start.y;
    w = width * (this.options.end.x - this.options.start.x);
    h = height * (this.options.end.y - this.options.start.y);
    return context.getImageData(x, y, w, h);
  };

  return CropOperation;

})(Operation);

module.exports = CropOperation;



},{"../math/vector2.coffee":3,"../utils.coffee":77,"./operation.coffee":53}],7:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var DrawImageOperation, Operation, Queue, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Queue = require("../vendor/queue.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

module.exports = DrawImageOperation = (function(_super) {
  __extends(DrawImageOperation, _super);

  function DrawImageOperation(app, options) {
    this.app = app;
    this.options = options != null ? options : {};
    DrawImageOperation.__super__.constructor.apply(this, arguments);
    this.options.resizeButtonOffset = 20;
    this.options.scale = this.options.resizeButtonOffset + 100;
    this.options.stickerImageWidth = 100;
    this.options.stickerImageHeight = 100;
    this.options.sticker = "stickers/sticker-glasses-nerd.png";
    this.options.widthRange = 570;
    this.options.heightRange = 427;
  }


  /*
    @param {String} sticker
   */

  DrawImageOperation.prototype.useSticker = function(sticker) {
    this.options.sticker = sticker;
    return this.emit("updateOptions", this.options);
  };

  DrawImageOperation.prototype.apply = function(imageData) {
    return Queue.promise((function(_this) {
      return function(resolve, reject) {
        var stickerImage;
        stickerImage = new Image();
        stickerImage.onload = function() {
          return resolve(stickerImage);
        };
        return stickerImage.src = _this.app.buildAssetsPath(_this.options.sticker);
      };
    })(this)).then((function(_this) {
      return function(stickerImage) {
        var canvas, context, ratio, scaling;
        ratio = stickerImage.height / stickerImage.width;
        _this.options.stickerImageWidth = _this.options.scale - _this.options.resizeButtonOffset;
        _this.options.stickerImageHeight = (_this.options.scale - _this.options.resizeButtonOffset) * ratio;
        canvas = Utils.newCanvasFromImageData(imageData);
        context = canvas.getContext("2d");
        if (_this.options.stickerPosition == null) {
          _this.options.stickerPosition = new Vector2(canvas.width / 2, canvas.height / 2);
        }
        scaling = canvas.width / _this.options.widthRange;
        context.drawImage(stickerImage, _this.options.stickerPosition.x * scaling, _this.options.stickerPosition.y * scaling, _this.options.stickerImageWidth * scaling, _this.options.stickerImageHeight * scaling);
        return context.getImageData(0, 0, imageData.width, imageData.height);
      };
    })(this));
  };

  return DrawImageOperation;

})(Operation);



},{"../math/rect.coffee":2,"../math/vector2.coffee":3,"../utils.coffee":77,"../vendor/queue.coffee":79,"./operation.coffee":53}],8:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var A15Filter, Brightness, Contrast, Filter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Contrast = require("./primitives/contrast.coffee");

Brightness = require("./primitives/brightness.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

A15Filter = (function(_super) {
  __extends(A15Filter, _super);

  function A15Filter() {
    return A15Filter.__super__.constructor.apply(this, arguments);
  }

  A15Filter.preview = '15.png';

  A15Filter.displayName = '15';

  A15Filter.prototype.apply = (new Contrast(A15Filter.app, {
    contrast: -0.37
  })).compose(Brightness, {
    brightness: 0.12
  }).compose(ToneCurve, {
    redControlPoints: [[0, 38 / 255], [94 / 255, 94 / 255], [148 / 255, 142 / 255], [175 / 255, 187 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [77 / 255, 53 / 255], [171 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 10 / 255], [48 / 255, 85 / 255], [174 / 255, 228 / 255], [1, 1]]
  });

  return A15Filter;

})(Filter);

module.exports = A15Filter;



},{"./filter.coffee":15,"./primitives/brightness.coffee":33,"./primitives/contrast.coffee":34,"./primitives/tonecurve.coffee":42}],9:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var BreezeFilter, Desaturation, Filter, ToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

BreezeFilter = (function(_super) {
  __extends(BreezeFilter, _super);

  function BreezeFilter() {
    return BreezeFilter.__super__.constructor.apply(this, arguments);
  }

  BreezeFilter.preview = "breeze.png";

  BreezeFilter.displayName = "Breeze";

  BreezeFilter.prototype.apply = (new Desaturation(BreezeFilter.app, {
    desaturation: 0.5
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 219 / 255], [234 / 255, 242 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [170 / 255, 168 / 255], [234 / 255, 231 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 208 / 255], [1, 1]]
  });

  return BreezeFilter;

})(Filter);

module.exports = BreezeFilter;



},{"./filter.coffee":15,"./primitives/desaturation.coffee":35,"./primitives/tonecurve.coffee":42}],10:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var BWFilter, Grayscale,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Grayscale = require("./primitives/grayscale.coffee");

BWFilter = (function(_super) {
  __extends(BWFilter, _super);

  function BWFilter() {
    return BWFilter.__super__.constructor.apply(this, arguments);
  }

  BWFilter.preview = 'bw.png';

  BWFilter.displayName = 'B&W';

  return BWFilter;

})(Grayscale);

module.exports = BWFilter;



},{"./primitives/grayscale.coffee":38}],11:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var BWHardFilter, Contrast, Filter, Grayscale,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Grayscale = require("./primitives/grayscale.coffee");

Contrast = require("./primitives/contrast.coffee");

BWHardFilter = (function(_super) {
  __extends(BWHardFilter, _super);

  function BWHardFilter() {
    return BWHardFilter.__super__.constructor.apply(this, arguments);
  }

  BWHardFilter.preview = '1920.png';

  BWHardFilter.displayName = '1920';

  BWHardFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.5
  });

  return BWHardFilter;

})(Filter);

module.exports = BWHardFilter;



},{"./filter.coffee":15,"./primitives/contrast.coffee":34,"./primitives/grayscale.coffee":38}],12:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var CelsiusFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

CelsiusFilter = (function(_super) {
  __extends(CelsiusFilter, _super);

  function CelsiusFilter() {
    return CelsiusFilter.__super__.constructor.apply(this, arguments);
  }

  CelsiusFilter.preview = 'celsius.png';

  CelsiusFilter.displayName = 'Celsius';

  CelsiusFilter.prototype.redControlPoints = [[0, 69 / 255], [55 / 255, 110 / 255], [202 / 255, 230 / 255], [1, 1]];

  CelsiusFilter.prototype.greenControlPoints = [[0, 44 / 255], [89 / 255, 93 / 255], [185 / 255, 141 / 255], [1, 189 / 255]];

  CelsiusFilter.prototype.blueControlPoints = [[0, 76 / 255], [39 / 255, 82 / 255], [218 / 255, 138 / 255], [1, 171 / 255]];

  return CelsiusFilter;

})(ToneCurve);

module.exports = CelsiusFilter;



},{"./primitives/tonecurve.coffee":42}],13:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var ChestFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

ChestFilter = (function(_super) {
  __extends(ChestFilter, _super);

  function ChestFilter() {
    return ChestFilter.__super__.constructor.apply(this, arguments);
  }

  ChestFilter.preview = 'chest.png';

  ChestFilter.displayName = 'Chest';

  ChestFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 44 / 255], [124 / 255, 143 / 255], [221 / 255, 204 / 255], [1, 1]];

  ChestFilter.prototype.greenControlPoints = [[0, 0], [130 / 255, 127 / 255], [213 / 255, 199 / 255], [1, 1]];

  ChestFilter.prototype.blueControlPoints = [[0, 0], [51 / 255, 52 / 255], [219 / 255, 204 / 255], [1, 1]];

  return ChestFilter;

})(ToneCurve);

module.exports = ChestFilter;



},{"./primitives/tonecurve.coffee":42}],14:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var DefaultFilter, IdentityFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentityFilter = require("./primitives/identity.coffee");

DefaultFilter = (function(_super) {
  __extends(DefaultFilter, _super);

  function DefaultFilter() {
    return DefaultFilter.__super__.constructor.apply(this, arguments);
  }

  DefaultFilter.preview = 'default.png';

  DefaultFilter.displayName = 'Default';

  return DefaultFilter;

})(IdentityFilter);

module.exports = DefaultFilter;



},{"./primitives/identity.coffee":39}],15:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, Operation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("../operation.coffee");

Filter = (function(_super) {
  __extends(Filter, _super);

  function Filter() {
    return Filter.__super__.constructor.apply(this, arguments);
  }

  Filter.preview = null;

  Filter.displayName = null;

  return Filter;

})(Operation);

module.exports = Filter;



},{"../operation.coffee":53}],16:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var FixieFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FixieFilter = (function(_super) {
  __extends(FixieFilter, _super);

  function FixieFilter() {
    return FixieFilter.__super__.constructor.apply(this, arguments);
  }

  FixieFilter.preview = 'fixie.png';

  FixieFilter.displayName = 'Fixie';

  FixieFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 28 / 255], [63 / 255, 48 / 255], [128 / 255, 132 / 255], [235 / 255, 248 / 255], [1, 1]];

  FixieFilter.prototype.greenControlPoints = [[0, 0], [20 / 255, 10 / 255], [60 / 255, 45 / 255], [190 / 255, 209 / 255], [211 / 255, 231 / 255], [1, 1]];

  FixieFilter.prototype.blueControlPoints = [[0, 31 / 255], [41 / 255, 62 / 255], [150 / 255, 142 / 255], [234 / 255, 212 / 255], [1, 224 / 255]];

  return FixieFilter;

})(ToneCurve);

module.exports = FixieFilter;



},{"./primitives/tonecurve.coffee":42}],17:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Contrast, Filter, FoodFilter, Saturation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Saturation = require("./primitives/saturation.coffee");

Contrast = require("./primitives/contrast.coffee");

FoodFilter = (function(_super) {
  __extends(FoodFilter, _super);

  function FoodFilter() {
    return FoodFilter.__super__.constructor.apply(this, arguments);
  }

  FoodFilter.preview = 'food.png';

  FoodFilter.displayName = 'Food';

  FoodFilter.prototype.apply = (new Saturation(FoodFilter.app, {
    saturation: 0.35
  })).compose(Contrast, {
    contrast: 0.1
  });

  return FoodFilter;

})(Filter);

module.exports = FoodFilter;



},{"./filter.coffee":15,"./primitives/contrast.coffee":34,"./primitives/saturation.coffee":40}],18:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var FridgeFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FridgeFilter = (function(_super) {
  __extends(FridgeFilter, _super);

  function FridgeFilter() {
    return FridgeFilter.__super__.constructor.apply(this, arguments);
  }

  FridgeFilter.preview = "fridge.png";

  FridgeFilter.displayName = "Fridge";

  FridgeFilter.prototype.redControlPoints = [[0, 9 / 255], [21 / 255, 11 / 255], [45 / 255, 24 / 255], [1, 220 / 255]];

  FridgeFilter.prototype.greenControlPoints = [[0, 12 / 255], [21 / 255, 21 / 255], [42 / 255, 42 / 255], [150 / 255, 150 / 255], [170 / 255, 173 / 255], [1, 210 / 255]];

  FridgeFilter.prototype.blueControlPoints = [[0, 28 / 255], [43 / 255, 72 / 255], [128 / 255, 185 / 255], [1, 220 / 255]];

  return FridgeFilter;

})(ToneCurve);

module.exports = FridgeFilter;



},{"./primitives/tonecurve.coffee":42}],19:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var FrontFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

FrontFilter = (function(_super) {
  __extends(FrontFilter, _super);

  function FrontFilter() {
    return FrontFilter.__super__.constructor.apply(this, arguments);
  }

  FrontFilter.preview = 'front.png';

  FrontFilter.displayName = 'Front';

  FrontFilter.prototype.redControlPoints = [[0, 65 / 255], [28 / 255, 67 / 255], [67 / 255, 113 / 255], [125 / 255, 183 / 255], [187 / 255, 217 / 255], [1, 229 / 255]];

  FrontFilter.prototype.greenControlPoints = [[0, 52 / 255], [42 / 255, 59 / 255], [104 / 255, 134 / 255], [169 / 255, 209 / 255], [1, 240 / 255]];

  FrontFilter.prototype.blueControlPoints = [[0, 52 / 255], [65 / 255, 68 / 255], [93 / 255, 104 / 255], [150 / 255, 153 / 255], [1, 198 / 255]];

  return FrontFilter;

})(ToneCurve);

module.exports = FrontFilter;



},{"./primitives/tonecurve.coffee":42}],20:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Contrast, Filter, GlamFilter, Grayscale, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Grayscale = require("./primitives/grayscale.coffee");

Contrast = require("./primitives/contrast.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

GlamFilter = (function(_super) {
  __extends(GlamFilter, _super);

  function GlamFilter() {
    return GlamFilter.__super__.constructor.apply(this, arguments);
  }

  GlamFilter.preview = 'glam.png';

  GlamFilter.displayName = 'Glam';

  GlamFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.1
  }).compose(ToneCurve, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [0.5, 0.5], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  });

  return GlamFilter;

})(Filter);

module.exports = GlamFilter;



},{"./filter.coffee":15,"./primitives/contrast.coffee":34,"./primitives/grayscale.coffee":38,"./primitives/tonecurve.coffee":42}],21:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Gobblin, GobblinFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Gobblin = require("./primitives/gobblin.coffee");

GobblinFilter = (function(_super) {
  __extends(GobblinFilter, _super);

  function GobblinFilter() {
    return GobblinFilter.__super__.constructor.apply(this, arguments);
  }

  GobblinFilter.preview = 'gobblin.png';

  GobblinFilter.displayName = 'Gobblin';

  return GobblinFilter;

})(Gobblin);

module.exports = GobblinFilter;



},{"./primitives/gobblin.coffee":37}],22:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, K1Filter, Saturation, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Saturation = require("./primitives/saturation.coffee");

K1Filter = (function(_super) {
  __extends(K1Filter, _super);

  function K1Filter() {
    return K1Filter.__super__.constructor.apply(this, arguments);
  }

  K1Filter.preview = 'k1.png';

  K1Filter.displayName = 'K1';

  K1Filter.prototype.apply = (new ToneCurve(K1Filter.app, {
    rgbControlPoints: [[0, 0], [53 / 255, 32 / 255], [91 / 255, 80 / 255], [176 / 255, 205 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.9
  });

  return K1Filter;

})(Filter);

module.exports = K1Filter;



},{"./filter.coffee":15,"./primitives/saturation.coffee":40,"./primitives/tonecurve.coffee":42}],23:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, K2Filter, SoftColorOverlay, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

SoftColorOverlay = require("./primitives/softcoloroverlay.coffee");

K2Filter = (function(_super) {
  __extends(K2Filter, _super);

  function K2Filter() {
    return K2Filter.__super__.constructor.apply(this, arguments);
  }

  K2Filter.preview = "k2.png";

  K2Filter.displayName = "K2";

  K2Filter.prototype.apply = (new ToneCurve(K2Filter.app, {
    rgbControlPoints: [[0, 0], [54 / 255, 33 / 255], [77 / 255, 82 / 255], [94 / 255, 103 / 255], [122 / 255, 126 / 255], [177 / 255, 193 / 255], [229 / 255, 232 / 255], [1, 1]]
  })).compose(SoftColorOverlay, {
    r: 40,
    g: 40,
    b: 40
  });

  return K2Filter;

})(Filter);

module.exports = K2Filter;



},{"./filter.coffee":15,"./primitives/softcoloroverlay.coffee":41,"./primitives/tonecurve.coffee":42}],24:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var K6Filter, SaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SaturationFilter = require("./primitives/saturation.coffee");

K6Filter = (function(_super) {
  __extends(K6Filter, _super);

  function K6Filter() {
    return K6Filter.__super__.constructor.apply(this, arguments);
  }

  K6Filter.preview = "k6.png";

  K6Filter.displayName = "K6";

  K6Filter.prototype.saturation = 0.5;

  return K6Filter;

})(SaturationFilter);

module.exports = K6Filter;



},{"./primitives/saturation.coffee":40}],25:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, KDynamicFilter, Saturation, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Saturation = require("./primitives/saturation.coffee");

KDynamicFilter = (function(_super) {
  __extends(KDynamicFilter, _super);

  function KDynamicFilter() {
    return KDynamicFilter.__super__.constructor.apply(this, arguments);
  }

  KDynamicFilter.preview = "kdynamic.png";

  KDynamicFilter.displayName = "KDynamic";

  KDynamicFilter.prototype.apply = (new ToneCurve(KDynamicFilter.app, {
    rgbControlPoints: [[0, 0], [17 / 255, 27 / 255], [46 / 255, 69 / 255], [90 / 255, 112 / 255], [156 / 255, 200 / 255], [203 / 255, 243 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.7
  });

  return KDynamicFilter;

})(Filter);

module.exports = KDynamicFilter;



},{"./filter.coffee":15,"./primitives/saturation.coffee":40,"./primitives/tonecurve.coffee":42}],26:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Desaturation, Filter, LeninFilter, ToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

LeninFilter = (function(_super) {
  __extends(LeninFilter, _super);

  function LeninFilter() {
    return LeninFilter.__super__.constructor.apply(this, arguments);
  }

  LeninFilter.preview = "lenin.png";

  LeninFilter.displayName = "Lenin";

  LeninFilter.prototype.apply = (new Desaturation(LeninFilter.app, {
    desaturation: 0.4
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [106 / 255, 111 / 255], [129 / 255, 153 / 255], [190 / 255, 223 / 255], [1, 1]],
    greenControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [62 / 255, 41 / 255], [106 / 255, 108 / 255], [132 / 255, 159 / 255], [203 / 255, 237 / 255], [1, 1]],
    blueControlPoints: [[0, 40 / 255], [40 / 255, 40 / 255], [73 / 255, 60 / 255], [133 / 255, 160 / 255], [191 / 255, 297 / 255], [203 / 255, 237 / 255], [237 / 255, 239 / 255], [1, 1]]
  });

  return LeninFilter;

})(Filter);

module.exports = LeninFilter;



},{"./filter.coffee":15,"./primitives/desaturation.coffee":35,"./primitives/tonecurve.coffee":42}],27:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var LomoFilter, ToneCurve, controlPoints,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

controlPoints = [[0, 0], [87 / 255, 20 / 255], [131 / 255, 156 / 255], [183 / 255, 205 / 255], [1, 183 / 208]];

LomoFilter = (function(_super) {
  __extends(LomoFilter, _super);

  function LomoFilter() {
    return LomoFilter.__super__.constructor.apply(this, arguments);
  }

  LomoFilter.preview = 'lomo.png';

  LomoFilter.displayName = 'Lomo';

  LomoFilter.prototype.redControlPoints = controlPoints;

  LomoFilter.prototype.greenControlPoints = controlPoints;

  LomoFilter.prototype.blueControlPoints = controlPoints;

  return LomoFilter;

})(ToneCurve);

module.exports = LomoFilter;



},{"./primitives/tonecurve.coffee":42}],28:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var MellowFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

MellowFilter = (function(_super) {
  __extends(MellowFilter, _super);

  function MellowFilter() {
    return MellowFilter.__super__.constructor.apply(this, arguments);
  }

  MellowFilter.preview = 'mellow.png';

  MellowFilter.displayName = 'Mellow';

  MellowFilter.prototype.redControlPoints = [[0, 0], [41 / 255, 84 / 255], [87 / 255, 134 / 255], [1, 1]];

  MellowFilter.prototype.greenControlPoints = [[0, 0], [1, 216 / 255]];

  MellowFilter.prototype.blueControlPoints = [[0, 0], [1, 131 / 255]];

  return MellowFilter;

})(ToneCurve);

module.exports = MellowFilter;



},{"./primitives/tonecurve.coffee":42}],29:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, Glow, MorningFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Glow = require("./primitives/glow.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

MorningFilter = (function(_super) {
  __extends(MorningFilter, _super);

  function MorningFilter() {
    return MorningFilter.__super__.constructor.apply(this, arguments);
  }

  MorningFilter.preview = 'morning.png';

  MorningFilter.displayName = 'Morning';

  MorningFilter.prototype.apply = (new ToneCurve(MorningFilter.app, {
    redControlPoints: [[0, 40 / 255], [1, 230 / 255]],
    greenControlPoints: [[0, 10 / 255], [1, 225 / 255]],
    blueControlPoints: [[0, 20 / 255], [1, 181 / 255]]
  })).compose(Glow);

  return MorningFilter;

})(Filter);

module.exports = MorningFilter;



},{"./filter.coffee":15,"./primitives/glow.coffee":36,"./primitives/tonecurve.coffee":42}],30:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Desaturation, Filter, OrchidFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

OrchidFilter = (function(_super) {
  __extends(OrchidFilter, _super);

  function OrchidFilter() {
    return OrchidFilter.__super__.constructor.apply(this, arguments);
  }

  OrchidFilter.preview = "orchid.png";

  OrchidFilter.displayName = "Orchid";

  OrchidFilter.prototype.apply = (new ToneCurve(OrchidFilter.app, {
    redControlPoints: [[0, 0], [115 / 255, 130 / 255], [195 / 255, 215 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [148 / 255, 153 / 255], [172 / 255, 215 / 255], [1, 1]],
    blueControlPoints: [[0, 46 / 255], [58 / 255, 75 / 255], [178 / 255, 205 / 255], [1, 1]]
  })).compose(ToneCurve, {
    rgbControlPoints: [[0, 0], [117 / 255, 151 / 255], [189 / 255, 217 / 255], [1, 1]]
  }).compose(Desaturation, {
    desaturation: 0.65
  });

  return OrchidFilter;

})(Filter);

module.exports = OrchidFilter;



},{"./filter.coffee":15,"./primitives/desaturation.coffee":35,"./primitives/tonecurve.coffee":42}],31:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Contrast, Filter, PolaFilter, Saturation, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Contrast = require("./primitives/contrast.coffee");

Saturation = require("./primitives/saturation.coffee");

PolaFilter = (function(_super) {
  __extends(PolaFilter, _super);

  function PolaFilter() {
    return PolaFilter.__super__.constructor.apply(this, arguments);
  }

  PolaFilter.preview = 'pola.png';

  PolaFilter.displayName = 'Pola';

  PolaFilter.prototype.apply = (new ToneCurve(PolaFilter.app, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [34 / 255, 34 / 255], [99 / 255, 76 / 255], [176 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return PolaFilter;

})(Filter);

module.exports = PolaFilter;



},{"./filter.coffee":15,"./primitives/contrast.coffee":34,"./primitives/saturation.coffee":40,"./primitives/tonecurve.coffee":42}],32:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Contrast, Filter, Pola669Filter, Saturation, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

Contrast = require("./primitives/contrast.coffee");

Saturation = require("./primitives/saturation.coffee");

Pola669Filter = (function(_super) {
  __extends(Pola669Filter, _super);

  function Pola669Filter() {
    return Pola669Filter.__super__.constructor.apply(this, arguments);
  }

  Pola669Filter.preview = 'pola669.png';

  Pola669Filter.displayName = 'Pola 669';

  Pola669Filter.prototype.apply = (new ToneCurve(Pola669Filter.app, {
    redControlPoints: [[0, 0], [56 / 255, 18 / 255], [196 / 255, 209 / 255], [1, 1]],
    greenControlPoints: [[0, 38 / 255], [71 / 255, 84 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [131 / 255, 133 / 255], [204 / 255, 211 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return Pola669Filter;

})(Filter);

module.exports = Pola669Filter;



},{"./filter.coffee":15,"./primitives/contrast.coffee":34,"./primitives/saturation.coffee":40,"./primitives/tonecurve.coffee":42}],33:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveBrightnessFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveBrightnessFilter = (function(_super) {
  __extends(PrimitiveBrightnessFilter, _super);

  function PrimitiveBrightnessFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveBrightnessFilter.__super__.constructor.apply(this, arguments);
    this.setBrightness(options.brightness);
  }

  PrimitiveBrightnessFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.min(imageData.data[index] + this.brightness * 255, 255);
        imageData.data[index + 1] = Math.min(imageData.data[index + 1] + this.brightness * 255, 255);
        imageData.data[index + 2] = Math.min(imageData.data[index + 2] + this.brightness * 255, 255);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveBrightnessFilter.prototype.setBrightness = function(brightness) {
    return this.brightness = typeof brightness === 'number' ? brightness : 0.0;
  };

  return PrimitiveBrightnessFilter;

})(Filter);

module.exports = PrimitiveBrightnessFilter;



},{"../filter.coffee":15}],34:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveContrastFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveContrastFilter = (function(_super) {
  __extends(PrimitiveContrastFilter, _super);

  function PrimitiveContrastFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveContrastFilter.__super__.constructor.apply(this, arguments);
    this.setContrast(options.contrast);
  }

  PrimitiveContrastFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        if (this.contrast > 0) {
          imageData.data[index] = (imageData.data[index] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 3] = 255;
        } else {
          imageData.data[index] = (imageData.data[index] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 3] = 255;
        }
      }
    }
    return imageData;
  };

  PrimitiveContrastFilter.prototype.setContrast = function(contrast) {
    return this.contrast = typeof contrast === 'number' ? contrast : 1.0;
  };

  return PrimitiveContrastFilter;

})(Filter);

module.exports = PrimitiveContrastFilter;



},{"../filter.coffee":15}],35:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveDesaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveDesaturationFilter = (function(_super) {
  __extends(PrimitiveDesaturationFilter, _super);

  function PrimitiveDesaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveDesaturationFilter.__super__.constructor.apply(this, arguments);
    if (this.desaturation == null) {
      this.desaturation = options != null ? options.desaturation : void 0;
    }
  }

  PrimitiveDesaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
        imageData.data[index] = luminance * (1 - this.desaturation) + (imageData.data[index] * this.desaturation);
        imageData.data[index + 1] = luminance * (1 - this.desaturation) + (imageData.data[index + 1] * this.desaturation);
        imageData.data[index + 2] = luminance * (1 - this.desaturation) + (imageData.data[index + 2] * this.desaturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveDesaturationFilter;

})(Filter);

module.exports = PrimitiveDesaturationFilter;



},{"../filter.coffee":15}],36:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveGlowFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveGlowFilter = (function(_super) {
  __extends(PrimitiveGlowFilter, _super);

  function PrimitiveGlowFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveGlowFilter.__super__.constructor.apply(this, arguments);
    this.setColorToAdd(options.r, options.g, options.b);
  }

  PrimitiveGlowFilter.prototype.apply = function(imageData) {
    var d, h, index, nx, ny, scalarX, scalarY, w, x, x01, y, y01, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        x01 = x / w;
        y01 = y / h;
        nx = (x01 - 0.5) / 0.75;
        ny = (y01 - 0.5) / 0.75;
        scalarX = nx * nx;
        scalarY = ny * ny;
        d = 1 - (scalarX + scalarY);
        d = Math.min(Math.max(d, 0.1), 1.0);
        imageData.data[index] = imageData.data[index] * (d * this.colorToAdd[0]);
        imageData.data[index + 1] = imageData.data[index + 1] * (d * this.colorToAdd[1]);
        imageData.data[index + 2] = imageData.data[index + 2] * (d * this.colorToAdd[2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveGlowFilter.prototype.setColorToAdd = function(r, g, b) {
    return this.colorToAdd = [typeof r === 'number' ? r : 1.0, typeof g === 'number' ? g : 1.0, typeof b === 'number' ? b : 1.0];
  };

  return PrimitiveGlowFilter;

})(Filter);

module.exports = PrimitiveGlowFilter;



},{"../filter.coffee":15}],37:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveGobblinFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveGobblinFilter = (function(_super) {
  __extends(PrimitiveGobblinFilter, _super);

  function PrimitiveGobblinFilter() {
    return PrimitiveGobblinFilter.__super__.constructor.apply(this, arguments);
  }

  PrimitiveGobblinFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index + 2] = imageData.data[index + 1] * 0.33;
        imageData.data[index] = imageData.data[index] * 0.6;
        imageData.data[index + 2] += imageData.data[index] * 0.33;
        imageData.data[index + 1] = imageData.data[index + 1] * 0.7;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveGobblinFilter;

})(Filter);

module.exports = PrimitiveGobblinFilter;



},{"../filter.coffee":15}],38:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimtiveGrayscaleFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimtiveGrayscaleFilter = (function(_super) {
  __extends(PrimtiveGrayscaleFilter, _super);

  function PrimtiveGrayscaleFilter() {
    return PrimtiveGrayscaleFilter.__super__.constructor.apply(this, arguments);
  }

  PrimtiveGrayscaleFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance;
        imageData.data[index + 1] = luminance;
        imageData.data[index + 2] = luminance;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimtiveGrayscaleFilter;

})(Filter);

module.exports = PrimtiveGrayscaleFilter;



},{"../filter.coffee":15}],39:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveIdentityFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveIdentityFilter = (function(_super) {
  __extends(PrimitiveIdentityFilter, _super);

  function PrimitiveIdentityFilter() {
    return PrimitiveIdentityFilter.__super__.constructor.apply(this, arguments);
  }

  PrimitiveIdentityFilter.prototype.apply = function(imageData) {
    return imageData;
  };

  return PrimitiveIdentityFilter;

})(Filter);

module.exports = PrimitiveIdentityFilter;



},{"../filter.coffee":15}],40:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveSaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveSaturationFilter = (function(_super) {
  __extends(PrimitiveSaturationFilter, _super);

  function PrimitiveSaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveSaturationFilter.__super__.constructor.apply(this, arguments);
    if (options.saturation != null) {
      this.setSaturation(options.saturation);
    }
  }

  PrimitiveSaturationFilter.prototype.setSaturation = function(saturation) {
    return this.saturation = typeof saturation === 'number' ? saturation + 1 : 1;
  };

  PrimitiveSaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance * (1 - this.saturation) + (imageData.data[index] * this.saturation);
        imageData.data[index + 1] = luminance * (1 - this.saturation) + (imageData.data[index + 1] * this.saturation);
        imageData.data[index + 2] = luminance * (1 - this.saturation) + (imageData.data[index + 2] * this.saturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSaturationFilter;

})(Filter);

module.exports = PrimitiveSaturationFilter;



},{"../filter.coffee":15}],41:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveSoftColorOverlayFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveSoftColorOverlayFilter = (function(_super) {
  __extends(PrimitiveSoftColorOverlayFilter, _super);

  function PrimitiveSoftColorOverlayFilter() {
    return PrimitiveSoftColorOverlayFilter.__super__.constructor.apply(this, arguments);
  }

  PrimitiveSoftColorOverlayFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.max(this.options.r, imageData.data[index]);
        imageData.data[index + 1] = Math.max(this.options.g, imageData.data[index + 1]);
        imageData.data[index + 2] = Math.max(this.options.b, imageData.data[index + 2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSoftColorOverlayFilter;

})(Filter);

module.exports = PrimitiveSoftColorOverlayFilter;



},{"../filter.coffee":15}],42:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveToneCurveFilter = (function(_super) {
  __extends(PrimitiveToneCurveFilter, _super);

  function PrimitiveToneCurveFilter(app, options) {
    var rgb;
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveToneCurveFilter.__super__.constructor.apply(this, arguments);
    if (this.rgbControlPoints || (options.rgbControlPoints != null)) {
      rgb = this.rgbControlPoints || options.rgbControlPoints;
      if (this.redControlPoints == null) {
        this.redControlPoints = rgb;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = rgb;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = rgb;
      }
    } else {
      if (this.redControlPoints == null) {
        this.redControlPoints = options.redControlPoints;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = options.greenControlPoints;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = options.blueControlPoints;
      }
    }
    if (this.redControlPoints && this.greenControlPoints && this.blueControlPoints) {
      this.updateToneCurveTexture();
    }
  }

  PrimitiveToneCurveFilter.prototype.render = function(context, w, h) {
    return context.putImageData(this.apply(context.getImageData(0, 0, w, h)), 0, 0);
  };

  PrimitiveToneCurveFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = imageData.data[index] + this.preparedRed[imageData.data[index]];
        imageData.data[index + 1] = imageData.data[index + 1] + this.preparedGreen[imageData.data[index + 1]];
        imageData.data[index + 2] = imageData.data[index + 2] + this.preparedBlue[imageData.data[index + 2]];
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveToneCurveFilter.prototype.updateToneCurveTexture = function() {
    this.preparedRed = this.getPreparedSplineCurve(this.redControlPoints);
    this.preparedBlue = this.getPreparedSplineCurve(this.blueControlPoints);
    return this.preparedGreen = this.getPreparedSplineCurve(this.greenControlPoints);
  };

  PrimitiveToneCurveFilter.prototype.getPreparedSplineCurve = function(points) {
    var convertedPoints, distance, firstSplinePoint, i, newPoint, origPoint, point, preparedSplinePoints, sortedPoints, splinePoints, _i, _j, _k, _len, _ref, _ref1;
    sortedPoints = points.sort(function(a, b) {
      var x1, x2;
      x1 = a[0];
      x2 = b[0];
      return x1 > x2;
    });
    convertedPoints = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      newPoint = [point[0] * 255, point[1] * 255];
      convertedPoints.push(newPoint);
    }
    splinePoints = this.splineCurve(convertedPoints);
    firstSplinePoint = splinePoints[0];
    if (firstSplinePoint[0] > 0) {
      for (i = _j = 0, _ref = firstSplinePoint[0]; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        splinePoints.unshift([0, 0]);
      }
    }
    preparedSplinePoints = [];
    for (i = _k = 0, _ref1 = splinePoints.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
      newPoint = splinePoints[i];
      origPoint = [newPoint[0], newPoint[0]];
      distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2));
      if (origPoint[1] > newPoint[1]) {
        distance = -distance;
      }
      preparedSplinePoints.push(distance);
    }
    return preparedSplinePoints;
  };

  PrimitiveToneCurveFilter.prototype.splineCurve = function(points) {
    var a, b, cur, h, i, n, next, output, sd, sdA, t, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    sdA = this.secondDerivative(points);
    n = sdA.length;
    sd = [];
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      sd[i] = sdA[i];
    }
    output = [];
    for (i = _j = 0, _ref = n - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
      cur = points[i];
      next = points[i + 1];
      for (x = _k = _ref1 = cur[0], _ref2 = next[0]; _ref1 <= _ref2 ? _k < _ref2 : _k > _ref2; x = _ref1 <= _ref2 ? ++_k : --_k) {
        t = (x - cur[0]) / (next[0] - cur[0]);
        a = 1 - t;
        b = t;
        h = next[0] - cur[0];
        y = a * cur[1] + b * next[1] + (h * h / 6) * ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]);
        if (y > 255) {
          y = 255;
        } else if (y < 0) {
          y = 0;
        }
        output.push([x, y]);
      }
    }
    if (output.length === 255) {
      output.push(points.pop());
    }
    return output;
  };

  PrimitiveToneCurveFilter.prototype.secondDerivative = function(points) {
    var P1, P2, P3, i, k, matrix, n, result, y2, _i, _j, _k, _l, _ref, _ref1;
    n = points.length;
    if (n <= 0 || n === 1) {
      return null;
    }
    matrix = [];
    result = [];
    matrix[0] = [0, 1, 0];
    for (i = _i = 1, _ref = n - 1; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
      P1 = points[i - 1];
      P2 = points[i];
      P3 = points[i + 1];
      if (matrix[i] == null) {
        matrix[i] = [];
      }
      matrix[i][0] = (P2[0] - P1[0]) / 6;
      matrix[i][1] = (P3[0] - P1[0]) / 3;
      matrix[i][2] = (P3[0] - P2[0]) / 6;
      result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0]);
    }
    result[0] = 0;
    result[n - 1] = 0;
    matrix[n - 1] = [0, 1, 0];
    for (i = _j = 1; 1 <= n ? _j < n : _j > n; i = 1 <= n ? ++_j : --_j) {
      k = matrix[1][0] / matrix[i - 1][1];
      matrix[i][1] -= k * matrix[i - 1][2];
      matrix[i][0] = 0;
      result[i] -= k * result[i - 1];
    }
    for (i = _k = _ref1 = n - 2; _ref1 <= 0 ? _k < 0 : _k > 0; i = _ref1 <= 0 ? ++_k : --_k) {
      k = matrix[i][2] / matrix[i + 1][1];
      matrix[i][1] -= k * matrix[i + 1][0];
      matrix[i][2] = 0;
      result[i] -= k * result[i + 1];
    }
    y2 = [];
    for (i = _l = 0; 0 <= n ? _l < n : _l > n; i = 0 <= n ? ++_l : --_l) {
      y2[i] = result[i] / matrix[i][1];
    }
    return y2;
  };

  PrimitiveToneCurveFilter.prototype.setRedControlPoints = function(controlPoints) {
    return this.redControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setGreenControlPoints = function(controlPoints) {
    return this.greenControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setBlueControlPoints = function(controlPoints) {
    return this.blueControlPoints = controlPoints;
  };

  return PrimitiveToneCurveFilter;

})(Filter);

module.exports = PrimitiveToneCurveFilter;



},{"../filter.coffee":15}],43:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, PrimitiveX400Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

PrimitiveX400Filter = (function(_super) {
  __extends(PrimitiveX400Filter, _super);

  function PrimitiveX400Filter() {
    return PrimitiveX400Filter.__super__.constructor.apply(this, arguments);
  }

  PrimitiveX400Filter.prototype.apply = function(imageData) {
    var gray, h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
        gray -= 0.2;
        gray = Math.max(0.0, Math.min(1.0, gray));
        gray += 0.15;
        gray *= 1.4;
        gray *= 255;
        imageData.data[index] = gray;
        imageData.data[index + 1] = gray;
        imageData.data[index + 2] = gray;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveX400Filter;

})(Filter);

module.exports = PrimitiveX400Filter;



},{"../filter.coffee":15}],44:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Desaturation, Filter, QuoziFilter, ToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurveFilter = require("./primitives/tonecurve.coffee");

Desaturation = require("./primitives/desaturation.coffee");

QuoziFilter = (function(_super) {
  __extends(QuoziFilter, _super);

  function QuoziFilter() {
    return QuoziFilter.__super__.constructor.apply(this, arguments);
  }

  QuoziFilter.preview = "breeze.png";

  QuoziFilter.displayName = "Breeze";

  QuoziFilter.prototype.apply = (new Desaturation(QuoziFilter.app, {
    desaturation: 0.65
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 50 / 255], [40 / 255, 78 / 255], [118 / 255, 170 / 255], [181 / 255, 211 / 255], [1, 1]],
    greenControlPoints: [[0, 27 / 255], [28 / 255, 45 / 255], [109 / 255, 157 / 255], [157 / 255, 195 / 255], [179 / 255, 208 / 255], [206 / 255, 212 / 255], [1, 240 / 255]],
    blueControlPoints: [[0, 50 / 255], [12 / 255, 55 / 255], [46 / 255, 103 / 255], [103 / 255, 162 / 255], [194 / 255, 182 / 255], [241 / 255, 201 / 255], [1, 219 / 255]]
  });

  return QuoziFilter;

})(Filter);

module.exports = QuoziFilter;



},{"./filter.coffee":15,"./primitives/desaturation.coffee":35,"./primitives/tonecurve.coffee":42}],45:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, Glow, SemiRedFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

Glow = require("./primitives/glow.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

SemiRedFilter = (function(_super) {
  __extends(SemiRedFilter, _super);

  function SemiRedFilter() {
    return SemiRedFilter.__super__.constructor.apply(this, arguments);
  }

  SemiRedFilter.preview = 'semired.png';

  SemiRedFilter.displayName = 'SemiRed';

  SemiRedFilter.prototype.apply = (new ToneCurve(SemiRedFilter.app, {
    redControlPoints: [[0, 129 / 255], [75 / 255, 153 / 255], [181 / 255, 227 / 255], [1, 1]],
    greenControlPoints: [[0, 8 / 255], [111 / 255, 85 / 255], [212 / 255, 158 / 255], [1, 226 / 255]],
    blueControlPoints: [[0, 5 / 255], [75 / 255, 22 / 255], [193 / 255, 90 / 255], [1, 229 / 255]]
  })).compose(Glow);

  return SemiRedFilter;

})(Filter);

module.exports = SemiRedFilter;



},{"./filter.coffee":15,"./primitives/glow.coffee":36,"./primitives/tonecurve.coffee":42}],46:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, SunnyFilter, ToneCurve, contrastPoints,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filter.coffee");

ToneCurve = require("./primitives/tonecurve.coffee");

contrastPoints = [[0, 0], [55 / 255, 20 / 255], [158 / 255, 191 / 255], [1, 1]];

SunnyFilter = (function(_super) {
  __extends(SunnyFilter, _super);

  function SunnyFilter() {
    return SunnyFilter.__super__.constructor.apply(this, arguments);
  }

  SunnyFilter.preview = 'sunny.png';

  SunnyFilter.displayName = 'Sunny';

  SunnyFilter.prototype.apply = (new ToneCurve(SunnyFilter.app, {
    redControlPoints: [[0, 0], [62 / 255, 82 / 255], [141 / 255, 154 / 255], [1, 1]],
    greenControlPoints: [[0, 39 / 255], [56 / 255, 96 / 255], [192 / 255, 176 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [174 / 255, 99 / 255], [1, 235 / 255]]
  })).compose(ToneCurve, {
    redControlPoints: contrastPoints,
    greenControlPoints: contrastPoints,
    blueControlPoints: contrastPoints
  });

  return SunnyFilter;

})(Filter);

module.exports = SunnyFilter;



},{"./filter.coffee":15,"./primitives/tonecurve.coffee":42}],47:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var TexasFilter, ToneCurve,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("./primitives/tonecurve.coffee");

TexasFilter = (function(_super) {
  __extends(TexasFilter, _super);

  function TexasFilter() {
    return TexasFilter.__super__.constructor.apply(this, arguments);
  }

  TexasFilter.preview = 'texas.png';

  TexasFilter.displayName = 'Texas';

  TexasFilter.prototype.redControlPoints = [[0, 72 / 255], [89 / 255, 99 / 255], [176 / 255, 212 / 255], [1, 237 / 255]];

  TexasFilter.prototype.greenControlPoints = [[0, 49 / 255], [1, 192 / 255]];

  TexasFilter.prototype.blueControlPoints = [[0, 72 / 255], [1, 151 / 255]];

  return TexasFilter;

})(ToneCurve);

module.exports = TexasFilter;



},{"./primitives/tonecurve.coffee":42}],48:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var X400Filter, x400,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

x400 = require("./primitives/x400.coffee");

X400Filter = (function(_super) {
  __extends(X400Filter, _super);

  function X400Filter() {
    return X400Filter.__super__.constructor.apply(this, arguments);
  }

  X400Filter.preview = 'x400.png';

  X400Filter.displayName = 'X400';

  return X400Filter;

})(x400);

module.exports = X400Filter;



},{"./primitives/x400.coffee":43}],49:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */

/*
  Helpers for the Stack Blur
 */
var BlurStack, Focus, Operation, Utils, mul_table, shg_table,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BlurStack = (function() {
  function BlurStack() {}

  BlurStack.r = 0;

  BlurStack.g = 0;

  BlurStack.b = 0;

  BlurStack.a = 0;

  BlurStack.next = null;

  return BlurStack;

})();

mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

Operation = require("../operation.coffee");

Utils = require("../../utils.coffee");

Focus = (function(_super) {
  __extends(Focus, _super);

  Focus.prototype.cache = null;

  Focus.prototype.fingerprint = null;


  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
   */

  function Focus(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    Focus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 1;
    }
  }

  Focus.prototype.apply = function(imageData) {
    var alpha, fingerprint, index, maskImageData, _i, _ref;
    fingerprint = Utils.fingerprint(imageData.data);
    if (fingerprint !== this.fingerprint) {
      this.cache = this.blur(Utils.cloneImageData(imageData));
      this.fingerprint = fingerprint;
    }
    maskImageData = this.createMaskImageData(imageData);
    for (index = _i = 0, _ref = imageData.data.length; _i < _ref; index = _i += 4) {
      alpha = maskImageData.data[index] / 255;
      imageData.data[index] = alpha * imageData.data[index] + (1 - alpha) * this.cache.data[index];
      imageData.data[index + 1] = alpha * imageData.data[index + 1] + (1 - alpha) * this.cache.data[index + 1];
      imageData.data[index + 2] = alpha * imageData.data[index + 2] + (1 - alpha) * this.cache.data[index + 2];
      imageData.data[index + 3] = 255;
    }
    return imageData;
  };


  /*
    @param {ImageData} originalImageData
    @returns {ImageData}
   */

  Focus.prototype.createMaskImageData = function(originalImageData) {
    var canvas, context;
    canvas = Utils.newCanvasWithDimensions({
      width: originalImageData.width,
      height: originalImageData.height
    });
    context = canvas.getContext("2d");
    this.drawMask(canvas, context);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };


  /*
    Uses quasimondo's StackBlur algorithm to blur
    the image
  
    @param {ImageData} imageData
    @returns {ImageData}
   */

  Focus.prototype.blur = function(imageData) {
    var b_in_sum, b_out_sum, b_sum, div, g_in_sum, g_out_sum, g_sum, height, heightMinus1, i, mul_sum, p, pb, pg, pixels, pr, r_in_sum, r_out_sum, r_sum, radius, radiusPlus1, rbs, shg_sum, stack, stackEnd, stackIn, stackOut, stackStart, sumFactor, w4, width, widthMinus1, x, y, yi, yp, yw, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    radius = this.options.radius;
    width = imageData.width;
    height = imageData.height;
    pixels = imageData.data;
    div = radius + radius + 1;
    w4 = width << 2;
    widthMinus1 = width - 1;
    heightMinus1 = height - 1;
    radiusPlus1 = radius + 1;
    sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
    stackStart = new BlurStack();
    stack = stackStart;
    for (i = _i = 1; 1 <= div ? _i < div : _i > div; i = 1 <= div ? ++_i : --_i) {
      stack = stack.next = new BlurStack();
      if (i === radiusPlus1) {
        stackEnd = stack;
      }
    }
    stack.next = stackStart;
    stackIn = null;
    stackOut = null;
    yw = yi = 0;
    mul_sum = mul_table[radius];
    shg_sum = shg_table[radius];
    for (y = _j = 0; 0 <= height ? _j < height : _j > height; y = 0 <= height ? ++_j : --_j) {
      r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _k = 0; 0 <= radiusPlus1 ? _k < radiusPlus1 : _k > radiusPlus1; i = 0 <= radiusPlus1 ? ++_k : --_k) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      for (i = _l = 1; 1 <= radiusPlus1 ? _l < radiusPlus1 : _l > radiusPlus1; i = 1 <= radiusPlus1 ? ++_l : --_l) {
        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
        r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
      }
      stackIn = stackStart;
      stackOut = stackEnd;
      for (x = _m = 0; 0 <= width ? _m < width : _m > width; x = 0 <= width ? ++_m : --_m) {
        pixels[yi] = (r_sum * mul_sum) >> shg_sum;
        pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
        r_in_sum += (stackIn.r = pixels[p]);
        g_in_sum += (stackIn.g = pixels[p + 1]);
        b_in_sum += (stackIn.b = pixels[p + 2]);
        r_sum += r_in_sum;
        g_sum += g_in_sum;
        b_sum += b_in_sum;
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += 4;
      }
      yw += width;
    }
    for (x = _n = 0; 0 <= width ? _n < width : _n > width; x = 0 <= width ? ++_n : --_n) {
      g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
      yi = x << 2;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _o = 0; 0 <= radiusPlus1 ? _o < radiusPlus1 : _o > radiusPlus1; i = 0 <= radiusPlus1 ? ++_o : --_o) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      yp = width;
      for (i = _p = 1; 1 <= radius ? _p <= radius : _p >= radius; i = 1 <= radius ? ++_p : --_p) {
        yi = (yp + x) << 2;
        r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
        if (i < heightMinus1) {
          yp += width;
        }
      }
      yi = x;
      stackIn = stackStart;
      stackOut = stackEnd;
      for (y = _q = 0; 0 <= height ? _q < height : _q > height; y = 0 <= height ? ++_q : --_q) {
        p = yi << 2;
        pixels[p] = (r_sum * mul_sum) >> shg_sum;
        pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
        r_sum += (r_in_sum += (stackIn.r = pixels[p]));
        g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
        b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += width;
      }
    }
    return imageData;
  };

  return Focus;

})(Operation);

module.exports = Focus;



},{"../../utils.coffee":77,"../operation.coffee":53}],50:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Focus, LinearFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("./focus.coffee");

Vector2 = require("../../math/vector2.coffee");

LinearFocus = (function(_super) {
  __extends(LinearFocus, _super);


  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
   */

  function LinearFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    LinearFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }


  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
   */

  LinearFocus.prototype.drawMask = function(canvas, context) {

    /*
      Multiply the control points with the canvas
      size to get real pixel information
     */
    var controlPoint1, controlPoint2, end, gradient, halfDiff, start;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);

    /*
      Calculate the difference between the two points
      and divide it by two
     */
    halfDiff = new Vector2().copy(controlPoint2).subtract(controlPoint1).divide(2);

    /*
      Calculate start and end of the gradient
      We want the gradient to start 50% before
      and 50% after the control points, so that
      the gradient is outside of our control points
     */
    start = new Vector2().copy(controlPoint1).subtract(halfDiff);
    end = new Vector2().copy(controlPoint2).add(halfDiff);

    /*
      Finally draw the gradient
     */
    gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.25, '#FFFFFF');
    gradient.addColorStop(0.75, '#FFFFFF');
    gradient.addColorStop(1, '#000000');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return LinearFocus;

})(Focus);

module.exports = LinearFocus;



},{"../../math/vector2.coffee":3,"./focus.coffee":49}],51:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Focus, RadialFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("./focus.coffee");

Vector2 = require("../../math/vector2.coffee");

RadialFocus = (function(_super) {
  __extends(RadialFocus, _super);


  /*
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
   */

  function RadialFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    RadialFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }


  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
   */

  RadialFocus.prototype.drawMask = function(canvas, context) {

    /*
      Multiply the control points with the canvas
      size to get real pixel information
     */
    var center, controlPoint1, controlPoint2, gradient, halfDiff, innerRadius, outerRadius;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);

    /*
      Calculate the difference between the two points
      and divide it by two
     */
    halfDiff = new Vector2().copy(controlPoint2).subtract(controlPoint1).divide(2);

    /*
      The of the circle is the center of the two points
     */
    center = new Vector2().copy(controlPoint1).add(halfDiff);
    innerRadius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    outerRadius = innerRadius * 3 / 2;

    /*
      Finally draw the gradient
     */
    gradient = context.createRadialGradient(center.x, center.y, outerRadius, center.x, center.y, innerRadius);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#FFFFFF');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return RadialFocus;

})(Focus);

module.exports = RadialFocus;



},{"../../math/vector2.coffee":3,"./focus.coffee":49}],52:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var FramesOperation, Operation, Queue, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Queue = require("../vendor/queue.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

FramesOperation = (function(_super) {
  __extends(FramesOperation, _super);

  FramesOperation.prototype.renderPreview = true;

  function FramesOperation(app, options) {
    var _base, _base1;
    this.app = app;
    this.options = options != null ? options : {};
    FramesOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).frame == null) {
      _base.frame = "black";
    }
    if ((_base1 = this.options).scale == null) {
      _base1.scale = 0.1;
    }
  }


  /*
    @param {Integer} frame
    @param {Float} scale
   */

  FramesOperation.prototype.setFrameOptions = function(frame, scale) {
    this.options.frame = frame;
    return this.options.scale = scale;
  };


  /*
    @param {ImageData} imageData
    @returns {ImageData}
   */

  FramesOperation.prototype.apply = function(imageData) {
    return Queue.promise((function(_this) {
      return function(resolve, reject) {
        var frameImage;
        frameImage = new Image();
        frameImage.onload = function() {
          return resolve(frameImage);
        };
        return frameImage.src = _this.app.buildAssetsPath("frames/" + _this.options.frame + ".png");
      };
    })(this)).then((function(_this) {
      return function(frameImage) {
        var bottomHeight, canvas, context, frameCanvas, height, i, leftWidth, lowerHeight, maxHeight, originalHeight, originalWidth, repeatCount, rightWidth, scaledMaxHeight, topHeight, upperHeight, width, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref;
        _ref = _this.analyzeFrameImage(frameImage), xRepeatAreaStart = _ref.xRepeatAreaStart, xRepeatAreaEnd = _ref.xRepeatAreaEnd, xRepeatMode = _ref.xRepeatMode, yRepeatAreaStart = _ref.yRepeatAreaStart, yRepeatAreaEnd = _ref.yRepeatAreaEnd, yRepeatMode = _ref.yRepeatMode, frameCanvas = _ref.frameCanvas;

        /*
          Create a canvas and a drawing context out of
          the image data
         */
        canvas = Utils.newCanvasFromImageData(imageData);
        context = canvas.getContext("2d");
        upperHeight = yRepeatAreaStart;
        lowerHeight = frameCanvas.height - yRepeatAreaEnd;
        maxHeight = Math.max(lowerHeight, upperHeight);
        scaledMaxHeight = imageData.height * _this.options.scale;
        leftWidth = Math.round(xRepeatAreaStart * (scaledMaxHeight / maxHeight));
        topHeight = Math.round(scaledMaxHeight * (maxHeight / upperHeight));
        rightWidth = Math.round((frameCanvas.width - xRepeatAreaEnd) * (scaledMaxHeight / maxHeight));
        bottomHeight = Math.round(scaledMaxHeight * (maxHeight / lowerHeight));

        /*
          Draw corners
         */
        context.drawImage(frameCanvas, 0, 0, xRepeatAreaStart, yRepeatAreaStart, 0, 0, leftWidth, topHeight);
        context.drawImage(frameCanvas, xRepeatAreaEnd, 0, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaStart, imageData.width - rightWidth, 0, rightWidth, topHeight);
        context.drawImage(frameCanvas, 0, yRepeatAreaEnd, xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, 0, imageData.height - bottomHeight, leftWidth, bottomHeight);
        context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaEnd, frameCanvas.width - xRepeatAreaEnd, frameCanvas.height - yRepeatAreaEnd, imageData.width - rightWidth, imageData.height - bottomHeight, rightWidth, bottomHeight);

        /*
          Draw edges
         */
        if (xRepeatMode === "stretch") {
          context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth, 0, imageData.width - leftWidth - rightWidth, topHeight);
          context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth, imageData.height - bottomHeight, imageData.width - leftWidth - rightWidth, bottomHeight);
        } else if (xRepeatMode === "repeat") {
          originalWidth = xRepeatAreaEnd - xRepeatAreaStart;
          originalHeight = yRepeatAreaStart;
          height = topHeight;
          width = Math.round(height * (originalWidth / originalHeight));
          repeatCount = Math.ceil(imageData.width / width);
          for (i = _i = 0; 0 <= repeatCount ? _i < repeatCount : _i > repeatCount; i = 0 <= repeatCount ? ++_i : --_i) {
            context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth + i * width, 0, width, height);
          }
          originalHeight = frameCanvas.height - yRepeatAreaEnd;
          height = bottomHeight;
          width = Math.round(bottomHeight * (originalWidth / originalHeight));
          for (i = _j = 0; 0 <= repeatCount ? _j < repeatCount : _j > repeatCount; i = 0 <= repeatCount ? ++_j : --_j) {
            context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth + i * width, imageData.height - bottomHeight, width, height);
          }
        }
        if (yRepeatMode === "stretch") {
          context.drawImage(frameCanvas, 0, yRepeatAreaStart, xRepeatAreaStart, yRepeatAreaEnd - yRepeatAreaStart, 0, topHeight, leftWidth, imageData.height - topHeight - bottomHeight);
          context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaStart, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaEnd - yRepeatAreaStart, imageData.width - rightWidth, topHeight, rightWidth, imageData.height - topHeight - bottomHeight);
        }
        return context.getImageData(0, 0, imageData.width, imageData.height);
      };
    })(this));
  };

  FramesOperation.prototype.analyzeFrameImage = function(frameImage) {
    var a, b, canvas, context, frameImageData, g, index, r, x, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, y, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref, _ref1;
    frameImageData = Utils.getImageDataForImage(frameImage);
    xRepeatAreaStart = null;
    xRepeatAreaEnd = null;
    xRepeatMode = null;
    for (x = _i = 0, _ref = frameImageData.width; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      index = x * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "repeat";
      }
      if (a !== 255 && (xRepeatAreaStart != null) && (xRepeatAreaEnd == null)) {
        xRepeatAreaEnd = x - 1;
      }
    }
    yRepeatAreaStart = null;
    yRepeatAreaEnd = null;
    yRepeatMode = null;
    for (y = _j = 0, _ref1 = frameImageData.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
      index = (frameImageData.width * y) * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "repeat";
      }
      if (a !== 255 && (yRepeatAreaStart != null) && (yRepeatAreaEnd == null)) {
        yRepeatAreaEnd = y - 1;
      }
    }
    canvas = Utils.newCanvasWithDimensions({
      width: frameImage.width - 1,
      height: frameImage.height - 1
    });
    context = canvas.getContext("2d");
    context.putImageData(frameImageData, -1, -1);
    return {
      xRepeatAreaStart: xRepeatAreaStart,
      xRepeatAreaEnd: xRepeatAreaEnd,
      xRepeatMode: xRepeatMode,
      yRepeatAreaStart: yRepeatAreaStart,
      yRepeatAreaEnd: yRepeatAreaEnd,
      yRepeatMode: yRepeatMode,
      frameCanvas: canvas
    };
  };

  return FramesOperation;

})(Operation);

module.exports = FramesOperation;



},{"../math/rect.coffee":2,"../math/vector2.coffee":3,"../utils.coffee":77,"../vendor/queue.coffee":79,"./operation.coffee":53}],53:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var EventEmitter, Operation, Queue, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Queue = require("../vendor/queue.coffee");

Utils = require("../utils.coffee");

EventEmitter = require("events").EventEmitter;

Operation = (function(_super) {
  var buildComposition;

  __extends(Operation, _super);

  Operation.prototype.renderPreview = true;


  /*
    @param {ImglyKit} app
    @param {Object} options
   */

  function Operation(app, options) {
    var apply;
    this.app = app;
    this.options = options != null ? options : {};
    this.cachedImageData = null;
    apply = this.apply;
    this.apply = function(dataOrPromise) {
      return Queue(dataOrPromise).then((function(_this) {
        return function(imageData) {
          return apply.call(_this, imageData);
        };
      })(this));
    };
  }


  /*
    @param {CanvasRenderingContext2d} context
   */

  Operation.prototype.setContext = function(context) {
    this.context = context;
  };


  /*
    @param {Object} options
   */

  Operation.prototype.setOptions = function(options) {
    var key, val;
    for (key in options) {
      val = options[key];
      this.options[key] = val;
    }
    return this.emit("updateOptions", options);
  };


  /*
    Caches the given image data
   */

  Operation.prototype.cacheImageData = function(imageData) {
    if (imageData == null) {
      return;
    }
    return this.cachedImageData = Utils.cloneImageData(imageData);
  };


  /*
    Invalidates the cached image data so it can be removed from memory
    by the garbage collection
   */

  Operation.prototype.invalidateCache = function() {
    return this.cachedImageData = null;
  };


  /*
    Checks whether this operation has a cached copy of the image data
   */

  Operation.prototype.hasCache = function() {
    return !!this.cachedImageData;
  };


  /*
    This applies this operation to the image in the editor. However, it is not
    responsible for storing the result in any way. It receives imageData and
    returns a modified version.
    @param {ImageData} imageData
    @param {Function} callback
    @returns {ImageData}
   */

  Operation.prototype.apply = function() {
    throw Error("Abstract: Filter#apply");
  };

  buildComposition = function(direction, filter, args) {
    var composition, self;
    if (args == null) {
      args = [];
    }
    self = this;
    if (filter.prototype instanceof Operation) {
      filter = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(filter, [this.app].concat(__slice.call(args)), function(){});
    }
    composition = direction === "pre" ? function(imageData) {
      return self.apply(filter.apply(imageData || this));
    } : direction === "post" ? function(imageData) {
      return filter.apply(self.apply(imageData || this));
    } : void 0;
    composition.compose = Operation.prototype.compose;
    composition.precompose = Operation.prototype.precompose;
    composition.filter = filter;
    return composition;
  };


  /*
    @param {Operation} filter
    @returns {Function}
   */

  Operation.prototype.compose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "post", filter, args);
  };


  /*
    @param {Operation} filter
    @returns {Function}
   */

  Operation.prototype.precompose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "pre", filter, args);
  };

  return Operation;

})(EventEmitter);

module.exports = Operation;



},{"../utils.coffee":77,"../vendor/queue.coffee":79,"events":82}],54:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Operation, OrientationOperation, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

OrientationOperation = (function(_super) {
  __extends(OrientationOperation, _super);


  /*
    @param {ImglyKit} app
    @param {Object} options
   */

  function OrientationOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    OrientationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).rotation == null) {
      _base.rotation = 0;
    }
    if ((_base1 = this.options).flipVertically == null) {
      _base1.flipVertically = false;
    }
    if ((_base2 = this.options).flipHorizontally == null) {
      _base2.flipHorizontally = false;
    }
  }

  OrientationOperation.prototype.flipVertically = function() {
    return this.options.flipVertically = !this.options.flipVertically;
  };

  OrientationOperation.prototype.flipHorizontally = function() {
    return this.options.flipHorizontally = !this.options.flipHorizontally;
  };

  OrientationOperation.prototype.rotateRight = function() {
    this.options.rotation += 90;
    if (this.options.rotation === 360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.rotateLeft = function() {
    this.options.rotation -= 90;
    if (this.options.rotation === -360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.apply = function(imageData) {
    var canvas, context, flipped, h, rotated, w;
    if (Math.abs(this.options.rotation) === 90 || Math.abs(this.options.rotation) === 270) {
      w = imageData.height;
      h = imageData.width;
    } else {
      w = imageData.width;
      h = imageData.height;
    }
    canvas = Utils.newCanvasWithDimensions({
      width: w,
      height: h
    });
    context = canvas.getContext("2d");
    rotated = false;
    flipped = false;
    if (this.options.rotation !== 0) {
      imageData = this.rotateImageData(context, imageData);
      rotated = true;
    }
    if (this.options.flipHorizontally || this.options.flipVertically) {
      imageData = this.flipImageData(context, imageData);
      flipped = true;
    }
    if (rotated || flipped) {
      return context.getImageData(0, 0, w, h);
    } else {
      return imageData;
    }
  };


  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
   */

  OrientationOperation.prototype.flipImageData = function(context, imageData) {
    var imageDataCanvas, scaleX, scaleY, translateX, translateY;
    context.save();
    scaleX = 1;
    scaleY = 1;
    translateX = 0;
    translateY = 0;
    if (this.options.flipHorizontally) {
      scaleX = -1;
      translateX = context.canvas.width;
    }
    if (this.options.flipVertically) {
      scaleY = -1;
      translateY = context.canvas.height;
    }
    context.translate(translateX, translateY);
    context.scale(scaleX, scaleY);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, 0, 0);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };


  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
   */

  OrientationOperation.prototype.rotateImageData = function(context, imageData) {
    var imageDataCanvas;
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.rotate(this.options.rotation * (Math.PI / 180));
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, -imageData.width / 2, -imageData.height / 2);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };

  return OrientationOperation;

})(Operation);

module.exports = OrientationOperation;



},{"../utils.coffee":77,"./operation.coffee":53}],55:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Filter, Saturation, SaturationOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("./filters/filter.coffee");

Saturation = require("./filters/primitives/saturation.coffee");

SaturationOperation = (function(_super) {
  __extends(SaturationOperation, _super);


  /*
    @param {ImglyKit} app
    @param {Object} options
   */

  function SaturationOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    SaturationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Saturation(this.app, {
      saturation: this.options.amount
    });
  }

  SaturationOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };


  /*
    @param {Integer} saturation
   */

  SaturationOperation.prototype.setSaturation = function(saturation) {
    this.options.amount = saturation;
    return this.filter.setSaturation(saturation);
  };

  return SaturationOperation;

})(Filter);

module.exports = SaturationOperation;



},{"./filters/filter.coffee":15,"./filters/primitives/saturation.coffee":40}],56:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var CropOperation, SocialNetworkResizeOperation, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

CropOperation = require("./crop.coffee");

SocialNetworkResizeOperation = (function(_super) {
  __extends(SocialNetworkResizeOperation, _super);

  function SocialNetworkResizeOperation() {
    return SocialNetworkResizeOperation.__super__.constructor.apply(this, arguments);
  }

  SocialNetworkResizeOperation.prototype.calculateRatio = function(size) {
    switch (size) {
      case "facebook":
        this.options.ratio = 4 / 3;
        break;
      case "twitter":
        this.options.ratio = 2 / 1;
        break;
      case "linkedin":
        this.options.ratio = 18 / 11;
        break;
      case "instagram":
        this.options.ratio = 1 / 1;
        break;
      case "pinterest":
        this.options.ratio = 1 / 1;
    }
  };

  return SocialNetworkResizeOperation;

})(CropOperation);

module.exports = SocialNetworkResizeOperation;



},{"../math/vector2.coffee":3,"../utils.coffee":77,"./crop.coffee":6}],57:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var FontOperation, Operation, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

FontOperation = (function(_super) {
  __extends(FontOperation, _super);

  FontOperation.prototype.renderPreview = false;

  function FontOperation(app, options) {
    this.app = app;
    this.options = options != null ? options : {};
    FontOperation.__super__.constructor.apply(this, arguments);
    this.options.start = new Vector2(0.2, 0.2);
    this.options.width = 300;
    this.options.font = "Helvetica";
    this.options.text = "Text";
    this.options.color = "rgba(255, 255, 255, 1.0)";
    this.options.backgroundColor = "rgba(0, 0, 0, 0.5)";
    this.options.fontSize = 0.1;
    this.options.lineHeight = 1.1;
    this.options.paddingLeft = 0;
    this.options.paddingTop = 0;
  }


  /*
    @param {String} font
   */

  FontOperation.prototype.setFont = function(font) {
    this.options.font = font;
    return this.emit("updateOptions", this.options);
  };

  FontOperation.prototype.apply = function(imageData) {
    var boundingBoxHeight, boundingBoxWidth, canvas, context, line, lineHeight, lineNum, lineOffset, lineWidth, padding, paddingVector, scaledFontSize, scaledStart, _i, _j, _len, _len1, _ref, _ref1;
    scaledFontSize = this.options.fontSize * imageData.height;
    paddingVector = new Vector2(this.options.paddingLeft, this.options.paddingTop);
    scaledStart = new Vector2().copy(this.options.start).add(paddingVector).multiplyWithRect(imageData);
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    context.font = "normal " + scaledFontSize + "px " + this.options.font;
    context.textBaseline = "hanging";
    lineHeight = this.options.lineHeight;
    boundingBoxWidth = 0;
    boundingBoxHeight = 0;
    _ref = this.options.text.split("\n");
    for (lineNum = _i = 0, _len = _ref.length; _i < _len; lineNum = ++_i) {
      line = _ref[lineNum];
      lineWidth = context.measureText(line).width;
      if (lineWidth > boundingBoxWidth) {
        boundingBoxWidth = lineWidth;
      }
      boundingBoxHeight += scaledFontSize * lineHeight;
    }
    context.fillStyle = this.options.backgroundColor;
    padding = 10;
    context.fillRect(scaledStart.x - padding, scaledStart.y - padding, boundingBoxWidth + padding * 2, boundingBoxHeight + padding);
    context.fillStyle = this.options.color;
    _ref1 = this.options.text.split("\n");
    for (lineNum = _j = 0, _len1 = _ref1.length; _j < _len1; lineNum = ++_j) {
      line = _ref1[lineNum];
      lineOffset = lineNum * scaledFontSize * lineHeight;
      context.fillText(line, scaledStart.x, scaledStart.y + this.options.paddingLeft + lineOffset);
    }
    return context.getImageData(0, 0, imageData.width, imageData.height);
  };

  return FontOperation;

})(Operation);

module.exports = FontOperation;



},{"../math/rect.coffee":2,"../math/vector2.coffee":3,"../utils.coffee":77,"./operation.coffee":53}],58:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var CropOperation, EventEmitter, IdentityFilter, Perf, PhotoProcessor, Queue, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Perf = require("./vendor/perf.coffee");

Queue = require("./vendor/queue.coffee");

Utils = require("./utils.coffee");

IdentityFilter = require("./operations/filters/primitives/identity.coffee");

CropOperation = require("./operations/crop.coffee");

EventEmitter = require("events").EventEmitter;

PhotoProcessor = (function(_super) {
  __extends(PhotoProcessor, _super);


  /*
    @param {imglyUtil} app
   */

  function PhotoProcessor(app) {
    this.app = app;
    this.canvas = null;
    this.operationChain = new IdentityFilter(this.app);
    this.operationStack = [this.operationChain];
    this.operationChainNeedsRender = true;
    this.cachedPreviewImageData = null;
    this.previewOperation = null;
    this.rendering = false;
  }

  PhotoProcessor.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
  };

  PhotoProcessor.prototype.setSourceImage = function(sourceImage) {
    this.sourceImage = sourceImage;
  };


  /*
    @params {ImglyKit.Operations.Operation} operation
   */

  PhotoProcessor.prototype.setPreviewOperation = function(operation) {
    operation.setContext(this.canvas.getContext());
    this.previewOperation = operation;
    if (!operation.renderPreview) {
      return;
    }
    return this.renderPreview();
  };

  PhotoProcessor.prototype.unsetPreviewOperation = function() {
    this.previewOperation = null;
    return this.renderPreview();
  };

  PhotoProcessor.prototype.acceptPreviewOperation = function() {
    var _ref;
    if (!this.previewOperation) {
      return;
    }
    this.operationChainNeedsRender = true;
    if ((_ref = this.operationStack[this.operationStack.length - 2]) != null) {
      _ref.invalidateCache();
    }
    if (this.previewOperation instanceof CropOperation) {
      this.resizedPreviewImageData = null;
    }
    this.operationChain = this.operationChain.compose(this.previewOperation);
    this.operationStack.push(this.previewOperation);
    this.previewOperation = null;
    this.renderPreview();
    return this.emit("operation_chain_changed");
  };


  /*
    Render the full size final image
   */

  PhotoProcessor.prototype.renderImage = function(options, callback) {
    var dimensions, height, imageData, p, scale, width, _ref;
    p = new Perf("imglyPhotoProcessor#renderFullImage()", {
      debug: this.app.options.debug
    });
    p.start();
    if (!options.size) {
      dimensions = {
        width: this.sourceImage.width,
        height: this.sourceImage.height
      };
      imageData = Utils.getImageDataForImage(this.sourceImage);
    } else if (options.size) {
      _ref = options.size.split("x"), width = _ref[0], height = _ref[1];
      if (width && !height) {
        scale = this.sourceImage.height / this.sourceImage.width;
        height = width * scale;
      } else if (height && !width) {
        scale = this.sourceImage.width / this.sourceImage.height;
        width = height * scale;
      }
      dimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
      imageData = Utils.getImageDataForImage(this.sourceImage);
    }
    return this.render(imageData, {
      preview: false
    }, (function(_this) {
      return function(err, imageData) {
        if (err != null) {
          return callback(err);
        }
        if (options.size) {
          imageData = Utils.resizeImageData(imageData, options, {
            smooth: true
          });
        }
        return callback(null, imageData);
      };
    })(this));
  };


  /*
    Renders a preview
   */

  PhotoProcessor.prototype.renderPreview = function(callback) {
    return this.render(null, {
      preview: true
    }, callback);
  };


  /*
    Render preview or image
   */

  PhotoProcessor.prototype.render = function(imageData, options, callback) {

    /*
      Make sure we are not rendering multiple previews at a time
     */
    var p;
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    p = new Perf("imglyPhotoProcessor#render({ preview: " + options.preview + " })", {
      debug: this.app.options.debug
    });
    p.start();
    imageData = options.preview ? this.renderOperationChainPreview(imageData) : this.operationChain.apply(imageData);
    return Queue(imageData).then((function(_this) {
      return function(imageData) {
        if (typeof _this.operationChain === "function") {
          _this.operationChain.filter.cacheImageData(imageData);
        } else {
          _this.operationChain.cacheImageData(imageData);
        }
        if (options.preview && _this.operationChainNeedsRender) {
          _this.cachedPreviewImageData = imageData;
          _this.operationChainNeedsRender = false;
        }
        if (_this.previewOperation && options.preview) {
          return _this.previewOperation.apply(imageData);
        } else {
          return imageData;
        }
      };
    })(this)).then((function(_this) {
      return function(imageData) {
        if (options.preview) {
          _this.canvas.renderImageData(imageData);
        }
        if (typeof callback === "function") {
          callback(null, imageData);
        }
        _this.rendering = false;
        p.stop(true);
        return imageData;
      };
    })(this));
  };

  PhotoProcessor.prototype.renderOperationChainPreview = function(imageData) {
    var dimensions, imageDimensions;
    if (!this.operationChainNeedsRender) {
      return Utils.cloneImageData(this.cachedPreviewImageData);
    } else {
      dimensions = this.calculateMinimumPreviewDimensions(this.sourceImage);
      if (this.resizedPreviewImageData == null) {
        imageDimensions = {
          width: dimensions.width * (window.devicePixelRatio || 1),
          height: dimensions.height * (window.devicePixelRatio || 1)
        };
        this.resizedPreviewImageData = imageData = Utils.getResizedImageDataForImage(this.sourceImage, imageDimensions, {
          smooth: true
        });
      } else {
        imageData = Utils.cloneImageData(this.resizedPreviewImageData);
      }
      return this.operationChain.apply(imageData);
    }
  };


  /*
    Checks whether the current operation chain allows an undo action
   */

  PhotoProcessor.prototype.isUndoPossible = function() {
    var _ref;
    return (_ref = this.operationStack[this.operationStack.length - 2]) != null ? _ref.hasCache() : void 0;
  };


  /*
    Calculates the minimum dimensions of the initial picture. The dimensions
    might be larger than the canvas itself (to keep the quality when cropping)
   */

  PhotoProcessor.prototype.calculateMinimumPreviewDimensions = function(image) {
    var cropSize, end, initialDimensions, initialHeight, initialWidth, maxCropFactor, operation, originalHeight, originalWidth, start, _i, _len, _ref, _ref1;
    originalWidth = this.sourceImage.width;
    originalHeight = this.sourceImage.height;
    initialDimensions = this.canvas.getDimensionsForImage(this.sourceImage);
    initialWidth = initialDimensions.width;
    initialHeight = initialDimensions.height;
    _ref = this.operationStack;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      operation = _ref[_i];
      if (!(operation instanceof CropOperation)) {
        continue;
      }
      _ref1 = operation.options, start = _ref1.start, end = _ref1.end;
      cropSize = end.clone().subtract(start);
      maxCropFactor = Math.max(1 / cropSize.x, 1 / cropSize.y);
      initialWidth *= maxCropFactor;
      initialHeight *= maxCropFactor;
    }
    initialWidth = Math.min(initialWidth, originalWidth);
    initialHeight = Math.min(initialHeight, originalHeight);
    return {
      width: initialWidth,
      height: initialHeight
    };
  };


  /*
    Undos the last operation
   */

  PhotoProcessor.prototype.undo = function() {
    var currentOperation, lastOperation, previousOperation;
    if (!this.isUndoPossible()) {
      return;
    }
    lastOperation = this.operationStack.pop();
    currentOperation = this.operationStack[this.operationStack.length - 1];
    if (currentOperation.cachedImageData != null) {
      this.canvas.renderImageData(currentOperation.cachedImageData);
    }
    if (this.operationStack.length === 1) {
      this.reset();
    } else {
      previousOperation = this.operationStack[this.operationStack.length - 2];
      this.operationChain = previousOperation.compose(currentOperation.constructor);
      this.operationChainNeedsRender = true;
    }
    return this.emit("operation_chain_changed");
  };


  /*
    Resets all UI elements
   */

  PhotoProcessor.prototype.reset = function() {
    this.operationChain = new IdentityFilter(this.app);
    this.operationStack = [this.operationChain];
    this.previewOperation = null;
    this.rendering = false;
    this.operationChainNeedsRender = true;
    return this.resizedPreviewImageData = null;
  };

  return PhotoProcessor;

})(EventEmitter);

module.exports = PhotoProcessor;



},{"./operations/crop.coffee":6,"./operations/filters/primitives/identity.coffee":39,"./utils.coffee":77,"./vendor/perf.coffee":78,"./vendor/queue.coffee":79,"events":82}],59:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, UICanvas, Utils;

$ = require("jquery");

Utils = require("../utils.coffee");

UICanvas = (function() {

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
    @param {Integer} options.height Height of the controls
  
    @todo Get controls height from elsewhere. The options hash
          is probably not a good place for that.
   */
  function UICanvas(app, ui, options) {
    this.app = app;
    this.ui = ui;
    this.options = options;
    this.container = this.app.getContainer();
    this.init();
  }


  /*
    @returns {CanvasRenderingContext2d}
   */

  UICanvas.prototype.getContext = function() {
    return this.context;
  };


  /*
    @returns {ImageData}
   */

  UICanvas.prototype.getImageData = function() {
    return this.context.getImageData(0, 0, this.canvasDom.width, this.canvasDom.height);
  };


  /*
    Initializes the container, creates
    the canvas object
   */

  UICanvas.prototype.init = function() {
    this.canvasContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-container").css({
      height: this.app.getHeight() - this.options.height
    }).appendTo(this.container);
    this.canvas = $("<canvas>").addClass(ImglyKit.classPrefix + "canvas").appendTo(this.canvasContainer);
    this.canvasDom = this.canvas.get(0);
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-controls-container").appendTo(this.canvasContainer);
    return this.context = this.canvasDom.getContext("2d");
  };


  /*
    Resizes the canvas and renders the given imageData
  
    @param {ImageData} imageData
   */

  UICanvas.prototype.renderImageData = function(imageData) {
    var imageDataCanvas;
    this.resizeAndPositionCanvasToMatch(imageData);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(imageDataCanvas, 0, 0, imageData.width, imageData.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };


  /*
    Resizes the canvas and renders the given image
  
    @param {Image} image
   */

  UICanvas.prototype.renderImage = function(image) {
    this.resizeAndPositionCanvasToMatch(image);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };


  /*
    Takes an image and returns the new dimensions
    so that it fits into the UI
  
    @param {Image} image
    @returns {Object} dimensions
    @returns {Integer} dimensions.width
    @returns {Integer} dimensions.height
   */

  UICanvas.prototype.getDimensionsForImage = function(image) {
    var options;
    options = {
      image: {
        width: image.width,
        height: image.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    return Utils.calculateCanvasSize(options);
  };


  /*
    @returns {jQuery.Object}
   */

  UICanvas.prototype.getControlsContainer = function() {
    return this.controlsContainer;
  };


  /*
    @param {Mixed} object
    @param {Integer} object.height
    @param {Integer} object.width
   */

  UICanvas.prototype.resizeAndPositionCanvasToMatch = function(obj) {
    var newCanvasSize, options;
    options = {
      image: {
        width: obj.width,
        height: obj.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    newCanvasSize = Utils.calculateCanvasSize(options);
    this.canvas.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: Math.round((this.canvasContainer.height() - newCanvasSize.height) / 2),
      left: Math.round((this.canvasContainer.width() - newCanvasSize.width) / 2)
    });
    this.controlsContainer.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: this.canvas.position().top,
      left: this.canvas.position().left
    });
    this.canvasDom.width = newCanvasSize.width * (window.devicePixelRatio || 1);
    return this.canvasDom.height = newCanvasSize.height * (window.devicePixelRatio || 1);
  };


  /*
    Clears the context
   */

  UICanvas.prototype.reset = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.controlsContainer.html("");
  };

  return UICanvas;

})();

module.exports = UICanvas;



},{"../utils.coffee":77,"jquery":"jquery"}],60:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, EventEmitter, Overview, UIControls,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

Overview = require("./controls/overview.coffee");

EventEmitter = require("events").EventEmitter;

UIControls = (function(_super) {
  __extends(UIControls, _super);


  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
   */

  function UIControls(app, ui) {
    this.app = app;
    this.ui = ui;
    this.updateUndoState = __bind(this.updateUndoState, this);
    this.onUndoClick = __bind(this.onUndoClick, this);
    this.container = this.app.getContainer();
    this.init();
  }


  /*
    @returns {Integer} Height of the controls container
   */

  UIControls.prototype.getHeight = function() {
    return this.controlsContainer.height();
  };


  /*
    @returns {jQuery.Object} The controls container
   */

  UIControls.prototype.getContainer = function() {
    return this.controlsContainer;
  };


  /*
    @returns {ImglyKit.UI.Controls.Base}
   */

  UIControls.prototype.getCurrentControls = function() {
    return this.currentControls;
  };


  /*
    Initializes the container
   */

  UIControls.prototype.init = function() {
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "controls-container").appendTo(this.container);
    this.initOverview();
    this.createUndoButton();
    return this.app.getPhotoProcessor().on("operation_chain_changed", this.updateUndoState);
  };


  /*
    Initialize the overview
   */

  UIControls.prototype.initOverview = function() {
    this.currentControls = this.overview = new Overview(this.app, this.ui, this);
    this.attachEvents(this.currentControls);
    this.overview.init();
    if (this.app.options.initialControls == null) {
      return this.overview.show();
    }
  };


  /*
    Attach select events
   */

  UIControls.prototype.attachEvents = function(controls) {
    controls.on("select", (function(_this) {
      return function(option) {
        if (option.controls != null) {
          _this.switchToControls(option.controls, controls);
        }
        if (option.operation != null) {
          return _this.emit("preview_operation", new option.operation(_this.app, option.options));
        }
      };
    })(this));
    controls.on("back", (function(_this) {
      return function() {
        return _this.emit("back");
      };
    })(this));
    controls.on("done", (function(_this) {
      return function() {
        return _this.emit("done");
      };
    })(this));
    return controls.on("renderPreview", (function(_this) {
      return function() {
        return _this.app.getPhotoProcessor().renderPreview();
      };
    })(this));
  };


  /*
    Switch to another controls instance
   */

  UIControls.prototype.switchToControls = function(controlsClass, oldControls, options) {
    var canvasControlsContainer, key, value;
    if (options == null) {
      options = {};
    }
    this.currentControls = new controlsClass(this.app, this.ui, this);
    for (key in options) {
      value = options[key];
      this.currentControls.options[key] = value;
    }
    this.attachEvents(this.currentControls);
    if (this.currentControls.hasCanvasControls) {
      canvasControlsContainer = this.ui.getCanvas().getControlsContainer();
      this.currentControls.setupCanvasControls(canvasControlsContainer);
      canvasControlsContainer.fadeIn("slow");
    }
    this.currentControls.init();
    return oldControls.hide((function(_this) {
      return function() {
        return _this.currentControls.show();
      };
    })(this));
  };


  /*
    Creates the undo button
   */

  UIControls.prototype.createUndoButton = function() {
    this.undoButton = $("<div>").addClass("" + ImglyKit.classPrefix + "undo " + ImglyKit.classPrefix + "disabled").appendTo(this.container);
    return this.undoButton.click(this.onUndoClick);
  };


  /*
    Gets called when the user clicks the undo button
   */

  UIControls.prototype.onUndoClick = function(e) {
    e.preventDefault();
    return this.app.getPhotoProcessor().undo();
  };


  /*
    Updates the undo state (active / inactive)
   */

  UIControls.prototype.updateUndoState = function() {
    var disabled;
    disabled = !this.app.getPhotoProcessor().isUndoPossible();
    return this.undoButton.toggleClass("" + ImglyKit.classPrefix + "disabled", disabled);
  };


  /*
    Returns to the default view
   */

  UIControls.prototype.reset = function() {
    var _ref;
    this.overview.reset();
    this.ui.getCanvas().getControlsContainer().hide().html("");
    return (_ref = this.currentControls) != null ? _ref.hide((function(_this) {
      return function() {
        _this.currentControls.remove();
        return _this.overview.show();
      };
    })(this)) : void 0;
  };

  return UIControls;

})(EventEmitter);

module.exports = UIControls;



},{"./controls/overview.coffee":71,"events":82,"jquery":"jquery"}],61:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, EventEmitter, UIControlsBase,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

EventEmitter = require("events").EventEmitter;

UIControlsBase = (function(_super) {
  __extends(UIControlsBase, _super);

  UIControlsBase.prototype.allowMultipleClick = true;


  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
   */

  function UIControlsBase(app, ui, controls) {
    var _base, _base1;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.domCreated = false;
    if (this.options == null) {
      this.options = {};
    }
    if ((_base = this.options).backButton == null) {
      _base.backButton = true;
    }
    if ((_base1 = this.options).showList == null) {
      _base1.showList = true;
    }
  }


  /*
    @param {imglyUtil.Operations.Operation}
   */

  UIControlsBase.prototype.setOperation = function(operation) {
    this.operation = operation;
  };


  /*
    @param {Object} options
   */

  UIControlsBase.prototype.init = function(options) {};


  /*
    Handle visibility
   */

  UIControlsBase.prototype.show = function(cb) {
    return this.wrapper.fadeIn("fast", cb);
  };

  UIControlsBase.prototype.hide = function(cb) {
    return this.wrapper.fadeOut("fast", cb);
  };


  /*
    Returns to the default view
   */

  UIControlsBase.prototype.reset = function() {};


  /*
    Create "Back" and "Done" buttons
   */

  UIControlsBase.prototype.createButtons = function() {
    var back, done;
    if (this.buttons == null) {
      this.buttons = {};
    }

    /*
      "Back" Button
     */
    if (this.options.backButton) {
      back = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-back").appendTo(this.wrapper);
      back.click((function(_this) {
        return function() {
          return _this.emit("back");
        };
      })(this));
      this.buttons.back = back;
    }

    /*
      "Done" Button
     */
    done = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-done").appendTo(this.wrapper);
    done.click((function(_this) {
      return function() {
        return _this.emit("done");
      };
    })(this));
    return this.buttons.done = done;
  };

  UIControlsBase.prototype.remove = function() {
    return this.wrapper.remove();
  };

  return UIControlsBase;

})(EventEmitter);

module.exports = UIControlsBase;



},{"events":82,"jquery":"jquery"}],62:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, Base, UIControlsBaseList, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

Base = require("./base.coffee");

Utils = require("../../../utils.coffee");

UIControlsBaseList = (function(_super) {
  __extends(UIControlsBaseList, _super);

  function UIControlsBaseList() {
    return UIControlsBaseList.__super__.constructor.apply(this, arguments);
  }

  UIControlsBaseList.prototype.displayButtons = false;

  UIControlsBaseList.prototype.singleOperation = false;

  UIControlsBaseList.prototype.init = function() {
    var option, _i, _len, _ref, _results;
    this.createList();
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    if (!this.options.showList) {
      this.list.hide();
    }

    /*
      Add the list elements
     */
    _ref = this.listItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      _results.push(((function(_this) {
        return function(option) {
          var cssClass, item;
          if (option.name == null) {
            return $("<li>").addClass(ImglyKit.classPrefix + "controls-item-space").appendTo(_this.list);
          }
          cssClass = option.cssClass || Utils.dasherize(option.name);
          item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").addClass(ImglyKit.classPrefix + "controls-item-" + cssClass).appendTo(_this.list);
          if (option.pixmap != null) {
            item.attr("style", "background-image: url('" + (_this.app.buildAssetsPath(option.pixmap)) + "'); background-size: 42px;");
          }
          if (option.tooltip != null) {
            item.attr("title", option.tooltip);
          }
          item.click(function(e) {
            if (!_this.allowMultipleClick) {
              if (_this.optionSelected) {
                return;
              }
              _this.optionSelected = true;
            }
            return _this.handleOptionSelect(option, item);
          });
          if (option["default"] != null) {
            return item.click();
          }
        };
      })(this))(option));
    }
    return _results;
  };


  /*
    @param {ImglyKit.Operations.Operation}
   */

  UIControlsBaseList.prototype.setOperation = function(operation) {
    this.operation = operation;
    this.updateOptions(this.operation.options);
    return this.operation.on("updateOptions", (function(_this) {
      return function(o) {
        return _this.updateOptions(o);
      };
    })(this));
  };


  /*
    @params {Object} options
   */

  UIControlsBaseList.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
  };


  /*
    @param {Object} option
    @param {jQuery.Object} item
   */

  UIControlsBaseList.prototype.handleOptionSelect = function(option, item) {
    var activeClass;
    this.setAllItemsInactive();
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    item.addClass(activeClass);
    if (this.singleOperation) {
      option.operation = this.operationClass;
    }
    if (!this.singleOperation || (this.singleOperation && !this.sentSelected)) {
      this.emit("select", option);
      this.sentSelected = true;
    }
    if (option.method) {
      this.operation[option.method].apply(this.operation, option["arguments"]);
    }
    if ((this.operation != null) && this.operation.renderPreview) {
      return this.emit("renderPreview");
    }
  };


  /*
    Create controls DOM tree
   */

  UIControlsBaseList.prototype.createList = function() {
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.list = $("<ul>").addClass(ImglyKit.classPrefix + "controls-list").appendTo(this.wrapper);
    if (this.cssClassIdentifier != null) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-" + this.cssClassIdentifier);
    }
    if (this.displayButtons) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-with-buttons");
      this.list.css("margin-right", this.controls.getHeight());
      return this.createButtons();
    }
  };


  /*
    Reset active states
   */

  UIControlsBaseList.prototype.reset = function() {
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    return this.setAllItemsInactive();
  };


  /*
    Sets all list items to inactive state
   */

  UIControlsBaseList.prototype.setAllItemsInactive = function() {
    var activeClass;
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    return this.list.find("li").removeClass(activeClass);
  };

  return UIControlsBaseList;

})(Base);

module.exports = UIControlsBaseList;



},{"../../../utils.coffee":77,"./base.coffee":61,"jquery":"jquery"}],63:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, Base, UIControlsBaseSlider,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

Base = require("./base.coffee");

UIControlsBaseSlider = (function(_super) {
  __extends(UIControlsBaseSlider, _super);

  function UIControlsBaseSlider() {
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    return UIControlsBaseSlider.__super__.constructor.apply(this, arguments);
  }

  UIControlsBaseSlider.prototype.init = function() {
    var spaceForPlusAndMinus, width;
    spaceForPlusAndMinus = 60;
    width = this.controls.getContainer().width();
    width -= this.controls.getHeight() * 2;
    width -= spaceForPlusAndMinus;
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.sliderWrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-wrapper").width(width).appendTo(this.wrapper);
    this.sliderCenterDot = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-dot").appendTo(this.sliderWrapper);
    this.sliderBar = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-bar").appendTo(this.sliderWrapper);
    this.slider = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider").css({
      left: width / 2
    }).appendTo(this.sliderWrapper);

    /*
      Plus / Minus images
     */
    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-plus").appendTo(this.sliderWrapper);
    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-minus").appendTo(this.sliderWrapper);
    this.handleSliderControl();
    return this.createButtons();
  };


  /*
    Handles slider dragging
   */

  UIControlsBaseSlider.prototype.handleSliderControl = function() {
    this.sliderWidth = this.sliderWrapper.width();
    return this.slider.mousedown((function(_this) {
      return function(e) {
        _this.lastX = e.clientX;
        _this.currentSliderLeft = parseInt(_this.slider.css("left"));
        $(document).mousemove(_this.onMouseMove);
        return $(document).mouseup(_this.onMouseUp);
      };
    })(this));
  };


  /*
    Is called when the slider has been moved
  
    @param {Integer} left
   */

  UIControlsBaseSlider.prototype.setSliderLeft = function(left) {
    var barWidth, normalized;
    this.slider.css({
      left: left
    });
    if (left < this.sliderWidth / 2) {
      barWidth = this.sliderWidth / 2 - left;
      this.sliderBar.css({
        left: left,
        width: barWidth
      });
    } else {
      barWidth = left - this.sliderWidth / 2;
      this.sliderBar.css({
        left: this.sliderWidth / 2,
        width: barWidth
      });
    }
    normalized = (left - this.sliderWidth / 2) / this.sliderWidth * 2;
    this.operation[this.valueSetMethod].apply(this.operation, [normalized]);
    return this.app.getPhotoProcessor().renderPreview();
  };


  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
   */

  UIControlsBaseSlider.prototype.onMouseMove = function(e) {
    var curX, deltaX, sliderLeft;
    curX = e.clientX;
    deltaX = curX - this.lastX;
    sliderLeft = Math.min(Math.max(0, this.currentSliderLeft + deltaX), this.sliderWidth);
    if (sliderLeft < this.sliderWidth && sliderLeft > 0) {
      this.lastX = curX;
      this.currentSliderLeft = sliderLeft;
    }
    return this.setSliderLeft(sliderLeft);
  };


  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
   */

  UIControlsBaseSlider.prototype.onMouseUp = function(e) {
    $(document).off("mouseup", this.onMouseUp);
    return $(document).off("mousemove", this.onMouseMove);
  };

  return UIControlsBaseSlider;

})(Base);

module.exports = UIControlsBaseSlider;



},{"./base.coffee":61,"jquery":"jquery"}],64:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Slider, UIControlsBrightness,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsBrightness = (function(_super) {
  __extends(UIControlsBrightness, _super);

  function UIControlsBrightness() {
    return UIControlsBrightness.__super__.constructor.apply(this, arguments);
  }

  UIControlsBrightness.prototype.name = "Brightness";

  UIControlsBrightness.prototype.cssClass = "brightness";

  UIControlsBrightness.prototype.valueSetMethod = "setBrightness";

  UIControlsBrightness.prototype.displayButtons = true;

  return UIControlsBrightness;

})(Slider);

module.exports = UIControlsBrightness;



},{"./base/slider.coffee":63}],65:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Slider, UIControlsContrast,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsContrast = (function(_super) {
  __extends(UIControlsContrast, _super);

  function UIControlsContrast() {
    return UIControlsContrast.__super__.constructor.apply(this, arguments);
  }

  UIControlsContrast.prototype.name = "Contrast";

  UIControlsContrast.prototype.cssClass = "contrast";

  UIControlsContrast.prototype.valueSetMethod = "setContrast";

  UIControlsContrast.prototype.displayButtons = true;

  return UIControlsContrast;

})(Slider);

module.exports = UIControlsContrast;



},{"./base/slider.coffee":63}],66:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, Rect, UIControlsCrop, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsCrop = (function(_super) {
  __extends(UIControlsCrop, _super);

  UIControlsCrop.prototype.displayButtons = true;

  UIControlsCrop.prototype.minimumCropSize = 50;

  UIControlsCrop.prototype.singleOperation = true;


  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
   */

  function UIControlsCrop(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsCrop.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/crop.coffee");
    this.listItems = [
      {
        name: "Custom",
        cssClass: "custom",
        method: "setSize",
        "arguments": ["free"],
        tooltip: "Freeform crop",
        "default": true,
        options: {
          size: "free"
        }
      }, {
        name: "Square",
        cssClass: "square",
        method: "setSize",
        "arguments": ["square"],
        tooltip: "Squared crop",
        options: {
          size: "square"
        }
      }, {
        name: "4:3",
        cssClass: "4-3",
        method: "setSize",
        "arguments": ["4:3"],
        tooltip: "4:3 crop",
        options: {
          size: "4:3"
        }
      }, {
        name: "16:9",
        cssClass: "16-9",
        method: "setSize",
        "arguments": ["16:9"],
        tooltip: "16:9 crop",
        options: {
          size: "16:9"
        }
      }
    ];
  }

  UIControlsCrop.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.resizeCanvasControls();
  };


  /*
    @param {jQuery.Object} canvasControlsContainer
   */

  UIControlsCrop.prototype.hasCanvasControls = true;

  UIControlsCrop.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var div, position, _i, _j, _len, _len1, _ref, _ref1;
    this.canvasControlsContainer = canvasControlsContainer;

    /*
      Create the dark parts around the cropped area
     */
    this.spotlightDivs = {};
    _ref = ["tl", "tc", "tr", "lc", "rc", "bl", "bc", "br"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      position = _ref[_i];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight-" + position).appendTo(this.canvasControlsContainer);
      this.spotlightDivs[position] = div;
    }

    /*
      Create the center div (cropped area)
     */
    this.centerDiv = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-center").appendTo(this.canvasControlsContainer);

    /*
      Create the knobs the user can use to resize the cropped area
     */
    this.knobs = {};
    _ref1 = ["tl", "tr", "bl", "br"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      position = _ref1[_j];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob").appendTo(this.canvasControlsContainer);
      this.knobs[position] = div;
    }
    this.handleCenterDragging();
    this.handleTopLeftKnob();
    this.handleBottomRightKnob();
    this.handleBottomLeftKnob();
    return this.handleTopRightKnob();
  };


  /*
    Handles the dragging of the upper right knob
   */

  UIControlsCrop.prototype.handleTopRightKnob = function() {
    var knob;
    knob = this.knobs.tr;
    return knob.mousedown((function(_this) {
      return function(e) {
        var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
        canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialStart = _this.operationOptions.start.clone();
        initialEnd = _this.operationOptions.end.clone();
        ratio = _this.operationOptions.ratio;
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
          diffMousePosition = new Vector2(e.clientX, e.clientY).subtract(initialMousePosition);
          endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
          if (_this.operationOptions.ratio === 0) {
            _this.operationOptions.start.copy(startInPixels);
            _this.operationOptions.start.y += diffMousePosition.y;
            _this.operationOptions.start.clamp(new Vector2(startInPixels.x, 1), new Vector2(startInPixels.x, endInPixels.y - 50)).divideByRect(canvasRect);
            _this.operationOptions.end.copy(endInPixels);
            _this.operationOptions.end.x += diffMousePosition.x;
            _this.operationOptions.end.clamp(new Vector2(startInPixels.x + 50, endInPixels.y), new Vector2(canvasRect.width - 1, endInPixels.y)).divideByRect(canvasRect);
          } else {
            endInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
            endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
            widthInPixels = endInPixels.x - startInPixels.x;
            heightInPixels = widthInPixels / _this.operationOptions.ratio;
            if (endInPixels.y - heightInPixels < 1) {
              heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
              widthInPixels = heightInPixels * _this.operationOptions.ratio;
            }
            _this.operationOptions.end.x = (startInPixels.x + widthInPixels) / canvasRect.width;
            _this.operationOptions.start.y = (endInPixels.y - heightInPixels) / canvasRect.height;
          }
          return _this.resizeCanvasControls();
        });
      };
    })(this));
  };


  /*
    Handles the dragging of the lower left knob
   */

  UIControlsCrop.prototype.handleBottomLeftKnob = function() {
    var knob;
    knob = this.knobs.bl;
    return knob.mousedown((function(_this) {
      return function(e) {
        var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
        canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialStart = _this.operationOptions.start.clone();
        initialEnd = _this.operationOptions.end.clone();
        ratio = _this.operationOptions.ratio;
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
          diffMousePosition = new Vector2(e.clientX, e.clientY).subtract(initialMousePosition);
          endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
          if (_this.operationOptions.ratio === 0) {
            _this.operationOptions.end.copy(endInPixels);
            _this.operationOptions.end.y += diffMousePosition.y;
            _this.operationOptions.end.clamp(new Vector2(endInPixels.x, startInPixels.y + 50), new Vector2(endInPixels.x, canvasRect.height - 1)).divideByRect(canvasRect);
            _this.operationOptions.start.copy(startInPixels);
            _this.operationOptions.start.x += diffMousePosition.x;
            _this.operationOptions.start.clamp(new Vector2(1, 1), new Vector2(endInPixels.x - 50, endInPixels.y - 50)).divideByRect(canvasRect);
          } else {
            startInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
            startInPixels.clamp(1, endInPixels.x - 50);
            widthInPixels = endInPixels.x - startInPixels.x;
            heightInPixels = widthInPixels / _this.operationOptions.ratio;
            if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
              heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
              widthInPixels = heightInPixels * _this.operationOptions.ratio;
            }
            _this.operationOptions.start.x = (endInPixels.x - widthInPixels) / canvasRect.width;
            _this.operationOptions.end.y = (startInPixels.y + heightInPixels) / canvasRect.height;
          }
          return _this.resizeCanvasControls();
        });
      };
    })(this));
  };


  /*
    Handles the dragging of the lower right knob
   */

  UIControlsCrop.prototype.handleBottomRightKnob = function() {
    var knob;
    knob = this.knobs.br;
    return knob.mousedown((function(_this) {
      return function(e) {
        var canvasRect, initialEnd, initialMousePosition, ratio;
        canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialEnd = new Vector2().copy(_this.operationOptions.end);
        ratio = _this.operationOptions.ratio;
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var diffMousePosition, endInPixels, height, heightInPixels, startInPixels, width, widthInPixels, _ref;
          diffMousePosition = new Vector2(e.clientX, e.clientY).subtract(initialMousePosition);
          endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(_this.operationOptions.start).multiplyWithRect(canvasRect);
          if (_this.operationOptions.ratio === 0) {
            _this.operationOptions.end.copy(endInPixels).add(diffMousePosition).clamp(new Vector2(startInPixels.x + 50, startInPixels.y + 50), new Vector2(canvasRect.width - 1, canvasRect.height - 1)).divideByRect(canvasRect);
            _ref = _this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
            widthInPixels = endInPixels.x - startInPixels.x;
          } else {
            endInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
            endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
            widthInPixels = endInPixels.x - startInPixels.x;
            heightInPixels = widthInPixels / _this.operationOptions.ratio;
            if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
              heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
              widthInPixels = heightInPixels * _this.operationOptions.ratio;
            }
            _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).add(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
          }
          return _this.resizeCanvasControls();
        });
      };
    })(this));
  };


  /*
    Handles the dragging of the upper left knob
   */

  UIControlsCrop.prototype.handleTopLeftKnob = function() {
    var knob;
    knob = this.knobs.tl;
    return knob.mousedown((function(_this) {
      return function(e) {
        var canvasRect, initialMousePosition, initialStart, ratio;
        canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialStart = new Vector2().copy(_this.operationOptions.start);
        ratio = _this.operationOptions.ratio;
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
          diffMousePosition = new Vector2(e.clientX, e.clientY).subtract(initialMousePosition);
          if (_this.operationOptions.ratio === 0) {
            _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).divideByRect(canvasRect);
          } else {
            endInPixels = new Vector2().copy(_this.operationOptions.end).multiplyWithRect(canvasRect);
            startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
            startInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
            startInPixels.clamp(1, endInPixels.x - 50);
            widthInPixels = endInPixels.x - startInPixels.x;
            heightInPixels = widthInPixels / _this.operationOptions.ratio;
            if (endInPixels.y - heightInPixels < 1) {
              heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
              widthInPixels = heightInPixels * _this.operationOptions.ratio;
            }
            _this.operationOptions.start.copy(_this.operationOptions.end).multiplyWithRect(canvasRect).subtract(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
          }
          return _this.resizeCanvasControls();
        });
      };
    })(this));
  };


  /*
    Handles the dragging of the visible, cropped part
   */

  UIControlsCrop.prototype.handleCenterDragging = function() {
    return this.centerDiv.mousedown((function(_this) {
      return function(e) {
        var canvasRect, centerRect, initialEnd, initialMousePosition, initialStart, max, min;
        canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
        min = new Vector2(1, 1);
        max = new Vector2(canvasRect.width - _this.centerDiv.width() - 1, canvasRect.height - _this.centerDiv.height() - 1);
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialStart = new Vector2().copy(_this.operationOptions.start);
        initialEnd = new Vector2().copy(_this.operationOptions.end);
        centerRect = new Rect(0, 0, _this.centerDiv.width(), _this.centerDiv.height());
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var currentMousePosition, diffMousePosition;
          currentMousePosition = new Vector2(e.clientX, e.clientY);
          diffMousePosition = new Vector2().copy(currentMousePosition).subtract(initialMousePosition);
          _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).clamp(min, max).divideByRect(canvasRect);
          _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).addRect(centerRect).divideByRect(canvasRect);
          return _this.resizeCanvasControls();
        });
      };
    })(this));
  };

  UIControlsCrop.prototype.updateOperationOptions = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.operation.setStart(this.operationOptions.start.x / canvasWidth, this.operationOptions.start.y / canvasHeight);
    return this.operation.setEnd(this.operationOptions.end.x / canvasWidth, this.operationOptions.end.y / canvasHeight);
  };

  UIControlsCrop.prototype.resizeCanvasControls = function() {
    var $el, bottomHeight, canvasRect, centerHeight, centerWidth, el, leftWidth, rightWidth, scaledEnd, scaledStart, topHeight, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    scaledStart = new Vector2().copy(this.operationOptions.start).multiplyWithRect(canvasRect);
    scaledEnd = new Vector2().copy(this.operationOptions.end).multiplyWithRect(canvasRect);

    /*
      Set fragment widths
     */
    leftWidth = scaledStart.x;
    _ref = ["tl", "lc", "bl"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      $el = this.spotlightDivs[el];
      $el.css({
        width: leftWidth,
        left: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth
        });
      }
    }
    centerWidth = scaledEnd.x - scaledStart.x;
    _ref1 = ["tc", "bc"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
      $el = this.spotlightDivs[el];
      $el.css({
        width: centerWidth,
        left: leftWidth
      });
    }
    rightWidth = canvasRect.width - centerWidth - leftWidth;
    _ref2 = ["tr", "rc", "br"];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      $el = this.spotlightDivs[el];
      $el.css({
        width: rightWidth,
        left: leftWidth + centerWidth
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth + centerWidth
        });
      }
    }

    /*
      Set fragment heights
     */
    topHeight = scaledStart.y;
    _ref3 = ["tl", "tc", "tr"];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      el = _ref3[_l];
      $el = this.spotlightDivs[el];
      $el.css({
        height: topHeight,
        top: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight
        });
      }
    }
    centerHeight = scaledEnd.y - scaledStart.y;
    _ref4 = ["lc", "rc"];
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      el = _ref4[_m];
      $el = this.spotlightDivs[el];
      $el.css({
        height: centerHeight,
        top: topHeight
      });
    }
    bottomHeight = canvasRect.height - topHeight - centerHeight;
    _ref5 = ["bl", "bc", "br"];
    for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
      el = _ref5[_n];
      $el = this.spotlightDivs[el];
      $el.css({
        height: bottomHeight,
        top: topHeight + centerHeight
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight + centerHeight
        });
      }
    }

    /*
      Set center fragment dimensions and position
     */
    return this.centerDiv.css({
      height: centerHeight,
      width: centerWidth,
      left: leftWidth,
      top: topHeight
    });
  };

  return UIControlsCrop;

})(List);

module.exports = UIControlsCrop;



},{"../../math/rect.coffee":2,"../../math/vector2.coffee":3,"../../operations/crop.coffee":6,"./base/list.coffee":62,"jquery":"jquery"}],67:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, UIControlsFilters, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

UIControlsFilters = (function(_super) {
  __extends(UIControlsFilters, _super);

  function UIControlsFilters() {
    return UIControlsFilters.__super__.constructor.apply(this, arguments);
  }

  UIControlsFilters.prototype.displayButtons = true;

  UIControlsFilters.prototype.cssClassIdentifier = "filters";


  /*
    Initializes the container
   */

  UIControlsFilters.prototype.init = function() {
    var filter, _i, _len, _ref, _results;
    this.createList();
    _ref = [require("../../operations/filters/default.coffee"), require("../../operations/filters/k1.coffee"), require("../../operations/filters/k2.coffee"), require("../../operations/filters/k6.coffee"), require("../../operations/filters/kdynamic.coffee"), require("../../operations/filters/fridge.coffee"), require("../../operations/filters/breeze.coffee"), require("../../operations/filters/orchid.coffee"), require("../../operations/filters/chest.coffee"), require("../../operations/filters/front.coffee"), require("../../operations/filters/fixie.coffee"), require("../../operations/filters/x400.coffee"), require("../../operations/filters/bw.coffee"), require("../../operations/filters/bwhard.coffee"), require("../../operations/filters/lenin.coffee"), require("../../operations/filters/quozi.coffee"), require("../../operations/filters/pola669.coffee"), require("../../operations/filters/pola.coffee"), require("../../operations/filters/food.coffee"), require("../../operations/filters/glam.coffee"), require("../../operations/filters/celsius.coffee"), require("../../operations/filters/texas.coffee"), require("../../operations/filters/morning.coffee"), require("../../operations/filters/lomo.coffee"), require("../../operations/filters/gobblin.coffee"), require("../../operations/filters/mellow.coffee"), require("../../operations/filters/sunny.coffee"), require("../../operations/filters/a15.coffee"), require("../../operations/filters/semired.coffee")];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      filter = _ref[_i];
      _results.push(((function(_this) {
        return function(filter) {
          var item, preview;
          item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").appendTo(_this.list);
          preview = $("<div>").addClass(ImglyKit.classPrefix + "controls-preview-" + Utils.dasherize(filter.displayName)).appendTo(item);
          return item.click(function(e) {
            var activeClass;
            _this.reset();
            activeClass = ImglyKit.classPrefix + "controls-list-item-active";
            item.addClass(activeClass);
            return _this.emit("select", {
              operation: filter
            });
          });
        };
      })(this))(filter));
    }
    return _results;
  };

  return UIControlsFilters;

})(List);

module.exports = UIControlsFilters;



},{"../../operations/filters/a15.coffee":8,"../../operations/filters/breeze.coffee":9,"../../operations/filters/bw.coffee":10,"../../operations/filters/bwhard.coffee":11,"../../operations/filters/celsius.coffee":12,"../../operations/filters/chest.coffee":13,"../../operations/filters/default.coffee":14,"../../operations/filters/fixie.coffee":16,"../../operations/filters/food.coffee":17,"../../operations/filters/fridge.coffee":18,"../../operations/filters/front.coffee":19,"../../operations/filters/glam.coffee":20,"../../operations/filters/gobblin.coffee":21,"../../operations/filters/k1.coffee":22,"../../operations/filters/k2.coffee":23,"../../operations/filters/k6.coffee":24,"../../operations/filters/kdynamic.coffee":25,"../../operations/filters/lenin.coffee":26,"../../operations/filters/lomo.coffee":27,"../../operations/filters/mellow.coffee":28,"../../operations/filters/morning.coffee":29,"../../operations/filters/orchid.coffee":30,"../../operations/filters/pola.coffee":31,"../../operations/filters/pola669.coffee":32,"../../operations/filters/quozi.coffee":44,"../../operations/filters/semired.coffee":45,"../../operations/filters/sunny.coffee":46,"../../operations/filters/texas.coffee":47,"../../operations/filters/x400.coffee":48,"../../utils.coffee":77,"./base/list.coffee":62,"jquery":"jquery"}],68:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, UIControlsFocus, Utils, Vector2, linearOperation, radialOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

Vector2 = require("../../math/vector2.coffee");

radialOperation = require("../../operations/focus/radial.coffee");

linearOperation = require("../../operations/focus/linear.coffee");

UIControlsFocus = (function(_super) {
  __extends(UIControlsFocus, _super);

  UIControlsFocus.prototype.displayButtons = true;


  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
   */

  function UIControlsFocus(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsFocus.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Radial",
        cssClass: "radial",
        operation: radialOperation,
        tooltip: "Radial blur",
        "default": true
      }, {
        name: "Linear",
        cssClass: "linear",
        operation: linearOperation,
        tooltip: "Linear blur"
      }
    ];
  }


  /*
    @params {Object} options
   */

  UIControlsFocus.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.rerenderCanvas();
  };


  /*
    We call this every time we change the options, e.g.
    when the user drags a knob or a crosshair
   */

  UIControlsFocus.prototype.onOptionsUpdated = function() {
    this.operation.setOptions(this.operationOptions);
    this.rerenderCanvas();
    this.repositionControls();
    return this.emit("renderPreview");
  };


  /*
    @param {jQuery.Object} canvasControlsContainer
   */

  UIControlsFocus.prototype.hasCanvasControls = true;

  UIControlsFocus.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var height, width;
    this.canvasControlsContainer = canvasControlsContainer;
    width = this.canvasControlsContainer.width();
    height = this.canvasControlsContainer.height();
    this.canvas = $("<canvas>").css({
      width: width,
      height: height
    }).appendTo(this.canvasControlsContainer);
    this.canvas = this.canvas.get(0);
    this.canvas.width = $(this.canvas).width();
    this.canvas.height = $(this.canvas).height();
    this.context = this.canvas.getContext("2d");
    if (window.devicePixelRatio > 1) {
      this.canvas.width *= window.devicePixelRatio;
      return this.canvas.height *= window.devicePixelRatio;
    }
  };


  /*
    @param {Object} option
    @param {jQuery.Object} item
   */

  UIControlsFocus.prototype.handleOptionSelect = function(option, item) {
    UIControlsFocus.__super__.handleOptionSelect.apply(this, arguments);
    switch (option.operation) {
      case radialOperation:
        this.setControlsMode("radial");
        break;
      case linearOperation:
        this.setControlsMode("linear");
    }
    return this.onOptionsUpdated();
  };


  /*
    @param {String} mode
   */

  UIControlsFocus.prototype.setControlsMode = function(mode) {
    var i, knob, _i;
    this.controlsMode = mode;
    this.canvasControlsContainer.find("div").remove();
    this.knobs = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob");
      knob.appendTo(this.canvasControlsContainer);
      this.knobs.push(knob);
    }
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair");
    this.crosshair.appendTo(this.canvasControlsContainer);
    this.handleKnobControl();
    return this.handleCrosshairControl();
  };


  /*
    We call this everytime the user dragged a knob
    or a crosshair to reposition the controls
   */

  UIControlsFocus.prototype.repositionControls = function() {
    var canvasSize, controlPoint1, controlPoint2, diff, i, knob, position, _i;
    canvasSize = {
      width: this.canvasControlsContainer.width(),
      height: this.canvasControlsContainer.height()
    };
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = this.knobs[i];
      position = this.operationOptions["controlPoint" + (i + 1) + "Position"];
      knob.css({
        left: canvasSize.width * position.x,
        top: canvasSize.height * position.y
      });
    }

    /*
      Multiply the control points with the canvas
      size to get real pixel information
     */
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(canvasSize);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(canvasSize);
    diff = new Vector2().copy(controlPoint2).subtract(controlPoint1).divide(2);
    return this.crosshair.css({
      left: controlPoint1.x + diff.x,
      top: controlPoint1.y + diff.y
    });
  };


  /*
    Handle dragging of the crosshair
   */

  UIControlsFocus.prototype.handleCrosshairControl = function() {
    var canvasSize;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    return this.crosshair.mousedown((function(_this) {
      return function(e) {
        var lastPos;
        lastPos = new Vector2(e.clientX, e.clientY);
        $(document).mousemove(function(e) {
          var i, knobPositions, newKnobPositions, normalizedDiff, _i, _j;
          normalizedDiff = new Vector2(e.clientX, e.clientY).subtract(lastPos).divide(canvasSize);
          newKnobPositions = {};
          knobPositions = {};
          for (i = _i = 1; _i <= 2; i = ++_i) {
            knobPositions[i] = _this.operationOptions["controlPoint" + i + "Position"];
            newKnobPositions[i] = new Vector2().copy(knobPositions[i]).add(normalizedDiff);
            if (!Utils.withinBoundaries(newKnobPositions[i])) {
              return;
            }
          }
          for (i = _j = 1; _j <= 2; i = ++_j) {
            knobPositions[i].copy(newKnobPositions[i]);
          }
          lastPos.set(e.clientX, e.clientY);
          return _this.onOptionsUpdated();
        });
        return $(document).mouseup(function(e) {
          $(document).off("mousemove");
          return $(document).off("mouseup");
        });
      };
    })(this));
  };


  /*
    Handle dragging of the knobs
   */

  UIControlsFocus.prototype.handleKnobControl = function() {
    var canvasSize, index, knob, _i, _len, _ref, _results;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    _ref = this.knobs;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      knob = _ref[index];
      _results.push(((function(_this) {
        return function(knob, index) {
          return knob.mousedown(function(e) {
            var lastPos;
            lastPos = new Vector2(e.clientX, e.clientY);
            $(document).mousemove(function(e) {
              var currentKnobIndex, currentKnobPosition, newKnobPosition, newOppositeKnobPosition, normalizedDiff, oppositeKnobIndex, oppositeKnobPosition;
              normalizedDiff = new Vector2(e.clientX, e.clientY).subtract(lastPos).divide(canvasSize);
              currentKnobIndex = index + 1;
              currentKnobPosition = _this.operationOptions["controlPoint" + currentKnobIndex + "Position"];
              oppositeKnobIndex = index === 0 ? 2 : 1;
              oppositeKnobPosition = _this.operationOptions["controlPoint" + oppositeKnobIndex + "Position"];
              newKnobPosition = new Vector2().copy(currentKnobPosition).add(normalizedDiff);
              newOppositeKnobPosition = new Vector2().copy(oppositeKnobPosition).subtract(normalizedDiff);
              if (!(Utils.withinBoundaries(newKnobPosition) && Utils.withinBoundaries(newOppositeKnobPosition))) {
                return;
              }
              currentKnobPosition.copy(newKnobPosition);
              oppositeKnobPosition.copy(newOppositeKnobPosition);
              _this.onOptionsUpdated();
              return lastPos.set(e.clientX, e.clientY);
            });
            return $(document).mouseup(function() {
              $(document).off("mouseup");
              return $(document).off("mousemove");
            });
          });
        };
      })(this))(knob, index));
    }
    return _results;
  };


  /*
    Re-renders the canvas controls
   */

  UIControlsFocus.prototype.rerenderCanvas = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    switch (this.controlsMode) {
      case "radial":
        return this.drawRadialControl();
      case "linear":
        return this.drawLinearControl();
    }
  };


  /*
    Renders the radial indicator for the currently blurred area
   */

  UIControlsFocus.prototype.drawRadialControl = function() {
    var center, circle, circleProperties, controlPoint1, controlPoint2, halfDiff, radius, _i, _len, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    halfDiff = new Vector2().copy(controlPoint2).subtract(controlPoint1).divide(2);
    radius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    center = new Vector2().copy(controlPoint1).add(halfDiff);
    circleProperties = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
    _results = [];
    for (_i = 0, _len = circleProperties.length; _i < _len; _i++) {
      circle = circleProperties[_i];
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius + circle[2], 0, 2 * Math.PI, false);
      this.context.lineWidth = circle[1];
      this.context.strokeStyle = circle[0];
      this.context.stroke();
      _results.push(this.context.closePath());
    }
    return _results;
  };


  /*
    Renders the line indicators for the currently blurred area
   */

  UIControlsFocus.prototype.drawLinearControl = function() {
    var controlPoint, controlPoint1, controlPoint2, controlPoints, diagonal, diff, line, lines, point, _i, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    controlPoints = [controlPoint1, controlPoint2];
    diff = new Vector2().copy(controlPoint2).subtract(controlPoint1);
    diagonal = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
    _results = [];
    for (point = _i = 0; _i <= 1; point = ++_i) {
      controlPoint = controlPoints[point];
      lines = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
      _results.push((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          this.context.beginPath();
          this.context.moveTo(controlPoint.x + diff.y * diagonal + line[2], controlPoint.y - diff.x * diagonal + line[2]);
          this.context.lineTo(controlPoint.x - diff.y * diagonal + line[2], controlPoint.y + diff.x * diagonal + line[2]);
          this.context.strokeStyle = line[0];
          this.context.lineWidth = line[1];
          this.context.stroke();
          _results1.push(this.context.closePath());
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return UIControlsFocus;

})(List);

module.exports = UIControlsFocus;



},{"../../math/vector2.coffee":3,"../../operations/focus/linear.coffee":50,"../../operations/focus/radial.coffee":51,"../../utils.coffee":77,"./base/list.coffee":62,"jquery":"jquery"}],69:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, Rect, UIControlsFrames, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Utils = require("../../utils.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsFrames = (function(_super) {
  __extends(UIControlsFrames, _super);

  function UIControlsFrames() {
    return UIControlsFrames.__super__.constructor.apply(this, arguments);
  }

  UIControlsFrames.prototype.displayButtons = true;

  UIControlsFrames.prototype.singleOperation = true;

  UIControlsFrames.prototype.init = function() {
    var option, options, _i, _len, _results;
    this.createList();
    this.operationClass = require("../../operations/frames.coffee");
    options = [
      {
        id: "black",
        name: "Black",
        cssClass: "black",
        method: "setFrameOptions",
        "arguments": ["black", 0.1],
        tooltip: "Black",
        "default": true
      }, {
        id: "blackwood",
        name: "Black Wood",
        cssClass: "black-wood",
        method: "setFrameOptions",
        "arguments": ["blackwood", 0.1],
        tooltip: "Black wood"
      }, {
        id: "dia",
        name: "Dia",
        cssClass: "dia",
        method: "setFrameOptions",
        "arguments": ["dia", 0.1],
        tooltip: "Dia"
      }
    ];
    _results = [];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      option = options[_i];
      _results.push(((function(_this) {
        return function(option) {
          var item, preview;
          item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").appendTo(_this.list);
          preview = $("<div>").addClass(ImglyKit.classPrefix + "controls-frame-preview-" + Utils.dasherize(option.id)).appendTo(item);
          if (option.tooltip != null) {
            preview.attr("title", option.tooltip);
          }
          item.click(function(e) {
            return _this.handleOptionSelect(option, item);
          });
          if (option["default"] != null) {
            return item.click();
          }
        };
      })(this))(option));
    }
    return _results;
  };

  return UIControlsFrames;

})(List);

module.exports = UIControlsFrames;



},{"../../math/rect.coffee":2,"../../math/vector2.coffee":3,"../../operations/frames.coffee":52,"../../utils.coffee":77,"./base/list.coffee":62,"jquery":"jquery"}],70:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var List, UIControlsOrientation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

UIControlsOrientation = (function(_super) {
  __extends(UIControlsOrientation, _super);

  UIControlsOrientation.prototype.displayButtons = true;

  UIControlsOrientation.prototype.singleOperation = true;


  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
   */

  function UIControlsOrientation(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOrientation.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/orientation.coffee");
    this.listItems = [
      {
        name: "Rotate L",
        cssClass: "rotate-l",
        method: "rotateLeft",
        tooltip: "Rotate left"
      }, {
        name: "Rotate R",
        cssClass: "rotate-r",
        method: "rotateRight",
        tooltip: "Rotate right"
      }, {
        name: "Flip V",
        cssClass: "flip-v",
        method: "flipVertically",
        tooltip: "Flip vertically"
      }, {
        name: "Flip H",
        cssClass: "flip-h",
        method: "flipHorizontally",
        tooltip: "Flip horizontally"
      }
    ];
  }

  return UIControlsOrientation;

})(List);

module.exports = UIControlsOrientation;



},{"../../operations/orientation.coffee":54,"./base/list.coffee":62}],71:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var List, UIControlsOverview,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("./base/list.coffee");

UIControlsOverview = (function(_super) {
  __extends(UIControlsOverview, _super);


  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
   */

  UIControlsOverview.prototype.allowMultipleClick = false;

  function UIControlsOverview(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOverview.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Social Networks",
        cssClass: "social-networks",
        controls: require("./social_networks_resize.coffee"),
        tooltip: "Social Networks"
      }, {
        name: "Filters",
        cssClass: "filters",
        controls: require("./filters.coffee"),
        tooltip: "Filters"
      }, {
        name: "Stickers",
        cssClass: "stickers",
        controls: require("./stickers_control.coffee"),
        tooltip: "Stickers"
      }, {
        name: "Orientation",
        cssClass: "orientation",
        controls: require("./orientation.coffee"),
        tooltip: "Orientation"
      }, {
        name: "Focus",
        cssClass: "focus",
        controls: require("./focus.coffee"),
        tooltip: "Focus"
      }, {
        name: "Crop",
        cssClass: "crop",
        controls: require("./crop.coffee"),
        operation: require("../../operations/crop.coffee"),
        tooltip: "Crop"
      }, {
        name: "Brightness",
        cssClass: "brightness",
        controls: require("./brightness.coffee"),
        operation: require("../../operations/brightness.coffee"),
        tooltip: "Brightness"
      }, {
        name: "Contrast",
        cssClass: "contrast",
        controls: require("./contrast.coffee"),
        operation: require("../../operations/contrast.coffee"),
        tooltip: "Contrast"
      }, {
        name: "Saturation",
        cssClass: "saturation",
        controls: require("./saturation.coffee"),
        operation: require("../../operations/saturation.coffee"),
        tooltip: "Saturation"
      }, {
        name: "Text",
        cssClass: "text",
        controls: require("./text.coffee"),
        operation: require("../../operations/text.coffee"),
        tooltip: "Text"
      }, {
        name: "Frames",
        cssClass: "frames",
        controls: require("./frames.coffee"),
        operation: require("../../operations/frames.coffee"),
        tooltip: "Frames"
      }
    ];
  }

  return UIControlsOverview;

})(List);

module.exports = UIControlsOverview;



},{"../../operations/brightness.coffee":4,"../../operations/contrast.coffee":5,"../../operations/crop.coffee":6,"../../operations/frames.coffee":52,"../../operations/saturation.coffee":55,"../../operations/text.coffee":57,"./base/list.coffee":62,"./brightness.coffee":64,"./contrast.coffee":65,"./crop.coffee":66,"./filters.coffee":67,"./focus.coffee":68,"./frames.coffee":69,"./orientation.coffee":70,"./saturation.coffee":72,"./social_networks_resize.coffee":73,"./stickers_control.coffee":74,"./text.coffee":75}],72:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Slider, UIControlsSaturation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("./base/slider.coffee");

UIControlsSaturation = (function(_super) {
  __extends(UIControlsSaturation, _super);

  function UIControlsSaturation() {
    return UIControlsSaturation.__super__.constructor.apply(this, arguments);
  }

  UIControlsSaturation.prototype.name = "Saturation";

  UIControlsSaturation.prototype.cssClass = "saturation";

  UIControlsSaturation.prototype.valueSetMethod = "setSaturation";

  UIControlsSaturation.prototype.displayButtons = true;

  return UIControlsSaturation;

})(Slider);

module.exports = UIControlsSaturation;



},{"./base/slider.coffee":63}],73:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, Crop, Rect, UIControlsSocialNetworkResize, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

Crop = require("./crop.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsSocialNetworkResize = (function(_super) {
  __extends(UIControlsSocialNetworkResize, _super);

  UIControlsSocialNetworkResize.prototype.displayButtons = true;

  UIControlsSocialNetworkResize.prototype.minimumCropSize = 50;

  UIControlsSocialNetworkResize.prototype.singleOperation = true;


  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
   */

  function UIControlsSocialNetworkResize(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsSocialNetworkResize.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/social_networks_resize.coffee");
    this.listItems = [
      {
        name: "Facebook",
        cssClass: "facebook",
        method: "setSize",
        "arguments": ["facebook"],
        tooltip: "Facebook",
        "default": true,
        options: {
          size: "4:3"
        }
      }, {
        name: "Twitter",
        cssClass: "twitter",
        method: "setSize",
        "arguments": ["twitter"],
        tooltip: "Twitter",
        options: {
          size: "2:1"
        }
      }, {
        name: "LinkedIn",
        cssClass: "linkedin",
        method: "setSize",
        "arguments": ["linkedin"],
        tooltip: "LinkedIn",
        options: {
          size: "18:11"
        }
      }, {
        name: "Instagram",
        cssClass: "instagram",
        method: "setSize",
        "arguments": ["instagram"],
        tooltip: "Instagram",
        options: {
          size: "1:1"
        }
      }, {
        name: "Pinterest",
        cssClass: "pinterest",
        method: "setSize",
        "arguments": ["pinterest"],
        tooltip: "Pinterest",
        options: {
          size: "1:1"
        }
      }
    ];
  }

  return UIControlsSocialNetworkResize;

})(Crop);

module.exports = UIControlsSocialNetworkResize;



},{"../../math/rect.coffee":2,"../../math/vector2.coffee":3,"../../operations/social_networks_resize.coffee":56,"./crop.coffee":66,"jquery":"jquery"}],74:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, Rect, UIControlsStickers, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

UIControlsStickers = (function(_super) {
  __extends(UIControlsStickers, _super);

  UIControlsStickers.prototype.singleOperation = true;

  UIControlsStickers.prototype.displayButtons = true;

  UIControlsStickers.prototype.hasCanvasControls = true;

  UIControlsStickers.prototype.cssClassIdentifier = "sticker";


  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
   */

  function UIControlsStickers(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsStickers.__super__.constructor.apply(this, arguments);
    this.operationClass = require("../../operations/draw_image.coffee");
    this.listItems = [
      {
        name: "Nerd glasses",
        cssClass: "sticker-glasses-nerd",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-nerd.png"],
        pixmap: "stickers/sticker-glasses-nerd.png",
        tooltip: "Nerd glasses",
        "default": true
      }, {
        name: "Normal glasses",
        cssClass: "sticker-glasses-normal",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-normal.png"],
        pixmap: "stickers/sticker-glasses-normal.png",
        tooltip: "Normal glasses"
      }, {
        name: "Green shutter glasses",
        cssClass: "sticker-glasses-shutter-green",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-shutter-green.png"],
        pixmap: "stickers/sticker-glasses-shutter-green.png",
        tooltip: "Green shutter glasses"
      }, {
        name: "Yellow shutter glasses",
        cssClass: "sticker-glasses-shutter-yellow",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-shutter-yellow.png"],
        pixmap: "stickers/sticker-glasses-shutter-yellow.png",
        tooltip: "Yellow shutter glasses"
      }, {
        name: "Sunglasses",
        cssClass: "sticker-glasses-sun",
        method: "useSticker",
        "arguments": ["stickers/sticker-glasses-sun.png"],
        pixmap: "stickers/sticker-glasses-sun.png",
        tooltip: "Sunglasses"
      }, {
        name: "Cap",
        cssClass: "sticker-hat-cap",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-cap.png"],
        pixmap: "stickers/sticker-hat-cap.png",
        tooltip: "Cap"
      }, {
        name: "Party hat",
        cssClass: "sticker-hat-party",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-party.png"],
        pixmap: "stickers/sticker-hat-party.png",
        tooltip: "Party hat"
      }, {
        name: "Sheriff's' hat",
        cssClass: "sticker-hat-sheriff",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-sheriff.png"],
        pixmap: "stickers/sticker-hat-sheriff.png",
        tooltip: "Sheriff's hat'"
      }, {
        name: "Cylinder",
        cssClass: "sticker-hat-cylinder",
        method: "useSticker",
        "arguments": ["stickers/sticker-hat-cylinder.png"],
        pixmap: "stickers/sticker-hat-cylinder.png",
        tooltip: "Cylinder"
      }, {
        name: "Heart",
        cssClass: "sticker-heart",
        method: "useSticker",
        "arguments": ["stickers/sticker-heart.png"],
        pixmap: "stickers/sticker-heart.png",
        tooltip: "Heart"
      }, {
        name: "Mustache 1",
        cssClass: "sticker-mustache1",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache1.png"],
        pixmap: "stickers/sticker-mustache1.png",
        tooltip: "Mustache 1"
      }, {
        name: "Mustache 2",
        cssClass: "sticker-mustache2",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache2.png"],
        pixmap: "stickers/sticker-mustache2.png",
        tooltip: "Mustache 2"
      }, {
        name: "Mustache 3",
        cssClass: "sticker-mustache3",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache3.png"],
        pixmap: "stickers/sticker-mustache3.png",
        tooltip: "Mustache 3"
      }, {
        name: "Long mustache",
        cssClass: "sticker-mustache-long",
        method: "useSticker",
        "arguments": ["stickers/sticker-mustache-long.png"],
        pixmap: "stickers/sticker-mustache-long.png",
        tooltip: "Long mustache"
      }, {
        name: "Pipe",
        cssClass: "sticker-pipe",
        method: "useSticker",
        "arguments": ["stickers/sticker-pipe.png"],
        pixmap: "stickers/sticker-pipe.png",
        tooltip: "Pipe"
      }, {
        name: "Snowflake",
        cssClass: "sticker-snowflake",
        method: "useSticker",
        "arguments": ["stickers/sticker-snowflake.png"],
        pixmap: "stickers/sticker-snowflake.png",
        tooltip: "Snowflake"
      }, {
        name: "Star",
        cssClass: "sticker-star",
        method: "useSticker",
        "arguments": ["stickers/sticker-star.png"],
        pixmap: "stickers/sticker-star.png",
        tooltip: "Star"
      }
    ];
  }


  /*
    @param {jQuery.Object} canvasControlsContainer
   */

  UIControlsStickers.prototype.hasCanvasControls = true;

  UIControlsStickers.prototype.setupCanvasControls = function(canvasControlsContainer) {
    this.canvasControlsContainer = canvasControlsContainer;
    this.stickerContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-sticker-container").appendTo(this.canvasControlsContainer);
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-sticker-crosshair").appendTo(this.stickerContainer);
    this.resizeKnob = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob").css({
      left: 120
    }).appendTo(this.stickerContainer);
    this.handleCrosshair();
    return this.handleResizeKnob();
  };


  /*
    Move the sticker around by dragging the crosshair
   */

  UIControlsStickers.prototype.handleCrosshair = function() {
    var canvasRect, maxContainerPosition, minContainerPosition, minimumHeight, minimumWidth;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minimumWidth = 0;
    minimumHeight = 0;
    minContainerPosition = new Vector2(0, -20);
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight);
    return this.crosshair.mousedown((function(_this) {
      return function(e) {
        var currentContainerPosition, currentMousePosition, initialContainerPosition, initialMousePosition;
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        currentMousePosition = new Vector2().copy(initialMousePosition);
        initialContainerPosition = new Vector2(_this.stickerContainer.position().left, _this.stickerContainer.position().top);
        currentContainerPosition = new Vector2().copy(initialContainerPosition);
        $(document).mousemove(function(e) {
          var mousePositionDifference;
          currentMousePosition.set(e.clientX, e.clientY);
          mousePositionDifference = new Vector2().copy(currentMousePosition).subtract(initialMousePosition);
          currentContainerPosition.copy(initialContainerPosition).add(mousePositionDifference).clamp(minContainerPosition, maxContainerPosition);
          _this.stickerContainer.css({
            left: currentContainerPosition.x,
            top: currentContainerPosition.y,
            width: _this.operationOptions.stickerImageWidth,
            height: _this.operationOptions.stickerImageHeight
          });
          _this.resizeKnob.css({
            left: _this.operationOptions.scale
          });
          if (_this.stickerContainer.position().left + _this.operationOptions.scale > _this.canvasControlsContainer.width() + 20) {
            _this.operationOptions.scale = _this.canvasControlsContainer.width() - _this.stickerContainer.position().left + 20;
          }
          _this.operationOptions.stickerPosition = new Vector2().copy(currentContainerPosition);
          _this.operationOptions.widthRange = _this.canvasControlsContainer.width();
          _this.operationOptions.heightRange = _this.canvasControlsContainer.height();
          _this.operation.setOptions(_this.operationOptions);
          return _this.emit("renderPreview");
        });
        return $(document).mouseup(function() {
          $(document).off("mousemove");
          return $(document).off("mouseup");
        });
      };
    })(this));
  };


  /*
    Handles the dragging of resize knob
   */

  UIControlsStickers.prototype.handleResizeKnob = function() {
    var canvasRect, maxContainerPosition, minContainerPosition;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minContainerPosition = new Vector2(20, 0);
    maxContainerPosition = new Vector2(canvasRect.width, canvasRect.height);
    return this.resizeKnob.mousedown((function(_this) {
      return function(e) {
        var initialContainerPosition, initialKnobPosition, initialMousePosition;
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        initialKnobPosition = new Vector2(_this.resizeKnob.position().left, _this.resizeKnob.position().top);
        initialContainerPosition = new Vector2(_this.stickerContainer.position().left, _this.stickerContainer.position().top);
        $(document).mouseup(function(e) {
          $(document).off("mouseup");
          return $(document).off("mousemove");
        });
        return $(document).mousemove(function(e) {
          var ajdustedMaxContainerPosition, currentKnobPosition, currentMousePosition, mousePositionDifference;
          currentMousePosition = new Vector2(e.clientX, e.clientY);
          mousePositionDifference = new Vector2().copy(currentMousePosition).subtract(initialMousePosition);
          ajdustedMaxContainerPosition = new Vector2().copy(maxContainerPosition).subtract(new Vector2(_this.stickerContainer.position().left - 20, 0));
          currentKnobPosition = new Vector2().copy(initialKnobPosition).add(mousePositionDifference).clamp(minContainerPosition, ajdustedMaxContainerPosition);
          _this.resizeKnob.css({
            left: currentKnobPosition.x
          });
          _this.operationOptions.scale = _this.resizeKnob.position().left;
          _this.operation.setOptions(_this.operationOptions);
          return _this.emit("renderPreview");
        });
      };
    })(this));
  };

  return UIControlsStickers;

})(List);

module.exports = UIControlsStickers;



},{"../../math/rect.coffee":2,"../../math/vector2.coffee":3,"../../operations/draw_image.coffee":7,"./base/list.coffee":62,"jquery":"jquery"}],75:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var $, List, Rect, UIControlsText, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = require("jquery");

List = require("./base/list.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

require("../../vendor/spectrum")(window, $);

UIControlsText = (function(_super) {
  __extends(UIControlsText, _super);

  UIControlsText.prototype.displayButtons = true;

  UIControlsText.prototype.singleOperation = true;

  UIControlsText.prototype.hasCanvasControls = true;

  UIControlsText.prototype.cssClassIdentifier = "text";


  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
   */

  function UIControlsText(app, ui, controls) {
    var additionalFont, _i, _len, _ref;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.autoResizeTextInput = __bind(this.autoResizeTextInput, this);
    this.onFontsizeSmallerClick = __bind(this.onFontsizeSmallerClick, this);
    this.onFontsizeBiggerClick = __bind(this.onFontsizeBiggerClick, this);
    UIControlsText.__super__.constructor.apply(this, arguments);
    this.initialized = false;
    this.fontResizePerClick = 3;
    this.operationClass = require("../../operations/text.coffee");
    this.listItems = [
      {
        name: "Helvetica",
        method: "setFont",
        cssClass: "helvetica",
        "arguments": ["Helvetica"],
        tooltip: "Helvetica",
        "default": true
      }, {
        name: "Lucida Grande",
        method: "setFont",
        cssClass: "lucida-grande",
        "arguments": ["Lucida Grande"],
        tooltip: "Lucida Grande"
      }, {
        name: "Times New Roman",
        method: "setFont",
        cssClass: "times-new-roman",
        "arguments": ["Times New Roman"],
        tooltip: "Times New Roman"
      }
    ];
    if (this.app.options.additionalFonts != null) {
      _ref = this.app.options.additionalFonts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        additionalFont = _ref[_i];
        this.listItems.push({
          name: additionalFont.name,
          method: "setFont",
          cssClass: additionalFont.cssClass,
          "arguments": [additionalFont.name]
        });
      }
    }
  }


  /*
    Create controls DOM tree
   */

  UIControlsText.prototype.createList = function() {
    UIControlsText.__super__.createList.apply(this, arguments);

    /*
      Color control
     */
    this.textColorControl = $("<div>").addClass(ImglyKit.classPrefix + "controls-text-color-button " + ImglyKit.classPrefix + "controls-button-right").appendTo(this.wrapper);
    this.textColorPreview = $("<div>").addClass(ImglyKit.classPrefix + "controls-text-color").appendTo(this.textColorControl);

    /*
      Background color control
     */
    this.backgroundColorControl = $("<div>").addClass(ImglyKit.classPrefix + "controls-background-color-button " + ImglyKit.classPrefix + "controls-button-right").appendTo(this.wrapper);
    this.backgroundColorPreview = $("<div>").addClass(ImglyKit.classPrefix + "controls-background-color").appendTo(this.backgroundColorControl);
    this.list.css("margin-right", this.controls.getHeight() * 3);
    return this.handleColorsControl();
  };


  /*
    Handle the colors control
   */

  UIControlsText.prototype.handleColorsControl = function() {
    var defaultBackgroundColor, defaultForegroundColor;
    defaultForegroundColor = "rgba(255, 255, 255, 1.0)";
    defaultBackgroundColor = "rgba(0, 0, 0, 0.5)";
    this.textColorControl.spectrum({
      color: defaultForegroundColor,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      palette: [],
      showButtons: false,
      localStorageKey: "imgly.palette",
      move: (function(_this) {
        return function(color) {
          var colorComponents, rgbaString;
          colorComponents = color.toRgb();
          rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + "," + colorComponents.b + "," + colorComponents.a + ")";
          _this.textColorPreview.css({
            backgroundColor: rgbaString
          });
          _this.operationOptions.color = rgbaString;
          return _this.operation.setOptions(_this.operationOptions);
        };
      })(this)
    });
    this.backgroundColorControl.spectrum({
      color: defaultBackgroundColor,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      palette: [],
      showButtons: false,
      localStorageKey: "imgly.palette",
      move: (function(_this) {
        return function(color) {
          var colorComponents, rgbaString;
          colorComponents = color.toRgb();
          rgbaString = "rgba(" + colorComponents.r + "," + colorComponents.g + "," + colorComponents.b + "," + colorComponents.a + ")";
          _this.backgroundColorPreview.css({
            backgroundColor: rgbaString
          });
          _this.textContainer.css({
            backgroundColor: rgbaString
          });
          _this.operationOptions.backgroundColor = rgbaString;
          return _this.operation.setOptions(_this.operationOptions);
        };
      })(this)
    });
    this.textColorPreview.css({
      backgroundColor: defaultForegroundColor
    });
    this.backgroundColorPreview.css({
      backgroundColor: defaultBackgroundColor
    });
    this.textContainer.css({
      backgroundColor: defaultBackgroundColor
    });
  };


  /*
    @param {jQuery.Object} canvasControlsContainer
   */

  UIControlsText.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var control, _i, _len, _ref;
    this.canvasControlsContainer = canvasControlsContainer;
    this.textContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-container").appendTo(this.canvasControlsContainer);
    this.fontsizeButtonsContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-size-container").appendTo(this.textContainer);
    _ref = ["Smaller", "Bigger"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      control = _ref[_i];
      this["fontsize" + control + "Button"] = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-size-" + control.toLowerCase()).appendTo(this.fontsizeButtonsContainer);
      this["fontsize" + control + "Button"].on("click", this["onFontsize" + control + "Click"]);
    }
    this.crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair " + ImglyKit.classPrefix + "canvas-text-crosshair").appendTo(this.textContainer);
    this.handleCrosshair();
    this.textInput = $("<textarea>").addClass(ImglyKit.classPrefix + "canvas-text-input").appendTo(this.textContainer).attr({
      placeholder: "Text"
    }).focus();
    this.textInputDummy = $("<div>").addClass(ImglyKit.classPrefix + "canvas-text-input-dummy").appendTo(this.canvasControlsContainer);
    this.textInput.keyup((function(_this) {
      return function(e) {
        _this.operationOptions.text = _this.textInput.val();
        _this.operation.setOptions(_this.operationOptions);
        return _this.autoResizeTextInput();
      };
    })(this));
    return after(100, (function(_this) {
      return function() {
        return _this.autoResizeTextInput();
      };
    })(this));
  };


  /*
    Gets called as soon as the user clicks the button
    to increase font size
   */

  UIControlsText.prototype.onFontsizeBiggerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.min(this.operationOptions.fontSize + resizeFactor, 1);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };


  /*
    Gets called as soon as the user clicks the button
    to reduce font size
   */

  UIControlsText.prototype.onFontsizeSmallerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.max(this.operationOptions.fontSize - resizeFactor, 0.05);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };


  /*
    Update input position
   */

  UIControlsText.prototype.updateCanvasControls = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.textContainer.css({
      left: this.operationOptions.start.x * canvasWidth,
      top: this.operationOptions.start.y * canvasHeight
    });
    return this.autoResizeTextInput();
  };


  /*
    Move the text input around by dragging the crosshair
   */

  UIControlsText.prototype.handleCrosshair = function() {
    var canvasRect, maxContainerPosition, minContainerPosition, minimumHeight, minimumWidth;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minimumWidth = 50;
    minimumHeight = 50;
    minContainerPosition = new Vector2(0, 0);
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight);
    return this.crosshair.mousedown((function(_this) {
      return function(e) {
        var currentContainerPosition, currentMousePosition, initialContainerPosition, initialMousePosition;
        initialMousePosition = new Vector2(e.clientX, e.clientY);
        currentMousePosition = new Vector2().copy(initialMousePosition);
        initialContainerPosition = new Vector2(_this.textContainer.position().left, _this.textContainer.position().top);
        currentContainerPosition = new Vector2().copy(initialContainerPosition);
        $(document).mousemove(function(e) {
          var mousePositionDifference;
          currentMousePosition.set(e.clientX, e.clientY);
          mousePositionDifference = new Vector2().copy(currentMousePosition).subtract(initialMousePosition);
          currentContainerPosition.copy(initialContainerPosition).add(mousePositionDifference).clamp(minContainerPosition, maxContainerPosition);
          _this.textContainer.css({
            left: currentContainerPosition.x,
            top: currentContainerPosition.y
          });
          _this.operationOptions.start = new Vector2().copy(currentContainerPosition).divideByRect(canvasRect);
          _this.operation.setOptions(_this.operationOptions);
          return _this.updateCanvasControls();
        });
        return $(document).mouseup(function() {
          $(document).off("mousemove");
          return $(document).off("mouseup");
        });
      };
    })(this));
  };


  /*
    Automatically resizes the text input
   */

  UIControlsText.prototype.autoResizeTextInput = function() {
    var canvasHeight, canvasWidth, comfortZoneX, comfortZoneY, fontSize, inputWidth, maxHeight, maxWidth, paddingX, paddingY, text;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    inputWidth = this.textInput.width();
    fontSize = parseInt(this.textInput.css("font-size"));
    comfortZoneX = fontSize * 3;
    comfortZoneY = fontSize * 2;
    paddingX = parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textInputDummy.css("padding-right"));
    paddingY = parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textInputDummy.css("padding-bottom"));
    this.operationOptions.paddingLeft = (parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textContainer.css("border-left-width"))) / canvasWidth;
    this.operationOptions.paddingTop = (parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textContainer.css("border-top-width"))) / canvasHeight;
    maxWidth = canvasWidth - this.operationOptions.start.x * canvasWidth;
    maxHeight = canvasHeight - this.operationOptions.start.y * canvasHeight;
    text = this.textInput.val();
    if (text.match(/\n$/i)) {
      text = text + "&nbsp;";
    }
    text = text.replace(/\n/g, "<br />");
    if (!text) {
      text = "&nbsp;";
    }
    this.textInputDummy.css({
      width: "auto",
      height: "auto"
    }).html(text);
    if (this.textInputDummy.width() >= maxWidth) {
      this.textInputDummy.css({
        width: maxWidth
      });
      comfortZoneX = 0;
    }
    if (this.textInputDummy.height() >= maxHeight) {
      this.textInputDummy.css({
        height: maxHeight
      });
      comfortZoneY = 0;
    }
    return this.textInput.css({
      width: Math.min(this.textInputDummy.width() + comfortZoneX, maxWidth),
      height: Math.min(this.textInputDummy.height() + comfortZoneY, maxHeight)
    });
  };


  /*
    @params {Object} options
   */

  UIControlsText.prototype.updateOptions = function(operationOptions) {
    var canvasHeight;
    this.operationOptions = operationOptions;
    canvasHeight = this.canvasControlsContainer.height();
    $([this.textInput.get(0), this.textInputDummy.get(0)]).css({
      fontSize: this.operationOptions.fontSize * canvasHeight,
      color: this.operationOptions.color,
      fontFamily: this.operationOptions.font,
      lineHeight: this.operationOptions.lineHeight
    });
    return this.updateCanvasControls();
  };

  return UIControlsText;

})(List);

module.exports = UIControlsText;



},{"../../math/rect.coffee":2,"../../math/vector2.coffee":3,"../../operations/text.coffee":57,"../../vendor/spectrum":81,"./base/list.coffee":62,"jquery":"jquery"}],76:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Canvas, Controls, EventEmitter, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controls = require("./controls.coffee");

Canvas = require("./canvas.coffee");

EventEmitter = require("events").EventEmitter;

UI = (function(_super) {
  __extends(UI, _super);


  /*
    @param {imglyUtil} app
   */

  function UI(app) {
    this.app = app;
    this.initialized = false;
  }


  /*
    @returns {ImglyKit.UI.Canvas}
   */

  UI.prototype.getCanvas = function() {
    return this.canvas;
  };


  /*
    @returns ImglyKit.UI.Controls.Base
   */

  UI.prototype.getCurrentControls = function() {
    return this.controls.getCurrentControls();
  };


  /*
    Initializes all UI elements
   */

  UI.prototype.init = function() {
    this.controls = new Controls(this.app, this);
    this.controls.on("preview_operation", (function(_this) {
      return function(operation) {
        return _this.emit("preview_operation", operation);
      };
    })(this));
    this.controls.on("back", (function(_this) {
      return function() {
        return _this.emit("back");
      };
    })(this));
    this.controls.on("done", (function(_this) {
      return function() {
        return _this.emit("done");
      };
    })(this));
    this.canvas = new Canvas(this.app, this, {
      height: this.controls.getHeight()
    });
    return this.initialized = true;
  };


  /*
    Resets the controls
   */

  UI.prototype.resetControls = function() {
    return this.controls.reset();
  };

  return UI;

})(EventEmitter);

module.exports = UI;



},{"./canvas.coffee":59,"./controls.coffee":60,"events":82}],77:[function(require,module,exports){

/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
 */
var Resize, Utils;

Resize = require("./vendor/resize");

Utils = {};

Utils.sharedCanvas = document.createElement("canvas");

Utils.sharedContext = Utils.sharedCanvas.getContext("2d");


/*
  @param options Options
  @param options.image Dimensions (width, height) of the image
  @param options.container Dimensions (width, height) of the container
  @returns {Object} An object containing the final canvas dimensions (width, height)
 */

Utils.calculateCanvasSize = function(options) {
  var result, scale;
  scale = Math.min(options.container.width / options.image.width, options.container.height / options.image.height);
  result = {
    width: options.image.width * scale,
    height: options.image.height * scale
  };
  return result;
};


/*
  Creates a number as a fingerprint for an array of numbers.

  Based on http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery.

  @param {Array} data
  @returns {Number}
 */

Utils.fingerprint = function(data) {
  var hash, point, _i, _len;
  hash = 0;
  if (!data.length) {
    return hash;
  }
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    point = data[_i];
    hash = ((hash << 5) - hash) + point;
    hash |= 0;
  }
  return hash;
};


/*
  @param {Image} image
  @returns {ImageData}
 */

Utils.getImageDataForImage = function(image) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};


/*
  @param {Image} image
  @param {CanvasRenderingContext2d} context
 */

Utils.resizeImageSmooth = function(image, context) {
  var destHeight, destImageData, destPixels, destWidth, i, resized, resizedBuffer, resizedBufferLength, sourceImageData, sourcePixels, _i;
  sourceImageData = Utils.getImageDataForImage(image);
  destImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  sourcePixels = sourceImageData.data;
  destPixels = destImageData.data;
  destWidth = context.canvas.width;
  destHeight = context.canvas.height;
  resized = new Resize(image.width, image.height, destWidth, destHeight, true, true, false);
  resizedBuffer = resized.resize(sourcePixels);
  resizedBufferLength = resizedBuffer.length;
  for (i = _i = 0; 0 <= resizedBufferLength ? _i < resizedBufferLength : _i > resizedBufferLength; i = 0 <= resizedBufferLength ? ++_i : --_i) {
    destPixels[i] = resizedBuffer[i] & 0xFF;
  }
  return context.putImageData(destImageData, 0, 0);
};


/*
  @param {Image} image
  @returns {ImageData}
 */

Utils.getResizedImageDataForImage = function(image, dimensions, options) {
  var canvas, context;
  if (options == null) {
    options = {};
  }
  if (options.smooth == null) {
    options.smooth = false;
  }
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  context = canvas.getContext("2d");
  if (!options.smooth) {
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  } else {
    Utils.resizeImageSmooth(image, context);
  }
  return context.getImageData(0, 0, canvas.width, canvas.height);
};


/*
  @param {ImageData} imageData
  @param {Object} dimensions
  @returns {ImageData}
 */

Utils.resizeImageData = function(imageData, options) {
  var destinationCanvas, destinationContext, dimensions, sourceCanvas, sourceContext;
  if (options == null) {
    options = {};
  }
  if (options.size == null) {
    throw new Error("No size given.");
  }
  if (options.smooth == null) {
    options.smooth = false;
  }
  sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = imageData.width;
  sourceCanvas.height = imageData.height;
  sourceContext = sourceCanvas.getContext("2d");
  sourceContext.putImageData(imageData, 0, 0);
  dimensions = Utils.calculateDimensionsFromSize(imageData, options.size);
  destinationCanvas = document.createElement("canvas");
  destinationCanvas.width = dimensions.width;
  destinationCanvas.height = dimensions.height;
  destinationContext = destinationCanvas.getContext("2d");
  if (!options.smooth) {
    destinationContext.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, destinationCanvas.width, destinationCanvas.height);
  } else {
    Utils.resizeImageSmooth(sourceCanvas, destinationContext);
  }
  return destinationContext.getImageData(0, 0, destinationCanvas.width, destinationCanvas.height);
};


/*
  @param {Object} size
  @returns {Object}
 */

Utils.calculateDimensionsFromSize = function(sourceSize, size) {
  var containerSize, height, m, match, modifier, ratio, width, x, y;
  match = size.match(/^([0-9]+)?x([0-9]+)?([\!])?$/i);
  if (!match) {
    throw new Error("Invalid size option: " + size);
  }
  m = match[0], x = match[1], y = match[2], modifier = match[3];
  if (modifier === "!" && !((x != null) && (y != null))) {
    throw new Error("Both `x` and `y` have to be set when using the fixed (!) modifier.");
  }
  if (!((x != null) || (y != null))) {
    throw new Error("Neither `x` nor `y` are given.");
  }
  if (modifier === "!") {
    return {
      width: x,
      height: y
    };
  } else {
    containerSize = {
      width: sourceSize.width,
      height: sourceSize.height
    };
    if ((x != null) && (y != null)) {
      return Utils.calculateCanvasSize({
        container: {
          width: x,
          height: y
        },
        image: sourceSize
      });
    } else if (x != null) {
      width = x;
      ratio = sourceSize.height / sourceSize.width;
      height = width * ratio;
    } else if (y != null) {
      height = y;
      ratio = sourceSize.width / sourceSize.height;
      width = height * ratio;
    }
    return {
      width: width,
      height: height
    };
  }
};


/*
  @param {ImageData} imageData
  @returns {ImageData}
 */

Utils.cloneImageData = function(imageData) {
  var i, newImageData, _i, _ref;
  newImageData = this.sharedContext.createImageData(imageData.width, imageData.height);
  for (i = _i = 0, _ref = imageData.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    newImageData.data[i] = imageData.data[i];
  }
  return newImageData;
};


/*
  @param {Object} dimensions
  @param {Integer} dimensions.width
  @param {Integer} dimensions.height
  @returns {HTMLCanvasElement}
 */

Utils.newCanvasWithDimensions = function(dimensions) {
  var canvas;
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  return canvas;
};


/*
  @param {imageData} imageData
  @returns {HTMLCanvasElement}
 */

Utils.newCanvasFromImageData = function(imageData) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  return canvas;
};


/*
  @param {String} str Input String
  @returns {String} Output Stirng
 */

Utils.dasherize = function(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/[-_\s]+/g, '-');
};


/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
 */

Utils.clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
};


/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
 */

Utils.within = function(number, min, max) {
  return (min < number && number < max);
};


/*
  @param {Object} x/y coordinates
  @param [Object] minimum and maximum x/y coordinates
  @returns {Boolean}
 */

Utils.withinBoundaries = function(coords, boundaries) {
  if (boundaries == null) {
    boundaries = {
      x: {
        min: 0,
        max: 1
      },
      y: {
        min: 0,
        max: 1
      }
    };
  }
  return !(coords.x < boundaries.x.min || coords.x > boundaries.x.max || coords.y < boundaries.y.min || coords.y > boundaries.y.max);
};


/*
  @param {String} string
  @returns {String}
 */

Utils.truncate = function(string, length) {
  if (length == null) {
    length = 10;
  }
  if (string.length > length) {
    return string.substr(0, length - 3) + "...";
  } else {
    return string;
  }
};

module.exports = Utils;



},{"./vendor/resize":80}],78:[function(require,module,exports){
var Perf;

Perf = (function() {
  function Perf(name, options) {
    var _base, _base1, _base2;
    this.name = name;
    this.options = options != null ? options : {};
    if ((_base = this.options).good == null) {
      _base.good = 100;
    }
    if ((_base1 = this.options).bad == null) {
      _base1.bad = 500;
    }
    if ((_base2 = this.options).debug == null) {
      _base2.debug = true;
    }
    this.started = false;
  }

  Perf.prototype.start = function() {
    if (this.started || !this.options.debug) {
      return;
    }
    this.start = +new Date();
    return this.started = true;
  };

  Perf.prototype.stop = function(printLine) {
    var background, color, duration, end, message;
    if (!this.started || !this.options.debug) {
      return;
    }
    end = +new Date();
    duration = end - this.start;
    if (this.name != null) {
      message = this.name + ' took';
    } else {
      message = 'Code execution time:';
    }
    if (typeof window !== "undefined" && window !== null) {
      if (duration < this.options.good) {
        background = 'darkgreen';
        color = 'white';
      } else if (duration > this.options.good && duration < this.options.bad) {
        background = 'orange';
        color = 'black';
      } else {
        background = 'darkred';
        color = 'white';
      }
      console.log('%c perf %c ' + message + ' %c ' + duration.toFixed(2) + 'ms ', 'background: #222; color: #bada55', '', 'background: ' + background + '; color: ' + color);
    } else {
      console.log('[perf] ' + message + ' ' + duration.toFixed(2) + 'ms');
    }
    this.started = false;
    if (printLine && (typeof window !== "undefined" && window !== null)) {
      return console.log('%c perf %c -- END --                                                                          ', 'background: #222; color: #bada55', 'background: #222; color: #ffffff');
    }
  };

  return Perf;

})();

module.exports = Perf;



},{}],79:[function(require,module,exports){

/*
  Common interface for promises.

  Use jQuery's Deferreds when in browser environment,
  otherwise assume node environment and load kriskowal's q.
 */
var Queue, provider;

provider = typeof window !== "undefined" ? require("jquery") : require("q");


/*
  Creates a thenable value from the given value.

  @param value
  @returns {Promise}
 */

Queue = function() {
  return provider.when.apply(provider, arguments);
};


/*
  Creates a new promise.

  Calls the resolver which takes as arguments three functions `resolve`,
  `reject` and `progress`.

  @param {function} resolver
  @returns {Promise}
 */

Queue.promise = (function() {
  if (typeof window !== "undefined") {
    return function(resolver) {
      var d;
      d = provider.Deferred();
      resolver(d.resolve, d.reject, d.progress);
      return d;
    };
  } else {
    return function() {
      return provider.promise.apply(provider, arguments);
    };
  }
})();

module.exports = Queue;



},{"jquery":"jquery","q":"q"}],80:[function(require,module,exports){

//JavaScript Image Resizer (c) 2012 - Grant Galitz
var scripts = document.getElementsByTagName("script");
var sourceOfWorker = scripts[scripts.length-1].src;
function Resize(widthOriginal, heightOriginal, targetWidth, targetHeight, blendAlpha, interpolationPass, useWebWorker, resizeCallback) {
  this.widthOriginal = Math.abs(parseInt(widthOriginal) || 0);
  this.heightOriginal = Math.abs(parseInt(heightOriginal) || 0);
  this.targetWidth = Math.abs(parseInt(targetWidth) || 0);
  this.targetHeight = Math.abs(parseInt(targetHeight) || 0);
  this.colorChannels = (!!blendAlpha) ? 4 : 3;
  this.interpolationPass = !!interpolationPass;
  this.useWebWorker = !!useWebWorker;
  this.resizeCallback = (typeof resizeCallback == "function") ? resizeCallback : function (returnedArray) {};
  this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
  this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
  this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
  this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
  this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
  this.initialize();
}
Resize.prototype.initialize = function () {
  //Perform some checks:
  if (this.widthOriginal > 0 && this.heightOriginal > 0 && this.targetWidth > 0 && this.targetHeight > 0) {
    if (this.useWebWorker) {
      this.useWebWorker = (this.widthOriginal != this.targetWidth || this.heightOriginal != this.targetHeight);
      if (this.useWebWorker) {
        this.configureWorker();
      }
    }
    if (!this.useWebWorker) {
      this.configurePasses();
    }
  }
  else {
    throw(new Error("Invalid settings specified for the resizer."));
  }
}
Resize.prototype.configureWorker = function () {
  try {
    var parentObj = this;
    this.worker = new Worker(sourceOfWorker.substring(0, sourceOfWorker.length - 3) + "Worker.js");
    this.worker.onmessage = function (event) {
      parentObj.heightBuffer = event.data;
      parentObj.resizeCallback(parentObj.heightBuffer);
    }
    this.worker.postMessage(["setup", this.widthOriginal, this.heightOriginal, this.targetWidth, this.targetHeight, this.colorChannels, this.interpolationPass]);
  }
  catch (error) {
    this.useWebWorker = false;
  }
}
Resize.prototype.configurePasses = function () {
  if (this.widthOriginal == this.targetWidth) {
    //Bypass the width resizer pass:
    this.resizeWidth = this.bypassResizer;
  }
  else {
    //Setup the width resizer pass:
    this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
    if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
      this.initializeFirstPassBuffers(true);
      this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB;
    }
    else {
      this.initializeFirstPassBuffers(false);
      this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthRGBA : this.resizeWidthRGB;
    }
  }
  if (this.heightOriginal == this.targetHeight) {
    //Bypass the height resizer pass:
    this.resizeHeight = this.bypassResizer;
  }
  else {
    //Setup the height resizer pass:
    this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
    if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
      this.initializeSecondPassBuffers(true);
      this.resizeHeight = this.resizeHeightInterpolated;
    }
    else {
      this.initializeSecondPassBuffers(false);
      this.resizeHeight = (this.colorChannels == 4) ? this.resizeHeightRGBA : this.resizeHeightRGB;
    }
  }
}
Resize.prototype.resizeWidthRGB = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var line = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 2;
  var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 2;
  var output = this.outputWidthWorkBench;
  var outputBuffer = this.widthBuffer;
  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels;) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset] * amountToNext;
        }
        currentPosition = actualPosition = actualPosition + 3;
        weight -= amountToNext;
      }
      else {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
    for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
      outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
      outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
      outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
    }
    outputOffset += 3;
  } while (outputOffset < this.targetWidthMultipliedByChannels);
  return outputBuffer;
}
Resize.prototype.resizeWidthInterpolatedRGB = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var firstWeight = 0;
  var secondWeight = 0;
  var outputBuffer = this.widthBuffer;
  //Handle for only one interpolation input being valid for start calculation:
  for (var targetPosition = 0; weight < 1/3; targetPosition += 3, weight += ratioWeight) {
    for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
    }
  }
  //Adjust for overshoot of the last pass's counter:
  weight -= 1/3;
  for (var interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += 3, weight += ratioWeight) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 3; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 3] * secondWeight);
      outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
      outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
    }
  }
  //Handle for only one interpolation input being valid for end calculation:
  for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - 3; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 3) {
    for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
    }
  }
  return outputBuffer;
}
Resize.prototype.resizeWidthRGBA = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var line = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 3;
  var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 3;
  var output = this.outputWidthWorkBench;
  var outputBuffer = this.widthBuffer;
  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels;) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset] * amountToNext;
        }
        currentPosition = actualPosition = actualPosition + 4;
        weight -= amountToNext;
      }
      else {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
    for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
      outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
      outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
      outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
      outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
    }
    outputOffset += 4;
  } while (outputOffset < this.targetWidthMultipliedByChannels);
  return outputBuffer;
}
Resize.prototype.resizeWidthInterpolatedRGBA = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var firstWeight = 0;
  var secondWeight = 0;
  var outputBuffer = this.widthBuffer;
  //Handle for only one interpolation input being valid for start calculation:
  for (var targetPosition = 0; weight < 1/3; targetPosition += 4, weight += ratioWeight) {
    for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  }
  //Adjust for overshoot of the last pass's counter:
  weight -= 1/3;
  for (var interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += 4, weight += ratioWeight) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 4; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
      outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
      outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 6] * secondWeight);
      outputBuffer[finalOffset + 3] = (buffer[pixelOffset + 3] * firstWeight) + (buffer[pixelOffset + 7] * secondWeight);
    }
  }
  //Handle for only one interpolation input being valid for end calculation:
  for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - 4; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 4) {
    for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  }
  return outputBuffer;
}
Resize.prototype.resizeHeightRGB = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var output = this.outputHeightWorkBench;
  var outputBuffer = this.heightBuffer;
  do {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
        }
        currentPosition = actualPosition;
        weight -= amountToNext;
      }
      else {
        for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
    }
  } while (outputOffset < this.finalResultSize);
  return outputBuffer;
}
Resize.prototype.resizeHeightInterpolated = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var pixelOffsetAccumulated = 0;
  var pixelOffsetAccumulated2 = 0;
  var firstWeight = 0;
  var secondWeight = 0;
  var outputBuffer = this.heightBuffer;
  //Handle for only one interpolation input being valid for start calculation:
  for (; weight < 1/3; weight += ratioWeight) {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
    }
  }
  //Adjust for overshoot of the last pass's counter:
  weight -= 1/3;
  for (var interpolationHeightSourceReadStop = this.heightOriginal - 1; weight < interpolationHeightSourceReadStop; weight += ratioWeight) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
    pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
      outputBuffer[finalOffset++] = Math.round((buffer[pixelOffsetAccumulated++] * firstWeight) + (buffer[pixelOffsetAccumulated2++] * secondWeight));
    }
  }
  //Handle for only one interpolation input being valid for end calculation:
  while (finalOffset < this.finalResultSize) {
    for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * this.targetWidthMultipliedByChannels; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
    }
  }
  return outputBuffer;
}
Resize.prototype.resizeHeightRGBA = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var output = this.outputHeightWorkBench;
  var outputBuffer = this.heightBuffer;
  do {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
        }
        currentPosition = actualPosition;
        weight -= amountToNext;
      }
      else {
        for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
    }
  } while (outputOffset < this.finalResultSize);
  return outputBuffer;
}
Resize.prototype.resize = function (buffer) {
  if (this.useWebWorker) {
    this.worker.postMessage(["resize", buffer]);
  }
  else {
    return this.resizeHeight(this.resizeWidth(buffer));
  }
}
Resize.prototype.bypassResizer = function (buffer) {
  //Just return the buffer passsed:
  return buffer;
}
Resize.prototype.initializeFirstPassBuffers = function (BILINEARAlgo) {
  //Initialize the internal width pass buffers:
  this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);
  if (!BILINEARAlgo) {
    this.outputWidthWorkBench = this.generateFloatBuffer(this.originalHeightMultipliedByChannels);
  }
}
Resize.prototype.initializeSecondPassBuffers = function (BILINEARAlgo) {
  //Initialize the internal height pass buffers:
  this.heightBuffer = this.generateUint8Buffer(this.finalResultSize);
  if (!BILINEARAlgo) {
    this.outputHeightWorkBench = this.generateFloatBuffer(this.targetWidthMultipliedByChannels);
  }
}
Resize.prototype.generateFloatBuffer = function (bufferLength) {
  //Generate a float32 typed array buffer:
  try {
    return new Float32Array(bufferLength);
  }
  catch (error) {
    return [];
  }
}
Resize.prototype.generateUint8Buffer = function (bufferLength) {
  //Generate a uint8 typed array buffer:
  try {
    return new Uint8Array(bufferLength);
  }
  catch (error) {
    return [];
  }
}
module.exports = Resize;

},{}],81:[function(require,module,exports){
module.exports = function(window,$,undefined){"use strict";function paletteTemplate(p,color,className,opts){for(var html=[],i=0;i<p.length;i++){var current=p[i];if(current){var tiny=tinycolor(current),c=tiny.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";c+=tinycolor.equals(color,current)?" sp-thumb-active":"";var formattedString=tiny.toString(opts.preferredFormat||"rgb"),swatchStyle=rgbaSupport?"background-color:"+tiny.toRgbString():"filter:"+tiny.toFilter();html.push('<span title="'+formattedString+'" data-color="'+tiny.toRgbString()+'" class="'+c+'"><span class="sp-thumb-inner" style="'+swatchStyle+';" /></span>')}else{var cls="sp-clear-display";html.push($("<div />").append($('<span data-color="" style="background-color:transparent;" class="'+cls+'"></span>').attr("title",opts.noColorSelectedText)).html())}}return"<div class='sp-cf "+className+"'>"+html.join("")+"</div>"}function hideAll(){for(var i=0;i<spectrums.length;i++)spectrums[i]&&spectrums[i].hide()}function instanceOptions(o,callbackContext){var opts=$.extend({},defaultOpts,o);return opts.callbacks={move:bind(opts.move,callbackContext),change:bind(opts.change,callbackContext),show:bind(opts.show,callbackContext),hide:bind(opts.hide,callbackContext),beforeShow:bind(opts.beforeShow,callbackContext)},opts}function spectrum(element,o){function applyOptions(){if(opts.showPaletteOnly&&(opts.showPalette=!0),toggleButton.text(opts.showPaletteOnly?opts.togglePaletteMoreText:opts.togglePaletteLessText),opts.palette){palette=opts.palette.slice(0),paletteArray=$.isArray(palette[0])?palette:[palette],paletteLookup={};for(var i=0;i<paletteArray.length;i++)for(var j=0;j<paletteArray[i].length;j++){var rgb=tinycolor(paletteArray[i][j]).toRgbString();paletteLookup[rgb]=!0}}container.toggleClass("sp-flat",flat),container.toggleClass("sp-input-disabled",!opts.showInput),container.toggleClass("sp-alpha-enabled",opts.showAlpha),container.toggleClass("sp-clear-enabled",allowEmpty),container.toggleClass("sp-buttons-disabled",!opts.showButtons),container.toggleClass("sp-palette-buttons-disabled",!opts.togglePaletteOnly),container.toggleClass("sp-palette-disabled",!opts.showPalette),container.toggleClass("sp-palette-only",opts.showPaletteOnly),container.toggleClass("sp-initial-disabled",!opts.showInitial),container.addClass(opts.className).addClass(opts.containerClassName),reflow()}function initialize(){function paletteElementClick(e){return e.data&&e.data.ignore?(set($(e.target).closest(".sp-thumb-el").data("color")),move()):(set($(e.target).closest(".sp-thumb-el").data("color")),move(),updateOriginalInput(!0),opts.hideAfterPaletteSelect&&hide()),!1}if(IE&&container.find("*:not(input)").attr("unselectable","on"),applyOptions(),shouldReplace&&boundElement.after(replacer).hide(),allowEmpty||clearButton.hide(),flat)boundElement.after(container).hide();else{var appendTo="parent"===opts.appendTo?boundElement.parent():$(opts.appendTo);1!==appendTo.length&&(appendTo=$("body")),appendTo.append(container)}updateSelectionPaletteFromStorage(),offsetElement.bind("click.spectrum touchstart.spectrum",function(e){disabled||toggle(),e.stopPropagation(),$(e.target).is("input")||e.preventDefault()}),(boundElement.is(":disabled")||opts.disabled===!0)&&disable(),container.click(stopPropagation),textInput.change(setFromTextInput),textInput.bind("paste",function(){setTimeout(setFromTextInput,1)}),textInput.keydown(function(e){13==e.keyCode&&setFromTextInput()}),cancelButton.text(opts.cancelText),cancelButton.bind("click.spectrum",function(e){e.stopPropagation(),e.preventDefault(),hide("cancel")}),clearButton.attr("title",opts.clearText),clearButton.bind("click.spectrum",function(e){e.stopPropagation(),e.preventDefault(),isEmpty=!0,move(),flat&&updateOriginalInput(!0)}),chooseButton.text(opts.chooseText),chooseButton.bind("click.spectrum",function(e){e.stopPropagation(),e.preventDefault(),isValid()&&(updateOriginalInput(!0),hide())}),toggleButton.text(opts.showPaletteOnly?opts.togglePaletteMoreText:opts.togglePaletteLessText),toggleButton.bind("click.spectrum",function(e){e.stopPropagation(),e.preventDefault(),opts.showPaletteOnly=!opts.showPaletteOnly,opts.showPaletteOnly||flat||container.css("left","-="+(pickerContainer.outerWidth(!0)+5)),applyOptions()}),draggable(alphaSlider,function(dragX,dragY,e){currentAlpha=dragX/alphaWidth,isEmpty=!1,e.shiftKey&&(currentAlpha=Math.round(10*currentAlpha)/10),move()},dragStart,dragStop),draggable(slider,function(dragX,dragY){currentHue=parseFloat(dragY/slideHeight),isEmpty=!1,opts.showAlpha||(currentAlpha=1),move()},dragStart,dragStop),draggable(dragger,function(dragX,dragY,e){if(e.shiftKey){if(!shiftMovementDirection){var oldDragX=currentSaturation*dragWidth,oldDragY=dragHeight-currentValue*dragHeight,furtherFromX=Math.abs(dragX-oldDragX)>Math.abs(dragY-oldDragY);shiftMovementDirection=furtherFromX?"x":"y"}}else shiftMovementDirection=null;var setSaturation=!shiftMovementDirection||"x"===shiftMovementDirection,setValue=!shiftMovementDirection||"y"===shiftMovementDirection;setSaturation&&(currentSaturation=parseFloat(dragX/dragWidth)),setValue&&(currentValue=parseFloat((dragHeight-dragY)/dragHeight)),isEmpty=!1,opts.showAlpha||(currentAlpha=1),move()},dragStart,dragStop),initialColor?(set(initialColor),updateUI(),currentPreferredFormat=preferredFormat||tinycolor(initialColor).format,addColorToSelectionPalette(initialColor)):updateUI(),flat&&show();var paletteEvent=IE?"mousedown.spectrum":"click.spectrum touchstart.spectrum";paletteContainer.delegate(".sp-thumb-el",paletteEvent,paletteElementClick),initialColorContainer.delegate(".sp-thumb-el:nth-child(1)",paletteEvent,{ignore:!0},paletteElementClick)}function updateSelectionPaletteFromStorage(){if(localStorageKey&&window.localStorage){try{var oldPalette=window.localStorage[localStorageKey].split(",#");oldPalette.length>1&&(delete window.localStorage[localStorageKey],$.each(oldPalette,function(i,c){addColorToSelectionPalette(c)}))}catch(e){}try{selectionPalette=window.localStorage[localStorageKey].split(";")}catch(e){}}}function addColorToSelectionPalette(color){if(showSelectionPalette){var rgb=tinycolor(color).toRgbString();if(!paletteLookup[rgb]&&-1===$.inArray(rgb,selectionPalette))for(selectionPalette.push(rgb);selectionPalette.length>maxSelectionSize;)selectionPalette.shift();if(localStorageKey&&window.localStorage)try{window.localStorage[localStorageKey]=selectionPalette.join(";")}catch(e){}}}function getUniqueSelectionPalette(){var unique=[];if(opts.showPalette)for(var i=0;i<selectionPalette.length;i++){var rgb=tinycolor(selectionPalette[i]).toRgbString();paletteLookup[rgb]||unique.push(selectionPalette[i])}return unique.reverse().slice(0,opts.maxSelectionSize)}function drawPalette(){var currentColor=get(),html=$.map(paletteArray,function(palette,i){return paletteTemplate(palette,currentColor,"sp-palette-row sp-palette-row-"+i,opts)});updateSelectionPaletteFromStorage(),selectionPalette&&html.push(paletteTemplate(getUniqueSelectionPalette(),currentColor,"sp-palette-row sp-palette-row-selection",opts)),paletteContainer.html(html.join(""))}function drawInitial(){if(opts.showInitial){var initial=colorOnShow,current=get();initialColorContainer.html(paletteTemplate([initial,current],current,"sp-palette-row-initial",opts))}}function dragStart(){(0>=dragHeight||0>=dragWidth||0>=slideHeight)&&reflow(),container.addClass(draggingClass),shiftMovementDirection=null,boundElement.trigger("dragstart.spectrum",[get()])}function dragStop(){container.removeClass(draggingClass),boundElement.trigger("dragstop.spectrum",[get()])}function setFromTextInput(){var value=textInput.val();if(null!==value&&""!==value||!allowEmpty){var tiny=tinycolor(value);tiny.isValid()?(set(tiny),updateOriginalInput(!0)):textInput.addClass("sp-validation-error")}else set(null),updateOriginalInput(!0)}function toggle(){visible?hide():show()}function show(){var event=$.Event("beforeShow.spectrum");return visible?void reflow():(boundElement.trigger(event,[get()]),void(callbacks.beforeShow(get())===!1||event.isDefaultPrevented()||(hideAll(),visible=!0,$(doc).bind("click.spectrum",hide),$(window).bind("resize.spectrum",resize),replacer.addClass("sp-active"),container.removeClass("sp-hidden"),reflow(),updateUI(),colorOnShow=get(),drawInitial(),callbacks.show(colorOnShow),boundElement.trigger("show.spectrum",[colorOnShow]))))}function hide(e){if((!e||"click"!=e.type||2!=e.button)&&visible&&!flat){visible=!1,$(doc).unbind("click.spectrum",hide),$(window).unbind("resize.spectrum",resize),replacer.removeClass("sp-active"),container.addClass("sp-hidden");var colorHasChanged=!tinycolor.equals(get(),colorOnShow);colorHasChanged&&(clickoutFiresChange&&"cancel"!==e?updateOriginalInput(!0):revert()),callbacks.hide(get()),boundElement.trigger("hide.spectrum",[get()])}}function revert(){set(colorOnShow,!0)}function set(color,ignoreFormatChange){if(tinycolor.equals(color,get()))return void updateUI();var newColor,newHsv;!color&&allowEmpty?isEmpty=!0:(isEmpty=!1,newColor=tinycolor(color),newHsv=newColor.toHsv(),currentHue=newHsv.h%360/360,currentSaturation=newHsv.s,currentValue=newHsv.v,currentAlpha=newHsv.a),updateUI(),newColor&&newColor.isValid()&&!ignoreFormatChange&&(currentPreferredFormat=preferredFormat||newColor.getFormat())}function get(opts){return opts=opts||{},allowEmpty&&isEmpty?null:tinycolor.fromRatio({h:currentHue,s:currentSaturation,v:currentValue,a:Math.round(100*currentAlpha)/100},{format:opts.format||currentPreferredFormat})}function isValid(){return!textInput.hasClass("sp-validation-error")}function move(){updateUI(),callbacks.move(get()),boundElement.trigger("move.spectrum",[get()])}function updateUI(){textInput.removeClass("sp-validation-error"),updateHelperLocations();var flatColor=tinycolor.fromRatio({h:currentHue,s:1,v:1});dragger.css("background-color",flatColor.toHexString());var format=currentPreferredFormat;1>currentAlpha&&(0!==currentAlpha||"name"!==format)&&("hex"===format||"hex3"===format||"hex6"===format||"name"===format)&&(format="rgb");var realColor=get({format:format}),displayColor="";if(previewElement.removeClass("sp-clear-display"),previewElement.css("background-color","transparent"),!realColor&&allowEmpty)previewElement.addClass("sp-clear-display");else{var realHex=realColor.toHexString(),realRgb=realColor.toRgbString();if(rgbaSupport||1===realColor.alpha?previewElement.css("background-color",realRgb):(previewElement.css("background-color","transparent"),previewElement.css("filter",realColor.toFilter())),opts.showAlpha){var rgb=realColor.toRgb();rgb.a=0;var realAlpha=tinycolor(rgb).toRgbString(),gradient="linear-gradient(left, "+realAlpha+", "+realHex+")";IE?alphaSliderInner.css("filter",tinycolor(realAlpha).toFilter({gradientType:1},realHex)):(alphaSliderInner.css("background","-webkit-"+gradient),alphaSliderInner.css("background","-moz-"+gradient),alphaSliderInner.css("background","-ms-"+gradient),alphaSliderInner.css("background","linear-gradient(to right, "+realAlpha+", "+realHex+")"))}displayColor=realColor.toString(format)}opts.showInput&&textInput.val(displayColor),opts.showPalette&&drawPalette(),drawInitial()}function updateHelperLocations(){var s=currentSaturation,v=currentValue;if(allowEmpty&&isEmpty)alphaSlideHelper.hide(),slideHelper.hide(),dragHelper.hide();else{alphaSlideHelper.show(),slideHelper.show(),dragHelper.show();var dragX=s*dragWidth,dragY=dragHeight-v*dragHeight;dragX=Math.max(-dragHelperHeight,Math.min(dragWidth-dragHelperHeight,dragX-dragHelperHeight)),dragY=Math.max(-dragHelperHeight,Math.min(dragHeight-dragHelperHeight,dragY-dragHelperHeight)),dragHelper.css({top:dragY+"px",left:dragX+"px"});var alphaX=currentAlpha*alphaWidth;alphaSlideHelper.css({left:alphaX-alphaSlideHelperWidth/2+"px"});var slideY=currentHue*slideHeight;slideHelper.css({top:slideY-slideHelperHeight+"px"})}}function updateOriginalInput(fireCallback){var color=get(),displayColor="",hasChanged=!tinycolor.equals(color,colorOnShow);color&&(displayColor=color.toString(currentPreferredFormat),addColorToSelectionPalette(color)),isInput&&boundElement.val(displayColor),colorOnShow=color,fireCallback&&hasChanged&&(callbacks.change(color),boundElement.trigger("change",[color]))}function reflow(){dragWidth=dragger.width(),dragHeight=dragger.height(),dragHelperHeight=dragHelper.height(),slideWidth=slider.width(),slideHeight=slider.height(),slideHelperHeight=slideHelper.height(),alphaWidth=alphaSlider.width(),alphaSlideHelperWidth=alphaSlideHelper.width(),flat||(container.css("position","absolute"),container.offset(getOffset(container,offsetElement))),updateHelperLocations(),opts.showPalette&&drawPalette(),boundElement.trigger("reflow.spectrum")}function destroy(){boundElement.show(),offsetElement.unbind("click.spectrum touchstart.spectrum"),container.remove(),replacer.remove(),spectrums[spect.id]=null}function option(optionName,optionValue){return optionName===undefined?$.extend({},opts):optionValue===undefined?opts[optionName]:(opts[optionName]=optionValue,void applyOptions())}function enable(){disabled=!1,boundElement.attr("disabled",!1),offsetElement.removeClass("sp-disabled")}function disable(){hide(),disabled=!0,boundElement.attr("disabled",!0),offsetElement.addClass("sp-disabled")}var opts=instanceOptions(o,element),flat=opts.flat,showSelectionPalette=opts.showSelectionPalette,localStorageKey=opts.localStorageKey,theme=opts.theme,callbacks=opts.callbacks,resize=throttle(reflow,10),visible=!1,dragWidth=0,dragHeight=0,dragHelperHeight=0,slideHeight=0,slideWidth=0,alphaWidth=0,alphaSlideHelperWidth=0,slideHelperHeight=0,currentHue=0,currentSaturation=0,currentValue=0,currentAlpha=1,palette=[],paletteArray=[],paletteLookup={},selectionPalette=opts.selectionPalette.slice(0),maxSelectionSize=opts.maxSelectionSize,draggingClass="sp-dragging",shiftMovementDirection=null,doc=element.ownerDocument,boundElement=(doc.body,$(element)),disabled=!1,container=$(markup,doc).addClass(theme),pickerContainer=container.find(".sp-picker-container"),dragger=container.find(".sp-color"),dragHelper=container.find(".sp-dragger"),slider=container.find(".sp-hue"),slideHelper=container.find(".sp-slider"),alphaSliderInner=container.find(".sp-alpha-inner"),alphaSlider=container.find(".sp-alpha"),alphaSlideHelper=container.find(".sp-alpha-handle"),textInput=container.find(".sp-input"),paletteContainer=container.find(".sp-palette"),initialColorContainer=container.find(".sp-initial"),cancelButton=container.find(".sp-cancel"),clearButton=container.find(".sp-clear"),chooseButton=container.find(".sp-choose"),toggleButton=container.find(".sp-palette-toggle"),isInput=boundElement.is("input"),isInputTypeColor=isInput&&inputTypeColorSupport&&"color"===boundElement.attr("type"),shouldReplace=isInput&&!flat,replacer=shouldReplace?$(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName):$([]),offsetElement=shouldReplace?replacer:boundElement,previewElement=replacer.find(".sp-preview-inner"),initialColor=opts.color||isInput&&boundElement.val(),colorOnShow=!1,preferredFormat=opts.preferredFormat,currentPreferredFormat=preferredFormat,clickoutFiresChange=!opts.showButtons||opts.clickoutFiresChange,isEmpty=!initialColor,allowEmpty=opts.allowEmpty&&!isInputTypeColor;initialize();var spect={show:show,hide:hide,toggle:toggle,reflow:reflow,option:option,enable:enable,disable:disable,set:function(c){set(c),updateOriginalInput()},get:get,destroy:destroy,container:container};return spect.id=spectrums.push(spect)-1,spect}function getOffset(picker,input){var extraY=0,dpWidth=picker.outerWidth(),dpHeight=picker.outerHeight(),inputHeight=input.outerHeight(),doc=picker[0].ownerDocument,docElem=doc.documentElement,viewWidth=docElem.clientWidth+$(doc).scrollLeft(),viewHeight=docElem.clientHeight+$(doc).scrollTop(),offset=input.offset();return offset.top+=inputHeight,offset.left-=Math.min(offset.left,offset.left+dpWidth>viewWidth&&viewWidth>dpWidth?Math.abs(offset.left+dpWidth-viewWidth):0),offset.top-=Math.min(offset.top,offset.top+dpHeight>viewHeight&&viewHeight>dpHeight?Math.abs(dpHeight+inputHeight-extraY):extraY),offset}function noop(){}function stopPropagation(e){e.stopPropagation()}function bind(func,obj){var slice=Array.prototype.slice,args=slice.call(arguments,2);return function(){return func.apply(obj,args.concat(slice.call(arguments)))}}function draggable(element,onmove,onstart,onstop){function prevent(e){e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault(),e.returnValue=!1}function move(e){if(dragging){if(IE&&document.documentMode<9&&!e.button)return stop();var touches=e.originalEvent.touches,pageX=touches?touches[0].pageX:e.pageX,pageY=touches?touches[0].pageY:e.pageY,dragX=Math.max(0,Math.min(pageX-offset.left,maxWidth)),dragY=Math.max(0,Math.min(pageY-offset.top,maxHeight));hasTouch&&prevent(e),onmove.apply(element,[dragX,dragY,e])}}function start(e){{var rightclick=e.which?3==e.which:2==e.button;e.originalEvent.touches}rightclick||dragging||onstart.apply(element,arguments)!==!1&&(dragging=!0,maxHeight=$(element).height(),maxWidth=$(element).width(),offset=$(element).offset(),$(doc).bind(duringDragEvents),$(doc.body).addClass("sp-dragging"),hasTouch||move(e),prevent(e))}function stop(){dragging&&($(doc).unbind(duringDragEvents),$(doc.body).removeClass("sp-dragging"),onstop.apply(element,arguments)),dragging=!1}onmove=onmove||function(){},onstart=onstart||function(){},onstop=onstop||function(){};var doc=element.ownerDocument||document,dragging=!1,offset={},maxHeight=0,maxWidth=0,hasTouch="ontouchstart"in window,duringDragEvents={};duringDragEvents.selectstart=prevent,duringDragEvents.dragstart=prevent,duringDragEvents["touchmove mousemove"]=move,duringDragEvents["touchend mouseup"]=stop,$(element).bind("touchstart mousedown",start)}function throttle(func,wait,debounce){var timeout;return function(){var context=this,args=arguments,throttler=function(){timeout=null,func.apply(context,args)};debounce&&clearTimeout(timeout),(debounce||!timeout)&&(timeout=setTimeout(throttler,wait))}}var defaultOpts={beforeShow:noop,move:noop,change:noop,show:noop,hide:noop,color:!1,flat:!1,showInput:!1,allowEmpty:!1,showButtons:!0,clickoutFiresChange:!1,showInitial:!1,showPalette:!1,showPaletteOnly:!1,hideAfterPaletteSelect:!1,togglePaletteOnly:!1,showSelectionPalette:!0,localStorageKey:!1,appendTo:"body",maxSelectionSize:7,cancelText:"cancel",chooseText:"choose",togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected",preferredFormat:!1,className:"",containerClassName:"",replacerClassName:"",showAlpha:!1,theme:"sp-light",palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[],disabled:!1},spectrums=[],IE=!!/msie/i.exec(window.navigator.userAgent),rgbaSupport=function(){function contains(str,substr){return!!~(""+str).indexOf(substr)}var elem=document.createElement("div"),style=elem.style;return style.cssText="background-color:rgba(0,0,0,.5)",contains(style.backgroundColor,"rgba")||contains(style.backgroundColor,"hsla")}(),inputTypeColorSupport=function(){var colorInput=$("<input type='color' value='!' />")[0];return"color"===colorInput.type&&"!"!==colorInput.value}(),replaceInput=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),markup=function(){var gradientFix="";if(IE)for(var i=1;6>=i;i++)gradientFix+="<div class='sp-"+i+"'></div>";return["<div class='sp-container sp-hidden'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>",gradientFix,"</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("")}(),dataID="spectrum.id";$.fn.spectrum=function(opts){if("string"==typeof opts){var returnValue=this,args=Array.prototype.slice.call(arguments,1);return this.each(function(){var spect=spectrums[$(this).data(dataID)];if(spect){var method=spect[opts];if(!method)throw new Error("Spectrum: no such method: '"+opts+"'");"get"==opts?returnValue=spect.get():"container"==opts?returnValue=spect.container:"option"==opts?returnValue=spect.option.apply(spect,args):"destroy"==opts?(spect.destroy(),$(this).removeData(dataID)):method.apply(spect,args)}}),returnValue}return this.spectrum("destroy").each(function(){var options=$.extend({},opts,$(this).data()),spect=spectrum(this,options);$(this).data(dataID,spect.id)})},$.fn.spectrum.load=!0,$.fn.spectrum.loadOpts={},$.fn.spectrum.draggable=draggable,$.fn.spectrum.defaults=defaultOpts,$.spectrum={},$.spectrum.localization={},$.spectrum.palettes={},$.fn.spectrum.processNativeColorInputs=function(){inputTypeColorSupport||$("input[type=color]").spectrum({preferredFormat:"hex6"})},function(){function inputToRGB(color){var rgb={r:0,g:0,b:0},a=1,ok=!1,format=!1;return"string"==typeof color&&(color=stringInputToObject(color)),"object"==typeof color&&(color.hasOwnProperty("r")&&color.hasOwnProperty("g")&&color.hasOwnProperty("b")?(rgb=rgbToRgb(color.r,color.g,color.b),ok=!0,format="%"===String(color.r).substr(-1)?"prgb":"rgb"):color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("v")?(color.s=convertToPercentage(color.s),color.v=convertToPercentage(color.v),rgb=hsvToRgb(color.h,color.s,color.v),ok=!0,format="hsv"):color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("l")&&(color.s=convertToPercentage(color.s),color.l=convertToPercentage(color.l),rgb=hslToRgb(color.h,color.s,color.l),ok=!0,format="hsl"),color.hasOwnProperty("a")&&(a=color.a)),a=boundAlpha(a),{ok:ok,format:color.format||format,r:mathMin(255,mathMax(rgb.r,0)),g:mathMin(255,mathMax(rgb.g,0)),b:mathMin(255,mathMax(rgb.b,0)),a:a}}function rgbToRgb(r,g,b){return{r:255*bound01(r,255),g:255*bound01(g,255),b:255*bound01(b,255)}}function rgbToHsl(r,g,b){r=bound01(r,255),g=bound01(g,255),b=bound01(b,255);var h,s,max=mathMax(r,g,b),min=mathMin(r,g,b),l=(max+min)/2;if(max==min)h=s=0;else{var d=max-min;switch(s=l>.5?d/(2-max-min):d/(max+min),max){case r:h=(g-b)/d+(b>g?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4}h/=6}return{h:h,s:s,l:l}}function hslToRgb(h,s,l){function hue2rgb(p,q,t){return 0>t&&(t+=1),t>1&&(t-=1),1/6>t?p+6*(q-p)*t:.5>t?q:2/3>t?p+(q-p)*(2/3-t)*6:p}var r,g,b;if(h=bound01(h,360),s=bound01(s,100),l=bound01(l,100),0===s)r=g=b=l;else{var q=.5>l?l*(1+s):l+s-l*s,p=2*l-q;r=hue2rgb(p,q,h+1/3),g=hue2rgb(p,q,h),b=hue2rgb(p,q,h-1/3)}return{r:255*r,g:255*g,b:255*b}}function rgbToHsv(r,g,b){r=bound01(r,255),g=bound01(g,255),b=bound01(b,255);var h,s,max=mathMax(r,g,b),min=mathMin(r,g,b),v=max,d=max-min;if(s=0===max?0:d/max,max==min)h=0;else{switch(max){case r:h=(g-b)/d+(b>g?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4}h/=6}return{h:h,s:s,v:v}}function hsvToRgb(h,s,v){h=6*bound01(h,360),s=bound01(s,100),v=bound01(v,100);var i=math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s),mod=i%6,r=[v,q,p,p,t,v][mod],g=[t,v,v,q,p,p][mod],b=[p,p,t,v,v,q][mod];return{r:255*r,g:255*g,b:255*b}}function rgbToHex(r,g,b,allow3Char){var hex=[pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))];return allow3Char&&hex[0].charAt(0)==hex[0].charAt(1)&&hex[1].charAt(0)==hex[1].charAt(1)&&hex[2].charAt(0)==hex[2].charAt(1)?hex[0].charAt(0)+hex[1].charAt(0)+hex[2].charAt(0):hex.join("")}function rgbaToHex(r,g,b,a){var hex=[pad2(convertDecimalToHex(a)),pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))];return hex.join("")}function desaturate(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.s-=amount/100,hsl.s=clamp01(hsl.s),tinycolor(hsl)}function saturate(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.s+=amount/100,hsl.s=clamp01(hsl.s),tinycolor(hsl)}function greyscale(color){return tinycolor(color).desaturate(100)}function lighten(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.l+=amount/100,hsl.l=clamp01(hsl.l),tinycolor(hsl)}function brighten(color,amount){amount=0===amount?0:amount||10;var rgb=tinycolor(color).toRgb();return rgb.r=mathMax(0,mathMin(255,rgb.r-mathRound(255*-(amount/100)))),rgb.g=mathMax(0,mathMin(255,rgb.g-mathRound(255*-(amount/100)))),rgb.b=mathMax(0,mathMin(255,rgb.b-mathRound(255*-(amount/100)))),tinycolor(rgb)}function darken(color,amount){amount=0===amount?0:amount||10;var hsl=tinycolor(color).toHsl();return hsl.l-=amount/100,hsl.l=clamp01(hsl.l),tinycolor(hsl)}function spin(color,amount){var hsl=tinycolor(color).toHsl(),hue=(mathRound(hsl.h)+amount)%360;return hsl.h=0>hue?360+hue:hue,tinycolor(hsl)}function complement(color){var hsl=tinycolor(color).toHsl();return hsl.h=(hsl.h+180)%360,tinycolor(hsl)}function triad(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+120)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+240)%360,s:hsl.s,l:hsl.l})]}function tetrad(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+90)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+180)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+270)%360,s:hsl.s,l:hsl.l})]}function splitcomplement(color){var hsl=tinycolor(color).toHsl(),h=hsl.h;return[tinycolor(color),tinycolor({h:(h+72)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+216)%360,s:hsl.s,l:hsl.l})]}function analogous(color,results,slices){results=results||6,slices=slices||30;var hsl=tinycolor(color).toHsl(),part=360/slices,ret=[tinycolor(color)];for(hsl.h=(hsl.h-(part*results>>1)+720)%360;--results;)hsl.h=(hsl.h+part)%360,ret.push(tinycolor(hsl));return ret}function monochromatic(color,results){results=results||6;for(var hsv=tinycolor(color).toHsv(),h=hsv.h,s=hsv.s,v=hsv.v,ret=[],modification=1/results;results--;)ret.push(tinycolor({h:h,s:s,v:v})),v=(v+modification)%1;return ret}function flip(o){var flipped={};for(var i in o)o.hasOwnProperty(i)&&(flipped[o[i]]=i);return flipped}function boundAlpha(a){return a=parseFloat(a),(isNaN(a)||0>a||a>1)&&(a=1),a}function bound01(n,max){isOnePointZero(n)&&(n="100%");var processPercent=isPercentage(n);return n=mathMin(max,mathMax(0,parseFloat(n))),processPercent&&(n=parseInt(n*max,10)/100),math.abs(n-max)<1e-6?1:n%max/parseFloat(max)}function clamp01(val){return mathMin(1,mathMax(0,val))}function parseIntFromHex(val){return parseInt(val,16)}function isOnePointZero(n){return"string"==typeof n&&-1!=n.indexOf(".")&&1===parseFloat(n)}function isPercentage(n){return"string"==typeof n&&-1!=n.indexOf("%")}function pad2(c){return 1==c.length?"0"+c:""+c}function convertToPercentage(n){return 1>=n&&(n=100*n+"%"),n}function convertDecimalToHex(d){return Math.round(255*parseFloat(d)).toString(16)}function convertHexToDecimal(h){return parseIntFromHex(h)/255}function stringInputToObject(color){color=color.replace(trimLeft,"").replace(trimRight,"").toLowerCase();var named=!1;if(names[color])color=names[color],named=!0;else if("transparent"==color)return{r:0,g:0,b:0,a:0,format:"name"};var match;return(match=matchers.rgb.exec(color))?{r:match[1],g:match[2],b:match[3]}:(match=matchers.rgba.exec(color))?{r:match[1],g:match[2],b:match[3],a:match[4]}:(match=matchers.hsl.exec(color))?{h:match[1],s:match[2],l:match[3]}:(match=matchers.hsla.exec(color))?{h:match[1],s:match[2],l:match[3],a:match[4]}:(match=matchers.hsv.exec(color))?{h:match[1],s:match[2],v:match[3]}:(match=matchers.hex8.exec(color))?{a:convertHexToDecimal(match[1]),r:parseIntFromHex(match[2]),g:parseIntFromHex(match[3]),b:parseIntFromHex(match[4]),format:named?"name":"hex8"}:(match=matchers.hex6.exec(color))?{r:parseIntFromHex(match[1]),g:parseIntFromHex(match[2]),b:parseIntFromHex(match[3]),format:named?"name":"hex"}:(match=matchers.hex3.exec(color))?{r:parseIntFromHex(match[1]+""+match[1]),g:parseIntFromHex(match[2]+""+match[2]),b:parseIntFromHex(match[3]+""+match[3]),format:named?"name":"hex"}:!1}var trimLeft=/^[\s,#]+/,trimRight=/\s+$/,tinyCounter=0,math=Math,mathRound=math.round,mathMin=math.min,mathMax=math.max,mathRandom=math.random,tinycolor=function tinycolor(color,opts){if(color=color?color:"",opts=opts||{},color instanceof tinycolor)return color;if(!(this instanceof tinycolor))return new tinycolor(color,opts);var rgb=inputToRGB(color);this._r=rgb.r,this._g=rgb.g,this._b=rgb.b,this._a=rgb.a,this._roundA=mathRound(100*this._a)/100,this._format=opts.format||rgb.format,this._gradientType=opts.gradientType,this._r<1&&(this._r=mathRound(this._r)),this._g<1&&(this._g=mathRound(this._g)),this._b<1&&(this._b=mathRound(this._b)),this._ok=rgb.ok,this._tc_id=tinyCounter++};tinycolor.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var rgb=this.toRgb();return(299*rgb.r+587*rgb.g+114*rgb.b)/1e3},setAlpha:function(value){return this._a=boundAlpha(value),this._roundA=mathRound(100*this._a)/100,this},toHsv:function(){var hsv=rgbToHsv(this._r,this._g,this._b);return{h:360*hsv.h,s:hsv.s,v:hsv.v,a:this._a}},toHsvString:function(){var hsv=rgbToHsv(this._r,this._g,this._b),h=mathRound(360*hsv.h),s=mathRound(100*hsv.s),v=mathRound(100*hsv.v);return 1==this._a?"hsv("+h+", "+s+"%, "+v+"%)":"hsva("+h+", "+s+"%, "+v+"%, "+this._roundA+")"},toHsl:function(){var hsl=rgbToHsl(this._r,this._g,this._b);return{h:360*hsl.h,s:hsl.s,l:hsl.l,a:this._a}},toHslString:function(){var hsl=rgbToHsl(this._r,this._g,this._b),h=mathRound(360*hsl.h),s=mathRound(100*hsl.s),l=mathRound(100*hsl.l);return 1==this._a?"hsl("+h+", "+s+"%, "+l+"%)":"hsla("+h+", "+s+"%, "+l+"%, "+this._roundA+")"},toHex:function(allow3Char){return rgbToHex(this._r,this._g,this._b,allow3Char)},toHexString:function(allow3Char){return"#"+this.toHex(allow3Char)},toHex8:function(){return rgbaToHex(this._r,this._g,this._b,this._a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:mathRound(this._r),g:mathRound(this._g),b:mathRound(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+mathRound(this._r)+", "+mathRound(this._g)+", "+mathRound(this._b)+")":"rgba("+mathRound(this._r)+", "+mathRound(this._g)+", "+mathRound(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:mathRound(100*bound01(this._r,255))+"%",g:mathRound(100*bound01(this._g,255))+"%",b:mathRound(100*bound01(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+mathRound(100*bound01(this._r,255))+"%, "+mathRound(100*bound01(this._g,255))+"%, "+mathRound(100*bound01(this._b,255))+"%)":"rgba("+mathRound(100*bound01(this._r,255))+"%, "+mathRound(100*bound01(this._g,255))+"%, "+mathRound(100*bound01(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":this._a<1?!1:hexNames[rgbToHex(this._r,this._g,this._b,!0)]||!1},toFilter:function(secondColor){var hex8String="#"+rgbaToHex(this._r,this._g,this._b,this._a),secondHex8String=hex8String,gradientType=this._gradientType?"GradientType = 1, ":"";if(secondColor){var s=tinycolor(secondColor);secondHex8String=s.toHex8String()
}return"progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")"},toString:function(format){var formatSet=!!format;format=format||this._format;var formattedString=!1,hasAlpha=this._a<1&&this._a>=0,needsAlphaFormat=!formatSet&&hasAlpha&&("hex"===format||"hex6"===format||"hex3"===format||"name"===format);return needsAlphaFormat?"name"===format&&0===this._a?this.toName():this.toRgbString():("rgb"===format&&(formattedString=this.toRgbString()),"prgb"===format&&(formattedString=this.toPercentageRgbString()),("hex"===format||"hex6"===format)&&(formattedString=this.toHexString()),"hex3"===format&&(formattedString=this.toHexString(!0)),"hex8"===format&&(formattedString=this.toHex8String()),"name"===format&&(formattedString=this.toName()),"hsl"===format&&(formattedString=this.toHslString()),"hsv"===format&&(formattedString=this.toHsvString()),formattedString||this.toHexString())},_applyModification:function(fn,args){var color=fn.apply(null,[this].concat([].slice.call(args)));return this._r=color._r,this._g=color._g,this._b=color._b,this.setAlpha(color._a),this},lighten:function(){return this._applyModification(lighten,arguments)},brighten:function(){return this._applyModification(brighten,arguments)},darken:function(){return this._applyModification(darken,arguments)},desaturate:function(){return this._applyModification(desaturate,arguments)},saturate:function(){return this._applyModification(saturate,arguments)},greyscale:function(){return this._applyModification(greyscale,arguments)},spin:function(){return this._applyModification(spin,arguments)},_applyCombination:function(fn,args){return fn.apply(null,[this].concat([].slice.call(args)))},analogous:function(){return this._applyCombination(analogous,arguments)},complement:function(){return this._applyCombination(complement,arguments)},monochromatic:function(){return this._applyCombination(monochromatic,arguments)},splitcomplement:function(){return this._applyCombination(splitcomplement,arguments)},triad:function(){return this._applyCombination(triad,arguments)},tetrad:function(){return this._applyCombination(tetrad,arguments)}},tinycolor.fromRatio=function(color,opts){if("object"==typeof color){var newColor={};for(var i in color)color.hasOwnProperty(i)&&(newColor[i]="a"===i?color[i]:convertToPercentage(color[i]));color=newColor}return tinycolor(color,opts)},tinycolor.equals=function(color1,color2){return color1&&color2?tinycolor(color1).toRgbString()==tinycolor(color2).toRgbString():!1},tinycolor.random=function(){return tinycolor.fromRatio({r:mathRandom(),g:mathRandom(),b:mathRandom()})},tinycolor.mix=function(color1,color2,amount){amount=0===amount?0:amount||50;var w1,rgb1=tinycolor(color1).toRgb(),rgb2=tinycolor(color2).toRgb(),p=amount/100,w=2*p-1,a=rgb2.a-rgb1.a;w1=w*a==-1?w:(w+a)/(1+w*a),w1=(w1+1)/2;var w2=1-w1,rgba={r:rgb2.r*w1+rgb1.r*w2,g:rgb2.g*w1+rgb1.g*w2,b:rgb2.b*w1+rgb1.b*w2,a:rgb2.a*p+rgb1.a*(1-p)};return tinycolor(rgba)},tinycolor.readability=function(color1,color2){var c1=tinycolor(color1),c2=tinycolor(color2),rgb1=c1.toRgb(),rgb2=c2.toRgb(),brightnessA=c1.getBrightness(),brightnessB=c2.getBrightness(),colorDiff=Math.max(rgb1.r,rgb2.r)-Math.min(rgb1.r,rgb2.r)+Math.max(rgb1.g,rgb2.g)-Math.min(rgb1.g,rgb2.g)+Math.max(rgb1.b,rgb2.b)-Math.min(rgb1.b,rgb2.b);return{brightness:Math.abs(brightnessA-brightnessB),color:colorDiff}},tinycolor.isReadable=function(color1,color2){var readability=tinycolor.readability(color1,color2);return readability.brightness>125&&readability.color>500},tinycolor.mostReadable=function(baseColor,colorList){for(var bestColor=null,bestScore=0,bestIsReadable=!1,i=0;i<colorList.length;i++){var readability=tinycolor.readability(baseColor,colorList[i]),readable=readability.brightness>125&&readability.color>500,score=3*(readability.brightness/125)+readability.color/500;(readable&&!bestIsReadable||readable&&bestIsReadable&&score>bestScore||!readable&&!bestIsReadable&&score>bestScore)&&(bestIsReadable=readable,bestScore=score,bestColor=tinycolor(colorList[i]))}return bestColor};var names=tinycolor.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},hexNames=tinycolor.hexNames=flip(names),matchers=function(){var CSS_INTEGER="[-\\+]?\\d+%?",CSS_NUMBER="[-\\+]?\\d*\\.\\d+%?",CSS_UNIT="(?:"+CSS_NUMBER+")|(?:"+CSS_INTEGER+")",PERMISSIVE_MATCH3="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?",PERMISSIVE_MATCH4="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?";return{rgb:new RegExp("rgb"+PERMISSIVE_MATCH3),rgba:new RegExp("rgba"+PERMISSIVE_MATCH4),hsl:new RegExp("hsl"+PERMISSIVE_MATCH3),hsla:new RegExp("hsla"+PERMISSIVE_MATCH4),hsv:new RegExp("hsv"+PERMISSIVE_MATCH3),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();window.tinycolor=tinycolor}(),$(function(){$.fn.spectrum.load&&$.fn.spectrum.processNativeColorInputs()})};

},{}],82:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],83:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"jquery":[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.1.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-18T15:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.3",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// We once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optimization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur(),
				// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// Ensure the complete handler is called before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// Toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = window.location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// Support: BlackBerry 5, iOS 3 (original iPhone)
		// If we don't have gBCR, just use 0,0 rather than error
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

},{}],"q":[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof self !== "undefined") {
        self.Q = definition();

    } else {
        throw new Error("This environment was not anticiapted by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require('_process'))
},{"_process":83}]},{},[1]);
