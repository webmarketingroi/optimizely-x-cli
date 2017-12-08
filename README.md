# Optimizely X Command Line Interface

Optimizely-X-CLI (`optxcli`) is a command line tool that lets developers build Optimizely X experiments 
faster by using the sofware tools you already love, and publish to Optimizely X when ready. With this tool
you can use your own source code editors (like Vim or Notepad++) and Git to develop Optimizely experiments 
and variations locally. This had a *significant* positive impact on the test velocity.

Optimizely-X-CLI includes a command line executable that also integrates with either the 
[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Google Chrome) 
or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) browser extensions 
for local development / preview and the Optimizely REST API for publishing tests.

This tool is based on the [optimizely-cli](https://github.com/FunnelEnvy/optimizely-cli) project by FunnelEnvy.

## Installation

```
npm install -g optimizely-x-cli
```

This will install the `optxcli` executable on your system.

### Dependencies

You'll need to have [Node.js](http://nodejs.org/) installed locally to run `optxcli` and either the 
Tampermonkey or Greasemonkey browser extensions to view variations locally.

## Quickstart

```
optxcli
```

View available commands

```
optxcli init [options] [project_id]
```
Initializes a new Optimizely X project locally.

Options:

 - `-r` - pull the remote project with `project_id`.

```
optxcli experiment <folder> <description> <url>
```

Create a local experiment

```
optxcli variation <experiment> <folder> <description>
```
Create a local variation

```
optxcli host [options] <path> [port]
```
Host a variation locally. Point your browser at http(s)://localhost:8080 (default port) for usage info.

```
optcli push-experiment <path>
```
Push a local experiment to Optimizely.

```
optcli push-variation <path>
```
Push a local variation to Optimizely

## Copyright and license

Code copyright 2017 Web Marketing ROI. Released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
