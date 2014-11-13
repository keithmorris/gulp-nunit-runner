/* global require */
'use strict';
var _ = require('lodash'),
	child_process = require('child_process'),
	gutil = require('gulp-util'),
	PluginError = gutil.PluginError,
	es = require('event-stream'),
	path = require('path'),
	temp = require('temp'),
	fs = require('fs'),
	teamcity = require('./lib/teamcity');

var PLUGIN_NAME = 'gulp-nunit-runner';
var NUNIT_CONSOLE = 'nunit-console.exe';
var NUNIT_X86_CONSOLE = 'nunit-console-x86.exe';

// Main entry point
var runner = function gulpNunitRunner(opts) {
	opts = opts || {};

	var files = [];

	var stream = es.through(function write(file) {
		if (_.isUndefined(file)) {
			fail(this, 'File may not be null.');
		}

		files.push(file);
		this.emit('data', file);
	}, function end() {
		run(this, files, opts);
	});

	return stream;
};

runner.getExecutable = function (options) {
	var consoleRunner = options.platform === 'x86' ? NUNIT_X86_CONSOLE : NUNIT_CONSOLE;
	if (!options.executable) return consoleRunner;
	// trim any existing surrounding quotes and then wrap in ""
	var executable = trim(options.executable, '\\s', '"', "'");
	return !path.extname(options.executable) ? 
		path.join(executable, consoleRunner) : executable;
};

runner.getArguments = function (options, assemblies) {
	var args = [];

	if (options.options) {
		args = args.concat(parseSwitches(options.options));
	}
	args = args.concat(assemblies);

	return args;
};

function parseSwitches(options) {
	var switches = _.map(options, function (val, key) {
		if (typeof val === 'boolean') {
			if (val) {
				return ('/' + key);
			}
			return undefined;
		}
		if (typeof val === 'string') {
			var qualifier = val.trim().indexOf(' ') > -1 ? '"' : '';
			return ('/' + key + ':' + qualifier + val + qualifier);
		}
		if (val instanceof Array) {
			return ('/' + key + ':"' + val.join(',') + '"');
		}
	});

	var filtered = _.filter(switches, function (val) {
		return !_.isUndefined(val);
	});

	return filtered;
}

function fail(stream, msg) {
	stream.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
}

function end(stream) {
	stream.emit('end');
}

function run(stream, files, options) {

	var cleanupTempFiles;

	options.options = options.options || {};

	if (!options.options.result && options.teamcity) {
		temp.track();
		options.options.result = temp.path({ suffix: '.xml' });
		cleanupTempFiles = temp.cleanup;
	}

	var assemblies = files.map(function (file) {
		return file.path;
	});

	if (assemblies.length === 0) {
		return fail(stream, 'Some assemblies required.'); //<-- See what I did there ;)
	}

	var opts = {
		stdio: [process.stdin, process.stdout, process.stderr, 'pipe']
	};

	var exe = runner.getExecutable(options);
	var args = runner.getArguments(options, assemblies);

	var child = child_process.spawn(
		exe,
		args,
		opts);

	child.on('error', function(e) { 
		fail(stream, e.code === 'ENOENT' ? 'Unable to find \'' + exe + '\'.' : e.message);
	}); 

	child.on('close', function (code) {
		if (options.teamcity) gutil.log.apply(null, teamcity(fs.readFileSync(options.options.result, 'utf8')));
		if (cleanupTempFiles) cleanupTempFiles();
		if (code !== 0) {
			gutil.log(gutil.colors.red('NUnit tests failed.'));
			fail(stream, 'NUnit tests failed.');
		}
		else gutil.log(gutil.colors.cyan('NUnit tests passed'));
		return end(stream);
	});
}

function trim() {
	var args = Array.prototype.slice.call(arguments)
	var source = args[0];
	var replacements = args.slice(1).join(',');
	var regex = new RegExp("^[" + replacements + "]+|[" + replacements + "]+$", "g");
	return source.replace(regex, '');
}

module.exports = runner;