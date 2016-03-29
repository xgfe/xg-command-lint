var child_process = require('child_process');
var path = require('path');
var linter = require('lint-plus');
var colors = require('colors');

exports.name = 'lint [dir or filename]';
exports.desc = 'check the code style of your project';
exports.options = {
    '-c <filename>': 'specify the configuration file',
    '-v, --version': 'print the version of lint-plus',
    '-h, --help': 'print this help message'
};

const SERVERITY_ARR = ['info ', 'warn ', 'error'];
const LOG_TPL = 'lint type: %s; line: %s; col: %s; error message: %s; rule: %s';

exports.run = function(argv, cli, env) {

    // 显示帮助信息
    if (argv.h || argv.help) {
        return cli.help(exports.name, exports.options);
    }

    /*---------------------api start--------------------
    var options = {
        _: ['.']
    };

    console.log(argv);

    if ( typeof argv.c === 'string') {
        options.config = argv.c;
    }
    console.log(options);

    linter.check(options, function (sucess, json, errors, errorFile, totalFile) {
        if (sucess) {
            fis.log.info('Congratulations! You are the code master!')
            process.exit(1);
        }

        var messages;

        for(var i in json){
            messages = json[i];
            fis.log.notice('file %s has problem.',i);
            messages.forEach(function (message) {
                //console.log('lint type: %s',message.type);
                //console.log('problem severity: %s',message.severity);//2-error,1-warn,0-info
                //console.log('line: %s',message.line);
                //console.log('col: %s',message.col);
                //console.log('error message: %s',message.message);
                //console.log('rule: %s',message.rule);

                fis.log[SERVERITY_ARR[message.severity]](LOG_TPL, message.type, message.line, message.col, message.message, message.rule);
            });
        }

        process.exit(1);
    });
    --------------------------api end ----------------------*/

    var paramStr = process.title.replace('xg lint ', '').replace(/\[[^\[]+$/, '');

    var lintCheck = child_process.exec(path.join(__dirname, '../lint-plus/bin/lint-plus ') + paramStr);

    // 显示版本信息
    if (argv.v || argv.version) {
        lintCheck.stdout.on('data', function (chunk) {
            console.log('\n ' + chunk.toString('utf-8'));
        });
    } else {
        lintCheck.stdout.on('data', function (chunk) {
            var logInfoArr = chunk.toString('utf-8').replace(/^\s+/, '').split(/\n+\s*/);
            logInfoArr.forEach(function (logInfo, index, arr) {
                if (!logInfo) {
                    return true;
                }

                if (logInfo.match(/\smessages?\)$/)) {
                    fis.log.warn(logInfo);
                    return true;
                }

                var level = logInfo.split(/\s+/)[0].toLowerCase();

                switch (level) {
                    case 'error':
                    case 'warn':
                    case 'info':
                        console.log('     ' + logInfo);
                        break;
                    default:
                        fis.log.info(logInfo);

                }
            });
        });
    }

    lintCheck.stderr.on('data', function (chunk) {
        fis.log.error(chunk.toString('utf-8').replace(/^\s+/, ''));
    });

    lintCheck.on('close', function () {process.exit(1)});
};