# Optimizely X Command Line Interface

Optimizely-X-CLI (`optxcli`) is a command line tool that lets developers build Optimizely X experiments 
faster by using the sofware tools you already love, and publish to Optimizely X when ready. With this tool
you can use your own source code editors (like Vim or Notepad++) and Git to develop Optimizely experiments 
and variations locally. This has a significant positive impact on the test velocity.

Optimizely-X-CLI includes a command line executable that also integrates with either the 
[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Google Chrome) 
or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) browser extensions 
for local development / preview and the Optimizely REST API for publishing tests.

Optimizely-X-CLI was proudly developed by Optimizely Solutions Partner, [Web Marketing ROI](https://webmarketingroi.com.au). 
This tool is orignally based on the [optimizely-cli](https://github.com/FunnelEnvy/optimizely-cli) project by FunnelEnvy.

## Features

### Local file system

Optimizely-X-CLI uses local files for the experiment and variation code (CSS & javascript). These 
include the variation javascript (variation.js) and experiment global.css and global.js. Variations, 
experiments and projects are in a nested directory structure which mimics Optimizely’s structure. 
Metadata for these elements are stored in json files – specifically project.json, experiment.json 
and variation.json files. Since everything is on the local filesystem you can obviously your 
favorite editors and source control tools to write, manage and share everything.

### Command Line Executable

Optimizely-X-CLI includes a command line executable, `optxcli`. Optxcli will create the local 
project experiment and variation structure for you, host the local variation for debugging, 
and publish to Optimizely.

### Local Hosting & Script Injection

Injecting the experiment and variation code directly into the local browser makes for faster 
development & debug cycles. `optxcli` includes an `express.js` based server that will compile 
and host a variation locally, and will generate a GreaseMonkey or TamperMonkey compliant user 
script to inject the CSS and JS into any page. Make a code change and refresh the browser – 
your variation changes will be immediately applied without restarting the server.

Targeting a page served over https? Not a problem! Optxcli includes a self-signed certificate 
and can host over ssl with the `-s` option.

Script injection works by writing CSS and JS elements into the page, and targets any page which 
has an `optcli=activate` parameter. You can therefore run the variation code against any page 
by appending this parameter.

### Embedded Javascript

The `variation.js` and `global.js` files can contain embedded javascript (ejs), and are compiled 
before local hosting or being sent to Optimizely. That means you can use iterators or other 
logic expressions directly in your template.

### Assets

As part of the of EJS templates, you can create an `assets.json` file in your experiment directory 
with key / value pairs. These will be available for interpolation when the javascript files are 
compiled. This  can be handy when you write a test where you have to replace lots of images.

### Publish

With the `push-experiment` command `optxcli` lets you push your code directly to Optimizely 
via the REST API. You’ll have to have an API personal token with the appropriate permmissions 
issued for the project of course. Once the code is in Optimizely you’ll want to go in and 
adjust the other test parameters (targeting, activation conditions, etc) per your test requirements.

## Installation

```
npm install -g optimizely-x-cli
```

This will install the `optxcli` executable on your system.

### Dependencies

You'll need to have [Node.js](http://nodejs.org/) installed locally to run `optxcli` and either the 
Tampermonkey or Greasemonkey browser extensions to view variations locally.

## Optimizely Authentication

Optimizely's REST API uses OAuth 2.0 for authorization.
Therefore the Optimizely-X-CLI tool will prompt for a Optimizely's personal API token 
(see [this page](https://help.optimizely.com/Integrate_Other_Platforms/Generate_a_personal_access_token_in_Optimizely_X_Web) 
for instructions on how to get it).

## Commands

### View available commands

```
optxcli
```

### Initialize a new Optimizely X project in current directory

Before you create an experiment or variation you’ll want to initialize a project. 
If you have an existing project and have been issued a personal API token you can use the remote 
(-r) option, and if not just create it locally. You’ll need to specify the project 
id (required). 

```
optxcli init [options] <project_id>
```

Argument:

 - `project_id` - the Optimizely X project ID. Required.

Options:

 - `-r --remote` - pull the remote project with `project_id`
 - `-j --jquery` - include jQuery
 
### Create a local experiment

Create a local experiment under a project with the command: 

```
optxcli experiment <folder> <description> <url>
```

Arguments:

 - `<folder>` – The folder (directory) for the new experiment. Required.
 - `<description>` – The experiment description that will show up in Optimizely. Required
 - `<edit_url>` – The default editor url for the experiment. Required.

### Create a local variation

Create a local variation and scaffold the source files

```
optxcli variation <experiment> <folder> <description> <traffic_allocation>
```

Arguments:

 - `<experiment>` – The directory or id of the experiment. Required.
 - `<folder>` – The new folder (directory) that will be created for the variation. Required.
 - `<description>` – The variation description that will show up in Optimizely. Required.
 - `<traffic_allocation>` - The percentage of traffic allocation. Required.

### Host a variation locally

Compiles the experiment and variation CSS / JS, creates a user script for injection and 
starts a local web server to host the files. Pointing your browser to the root URL 
(default http://localhost:8080) will show a page with installation steps and variation URLs.

```
optxcli host [options] <path> [port] [host]
```

Arguments:

 - `<path>` – Path to the variation directory. Required.
 - `[port]` – Port to host the server. Default to 8080.
 - `[host]` - Hostname. Default to localhost.
 
Options:

 - `-s` - use the self-signed SSL certificate (if you use HTTPS)
 
### Push a local experiment to Optimizely.

Push (create or update) an experiment to Optimizely X through the REST API. This will 
create a new experiment remotely if it hasn’t been pushed before, or update the existing Optimizely experiment 
and its variations if it has.
 
```
optxcli push-experiment <path>
```

Arguments:

 - `<path>` – The path to the experiment directory. Required.

 
### Set API personal token

Set/rewrite the personal API token for authentication. The token will be saved to the `.optcli` folder inside the project folder.

```
optxcli set-token <token>
``` 

Arguments:

 - `<token>` - the personal API token used for Optimizely authentication. 
 
## Copyright and license

Code copyright 2017 Web Marketing ROI. Released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
