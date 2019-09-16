var readConfig = require("../read-config");
var Experiment = require("../experiment");
var Variation = require("../variation");
var logger = require("../logger");
var OptimizelyClient = require('optimizely-x-node-client');

module.exports = function(folder, program) {
  //find the experiment
  var experiment = Experiment.locateAndLoad(folder);

  if (!experiment) {
    logger.log("error", "could not find experiment at " + folder);
    return;
  } else {
    logger.log("info", "pushing experiment at " + folder);
  }

  readConfig("token").then(function(token) {
      var client = new OptimizelyClient({accessToken:token});

      //if we already have an id, then update
      if (experiment.attributes.id) {
        return experiment.updateRemote(client);
      } else {
        return experiment.createRemote(client);
      }
    }).then(function() { 
      logger.log("info", "success");
    }).catch(function(error) {
      // Handle any error from all above steps
      logger.log("error", error.stack);
    })
    .done();
};
