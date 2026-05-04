# 06 - 表格

## 🎯 本节目标
- 掌握表格的基本结构
- 学会合并单元格
- 了解表格语义化
- 掌握表格样式

---

## 📊 表格基本结构

```html
<table>
  <thead>
    <tr>
      <th>姓名</th>
      <th>年龄</th>
      <th>城市</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>25</td>
      <td>北京</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>30</td>
      <td>上海</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">总计：2 人</td>
    </tr>
  </tfoot>
</table>
```

### 表格标签

| 标签 | 描述 |
|------|------|
| `<table>` | 表格容器 |
| `<thead>` | 表头区域 |
| `<tbody>` | 表体区域 |
| `<tfoot>` | 表尾区域 |
| `<tr>` | 表格行 |
| `<th>` | 表头单元格 |
| `<td>` | 数据单元格 |
| `<caption>` | 表格标题 |

---

## 🔗 合并单元格

### 横向合并（colspan）

```html
<tr>
  <td colspan="2">合并两列</td>
</tr>
```

### 纵向合并（rowspan）

```html
<tr>
  <td rowspan="2">合并两行</td>
  <td>数据</td>
</tr>
<tr>
  <td>数据</td>
</tr>
```

---

## 📋 表格属性

```html
<table>
  <caption>表格标题</caption>
  <thead>
    <tr>
      <th scope="col">列标题</th>
      <th scope="col">列标题</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">行标题</th>
      <td>数据</td>
    </tr>
  </tbody>
</table>
```

### scope 属性

| 值 | 描述 |
|------|------|
| `col` | 列标题 |
| `row` | 行标题 |
| `colgroup` | 列组标题 |
| `rowgroup` | 行组标题 |

---

## 💻 完整示例

```html
<table>
  <caption>员工信息表</caption>
  <thead>
    <tr>
      <th>姓名</th>
      <th>部门</th>
      <th>职位</th>
      <th>入职日期</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td rowspan="2">技术部</td>
      <td>前端工程师</td>
      <td>2023-01-15</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>后端工程师</td>
      <td>2023-02-20</td>
    </tr>
    <tr>
      <td colspan="3">合计</td>
      <td>2 人</td>
    </tr>
  </tbody>
</table>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 创建基本表格
- [ ] 使用 thead、tbody、tfoot
- [ ] 合并单元格
- [ ] 添加表格标题
- [ ] 理解 scope 属性

---

## 🔗 相关资源

- [MDN - HTML 表格](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Tables)
