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

    // 显示版本信息
    if (argv.v || argv.version) {
        var lintVersion = child_process.execSync(path.join(__dirname, '../lint-plus/bin/lint-plus -v'));
        fis.log.info(lintVersion.toString());
        return true;
    }

    var options = {
        _: argv._.slice(1)
    };

    // set configfile
    if ( typeof argv.c === 'string') {
        options.config = argv.c;
    }

    var lintStream = linter.check(options, function (sucess, json, errors, errorFile, totalFile) {
        if (sucess) {
            fis.log.info(colors.green('Congratulations! You are the code master!'));
            process.exit(1);
        }

        fis.log.warn(
            colors.red('Linter found %s problem%s in %s of %s file%s.'),
            errors,
            errors > 1 ? 's' : '',
            errorFile,
            totalFile, totalFile > 1 ? 's' : ''
        );
        process.exit(1);
    });

    lintStream.on('lint', function(filepath, messages) {
        if (messages.length) {
            fis.log.warn(
                '%s (%s message%s)',
                colors.yellow(filepath.replace(env.cwd, '')),
                messages.length,
                messages.length>1?'s':''
            );

            messages.forEach(function (message) {
                var type = (function () {
                    var temp = message.severity;
                    if(temp === 2){
                        return colors.red("ERROR");
                    }
                    if(temp === 1){
                        return colors.yellow('WARN ');
                    }
                    return colors.green('INFO ');
                })();
                console.log(
                    '     %s line %s, col %s: %s  %s',
                    type,
                    message.line,
                    message.col,
                    message.message,
                    colors.gray(message.rule)
                );
            });
        }
    });

    /*var paramStr = process.title.replace('xg lint ', '').replace(/\[[^\[]+$/, '');


    // 显示版本信息
    if (argv.v || argv.version) {
        lintCheck.stdout.on('data', function (chunk) {
            console.log('\n ' + chunk.toString('utf-8'));
        });
    } else {
        lintCheck.stdout.on('data', function (chunk) {
            var logInfoArr = chunk.toString('utf-8').replace(/^\s+/, '').split(/\n+\s*!/);
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

    lintCheck.on('close', function () {process.exit(1)});*/
};