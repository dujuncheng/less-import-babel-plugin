
# less-import

痛点： 当我们导入lodash中指定的工具函数时 会将整个lodash打包进来

```
import {flattenDeep, chunk} from 'lodash'

```

换成按需引入的写法 但是这样写有些麻烦 我们想由上面写法 自动分解为下面写法 所以我们就编写一个babel插件 less-import

该 babel 插件会将import {flattenDeep, chunk} from 'lodash' 转化为下面这种写法:

```
import flattenDeep from 'lodash/flattenDeep'
import chunk from 'lodash/chunk'

 ```

## 使用

```
npm install less-import-babel-plugin --save

```

## 配置.babelrc
```
{
    "presets": [
        "env",
        "stage-0"
    ],
    "plugins": [
        [
            "less-import-babel-plugin", // 配置插件
            {
                "library": "lodash" // 指定处理的库
            }
        ]
    ]
}
```


## 原理解析

### @babel/parser

babelParser 把js解析为 ast tree，然后我们对 tree 进行修改
```
const script = babelParser.parse(sfc.script.content, {
  sourceType: 'module',
});

```

可以在线 ast 转换 javascript 的网站 https://astexplorer.net/


### @babel/trasform

当我们需要对 ast 改造的时候的，肯定会涉及到遍历。

主角是@babel/traverse，@babel/types和@babel/template是辅助工具

traverse 支持两个参数，第一个是 ast 树，第二个是 visitor

#### visitor

- visitor 是用于 AST 遍历的跨语言的模式。
- 就是一个对象，会在遇到合适类型节点时被执行

具体的语法：
```
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const code = `function mirror(something) {
  return something
}`
const ast = parser.parse(code, {
  sourceType: 'module',
})
const visitor = {
  Identifier (path) {
    console.log(path.node.name)
  }
}
traverse(ast, visitor)

```

#### path

- path是对当前访问的node的一层包装

- 使用path.node可以访问到当前的节点，使用path.parent可以访问到父节点，这里列出了path所包含的内容

- path中还提供了一系列的工具函数，例如`traverse`(在当前path下执行递归), `remove`(删除当前节点), `replaceWith`(替换当前节点)等等。

### @babel/types

- 包含了判断，新建以及变换 AST 节点的方法

比如说判断 isIdentifier
```
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

const code = `function mirror(something) {
  return something
}`
const ast = parser.parse(code, {
  sourceType: 'module',
})
const visitor = {
  enter(path) {
    if (t.isIdentifier(path.node)) {
      console.log('Identifier!')
    }
  }
}
traverse(ast, visitor)
```

比如说，生成：

```
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const t = require('@babel/types')

const code = `function mirror(something) {
  return something
}`
const ast = parser.parse(code, {
  sourceType: 'module',
})
const strNode = t.stringLiteral('mirror')
const visitor = {
  ReturnStatement (path) {
    path.traverse({
      Identifier(cpath){
        cpath.replaceWith(strNode)
      }
    })
  }
}
traverse(ast, visitor)
const transformedCode = generate(ast).code
console.log(transformedCode)

```

使用@babel/type创建一些简单节点会很容易，但是如果是大段代码的话就会变得困难了，这个时候我们可以使用@babel/template。

```
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const template = require('@babel/template').default
const t = require('@babel/types')

const code = `function mirror(something) {
  return something
}`
const ast = parser.parse(code, {
  sourceType: 'module',
})
const visitor = {
  FunctionDeclaration(path) {
    // 在这里声明了一个模板，比用@babel/types去生成方便很多
    const temp = template(`
      if(something) {
        NORMAL_RETURN
      } else {
        return 'nothing'
      }
    `)
    const
 = path.node.body.body[0]
    const tempAst = temp({
      NORMAL_RETURN: returnNode
    })
    path.node.body.body[0] = tempAst
  }
}
traverse(ast, visitor)
const transformedCode = generate(ast).code
console.log(transformedCode)

```
