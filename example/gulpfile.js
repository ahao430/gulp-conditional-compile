const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const less = require('gulp-less');
const rename = require('gulp-rename');
const json5 = require('gulp-json5-to-json');
const chalk = require('chalk');
const inquirer = require('inquirer');
const conditionalCompile = require('../');

let SRC_DIR = 'src';
let DIST_DIR = 'dist';
let platform = 'wx';

// 询问平台和环境
async function ask() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: '请选择小程序平台：',
      choices: [
        { name: '微信小程序', value: 'wx' },
        { name: '支付宝小程序', value: 'alipay' }
      ]
    },
  ]);

  platform = answers.platform;
}

// 清理dist目录
function clean() {
  console.log(chalk.yellow('🗑️  清理dist目录...'));
  return del([`${DIST_DIR}/**`]);
}

// 编译HTML
function html() {
  console.log(chalk.blue('📄 编译HTML文件...'));
  return src(`${SRC_DIR}/**/*.html`)
    .pipe(rename(path => {
      if (platform === 'alipay') {
        path.extname = '.axml';
      } else {
        path.extname = '.wxml';
      }
    }))
    .pipe(conditionalCompile({
      commentType: 'html',
      conditions: [
        ['platform', platform],
      ],
      cb: (content) => {
        return content.replace(/\b(gy:|wx:|a:)/g, platform === 'alipay'? 'a:' : 'wx:');
      }
    }))
    .pipe(dest(DIST_DIR));
}

// 编译样式文件
function styles() {
  console.log(chalk.magenta('💅 编译样式文件...'));
  return src([`${SRC_DIR}/**/*.less`, `${SRC_DIR}/**/*.css`])
    .pipe(conditionalCompile({
      commentType: 'less',
      conditions: [
        ['platform', platform],
      ],
    }))
    .pipe(less())
    // .pipe(cleanCSS())
    .pipe(rename(path => {
      if (platform === 'alipay') {
        path.extname = '.acss';
      } else {
        path.extname = '.wxss';
      }
    }))
    .pipe(dest(DIST_DIR));
}

// 编译JavaScript
function scripts() {
  console.log(chalk.yellow('⚡ 编译JavaScript文件...'));
  return src(`${SRC_DIR}/**/*.js`)
    .pipe(conditionalCompile({
      commentType: 'js',
      conditions: [
        ['platform', platform],
      ],
      cb: (content) => {
        return content.replace(/\b(gy\.|wx\.|my\.)/g, platform === 'alipay'? 'my.' : 'wx.');
      }
    }))
    .pipe(dest(DIST_DIR));
}

// 编译JSON
function json() {
  console.log(chalk.green('📋 编译JSON文件...'));
  return src([`${SRC_DIR}/**/*.json`, `${SRC_DIR}/**/*.json5`, `!${SRC_DIR}/**/project.config.json`, `!${SRC_DIR}/**/mini.project.json`])
    .pipe(conditionalCompile({
      commentType: 'json',
      conditions: [
        ['platform', platform],
      ],
    }))
    .pipe(json5())
    .pipe(rename(path => {
      path.extname = '.json';
    }))
    .pipe(dest(DIST_DIR));
}

// 编译SJS/WXS文件
function sjs() {
  console.log(chalk.cyan('🔧 编译逻辑文件...'));
  return src(`${SRC_DIR}/**/*.{sjs,wxs}`)
    .pipe(conditionalCompile({
      commentType: 'sjs',
      conditions: [
        ['platform', platform],
      ],
    }))
    .pipe(rename(path => {
      if (platform === 'alipay') {
        path.extname = '.sjs';
      } else {
        path.extname = '.wxs';
      }
    }))
    .pipe(dest(DIST_DIR));
}


// 监听文件变化
function watchFiles() {
  watch('src/**/*.html', html);
  watch(['src/**/*.less', 'src/**/*.css'], styles);
  watch('src/**/*.js', scripts);
  watch(['src/**/*.json', 'src/**/*.json5'], json);
  watch(['src/**/*.sjs', 'src/**/*.wxs'], sjs);
}


// 主要任务（并行执行）
const main = parallel(html, styles, scripts, json, sjs);

// 开发任务
exports.dev = series(
  ask,
  clean,
  main,
  watchFiles
);

// 构建任务
exports.build = series(
  ask,
  clean,
  main
);
