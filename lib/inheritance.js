var Being = exports.Being = {
  clone: function(characteristics) {
    var newBeing = Object.create(this)
    for (var k in characteristics) newBeing[k] = characteristics[k]
    return newBeing
  }
}

var Animal = exports.Animal = Being.clone({
  breath: function() {
    return "*" + this.name + " breathes*\n"
  }
})

var Human = exports.Human = Animal.clone({
  speak: function(what) {
    return '"' + what + '," says ' + this.name + "\n"
  }
})

var Anthropomorphised = exports.Anthropomorphised = Animal.clone({
  speak: function(what) {
    return '"' + what + '," says ' + this.name + "\n"
  }
})

var Alice = exports.Alice = Human.clone({
  name: 'Alice'
})

var WhiteRabbit = exports.WhiteRabbit = Anthropomorphised.clone({
  name: 'the White Rabbit'
})

var Dinah = exports.Dinah = Animal.clone({
  name: "Dinah"
})

var test = exports.test = function() {
  console.log(
    Dinah.breath(),
    WhiteRabbit.speak("Oh my fur and whiskers! I am late, I am late!"),
    Alice.speak("A rabbit with a clock! How curious!")
  );
};