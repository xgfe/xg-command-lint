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
        var lintVersion = child_process.execSync(path.join(require.resolve('lint-plus'), '../bin/lint-plus') + ' -v');
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

    lintCheck(options, function(sucess, json, errors, warnings ,errorFile, totalFile) {
        if (sucess) {
            fis.log.info(colors.green('Congratulations! You are the code master!'));
            process.exit(0);
        }

        fis.log.warn(
            colors.red('Linter found %s errors%s,%s warning%s in %s of %s file%s.'),
            errors,
            errors > 1 ? 's' : '',
            warnings,
            warnings > 1 ? 's' : '',
            errorFile,
            totalFile, totalFile > 1 ? 's' : ''
        );
        process.exit(1);
    });
};

/**
 *
 * @param {object}   options    监测配置
 *      @param {array}      _           待检测的文件或者目录
 *      @param {string}     config      配置文件路径
 * @param {function} callback   回调函数, 监测完成后调用
 *      @param {boolean}    success     是否有ERROR级别的代码违规
 *      @param {object}     json        以文件名为key, 存储各文件代码违规的array of object
 *      @param {number}     errors      ERROR级别代码违规总数
 *      @param {number}     warnings    WARNING级别代码违规总数
 *      @param {number}     errorFile   有问题代码违规的文件数
 *      @param {number}     totalFile   总共监测的文件数
 */
function lintCheck(options, callback) {
    var lintStream = linter.check(options, function (sucess, json, errors ,warnings , errorFile, totalFile) {
        if (typeof callback === 'function') {
            callback(sucess, json, errors ,warnings , errorFile, totalFile);
        }
    });

    lintStream.on('lint', function(filepath, messages) {
        if (messages.length) {
            fis.log.warn(
                '%s (%s message%s)',
                colors.yellow(filepath.replace(fis.project.getProjectPath(), '')),
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
};

exports.check = lintCheck;