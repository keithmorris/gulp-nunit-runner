#gulp-nunit-runner


A [Gulp.js](http://gulpjs.com/) plugin to facilitate running [NUnit](http://www.nunit.org/) tests on .NET assemblies. Much of this work was inspired by the [gulp-nunit](https://github.com/stormid/gulp-nunit) plugin.

##Usage
The plugin uses standard `gulp.src` globs to retrieve a list of assemblies that should be tested with Nunit. In its simplest form you just need to supply the command with the path to your `nunit-console.exe`. You should add `{read: false}` to your `gulp.src` so that it doesn't actually read the files and only grabs the file names.

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

You may also add options that will be used as NUnit command line switches. Any property that is a boolean `true` will simply be added to the command line while String values will be added to the switch parameter separated by a colon.

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



