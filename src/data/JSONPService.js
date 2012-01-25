var __slice = Array.prototype.slice;

define(['shared/LocationSearch'], function(LocationSearch) {
  var get, idFunc, jsonp, jsonpID;
  idFunc = function(o) {
    return o;
  };
  jsonpID = 0;
  jsonp = function(options) {
    var jsonpString, s;
    jsonpString = "__jsonp" + (++jsonpID);
    window[jsonpString] = function(j) {
      options.success(j);
      window[jsonpString] = void 0;
      return $('#' + jsonpString).remove();
    };
    if (options.callback == null) options.callback = 'callback';
    s = document.createElement('script');
    s.id = jsonpString;
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', "" + options.url + (options.url.indexOf('?') === -1 && '?' || '&') + options.callback + "=" + jsonpString);
    return $('head').append(s);
  };
  get = LocationSearch.usemockdata ? function(_arg, done) {
    var mock;
    mock = _arg.mock;
    return setTimeout((function() {
      return require([mock], done);
    }), 0);
  } : function(_arg, done) {
    var real;
    real = _arg.real;
    return jsonp({
      callback: 'jsonp',
      url: real,
      success: done || function() {}
    });
  };
  return {
    getXPToolBaseUrl: function(relPath) {
      return "http://destinyxptool/xptool/" + relPath;
    },
    JSONPService: (function() {

      function _Class(serviceName, _arg) {
        var baseURL, methods, name, pathFunc, process, _fn,
          _this = this;
        baseURL = _arg.baseURL, process = _arg.process, methods = _arg.methods;
        if (process == null) process = idFunc;
        _fn = function(name, pathFunc) {
          var cacheFunc, methodProcess, t;
          methodProcess = process;
          cacheFunc = idFunc;
          if ((t = typeof pathFunc) === 'object' && t !== 'function') {
            if (pathFunc.process != null) methodProcess = pathFunc.process;
            pathFunc = pathFunc.path;
            if (pathFunc.getCache != null) cacheFunc = pathFunc.getCache;
          }
          if (typeof pathFunc === 'string') {
            pathFunc = (function(pathFunc) {
              return function() {
                return pathFunc;
              };
            })(pathFunc);
          }
          return _this[name] = function() {
            var args, cacheValue, done, _i;
            args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
            if (done == null) done = idFunc;
            if ((cacheValue = cacheFunc()) !== void 0) {
              done(cacheValue);
            } else {
              get({
                mock: "data/mock/" + serviceName + "-" + name,
                real: baseURL + pathFunc.apply(null, args)
              }, function(rs) {
                return done(methodProcess(rs));
              });
            }
          };
        };
        for (name in methods) {
          pathFunc = methods[name];
          _fn(name, pathFunc);
        }
      }

      return _Class;

    })()
  };
});
