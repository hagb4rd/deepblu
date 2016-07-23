function compose() {
  var traits = [].slice.call(arguments)
  return traits.reduce(function(result, trait) {
    for (var k in trait) 
      if (k in result)  throw new Error("Duplicated property: " + k)
      else              result[k] = trait[k]
    return result
  }, {})
}
exports.compose = compose;

var CanBreath = {
  breath: function() {
    return "*" + this.name + " breathes*\n"
  }
}
exports.CanBreath = CanBreath;

var CanSpeak = {
  speak: function(what) {
    return '"' + what + '," says ' + this.name + "\n"
  }
}
exports.CanSpeak;

var Alice = compose(CanBreath, CanSpeak, { name: "Alice" })
var WhiteRabbit = compose(CanBreath, CanSpeak, { name: "the White Rabbit" })
var Dinah = compose(CanBreath, { name: "Dinah" })


exports.test = function() {
  console.log(
    Dinah.breath(),
    WhiteRabbit.speak("Oh my fur and whiskers! I am late, I am late!"),
    Alice.speak("A rabbit with a clock! How curious!")
  );
};