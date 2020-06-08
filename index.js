const babel = require('babel-core');
const types = require('babel-types');
const template = require('@babel/template').default

module.exports = function(babel) { // 将插件导出
  return {
    name: 'less-import',
    visitor: {
      ImportDeclaration(path, state) {
        let {specifiers} = path.node
        // 确认导入库 是否是 .babelrc library属性指定库 以及 如果不是默认导入 才进行按需导入加载
        if (state.opts.library === path.node.source.value && !types.isImportDefaultSpecifier(specifiers[0])) {
          let newImportsNode = specifiers.map(specifier => {
            let temp = template(`import NAME from 'SOURCE'`)
            return  temp({
              NAME: specifier.local.name,
              SOURCE: `${path.node.source.value}/${specifier.local.name}`
            })
          });
          // 使用 path 封装的替换方法
          path.replaceWithMultiple(newImportsNode);
        }
      }
    },
  }
};


