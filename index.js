var Klass = require('./lib/klass');

// Expose a factory function to create new Klass instances.
module.exports = function(name, definition) {
  return new Klass(name, definition).construct();
};
