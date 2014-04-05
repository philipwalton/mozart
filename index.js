var createKey = require('../private-parts').createKey;


/**
 * Store the associations between constructors and their klasses.
 */
var constructorToKlassMap = new WeakMap();


/**
 * Store the associations between protected prototypes and their public
 * prototype counterparts.
 */
var protectToPrototypeMap = new WeakMap();


/**
 * A Klass.
 * @constructor
 * @param {string} name An optional function name given to the produced
 *   constructor. This can be useful for debugger purposes.
 * @param {Function} definition The function used to define the new
 *   constructor.
 * @param {Klass} parentKlass A parent Klass instance to extend from.
 *   This parameter is only used internally.
 */
function Klass(name, definition, parentKlass) {

  // Argument shifting.
  if (typeof name == 'function') {
    definition = name;
    name = null;
  }
  this.definition = definition;
  this.parentKlass = parentKlass;

  // Create the constructor, add some methods to it, and store the association.
  this.Ctor = createConstructor(name);
  this.Ctor.subclass = subclass;
  this.Ctor.final = final;
  constructorToKlassMap.set(this.Ctor, this);

  this._setupInheritance();
  this._storeSecrets();
}


/**
 * Setup the protected and private keys and method objects. Then invoke the
 * definition with those values. Finally, return the constructor publicly.
 * @return {Function} The generated constructor.
 */
Klass.prototype.construct = function() {
  this.definition.call(
    this.Ctor,
    this.Ctor.prototype,
    this.protectedKey,
    this.protectedMethods,
    this.privateKey,
    this.privateMethods
  );
  return this.Ctor;
};


/**
 * This this klass to its parent and vise versa.
 */
Klass.prototype._setupInheritance = function() {
  if (this.parentKlass) {
    this.Parent = this.parentKlass.Ctor;
    this.parentKlass.Child = this.Ctor;
    this.parentKlass.childKlass = this;

    // Add a node-style `super_` property.
    this.Ctor.super_ = this.Parent;

    // Set up the prototype chain.
    this.Ctor.prototype = Object.create(this.Parent.prototype, {
      constructor: { value: this.Ctor },
      super: { value: this.Parent.prototype }
    });
  }
};


/**
 * Create the private and protect keys and methods objects.
 */
Klass.prototype._storeSecrets = function() {
  // Setup the protected key and method object.
  if (this.parentKlass) {
    this.protectedKey = this.parentKlass.protectedKey;
    this.protectedMethods = Object.create(this.parentKlass.protectedMethods, {
      super: { value: this.parentKlass.protectedMethods }
    });
  } else {
    this.protectedMethods = {};
    this.protectedKey = createKey(protectedFactory);
  }
  // Associate these klass's protected methods with its public prototype.
  protectToPrototypeMap.set(this.Ctor.prototype, this.protectedMethods);

  // Set up the private key and method object.
  this.privateMethods = {};
  this.privateKey = createKey(this.privateMethods);
};


/**
 * Subclass a constructor.
 * Note: This function gets assigned to new constructor instances, so when
 * it is invoked, its `this` context will be the calling constructor. When
 * subclassing, that means `this` is the parent constructor.
 * @param {Function} definition Any function that could be passed to the Klass
 *   constructor.
 * @return {Function} A new constuctor that is a subclass of the invoking
 *   consturctor.
 */
function subclass(name, definition) {
  var parentKlass = constructorToKlassMap.get(this);
  if (parentKlass.final) {
    throw new Error('Cannot subclass constructors marked final.');
  }
  var childKlass = new Klass(name, definition, parentKlass);
  return childKlass.construct();
}


/**
 * Prevent a constructor from being subclassed.
 */
function final() {
  var klass = constructorToKlassMap.get(this);
  klass.final = true;
}


/**
 * A creator function that can be passed to the Private Parts `createKey`
 * method. If accepts an object and return a new object whose prototype is
 * the protected counterpart to the prototype of the passed object.
 * @param {Object} instance An instance of a constructor created with Klass.
 * @return {Object} The protected methods object.
 */
function protectedFactory(instance) {
  var publicPrototype = Object.getPrototypeOf(instance);
  var protectedPrototype = protectToPrototypeMap.get(publicPrototype);
  if (!protectedPrototype) {
    throw new Error('The protected key function only accepts instances '
      + 'of objects created using Mozart constructors.'
    );
  }
  return Object.create(protectedPrototype);
}


/**
 * Create a constructor function with an optional name (the name makes it
 * easier to debug in the developer tools). The returned constructor, when
 * called, will attempt to invoke an `init` function (if it exists) with any
 * arguments passed to it.
 * @param {string} name The optional name of the constructor.
 * @return {Function} The newly created constructor function.
 */
function createConstructor(name) {
  if (!name) name = '';
  var factory = new Function('return function ' + name + '() {\n'
    + 'if (typeof this.init == \'function\')'
    + 'this.init.apply(this, arguments) }');
  return factory();
}


// Expose a factory function to create new Klass instances.
module.exports = function(name, definition) {
  return new Klass(name, definition).construct();
};
