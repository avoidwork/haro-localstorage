var figlet = require("figlet");

function graffiti (arg) {
	return figlet.textSync(arg, {
		font: 'Graffiti',
		horizontalLayout: 'default',
		verticalLayout: 'default'
	})
}

module.exports = function (grunt) {
	var banner = graffiti("haro-localStorage " + grunt.file.readJSON("package.json").version);

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		concat: {
			options : {
				banner : "/**\n" +
				         " * <%= pkg.description %>\n" +
				         " *\n" +
				         " * @author <%= pkg.author %>\n" +
				         " * @copyright <%= grunt.template.today('yyyy') %>\n" +
				         " * @license <%= pkg.license %>\n" +
				         " * @link <%= pkg.homepage %>\n" +
				         " * @version <%= pkg.version %>\n" +
				         " */\n"
			},
			dist: {
				src : [
					"src/index.js"
				],
				dest : "lib/index.es6.js"
			}
		},
		babel: {
			options: {
				sourceMap: false
			},
			dist: {
				files: {
					"lib/index.js": "lib/index.es6.js"
				}
			}
		},
		eslint: {
			target: ["lib/index.es6.js"]
		},
		uglify: {
			options: {
				banner: '/*\n' + banner + '\n\n<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>\n*/\n',
				sourceMap: true,
				sourceMapIncludeSources: true,
				mangle: {
					except: ["keigai", "define", "export", "process", "array", "regex", "store", "string", "utility"]
				}
			},
			target: {
				files: {
					"lib/index.min.js" : ["lib/index.js"]
				}
			}
		},
		watch : {
			grunt: {
				files : "Gruntfile.js",
				tasks : "default"
			},
			js : {
				files : "<%= concat.dist.src %>",
				tasks : "default"
			},
			pkg: {
				files : "package.json",
				tasks : "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-eslint");

	// aliases
	grunt.registerTask("test", ["eslint"]);
	grunt.registerTask("build", ["concat", "babel"]);
	grunt.registerTask("default", ["build", "test", "uglify"]);
};