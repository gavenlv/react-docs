# 20 - 工具链与工程化

## 🎯 本节目标
- 了解现代 JavaScript 工具链
- 掌握包管理器使用
- 学会使用构建工具
- 了解代码质量工具

---

## 📦 包管理器

### npm

```bash
npm init
npm install lodash
npm install -D webpack
npm run build
```

### yarn

```bash
yarn init
yarn add lodash
yarn add -D webpack
yarn build
```

### pnpm

```bash
pnpm init
pnpm add lodash
```

---

## 🔨 构建工具

### Webpack

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' }
    ]
  }
};
```

### Vite

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  }
});
```

---

## 📝 代码质量

### ESLint

```javascript
module.exports = {
  extends: 'eslint:recommended',
  rules: {
    'no-unused-vars': 'error',
    'semi': ['error', 'always']
  }
};
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握 npm/yarn 使用
- [ ] 了解 Webpack/Vite
- [ ] 会配置 ESLint
- [ ] 了解工程化流程

---

## 🔗 相关资源

- [npm 文档](https://docs.npmjs.com/)
- [Webpack 文档](https://webpack.js.org/)
- [Vite 文档](https://vitejs.dev/)
