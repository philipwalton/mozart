var createKey = require('../../private-parts').createKey;


/**
 * Store the associations between constructors and their classes.
 */
var constructorToClassMap = new WeakMap();


/**
 * Store the associations between protected prototypes and their public
 * prototype counterparts.
 */
var protectToPrototypeMap = new WeakMap();


/**
 * A Class.
 * @constructor
 * @param {string} name An optional function name given to the produced
 *   constructor. This can be useful for debugging purposes.
 * @param {Function} definition The function used to define the new
 *   constructor.
 * @param {Class} parentClass A parent Class instance to extend from.
 *   This parameter is only used internally.
 */
function Class(name, definition, parentClass) {

  // Argument shifting.
  if (typeof name == 'function') {
    parentClass = definition;
    definition = name;
    name = null;
  }
  this.definition = definition;
  this.parentClass = parentClass;

  // Create the constructor, add some methods to it, and store the association.
  this.Ctor = createConstructor(name);
  this.Ctor.subclass = subclass;
  this.Ctor.final = final;
  constructorToClassMap.set(this.Ctor, this);

  this._setupInheritance();
  this._storeSecrets();
}


/**
 * Setup the protected and private keys and method objects. Then invoke the
 * definition with those values. Finally, return the constructor publicly.
 * @return {Function} The generated constructor.
 */
Class.prototype.construct = function() {
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
 * Link this class to its parent and vise versa.
 */
Class.prototype._setupInheritance = function() {
  if (this.parentClass) {
    this.Parent = this.parentClass.Ctor;
    this.parentClass.Child = this.Ctor;
    this.parentClass.childClass = this;

    // Add a node-style `super_` property. This is different from above
    // but used in case existing node code expects it to be there.
    this.Ctor.super_ = this.Parent;

    // Set up the prototype chain. Store a reference the the parent constructor
    // on the prototype for easier access than the node-style `Ctor.super_`.
    this.Ctor.prototype = Object.create(this.Parent.prototype, {
      constructor: { value: this.Ctor },
      super: { value: this.Parent.prototype }
    });
  }
};


/**
 * Create the private and protect keys and methods objects.
 */
Class.prototype._storeSecrets = function() {
  // Setup the protected key and method object.
  if (this.parentClass) {
    this.protectedKey = this.parentClass.protectedKey;
    this.protectedMethods = Object.create(this.parentClass.protectedMethods, {
      super: { value: this.parentClass.protectedMethods }
    });
  } else {
    this.protectedMethods = {};
    this.protectedKey = createKey(protectedFactory);
  }
  // Associate these class's protected methods with its public prototype.
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
 * @param {Function} definition Any function that could be passed to the Class
 *   constructor.
 * @return {Function} A new constuctor that is a subclass of the invoking
 *   consturctor.
 */
function subclass(name, definition) {
  // Argument shifting.
  if (typeof name == 'function') {
    definition = name;
    name = null;
  }
  var parentClass = constructorToClassMap.get(this);
  if (parentClass.final) {
    throw new Error('Cannot subclass constructors marked final.');
  }
  var childClass = new Class(name, definition, parentClass);
  return childClass.construct();
}


/**
 * Prevent a constructor from being subclassed.
 */
function final() {
  var cls = constructorToClassMap.get(this);
  cls.final = true;
}


/**
 * A creator function that can be passed to the Private Parts `createKey`
 * method. If accepts an object and return a new object whose prototype is
 * the protected counterpart to the prototype of the passed object.
 * @param {Object} instance An instance of a constructor created with Class.
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

module.exports = Class;
