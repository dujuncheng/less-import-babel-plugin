const babel = require('@babel/core')

const code = ` import {flattenDeep, chunk} from 'lodash' `

const res = babel.transformSync(code, {
  plugins: [
    [
      require('./index.js'),
      {
        library: 'lodash' // 指定处理的库
      }
    ]
  ]
})

console.log(res.code)
