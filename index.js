const through2 = require('through2');

function processConditionalComments(content, conditions, options = {}) {
  const {
    commentType = 'html',
    startToken = commentType === 'html' ? '<!--' : '/*',
    endToken = commentType === 'html' ? '-->' : '*/',
  } = options;

  // 将conditions数组转换为对象格式
  const conditionsMap = {};
  if (Array.isArray(conditions)) {
    conditions.forEach(condition => {
      if (Array.isArray(condition) && condition.length >= 2) {
        const [key, value] = condition;
        conditionsMap[key] = String(value).toLowerCase();
      }
    });
  }

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedStartToken = escapeRegExp(startToken);
  const escapedEndToken = escapeRegExp(endToken);

  // 匹配完整的条件块（从if到endif）
  const conditionBlockRegex = new RegExp(
    `${escapedStartToken}\\s*if\\s+([^\\s]+)\\s*==\\s*(?:["']?([^"'\\s]+)["']?)?\\s*${escapedEndToken}([\\s\\S]*?)${escapedStartToken}\\s*endif\\s*${escapedEndToken}`,
    'g'
  );

  // 匹配条件语句（if/elif/else）
  const conditionStatementRegex = new RegExp(
    `${escapedStartToken}\\s*(if|elif|else)(?:\\s+([^\\s]+)\\s*==\\s*(?:["']?([^"'\\s]+)["']?)?)?\\s*${escapedEndToken}([\\s\\S]*?)(?=${escapedStartToken}|$)`,
    'g'
  );

  // 存储所有条件块
  const conditionBlocks = [];
  let match;

  // 提取所有条件块
  while ((match = conditionBlockRegex.exec(content)) !== null) {
    const [fullMatch] = match;
    const blocks = [];
    let blockContent = fullMatch;

    // 提取所有条件语句
    let statementMatch;
    while ((statementMatch = conditionStatementRegex.exec(blockContent)) !== null) {
      const [, type, key, value, content] = statementMatch;

      if (type === 'if' || type === 'elif') {
        blocks.push({
          type,
          key,
          value: (value || '').toLowerCase(),
          content: content.trim()
        });
      } else if (type === 'else') {
        blocks.push({
          type: 'else',
          content: content.trim()
        });
      }
    }

    if (blocks.length > 0) {
      conditionBlocks.push({
        fullMatch,
        blocks
      });
    }
  }

  // if (commentType === 'html') {
  //   console.log('conditionBlocks', conditionBlocks);
  //   conditionBlocks.forEach(group => {
  //     console.log('group', group.fullMatch);
  //     group.blocks.forEach(block => {
  //       console.log('block', block);
  //     });
  //   });
  // }


  // 处理所有条件块
  // if (commentType === 'html') {
  //   console.log('conditionsMap', conditionsMap);
  // }

  conditionBlocks.forEach(({ fullMatch, blocks }) => {
    // 查找匹配的条件块
    const matchedBlock = blocks.find(block => {
      if (block.type === 'else') return true;
      if (!block.key || !(block.key in conditionsMap)) return false;
      return block.value === conditionsMap[block.key];
    });
    // if (commentType === 'html') {
    //   console.log('matchedBlock', matchedBlock);
    // }

    // 替换原始内容
    content = content.replace(fullMatch, matchedBlock ? matchedBlock.content : '');
    // if (commentType === 'html') {
    //   console.log('content', content);
    // }
  });

  return content;
}

function conditionalComments({commentType = 'js', conditions = [], cb}) {
  return through2.obj(function(file, enc, cb2) {
    if (file.isBuffer()) {
      let content = file.contents.toString();
      content = processConditionalComments(content, conditions, {
        commentType,
      });
      if (cb) {
        // console.log(cb);
        // console.log(content);
        content = cb(content);
        // console.log(content);
      }
      file.contents = Buffer.from(content);
    }
    cb2(null, file);
  });
}

module.exports = conditionalComments;
