module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      dev: {
        src: ['manifest-src/manifest-head.json', 'manifest-src/manifest-key.json', 'manifest-src/manifest-tail.json'],
        dest: 'manifest-build/manifest-dev.json',
      },
      release: {
        src: ['manifest-src/manifest-head.json', 'manifest-src/manifest-tail.json'],
        dest: 'manifest-build/manifest-release.json',
      }
    },

    copy: {
      dev: {
        files: [
          {expand: true, cwd: 'deps', src: ['angular/**'], dest: 'build/'},
          {expand: true, cwd: 'deps', src: ['angular-animate/**'], dest: 'build/'},
          {expand: true, cwd: 'deps', src: ['angular-bootstrap/**'], dest: 'build/'},
          {expand: true, cwd: 'deps', src: ['angular-resource/**'], dest: 'build/'},
          {expand: true, cwd: 'deps', src: ['angular-sanitize/**'], dest: 'build/'},
          {expand: true, src: ['bootstrap/**'], dest: 'build/'},
          {expand: true, src: ['css/**'], dest: 'build/'},
          {expand: true, src: ['fonts/**'], dest: 'build/'},
          {expand: true, src: ['font-awesome-4.2.0/**'], dest: 'build/'},
          {expand: true, src: ['icons/**'], dest: 'build/'},
          {expand: true, src: ['images/**'], dest: 'build/'},
          {expand: true, src: ['jquery/**'], dest: 'build/'},
          {expand: true, src: ['jquery-ui/**'], dest: 'build/'},
          {expand: true, src: ['js/**'], dest: 'build/'},
          {expand: true, src: ['linkitz-device/**'], dest: 'build/'},
          {expand: true, src: ['partials/**'], dest: 'build/'},
          {expand: true, src: ['q/**'], dest: 'build/'},
          {expand: true, src: ['app-entry.js', 'app-main.html', 'manifest.json'], dest: 'build/'},
          {expand: true, cwd: 'manifest-build', src: ['manifest-dev.json'], dest: 'build/', rename: function (dest,src) {return dest + 'manifest.json'; }},
          {expand: true, cwd: 'blockly-assets', src: ['blocklyframe.html', 'blocklyframe.js'], dest: 'build/'},
          {expand: true, cwd: 'deps/linkitz-blockly/src', src: ['blockly_compressed.js', 'blocks_compressed.js', 'assembly_compressed.js',  'media/**', 'msg/**'], dest: 'build/blockly/'},
          {expand: true, cwd: 'deps/linkitz-blockly/src', src: ['images/**'], dest: 'build/'}, // trying to move images out of build/blockly to /build
          {expand: true, cwd: 'blockly-assets', src: ['style.css', 'msg/**'], dest: 'build/blockly/'},
        ],
      },
      release: {
        files: [
          {expand: true, cwd: 'deps', src: ['angular/**'], dest: 'release/'},
          {expand: true, cwd: 'deps', src: ['angular-animate/**'], dest: 'release/'},
          {expand: true, cwd: 'deps', src: ['angular-bootstrap/**'], dest: 'release/'},
          {expand: true, cwd: 'deps', src: ['angular-resource/**'], dest: 'release/'},
          {expand: true, cwd: 'deps', src: ['angular-sanitize/**'], dest: 'release/'},
          {expand: true, src: ['bootstrap/**'], dest: 'release/'},
          {expand: true, src: ['css/**'], dest: 'release/'},
          {expand: true, src: ['fonts/**'], dest: 'release/'},
          {expand: true, src: ['font-awesome-4.2.0/**'], dest: 'release/'},
          {expand: true, src: ['icons/**'], dest: 'release/'},
          {expand: true, src: ['images/**'], dest: 'release/'},
          {expand: true, src: ['jquery/**'], dest: 'release/'},
          {expand: true, src: ['jquery-ui/**'], dest: 'release/'},
          {expand: true, src: ['js/**'], dest: 'release/'},
          {expand: true, src: ['linkitz-device/**'], dest: 'release/'},
          {expand: true, src: ['partials/**'], dest: 'release/'},
          {expand: true, src: ['q/**'], dest: 'release/'},
          {expand: true, src: ['app-entry.js', 'app-main.html', 'manifest.json'], dest: 'release/'},
          {expand: true, cwd: 'manifest-build', src: ['manifest-release.json'], dest: 'release/', rename: function (dest,src) {return dest + 'manifest.json'; }},          
          {expand: true, cwd: 'blockly-assets', src: ['blocklyframe.html', 'blocklyframe.js'], dest: 'release/'},
          {expand: true, cwd: 'deps/linkitz-blockly/src', src: ['blockly_compressed.js', 'blocks_compressed.js', 'assembly_compressed.js', 'media/**', 'msg/**'], dest: 'release/blockly/'},
          {expand: true, cwd: 'deps/linkitz-blockly/src', src: ['images/**'], dest: 'release/'},
          {expand: true, cwd: 'blockly-assets', src: ['style.css', 'msg/**'], dest: 'release/blockly/'},
        ],
      }
    },
    watch: {
      devapp: {
        files: [
          'bootstrap/**',
          'css/**',
          'fonts/**',
          'font-awesome-4.2.0/**',
          'icons/**',
          'images/**',
          'jquery/**',
          'jquery-ui/**',
          'js/**',
          'linkitz-device/**',
          'partials/**',
          'q/**',
          'app-entry.js', 'app-main.html', 'manifest.json',
          'blockly-assets/blocklyframe.html', 'blockly-assets/blocklyframe.js',
          'deps/linkitz-blockly/src/blockly_compressed.js',
          'deps/linkitz-blockly/src/assembly_compressed.js', 
          'deps/linkitz-blockly/src/blocks_compressed.js',
          'deps/linkitz-blockly/src/images/**',
          'deps/linkitz-blockly/src/media/**',
          'deps/linkitz-blockly/src/msg/**',
          'blockly-assets/style.css',
          'blockly-assets/msg/**',
        ],
        tasks: ['copy']
      },
      blockly: {
        files: [
          'deps/linkitz-blockly/src/blocks/**',
          'deps/linkitz-blockly/src/core/**',
          'deps/linkitz-blockly/src/generators/**',
          'deps/linkitz-blockly/src/msg/**',
        ],
        tasks: ['shell:blocklybuild']
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'js/**',
        'linkitz-device/**',
        'app-entry.js',
        'blockly-assets/blocklyframe.js'
      ],
      options: {
        asi: true,
        boss: true,
        sub: true,
        shadow: true,
        esversion: 6,
        loopfunc: true,
        "-W041": false,
        "-W097": false,
        globals: {
          angular: true,
          browser: true
        }
      }
    },
    shell: {
      blocklybuild: {
        command: 'python build.py',
        options: {
          stderr: true,
          execOptions: {
            cwd: 'deps/linkitz-blockly/src'
          }
        }
      }
    },
    compress: {
      release: {
        options: {
          archive: 'archive/linkitz-app-release.zip'
        },
        files: [
          {expand: true, cwd: 'release/', src: ['**'], dest: '/'}
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['watch']);

};
