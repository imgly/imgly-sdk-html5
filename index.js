var ImglyKit = require("./src/js/imglykit");

// Expose ImglyKit
if (typeof window !== "undefined") {
  window.ImglyKit = ImglyKit;
} else if (typeof module !== "undefined") {
  module.exports = ImglyKit;
} else if (typeof global !== "undefined") {
  global.ImglyKit = ImglyKit;
}
