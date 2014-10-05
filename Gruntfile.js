var pkg = require('./package')
  , path = require('path')
  , gruntConfig;

gruntConfig = function (grunt) {
  var nodeWebkitLinuxDir, nodeWebkitMacDir, nodeWebkitWinDir, distDir;

  grunt.registerTask('mkdir', 'Create dir', function (goal) {
    var fs = require('fs')
      , configName, dirs;
    configName = this.name + (goal ? '.' + goal : '');
    dirs = grunt.config(configName + '.dir');
    if (!(dirs instanceof Array)) {
      dirs = [dirs];
    }
    dirs.forEach(function (dir) {
      try {
        fs.mkdirSync(dir);
      } catch (err) {
      }
    });
  });

  grunt.registerTask('chmod', 'Chmod a file', function (goal) {
    var fs = require('fs')
      , configName, file, mode;
    configName = this.name + (goal ? '.' + goal : '');
    file = grunt.config(configName + '.file');
    mode = grunt.config(configName + '.mode');
    fs.chmodSync(file, mode);
  });

  grunt.registerTask('binconcat', 'Concat binary files', function (goal) {
    var fs = require('fs')
      , configName, srcFiles, destFile, data;
    configName = this.name + (goal ? '.' + goal : '');
    srcFiles = grunt.config(configName + '.src');
    destFile = grunt.config(configName + '.dest');
    try {
      fs.unlinkSync(destFile);
    } catch (err) {
    }
    srcFiles.forEach(function (srcFile) {
      data = fs.readFileSync(srcFile);
      fs.appendFileSync(destFile, data);
    });
  });

  nodeWebkitLinuxDir = path.join('lib', 'vendor', 'node-webkit', 'linux');
  nodeWebkitMacDir = path.join('lib', 'vendor', 'node-webkit', 'osx');
  nodeWebkitWinDir = path.join('lib', 'vendor', 'node-webkit', 'win');
  distDir = path.join('dist');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: distDir
      }
    },
    less: {
      production: {
        options: {
          yuicompress: true
        },
        files: {
          'css/style.css': path.join('less', 'style.less')
        }
      }
    },
    exec: {
      nwsnapshot: {
        cmd: 'nwsnapshot --logfile dist/v8.log --extra_code b.js dist/b.bin'
      }
    },
    mkdir: {
      dir: [
        distDir,
        distDir + '/linux',
        distDir + '/mac',
        distDir + '/win'
      ]
    },
    compress: {
      app: {
        options: {
          archive: path.join(distDir, pkg.name + '.nw'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            src: [
              'controllers/**',
              'css/**',
              'img/**',
              'lib/*.js',
              'lib/vendor/js/**',
              'lib/vendor/css/**',
              'lib/vendor/fonts/**',
              'node_modules/moment/**',
              'views/**',
              'app.js',
              'config.js',
              'package.json',
              'index.html',
              path.join(distDir, 'hello.bin')
            ]
          }
        ]
      },
      linux: {
        options: {
          archive: path.join(distDir, pkg.name + '-linux.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'linux', '**')
            ]
          }
        ]
      },
      mac: {
        options: {
          archive: path.join(distDir, pkg.name + '-mac.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'mac', '**')
            ]
          }
        ]
      },
      win: {
        options: {
          archive: path.join(distDir, pkg.name + '-win.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'win', '**')
            ]
          }
        ]
      }
    },
    binconcat: {
      linux: {
        src: [path.join(nodeWebkitLinuxDir, 'nw'), path.join(distDir, pkg.name + '.nw')],
        dest: path.join(distDir, 'linux', pkg.name)
      },
      mac: {
        src: [path.join(nodeWebkitMacDir, 'nw'), path.join(distDir, pkg.name + 'nw')],
        dest: path.join(distDir, 'mac', pkg.name)
      },
      win: {
        src: [path.join(nodeWebkitWinDir, 'nw.exe'), path.join(distDir, pkg.name + '.nw')],
        dest: path.join(distDir, 'win', pkg.name + '.exe')
      }
    },
    chmod: {
      linux: {
        file: path.join(distDir, 'linux', pkg.name),
        mode: '775'
      },
      mac: {
        file: path.join(distDir, 'mac', pkg.name),
        mode: '775'
      },
      win: {
        file: path.join(distDir, 'win', pkg.name + '.exe'),
        mode: '775'
      }
    },
    copy: {
      linux: {
        files: [
          {
            expand: true,
            flatten: true,
            src: path.join(nodeWebkitLinuxDir, 'nw.pak'),
            dest: path.join(distDir, 'linux') + '/'
          }
        ]
      },
      mac: {
        files: [
          {
            expand: true,
            flatten: true,
            src: path.join(nodeWebkitMacDir, 'nw.pak'),
            dest: path.join(distDir, 'mac') + '/'
          }
        ]
      },
      win: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(nodeWebkitWinDir, 'nw.pak'),
              path.join(nodeWebkitWinDir, 'icudt.dll')
            ],
            dest: path.join(distDir, 'win') + '/'
          }
        ]
      }
    },
    bower: {
      dev: {
        dest: 'lib/vendor',
        js_dest: 'lib/vendor/js', 
        css_dest: 'lib/vendor/css',        
        options: {
          packageSpecific: {
            jquery: {
              files: ['jquery.min.js']
            },
            'jquery-ui': {
              keepExpandedHierarchy: false,
              files: [
                'ui/minified/jquery.ui.core.min.js', 
                'ui/minified/jquery.ui.widget.min.js', 
                'ui/minified/jquery.ui.mouse.min.js', 
                'ui/minified/jquery.ui.draggable.min.js', 
                'ui/minified/jquery.ui.droppable.min.js'
              ]
            },
            Respond: {
              files: [
                'respond.min.js'
              ]
            },
            angular: {
              files: [
                'angular.min.js'
              ]
            },
            'angular-sanitize': {
              files: [
                'angular-sanitize.min.js'
              ]
            },
            bootstrap: {
              dest: 'lib/vendor/fonts',
              keepExpandedHierarchy: false,
              files: [
                'dist/js/bootstrap.min.js',
                'dist/css/bootstrap.min.css',
                'dist/fonts/glyphicons-halflings-regular.eot',
                'dist/fonts/glyphicons-halflings-regular.svg',
                'dist/fonts/glyphicons-halflings-regular.ttf',
                'dist/fonts/glyphicons-halflings-regular.woff'
              ]
            },
            'node-webkit-linux': {
              dest: 'lib/vendor/node-webkit/linux',
              files: [
                'nw',
                'nwsnapshot',
                'nw.pak',
                'libffmpegsumo.so'
              ]
            },
            'node-webkit-win': {
              dest: 'lib/vendor/node-webkit/win',
              files: [
                'nw.exe',
                'nwsnapshot.exe',
                'nw.pak',
                'ffmpegsumo.dll',
                'icudt.dll',
                'libEGL.dll',
                'libGLESv2.dll'
              ]
            }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower');
  grunt.registerTask('build', ['less', 'mkdir', 'compress:app']);
  grunt.registerTask('linux', ['build', 'binconcat:linux', 'chmod:linux', 'copy:linux', 'compress:linux']);
  grunt.registerTask('mac', ['build', 'binconcat:mac', 'chmod:mac', 'copy:mac', 'compress:mac']);
  grunt.registerTask('win', ['build', 'binconcat:win', 'chmod:win', 'copy:win', 'compress:win']);
  grunt.registerTask('default', ['bower', 'clean', 'linux', 'win']);
};

module.exports = gruntConfig;
