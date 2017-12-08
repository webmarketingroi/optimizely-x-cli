# Optimizely X Command Line Interface

Optimizely-X-CLI (`optxcli`) is a command line tool that lets developers build Optimizely X experiments 
faster by using the sofware tools you already love, and publish to Optimizely X when ready. With this tool
you can use your own source code editors (like Vim or Notepad++) and Git to develop Optimizely experiments 
and variations locally. This had a *significant* positive impact on the test velocity.

Optimizely-X-CLI includes a command line executable that also integrates with either the 
[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Google Chrome) 
or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) browser extensions 
for local development / preview and the Optimizely REST API for publishing tests.

Optimizely-X-CLI was proudly developed by Optimizely Solutions Partner, [Web Marketing ROI](https://webmarketingroi.com.au). 
This tool is orignally based on the [optimizely-cli](https://github.com/FunnelEnvy/optimizely-cli) project by FunnelEnvy.

## Installation

```
npm install -g optimizely-x-cli
```

This will install the `optxcli` executable on your system.

### Dependencies

You'll need to have [Node.js](http://nodejs.org/) installed locally to run `optxcli` and either the 
Tampermonkey or Greasemonkey browser extensions to view variations locally.

## Commands

### View available commands

```
optxcli
```

### Initialize a new Optimizely X project in current directory

```
optxcli init [options] [project_id]
```

Options:

 - `-r --remote` - pull the remote project with `project_id`
 - `-j --jquery` - include jQuery
 
### Create a local experiment
 
```
optxcli experiment <folder> <description> <url>
```

### Create a local variation

```
optxcli variation <experiment> <folder> <description>
```

### Host a variation locally

Point your browser at http(s)://localhost:8080 (default host and port) for usage info.

```
optxcli host [options] <path> [port]
```

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

## Copyright and license

Code copyright 2017 Web Marketing ROI. Released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
