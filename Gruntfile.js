module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      main: {
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
          {expand: true, cwd: 'blockly-assets', src: ['blocklyframe.html', 'blocklyframe.js'], dest: 'build/'},
          {expand: true, cwd: 'deps/linkitz-blockly/src', src: ['blockly_compressed.js', 'blocks_compressed.js', 'dart_compressed.js', 'images/**', 'media/**', 'msg/**'], dest: 'build/blockly/'},
          {expand: true, cwd: 'blockly-assets', src: ['style.css', 'msg/**'], dest: 'build/blockly/'},
        ],
      },
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
          'deps/linkitz-blockly/src/blocks_compressed.js',
          'deps/linkitz-blockly/src/dart_compressed.js',
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
          stderr: false,
          execOptions: {
            cwd: 'deps/linkitz-blockly/src'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['watch']);

};
