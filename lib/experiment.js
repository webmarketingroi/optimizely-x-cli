var glob = require('glob');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require("lodash");

var fileUtil = require("./file-util");
var logger = require("./logger");
var Variation = require("./variation");
var OptCLIBase = require("./optcli-base");
var Project = require("./project");
var Variation = require("./variation");

function Experiment(attributes, baseDir) {
  Experiment.super_.call(this, attributes, baseDir);
}

Experiment.JSON_FILE_NAME = "experiment.json";
Experiment.JS_FILE_NAME = "global.js";
Experiment.CSS_FILE_NAME = "global.css";

util.inherits(Experiment, OptCLIBase);

Experiment.create = function(attrs, baseDir) {
  //create directory
  fileUtil.writeDir(baseDir);
  fileUtil.writeText(path.join(baseDir, Experiment.CSS_FILE_NAME));
  fileUtil.writeText(path.join(baseDir, Experiment.JS_FILE_NAME));
  fileUtil.writeJSON(path.join(baseDir, Experiment.JSON_FILE_NAME), attrs);
  return new Experiment(attrs, baseDir);
}

Experiment.locateAndLoad = function(identifier) {
  var experiment = null;
  if (fs.existsSync(identifier) && fs.lstatSync(identifier).isDirectory()) {
    //it's a directory
    experiment = new Experiment({}, identifier);
    if(!experiment.loadFromFile()) return false;
  } else {
    var attrs = {};
    glob.sync("**/" + Experiment.JSON_FILE_NAME).forEach(function(jsonFile) {
      if (experiment) return;
      try {
        var attrs = JSON.parse(fs.readFileSync(jsonFile), {
          encoding: "utf-8"
        });
        if (identifier === String(attrs.id) || identifier === attrs.description) {
          experiment = new Experiment(attrs, path.dirName(jsonFile));
          return experiment;
        }
      } catch (e) {
        logger.log("warn", "could not parse " + jsonFile);
        return false;
      }
    })
  }
  return experiment;
}

Experiment.prototype.getJSPath = function() {
  return this.getFilePath(Experiment.JS_FILE_NAME);
}

Experiment.prototype.getCSSPath = function() {
  return this.getFilePath(Experiment.CSS_FILE_NAME);
}

Experiment.prototype.getCSS = function() {
  return fileUtil.loadFile(this.getCSSPath()) || "";
}

Experiment.prototype.getJS = function() {
  return fileUtil.loadFile(this.getJSPath()) || "";
}

Experiment.prototype.getVariations = function() {
  return glob.sync(this.baseDir+'/**/'+Variation.JSON_FILE_NAME);
}

Experiment.prototype.createPage = function(client) {
    //find the project - assume it's one directory above
    var project = new Project({}, path.normalize(this.baseDir + "/.."));
    project.loadFromFile();
  
    var theClient = client;
    var self = this;
    if (this.attributes.page_id) {
        logger.log("info", "page already exists, skipping");
        return Promise.resolve(client);
    } else {
        logger.log("info", "creating remote page");
    
        var pageArgs = {
            'project_id' : project.attributes.id,
            'name' : 'Homepage',
            'edit_url' : this.attributes.edit_url,
            "activation_type" : "immediate",
            "archived" : false,
            "category" : "article",
            "conditions" : "[\"and\", {\"type\": \"url\", \"match_type\": \"simple\", \"value\": \""+this.attributes.edit_url+"\"}]",
            "key" : "home_page",
            "page_type" : "single_url"
        };
        return client.createPage({}, pageArgs)
        .then(function(data){
            self.attributes.page_id = data.payload.id;
            self.saveAttributes();
            return theClient;
        });
    }
}

