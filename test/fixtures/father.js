var ctor = require('../..');

var Father = ctor(function(proto, _, _protected) {
  proto.init = function(name) {
    _(this).name = name;
  };
  proto.toString = function() {
    return _(this).name;
  };
  proto.introduceYourself = function() {
    return 'Hello, I am ' + this;
  };
});

module.exports = Father;
