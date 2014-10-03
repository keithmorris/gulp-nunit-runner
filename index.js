/* global require */

'use strict';
var _ = require('lodash'),
    child_process = require('child_process'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    es = require('event-stream');

var PLUGIN_NAME = 'gulp-nunit-runner';

// Main entry point
var runner = function gulpNunitRunner(opts) {
    //options = opts;

    if (!opts || !opts.executable) {
        throw new PluginError(PLUGIN_NAME,
            "Path to NUnit executable is required in options.executable.");
    }

    // Creating and return a stream through which each file will pass
    // var stream = es.writeArray(run(opts));

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

runner.getExecutable = function(options) {
    // trim any existing surrounding quotes and then wrap in ""

    return options.executable.replace(/(^")|(^')|("$)|('$)/g, "");
};


runner.getArguments = function(options, assemblies) {
    var args = [];

    if (options.options) {
        args = args.concat(parseSwitches(options.options));
    }
    args = args.concat(assemblies);

    // var assemblyArgs = _.map(assemblies, function(assembly){
    //  return '"' + assembly + '"';
    // });

    //args.push(assemblyArgs);

    return args;
};

// runner.getExecutionCommand = function(options, assemblies) {
//   return '"' + runner.getExecutable(options) + '" ' + runner.getArguments(
//     options, assemblies).join(' ');
// };

function parseSwitches(options) {
    var switches = _.map(options, function(val, key) {
        if (typeof val === 'boolean') {
            if (val) {
                return ('/' + key);
            }
            return undefined;
        }
        if (typeof val === 'string') {
            return ('/' + key + ':' + val + '');
        }
    });

    var filtered = _.filter(switches, function(val) {
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

    var assemblies = files.map(function(file) {
        return file.path;
    });

    if (assemblies.length === 0) {
        return fail(stream, 'Some assemblies required.'); //<-- See what I did there ;)
    }

    // assemblies.forEach(function(assembly) {
    //     console.log('assembly: ' + assembly);
    // });

    var opts = {
        stdio: [process.stdin, process.stdout, process.stderr, 'pipe']
    };

    var exe = runner.getExecutable(options);
    var args = runner.getArguments(options, assemblies);
    
    var child = child_process.spawn(
            exe,
            args,
            opts);

    child.on('close', function(code) {
        if (code !== 0) {
            gutil.log(gutil.colors.red('NUnit tests failed.'));
            fail(stream, 'NUnit tests failed.');
        }
        gutil.log(gutil.colors.cyan('NUnit tests passed'));
        return end(stream);
    });


    // cp.stdout.pipe(process.stdout);
    // cp.stderr.pipe(process.stderr);
}

module.exports = runner;