Experiment.prototype.createRemote = function(client) {
  
  var self = this;
  return this.createPage(client).then(function(client) {
  
      //find the project - assume it's one directory above
      var project = new Project({}, path.normalize(this.baseDir + "/.."));
      project.loadFromFile();
      //create new experiment
      var expArgs = {
          "project_id" : project.attributes.id,
          "name": path.basename(self.baseDir),
          "key" : path.basename(self.baseDir),
          "description" : self.attributes.description,
          "edit_url" : self.attributes.edit_url,
          "type": "a/b",
          "holdback" : 5000,
          "variations" : [],
          "changes" : [
            {
                "type" : "custom_css",
                "value" : self.getCSS()
            },
            {
                "type" : "custom_code",
                "value" : self.getJS()
            },
          ],
          "metrics" : [
            {
                "aggregator" : "sum",
                "field" : "revenue"
            }
          ]
      };
      
      var variations = self.getVariations();
      
      if (variations.length==0) throw new Error('Project should have at least one variation');
      
      var theExperiment = self;
      
      variations.forEach(function(variationPath) {
        var varPath = path.resolve(process.cwd(), variationPath);
        varPath = path.dirname(varPath);
        var variation = new Variation({}, varPath);
        if (!variation.loadFromFile()) throw new Error('Could not load variation from file: ' + varPath);
        
        var variationArgs = {
            "weight" : Number(variation.attributes.traffic_allocation*100),
            "name" : path.basename(variation.baseDir),
            "key" : path.basename(variation.baseDir),
            "description" : variation.attributes.description,
            "changes" : [
                {
                    "type" : "custom_code",
                    "value" : variation.getJS()
                }
            ],
            "page_id" : theExperiment.attributes.page_id
        };
        
        expArgs.variations.push(variationArgs);
      });
      
      //console.log("%o", JSON.stringify(expArgs));
      
      return client.createExperiment({}, expArgs).then(function(data) {
          logger.log("info", "creating remote experiment");  

          //update the id
          self.attributes.id = data.payload.id;
          self.saveAttributes();
          logger.log("info", "created remote experiment: " + data.payload.id);
        }, function(error) {
          logger.log("error", error);
        })       
    })
    .catch(function(e) {
      logger.log("error", "unable to create remote experiment: " + e.message);
      console.error(e.stack);
    });
}

Experiment.prototype.updateRemote = function(client) {
  //update existing experiment
  logger.log("info", "updating remote experiment"); 
  
  var project = new Project({}, path.normalize(this.baseDir + "/.."));
  project.loadFromFile();
  var expArgs = {
      "project_id" : project.attributes.id,
      "name": path.basename(this.baseDir),
      "description" : this.attributes.description,
      "edit_url" : this.attributes.edit_url,
      "variations" : [
      ],
      "changes" : [
        {
            "type" : "custom_css",
            "value" : this.getCSS()
        },
        {
            "type" : "custom_code",
            "value" : this.getJS()
        },
      ],
      "metrics" : [
        {
            "aggregator" : "sum",
            "field" : "revenue"
        }
      ]
  };
  
  var variations = this.getVariations();
  
  if (variations.length==0) throw new Error('Project should have at least one variation');
  
  var theExperiment = this;
  
  variations.forEach(function(variationPath) {
        var varPath = path.resolve(process.cwd(), variationPath);
        varPath = path.dirname(varPath);
        var variation = new Variation({}, varPath);
        if (!variation.loadFromFile()) throw new Error('Could not load variation from file: ' + varPath);
        
        var variationArgs = {
            "weight" : Number(variation.attributes.traffic_allocation*100),
            "name" : path.basename(variation.baseDir),
            "key" : path.basename(variation.baseDir),
            "description" : variation.attributes.description,
            "changes" : [
                {
                    "type" : "custom_code",
                    "value" : variation.getJS()
                }
            ],
            "page_id" : theExperiment.attributes.page_id
        };
        
        expArgs.variations.push(variationArgs);
      });
  
  var self = this;
  return client.updateExperiment({"id":this.attributes.id}, expArgs).then(function(data) {
    logger.log("info", "updated remote experiment: " + data.payload.id);
  }, function(error) {
    logger.log("error", error);
  }).catch(function(e) {
    logger.log("error", "unable to update remote experiment: " + e.message);
    console.error(e.stack);
  });
}

Experiment.prototype.saveAttributes = function() {
  fileUtil.writeJSON(path.join(this.baseDir, Experiment.JSON_FILE_NAME), this
    .attributes);
}

Experiment.prototype.getOptcliURL = function() {
  var optcliURL;
  var appendToURL;
  optcliURL = this.attributes.edit_url;
  optcliURL.indexOf('?') === -1 ? 
    appendToURL = '?optcli=activate' : 
    appendToURL = '&optcli=activate';
  optcliURL.indexOf('#') === -1 ?
    optcliURL += appendToURL :
    optcliURL = optcliURL.replace('#', appendToURL + '#');

  return optcliURL;
}

module.exports = Experiment;
