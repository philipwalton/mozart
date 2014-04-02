var Father = require('./father');

var Son = Father.subclass(function(proto, _, _protected) {
  var supertype = this.super_.prototype;
  proto.init = function(name, father) {
    supertype.init.apply(this, arguments);
    _(this).father = father;
  };
  proto.introduceYourself = function() {
    var myIntroduction = supertype.introduceYourself.apply(this);
    var ancestorNames = _(this).getAncestors().map(function(ancestor) {
      return _(ancestor).name;
    });

    return [myIntroduction].concat(ancestorNames).join(', son of ');
  };
  _protected.getAncestors = function() {
    var ancestors = [];
    var father = _(this).father;
    do {
      ancestors.push(father);
    } while (father = _(father).father);

    return ancestors;
  };
});

module.exports = Son;
