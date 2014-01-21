(function() {
  var Perf;

  Perf = (function() {
    function Perf(name, options) {
      var _base, _base1;
      this.name = name;
      this.options = options != null ? options : {};
      if ((_base = this.options).good == null) {
        _base.good = 100;
      }
      if ((_base1 = this.options).bad == null) {
        _base1.bad = 500;
      }
      this.started = false;
    }

    Perf.prototype.start = function() {
      if (this.started) {
        return;
      }
      this.start = +new Date();
      return this.started = true;
    };

    Perf.prototype.stop = function(printLine) {
      var background, color, duration, end, message;
      if (!this.started) {
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

  if (typeof window !== "undefined" && window !== null) {
    window.Perf = Perf;
  } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Perf;
  }

}).call(this);
