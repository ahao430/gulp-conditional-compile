# gulp-conditional-compile

一个用于条件编译的 Gulp 插件，支持在 HTML 和 JavaScript/CSS 文件中使用条件注释。通过简单的条件注释语法，可以在不同的编译条件下生成不同的代码。

## 特性

- 支持 HTML 注释格式 (`<!-- -->`)
- 支持 JavaScript/CSS 注释格式 (`/* */`)
- 支持 if/elif/else/endif 条件语句
- 支持自定义回调函数处理编译后的内容
- 支持多种文件类型（HTML、CSS、JavaScript、JSON等）

## 安装

```bash
npm install gulp-conditional-compile --save-dev
```

## 使用方法

### 基本用法

```javascript
const gulp = require('gulp');
const conditionalCompile = require('gulp-conditional-compile');

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(conditionalCompile({
      commentType: 'html',
      conditions: [
        ['platform', 'wx'],
        ['debug', 'true']
      ]
    }))
    .pipe(gulp.dest('dist'));
});
```

### 条件注释语法

#### HTML 文件中的条件注释

```html
<!-- if platform == wx -->
<view>这段内容只在微信小程序中显示</view>
<!-- elif platform == alipay -->
<view>这段内容只在支付宝小程序中显示</view>
<!-- else -->
<view>当前平台不支持的内容</view>
<!-- endif -->

<!-- if debug == true -->
<view>这段内容只在debug模式下显示</view>
<!-- endif -->
```

#### JavaScript/CSS 文件中的条件注释

```javascript
/* if platform == wx */
wx.login();
/* elif platform == alipay */
my.getAuthCode();
/* endif */
```

### API

#### conditionalCompile(options)

##### options

- `commentType` (string): 注释类型，可选值：
  - `'html'`: HTML注释格式 (`<!-- -->`)
  - `'js'`: JavaScript注释格式 (`/* */`)
  - `'less'`: CSS注释格式 (`/* */`)
  - `'json'`: JSON注释格式 (`/* */`)
  - `'sjs'`: SJS/WXS注释格式 (`/* */`)

- `conditions` (Array): 条件数组，每个条件是一个包含两个元素的数组：[key, value]
  - `key`: 条件名
  - `value`: 条件值

- `cb` (Function, 可选): 自定义回调函数，用于处理编译后的内容
  - 参数：`content` (string) - 编译后的内容
  - 返回值：处理后的内容

## 示例项目

在 `example` 目录下提供了一个完整的示例项目，展示了如何在小程序项目中使用条件编译来处理不同平台的差异。

## 许可证

ISC License
