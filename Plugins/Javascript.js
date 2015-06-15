"use strict"
let Plugin = require('../Source/Plugin')
class PluginJS extends Plugin{
  static Process(Contents, Options){
    return Contents
  }
}
PluginJS.Info.Extensions = ['.js']
module.exports = PluginJS