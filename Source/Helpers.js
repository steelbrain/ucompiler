"use strict"
class Helpers{
  static normalizeOptions(Options){
    Options = Options || {}
    Options.Content = Options.Content || {}
    return Options
  }
}
module.exports = Helpers