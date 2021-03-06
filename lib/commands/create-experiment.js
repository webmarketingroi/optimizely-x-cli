/**
 * Module dependencies
 */
var Experiment = require("../experiment");
var logger = require("../logger");


/**
 * Create local experiment
 *
 * @param <String> description the experiment description
 * @param <String> edit_url experiment editor url
 */
var createLocalExperiment = function(folder, description, edit_url) {
  var success = Experiment.create({
    description: description,
    edit_url: edit_url
  }, folder);
  if (success) {
    logger.log("info", "created experiment \"" + description + "\" in folder " + folder);
  } else {
    logger.log("error", "failed to create experiment");
  }
};

/**
 * The export. Create a remote or local experiment
 *
 * @param <String> description the experiment descrition
 * @param <String> edit_url experiment editor url
 */
module.exports = function(folder, description, edit_url) {
  createLocalExperiment(folder, description, edit_url);
};
