var createKey = require('../private-parts').createKey;
var klasses = new WeakMap();

/**
 * Create a constructor function with an optional name (the name makes it
 * easier to debug in the developer tools). The returned constructor, when
 * called, will attempt to invoke an `init` function (if it exists) with any
 * arguments passed to it.
 * @param {string} name The name of the constructor.
 * @return {Function} The newly created constructor function.
 */
function createConstructor(name) {
  if (!name) name = 'Ctor';
  var factory = new Function('return function ' + name + '() {\n'
    + 'if (typeof this.init == \'function\')'
    + 'this.init.apply(this, arguments) }');
  return factory();
}

/**
 * Subclass a constructor.
 * @param {Function} definition Any function that could be passed to the Klass
 *   constructor.
 * @return {Function} A new constuctor that is a subclass of the invoking
 *   consturctor.
 */
function subclass(definition) {

  // Note: This function gets referenced on new constructor instances, so when
  // it is invoked, its `this` context will be the calling constructor. When
  // subclassing, that means `this` is the parent constructor.

  var parentKlass = klasses.get(this);

  if (parentKlass.final) {
    throw new Error('Cannot subclass constructors marked final.');
  }

  var childKlass = new Klass(definition);
  childKlass.parentKlass = parentKlass;
  childKlass.Parent = this;

  // Set up the prototype chain.
  childKlass.Ctor.super_ = this;
  childKlass.Ctor.prototype = Object.create(childKlass.Parent.prototype, {
    constructor: {
      value: childKlass.Ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  // `make` must be called after the Parent and Child are set up.
  return childKlass.make();
}

/**
 * Prevent a constructor from being subclassed.
 */
function final() {
  var klass = klasses.get(this);
  klass.final = true;
}

/**
 * A Klass instance
 * @constructor
 * @param {Function} definition The function used to define the new
 *   constructor.
 * @param {Klass} (optional) parent An optional parent Klass instance to
 *   extend from.
 */
function Klass(definition) {
  this.definition = definition;
  this.Ctor = createConstructor();
}

Klass.prototype.make = function() {

  this.privateMethods = {}; // Object.create(this.Ctor.prototype);
  this.privateStore = createKey(this.privateMethods);

  if (this.parentKlass) {
    this.protectedMethods = this.parentKlass.protectedMethods;
    this.protectedStore = this.parentKlass.protectedStore;
  } else {
    this.protectedMethods = {};
    this.protectedStore = createKey(this.protectedMethods);
  }

  // Add methods to the constructor.
  this.Ctor.subclass = subclass;
  this.Ctor.final = final;

  // Associate this Klass instance with its constructor.
  klasses.set(this.Ctor, this);

  // Invoke the definition.
  this.definition.call(
    this.Ctor,
    this.Ctor.prototype,
    this.protectedStore,
    this.protectedMethods,
    this.privateStore,
    this.privateMethods
  );

  return this.Ctor;
};

module.exports = function(definition) {
  var ctor = new Klass(definition);
  return ctor.make();
};
