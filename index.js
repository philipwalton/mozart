var Class = require('./lib/klass');

// Expose a factory function to create new Class instances.
module.exports = function(name, definition) {
  return new Class(name, definition).construct();
};
