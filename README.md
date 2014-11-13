#gulp-nunit-runner


A [Gulp.js](http://gulpjs.com/) plugin to facilitate running [NUnit](http://www.nunit.org/) tests on .NET assemblies. Much of this work was inspired by the [gulp-nunit](https://github.com/stormid/gulp-nunit) plugin.

##Installation
From the root of your project (where your `gulpfile.js` is), issue the following command:

```bat
npm install --save-dev gulp-nunit-runner
```

##Usage
The plugin uses standard `gulp.src` globs to retrieve a list of assemblies that should be tested with Nunit. By default the plugin looks for the NUnit console runner in your `PATH`. You can optionally specify the NUnit `bin` folder or the full path of the runner as demonstrated below. You should add `{read: false}` to your `gulp.src` so that it doesn't actually read the files and only grabs the file names.

```javascript
var gulp = require('gulp'),
    nunit = require('gulp-nunit-runner');

gulp.task('unit-test', function () {
	return gulp.src(['**/*.Test.dll'], {read: false})
		.pipe(nunit({
			executable: 'C:/nunit/bin/nunit-console.exe',
		}));
});

```
This would result in the following command being executed (assuming you had Database and Services Test assemblies.)

```bat
C:/nunit/bin/nunit-console.exe "C:\full\path\to\Database.Test.dll" "C:\full\path\to\Services.Test.dll"
```

Note: If you use Windows paths with `\`'s, you need to escape them with another `\`. (e.g. `C:\\nunit\\bin\\nunit-console.exe`). However, you may also use forward slashes `/` instead which don't have to be escaped.

You may also add options that will be used as NUnit command line switches. Any property that is a boolean `true` will simply be added to the command line, String values will be added to the switch parameter separated by a colon and arrays will be a comma seperated list of values.

For more information on available switches, see the NUnit documentation:

[http://www.nunit.org/index.php?p=consoleCommandLine&r=2.6.3](http://www.nunit.org/index.php?p=consoleCommandLine&r=2.6.3)

```javascript
var gulp = require('gulp'),
    nunit = require('gulp-nunit-runner');

gulp.task('unit-test', function () {
	return gulp.src(['**/*.Test.dll'], {read: false})
		.pipe(nunit({
			executable: 'C:/nunit/bin/nunit-console.exe',
			options: {
				nologo: true,
				config: 'Release',
				transform: 'myTransform.xslt'
			}
		}));
});
```
This would result in the following command:

```bat
C:/nunit/bin/nunit-console.exe /nologo /config:"Release" /transform:"myTransform.xslt" "C:\full\path\to\Database.Test.dll" "C:\full\path\to\Services.Test.dll"
```

## Options

Below are all avialable options.

```js
nunit({

    // The NUnit bin folder or the full path of the console runner.
    // If not specified the NUnit bin folder must be in the `PATH`.
    executable: 'c:/Program Files/NUnit/bin',

    // If the full path of the console runner is not specified this determines 
    // what version of the console runner is used. Defaults to anycpu.
    // http://www.nunit.org/index.php?p=nunit-console&r=2.6.3
    platform: 'anycpu|x86',

    // Output TeamCity service messages.
    // https://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity
    teamcity: true|false,

    // The options below map directly to the NUnit console runner. See here
    // for more info: http://www.nunit.org/index.php?p=consoleCommandLine&r=2.6.3
    options: {

        // Name of the test case(s), fixture(s) or namespace(s) to run.
        run: ['TestSuite.Unit', 'TestSuite.Integration'],

        // Name of a file containing a list of the tests to run, one per line.
        runlist: 'TestsToRun.txt',

        // Project configuration (e.g.: Debug) to load.
        config: 'Debug',

        // Name of XML result file (Default: TestResult.xml)
        result: 'TestResult.xml',

        // Suppress XML result output.
        noresult: true|false,

        // File to receive test output.
        output: 'TestOutput.txt',

        // File to receive test error output.
        err: 'TestErrors.txt',

        // Work directory for output files.
        work: 'BuildArtifacts',

        // Label each test in stdOut.
        labels: true|false,

        // Set internal trace level.
        trace: 'Off|Error|Warning|Info|Verbose',

        // List of categories to include.
        include: ['BaseLine', 'Unit'],

        // List of categories to exclude.
        exclude: ['Database', 'Network'],

        // Framework version to be used for tests.
        framework: 'net-1.1',

        // Process model for tests.
        process: 'Single|Separate|Multiple',

        // AppDomain Usage for tests.
        domain: 'None|Single|Multiple',

        // Apartment for running tests (Default is MTA).
        apartment: 'MTA|STA',

        // Disable shadow copy when running in separate domain.
        noshadow: true|false,

        // Disable use of a separate thread for tests.
        nothread: true|false,

        // Base path to be used when loading the assemblies.
        basepath: 'src',

        // Additional directories to be probed when loading assemblies.
        privatebinpath: ['lib', 'bin'],

        // Set timeout for each test case in milliseconds.
        timeout: 1000,

        // Wait for input before closing console window.
        wait: true|false,

        // Do not display the logo.
        nologo: true|false,

        // Do not display progress.
        nodots: true|false,

        // Stop after the first test failure or error.
        stoponerror: true|false,

        // Erase any leftover cache files and exit.
        cleanup: true|false

    }
});
```

## Release Notes

### 0.3.0 (30 Sept 2014)
- Fixes large amount of writes by NUnit tests causing node to crash
- Switched to using `child_process::spawn`, much simpler command building.

### 0.2.0 (28 Sept 2014)
- Fixes #2 "Simultaneous runs of test tasks cause duplication"
- Major rearchitecture of plugin by @VoiceOfWisdom
- Adds release notes to README.md

### 0.1.2 (4 Sept 2014)
- Fixes #1 "runner fails if executable path has space"

### 0.1.1 (10 Aug 2014)
- Documentation update

### 0.1.0 (10 Aug 2014)
- Initial release