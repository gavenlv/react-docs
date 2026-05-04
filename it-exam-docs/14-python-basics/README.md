# 第14章 - Python 基础

## 🎯 本章目标

- 了解 Python 语言的特点和应用领域
- 掌握 Python 基本语法规则
- 学会使用变量和数据类型
- 掌握运算符的使用
- 学会输入输出操作
- 掌握列表的基本操作

---

## 🐍 第一部分：Python 简介

### 1.1 Python 是什么

**Python** 是一种简单易学、功能强大的编程语言，由荷兰人 Guido van Rossum（吉多·范罗苏姆）于 1991 年创建。

#### Python 的特点

| 特点 | 说明 |
|------|------|
| 简单易学 | 语法简洁，接近自然语言 |
| 免费开源 | 可自由使用和分发 |
| 跨平台 | 可在 Windows、Mac、Linux 上运行 |
| 丰富的库 | 拥有大量第三方库 |
| 可扩展性 | 可调用 C/C++ 代码 |
| 面向对象 | 支持面向对象编程 |

#### Python 的应用领域

| 领域 | 应用示例 |
|------|----------|
| Web 开发 | 网站后端开发 |
| 数据分析 | 数据处理、可视化 |
| 人工智能 | 机器学习、深度学习 |
| 自动化脚本 | 自动化办公、测试 |
| 游戏开发 | 小游戏开发 |
| 网络爬虫 | 数据采集 |

### 1.2 Python 开发环境

#### Python 安装

1. 访问 Python 官网：https://www.python.org
2. 下载对应系统的 Python 安装包
3. 安装时勾选 "Add Python to PATH"
4. 验证安装：命令行输入 `python --version`

#### 常用开发工具

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| IDLE | Python 自带，简单易用 | 初学者学习 |
| VS Code | 功能强大，插件丰富 | 日常开发 |
| PyCharm | 专业 Python IDE | 大型项目 |
| Jupyter Notebook | 交互式编程 | 数据分析 |

### 1.3 第一个 Python 程序

#### 使用 print() 输出

```python
print("Hello, World!")
print("你好，Python！")
print(123)
print(3.14)
```

#### 程序运行方式

| 方式 | 操作 |
|------|------|
| 交互式 | 在 Python 解释器中直接输入代码 |
| 脚本式 | 将代码保存为 .py 文件后运行 |

#### 运行 Python 程序

1. **交互式运行**：
   - 打开命令行，输入 `python`
   - 输入代码，按回车执行

2. **脚本式运行**：
   - 将代码保存为 `hello.py`
   - 命令行输入 `python hello.py`

---

## 📝 第二部分：基本语法

### 2.1 注释

**注释**是程序中用于解释说明的文字，不会被执行。

#### 单行注释

```python
# 这是一个单行注释
print("Hello")  # 这也是单行注释
```

#### 多行注释

```python
"""
这是多行注释
可以写很多行
用于详细说明程序功能
"""

'''
这也是多行注释
使用单引号也可以
'''
```

#### 注释的作用

| 作用 | 说明 |
|------|------|
| 解释代码 | 帮助理解代码功能 |
| 调试代码 | 暂时禁用某些代码 |
| 文档说明 | 为代码添加说明文档 |

### 2.2 缩进

Python 使用**缩进**来表示代码块，通常使用 4 个空格。

#### 正确的缩进

```python
if True:
    print("True")      # 缩进 4 个空格
    print("正确")
    
for i in range(3):
    print(i)           # 缩进 4 个空格
```

#### 缩进规则

| 规则 | 说明 |
|------|------|
| 统一使用空格 | 推荐使用 4 个空格 |
| 同级代码对齐 | 同一代码块内的代码缩进相同 |
| 嵌套缩进 | 每嵌套一层，增加一级缩进 |

#### 错误示例

```python
if True:
print("错误")    # IndentationError: 缺少缩进

if True:
    print("正确")
  print("错误")  # IndentationError: 缩进不一致
```

### 2.3 标识符与关键字

#### 标识符命名规则

标识符是用于命名变量、函数、类等的名称。

| 规则 | 说明 | 正确示例 | 错误示例 |
|------|------|----------|----------|
| 字母开头 | 必须以字母或下划线开头 | name, _value | 1name, @email |
| 字符组成 | 只能包含字母、数字、下划线 | my_name, age1 | my-name, my name |
| 区分大小写 | 大小写字母不同 | Name ≠ name | - |
| 不能用关键字 | 不能使用保留字 | my_class | class, if |

#### Python 关键字

```python
# Python 关键字（保留字）
False    class    finally    is        return
None     continue for        lambda    try
True     def      from       nonlocal  while
and      del      global     not       with
as       elif     if         or        yield
assert   else     import     pass
break    except   in         raise
```

#### 命名规范

| 类型 | 命名风格 | 示例 |
|------|----------|------|
| 变量名 | 小写字母，下划线分隔 | my_name, student_age |
| 常量名 | 全大写，下划线分隔 | MAX_VALUE, PI |
| 函数名 | 小写字母，下划线分隔 | get_name(), calc_sum() |
| 类名 | 大驼峰命名法 | MyClass, StudentInfo |

---

## 📊 第三部分：变量与数据类型

### 3.1 变量

#### 什么是变量

**变量**是存储数据的容器，通过变量名可以访问存储的数据。

#### 变量的定义

```python
name = "张三"        # 字符串变量
age = 15            # 整数变量
height = 1.65       # 浮点数变量
is_student = True   # 布尔变量
```

#### 变量的使用

```python
name = "李四"
print(name)         # 输出：李四

age = 16
print("年龄:", age)  # 输出：年龄: 16

x = 10
x = 20              # 变量可以被重新赋值
print(x)            # 输出：20
```

#### 多重赋值

```python
a = b = c = 100     # 多个变量赋同一个值
print(a, b, c)      # 输出：100 100 100

x, y, z = 1, 2, 3   # 多个变量赋不同的值
print(x, y, z)      # 输出：1 2 3

a, b = b, a         # 交换两个变量的值
```

### 3.2 数据类型

#### 基本数据类型

| 类型 | 关键字 | 说明 | 示例 |
|------|--------|------|------|
| 整数 | int | 整数，无小数点 | 10, -5, 0, 100 |
| 浮点数 | float | 小数 | 3.14, -2.5, 0.0 |
| 字符串 | str | 文本，用引号包围 | "Hello", 'Python' |
| 布尔值 | bool | 真或假 | True, False |

#### 整数（int）

```python
a = 100             # 正整数
b = -50             # 负整数
c = 0               # 零

print(type(a))      # <class 'int'>

# 不同进制表示
d = 0b1010          # 二进制（以 0b 开头）
e = 0o12            # 八进制（以 0o 开头）
f = 0xFF            # 十六进制（以 0x 开头）
```

#### 浮点数（float）

```python
a = 3.14            # 小数
b = -2.5            # 负小数
c = 2.0             # 整数形式的小数
d = 1.5e2           # 科学计数法：1.5 × 10² = 150.0

print(type(a))      # <class 'float'>
```

#### 字符串（str）

```python
s1 = "Hello"        # 双引号
s2 = 'Python'       # 单引号
s3 = "你好"          # 中文字符串

print(type(s1))     # <class 'str'>

# 多行字符串
s4 = """
这是
多行
字符串
"""

# 转义字符
s5 = "Hello\nWorld"   # \n 换行
s6 = "Hello\tWorld"   # \t 制表符
s7 = "He said \"Hi\"" # \" 双引号
```

#### 布尔值（bool）

```python
a = True            # 真
b = False           # 假

print(type(a))      # <class 'bool'>

# 布尔值常用于条件判断
is_student = True
if is_student:
    print("是学生")
```

### 3.3 类型转换

#### 类型转换函数

| 函数 | 说明 | 示例 |
|------|------|------|
| int() | 转换为整数 | int("123") → 123 |
| float() | 转换为浮点数 | float("3.14") → 3.14 |
| str() | 转换为字符串 | str(123) → "123" |
| bool() | 转换为布尔值 | bool(1) → True |

#### 类型转换示例

```python
# 字符串转数字
s = "123"
n = int(s)          # 123（整数）
f = float(s)        # 123.0（浮点数）

# 数字转字符串
n = 456
s = str(n)          # "456"（字符串）

# 浮点数转整数（截断小数部分）
f = 3.9
n = int(f)          # 3

# 布尔值转换
print(bool(1))      # True
print(bool(0))      # False
print(bool(""))     # False（空字符串）
print(bool("abc"))  # True（非空字符串）
```

#### 类型检查

```python
a = 10
b = 3.14
c = "Hello"
d = True

print(type(a))      # <class 'int'>
print(type(b))      # <class 'float'>
print(type(c))      # <class 'str'>
print(type(d))      # <class 'bool'>

# 判断类型
print(isinstance(a, int))    # True
print(isinstance(b, float))  # True
```

---

## ➕ 第四部分：运算符

### 4.1 算术运算符

#### 基本算术运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| + | 加 | 3 + 2 | 5 |
| - | 减 | 3 - 2 | 1 |
| * | 乘 | 3 * 2 | 6 |
| / | 除（结果为浮点数） | 6 / 2 | 3.0 |
| // | 整除（取整数部分） | 7 // 2 | 3 |
| % | 取余（求模） | 7 % 2 | 1 |
| ** | 幂（乘方） | 2 ** 3 | 8 |

#### 运算示例

```python
print(10 + 3)       # 13 加法
print(10 - 3)       # 7  减法
print(10 * 3)       # 30 乘法
print(10 / 3)       # 3.333... 除法
print(10 // 3)      # 3  整除
print(10 % 3)       # 1  取余
print(10 ** 3)      # 1000 幂运算

# 负数运算
print(-7 // 2)      # -4（向下取整）
print(-7 % 2)       # 1

# 小数运算
print(3.5 + 2.5)    # 6.0
print(7.5 // 2)     # 3.0
```

#### 运算优先级

| 优先级 | 运算符 | 说明 |
|--------|--------|------|
| 1（最高） | ** | 幂运算 |
| 2 | +x, -x | 正负号 |
| 3 | *, /, //, % | 乘除类 |
| 4（最低） | +, - | 加减 |

```python
print(2 + 3 * 4)        # 14（先乘后加）
print((2 + 3) * 4)      # 20（括号优先）
print(2 ** 3 ** 2)      # 512（幂运算从右到左）
print((2 ** 3) ** 2)    # 64
```

### 4.2 赋值运算符

#### 基本赋值运算符

| 运算符 | 示例 | 等价于 |
|--------|------|--------|
| = | x = 5 | x = 5 |
| += | x += 3 | x = x + 3 |
| -= | x -= 3 | x = x - 3 |
| *= | x *= 3 | x = x * 3 |
| /= | x /= 3 | x = x / 3 |
| //= | x //= 3 | x = x // 3 |
| %= | x %= 3 | x = x % 3 |
| **= | x **= 3 | x = x ** 3 |

#### 赋值运算示例

```python
x = 10
x += 5             # x = x + 5 = 15
print(x)           # 15

x -= 3             # x = x - 3 = 12
print(x)           # 12

x *= 2             # x = x * 2 = 24
print(x)           # 24

x //= 5            # x = x // 5 = 4
print(x)           # 4
```

### 4.3 比较运算符

#### 比较运算符列表

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| == | 等于 | 5 == 5 | True |
| != | 不等于 | 5 != 3 | True |
| > | 大于 | 5 > 3 | True |
| < | 小于 | 5 < 3 | False |
| >= | 大于等于 | 5 >= 5 | True |
| <= | 小于等于 | 5 <= 3 | False |

#### 比较运算示例

```python
print(5 == 5)       # True
print(5 != 3)       # True
print(5 > 3)        # True
print(5 < 3)        # False
print(5 >= 5)       # True
print(5 <= 3)       # False

# 字符串比较（按字典序）
print("abc" < "abd")   # True
print("abc" == "ABC")  # False（区分大小写）

# 连续比较
print(1 < 5 < 10)   # True（等价于 1 < 5 and 5 < 10）
```

### 4.4 逻辑运算符

#### 逻辑运算符列表

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| and | 与（两边都为真才为真） | True and False | False |
| or | 或（一边为真就为真） | True or False | True |
| not | 非（取反） | not True | False |

#### 逻辑运算示例

```python
print(True and True)    # True
print(True and False)   # False
print(False and False)  # False

print(True or True)     # True
print(True or False)    # True
print(False or False)   # False

print(not True)         # False
print(not False)        # True

# 实际应用
age = 15
print(age >= 10 and age <= 20)  # True（10 ≤ age ≤ 20）
print(age < 10 or age > 20)     # False
print(not age == 15)            # False
```

#### 逻辑运算优先级

```python
print(not True and False)   # False（先 not，再 and）
print(not (True and False)) # True
```

---

## 📥 第五部分：输入输出

### 5.1 输出 print()

#### 基本输出

```python
print("Hello, World!")    # 输出字符串
print(123)                # 输出数字
print(3.14)               # 输出浮点数
print(True)               # 输出布尔值
```

#### 多项输出

```python
name = "张三"
age = 15

print("姓名:", name)       # 姓名: 张三
print("年龄:", age)        # 年龄: 15
print(name, age)           # 张三 15
print(name, age, sep="-")  # 张三-15（自定义分隔符）
print(name, age, end="。") # 张三 15。print()后不换行
```

#### 格式化输出

##### 使用 f-string（推荐）

```python
name = "李四"
age = 16
height = 1.75

print(f"姓名：{name}")
print(f"年龄：{age}岁")
print(f"身高：{height}米")
print(f"{name}今年{age}岁，身高{height}米")

# 格式化数字
score = 95.5
print(f"成绩：{score:.1f}分")   # 保留1位小数：95.5分
print(f"成绩：{score:.0f}分")   # 不保留小数：96分
```

##### 使用 format() 方法

```python
name = "王五"
age = 17

print("姓名：{}，年龄：{}岁".format(name, age))
print("姓名：{0}，年龄：{1}岁，{0}很高兴".format(name, age))
print("姓名：{n}，年龄：{a}岁".format(n=name, a=age))
```

##### 使用 % 格式化

```python
name = "赵六"
age = 18

print("姓名：%s，年龄：%d岁" % (name, age))
# %s 字符串，%d 整数，%f 浮点数

score = 98.5
print("成绩：%.1f分" % score)   # 保留1位小数
```

### 5.2 输入 input()

#### 基本输入

```python
name = input("请输入姓名：")
print(f"你好，{name}！")
```

#### input() 的特点

| 特点 | 说明 |
|------|------|
| 返回类型 | 总是返回字符串（str） |
| 参数 | 提示信息（可选） |
| 阻塞 | 等待用户输入后继续执行 |

#### 类型转换

```python
# input() 返回的是字符串
age_str = input("请输入年龄：")
print(type(age_str))    # <class 'str'>

# 需要转换为整数
age = int(input("请输入年龄："))
print(type(age))        # <class 'int'>
age += 1                # 可以进行数学运算

# 需要转换为浮点数
height = float(input("请输入身高（米）："))
print(type(height))     # <class 'float'>
```

#### 输入输出综合示例

```python
print("=== 学生信息录入 ===")
name = input("请输入姓名：")
age = int(input("请输入年龄："))
score = float(input("请输入成绩："))

print("\n=== 学生信息 ===")
print(f"姓名：{name}")
print(f"年龄：{age}岁")
print(f"成绩：{score:.1f}分")
```

---

## 📋 第六部分：列表基础

### 6.1 列表概述

#### 什么是列表

**列表（List）**是 Python 中最常用的数据结构，用于存储多个有序的数据。

#### 列表的特点

| 特点 | 说明 |
|------|------|
| 有序 | 元素按顺序存储，有索引 |
| 可变 | 可以添加、删除、修改元素 |
| 可重复 | 允许存储重复的元素 |
| 混合类型 | 可以存储不同类型的数据 |

### 6.2 创建列表

```python
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]    # 混合类型
empty = []                           # 空列表

print(type(fruits))    # <class 'list'>
```

### 6.3 访问列表元素

#### 通过索引访问

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]

print(fruits[0])    # 苹果（索引从 0 开始）
print(fruits[1])    # 香蕉
print(fruits[4])    # 西瓜

# 负数索引（从后往前）
print(fruits[-1])   # 西瓜（最后一个）
print(fruits[-2])   # 葡萄（倒数第二个）
```

#### 索引示意图

```
列表：["苹果", "香蕉", "橙子", "葡萄", "西瓜"]
正向索引：  0      1      2      3      4
负向索引： -5     -4     -3     -2     -1
```

#### 切片访问

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]

print(fruits[1:3])    # ['香蕉', '橙子']（索引1到2）
print(fruits[:3])     # ['苹果', '香蕉', '橙子']（前3个）
print(fruits[2:])     # ['橙子', '葡萄', '西瓜']（从索引2开始）
print(fruits[:])      # ['苹果', '香蕉', '橙子', '葡萄', '西瓜']（全部）
print(fruits[::2])    # ['苹果', '橙子', '西瓜']（每隔2个取一个）
```

### 6.4 修改列表

#### 修改元素

```python
fruits = ["苹果", "香蕉", "橙子"]
fruits[1] = "草莓"        # 修改索引1的元素
print(fruits)            # ['苹果', '草莓', '橙子']
```

#### 添加元素

```python
fruits = ["苹果", "香蕉"]

fruits.append("橙子")     # 在末尾添加
print(fruits)            # ['苹果', '香蕉', '橙子']

fruits.insert(1, "葡萄")  # 在索引1处插入
print(fruits)            # ['苹果', '葡萄', '香蕉', '橙子']
```

#### 删除元素

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄"]

fruits.remove("香蕉")     # 删除指定值的元素
print(fruits)            # ['苹果', '橙子', '葡萄']

del fruits[0]            # 删除指定索引的元素
print(fruits)            # ['橙子', '葡萄']

last = fruits.pop()       # 删除并返回最后一个元素
print(last)              # 葡萄
print(fruits)            # ['橙子']
```

### 6.5 列表常用操作

#### 列表长度

```python
fruits = ["苹果", "香蕉", "橙子"]
print(len(fruits))       # 3
```

#### 判断元素是否存在

```python
fruits = ["苹果", "香蕉", "橙子"]

print("苹果" in fruits)   # True
print("葡萄" in fruits)   # False

if "苹果" in fruits:
    print("列表中有苹果")
```

#### 列表拼接

```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]

list3 = list1 + list2    # 拼接
print(list3)             # [1, 2, 3, 4, 5, 6]

list1.extend(list2)      # 扩展
print(list1)             # [1, 2, 3, 4, 5, 6]
```

#### 列表常用方法

| 方法 | 说明 | 示例 |
|------|------|------|
| append() | 在末尾添加元素 | list.append(1) |
| insert() | 在指定位置插入元素 | list.insert(0, 1) |
| remove() | 删除指定值的元素 | list.remove(1) |
| pop() | 删除并返回指定索引元素 | list.pop(0) |
| index() | 返回元素的索引 | list.index(1) |
| count() | 统计元素出现次数 | list.count(1) |
| sort() | 排序 | list.sort() |
| reverse() | 反转 | list.reverse() |
| clear() | 清空列表 | list.clear() |

---

## ⚠️ 考点提示

### 常考知识点

1. **变量命名规则**
   - 只能包含字母、数字、下划线
   - 不能以数字开头
   - 不能使用关键字

2. **数据类型**
   - int、float、str、bool
   - 类型转换函数

3. **运算符**
   - 算术运算符（特别注意 // 和 %）
   - 比较运算符
   - 逻辑运算符

4. **输入输出**
   - print() 格式化输出
   - input() 返回字符串类型

5. **列表操作**
   - 索引访问（正负索引）
   - 添加、删除、修改元素

---

## 📝 单元测试

### 一、选择题（每题3分，共30分）

**1. 下列变量名中，合法的是（  ）**

A. 1name  
B. my-name  
C. my_name  
D. class  

**2. 表达式 17 // 5 的结果是（  ）**

A. 3.4  
B. 3  
C. 2  
D. 4  

**3. 表达式 17 % 5 的结果是（  ）**

A. 3.4  
B. 3  
C. 2  
D. 4  

**4. input() 函数返回的数据类型是（  ）**

A. int  
B. float  
C. str  
D. bool  

**5. 下列表达式的结果为 True 的是（  ）**

A. 5 > 3 and 3 > 5  
B. 5 > 3 or 3 > 5  
C. not (5 > 3)  
D. 5 == "5"  

**6. 将字符串 "123" 转换为整数，应使用（  ）**

A. str("123")  
B. int("123")  
C. float("123")  
D. bool("123")  

**7. 列表 fruits = ["苹果", "香蕉", "橙子"]，fruits[-1] 的值是（  ）**

A. "苹果"  
B. "香蕉"  
C. "橙子"  
D. 报错  

**8. 下列代码的输出结果是（  ）**
```python
x = 10
x += 5
print(x)
```

A. 10  
B. 5  
C. 15  
D. 50  

**9. Python 中用于输出内容的函数是（  ）**

A. input()  
B. print()  
C. output()  
D. display()  

**10. 下列关于 Python 注释的说法，正确的是（  ）**

A. 注释会被 Python 解释器执行  
B. 单行注释使用 // 开头  
C. 多行注释使用 """ 包围  
D. 注释对程序没有任何作用  

### 二、判断题（每题2分，共20分）

**1. Python 是区分大小写的编程语言。（  ）**

**2. 变量名可以用数字开头。（  ）**

**3. 3.14 和 3 是相同的数据类型。（  ）**

**4. 表达式 2 ** 3 的结果是 6。（  ）**

**5. 在 Python 中，缩进只影响代码美观，不影响程序运行。（  ）**

**6. 列表的索引从 1 开始。（  ）**

**7. 使用 append() 方法可以在列表末尾添加元素。（  ）**

**8. 字符串 "123" 和整数 123 是相等的。（  ）**

**9. int(3.9) 的结果是 4。（  ）**

**10. True 和 False 是 Python 的关键字。（  ）**

### 三、填空题（每空2分，共20分）

**1. Python 中用于输出内容的函数是 ______，用于输入内容的函数是 ______。**

**2. Python 的基本数据类型包括：整数（int）、______、字符串（str）、______。**

**3. 表达式 10 // 3 的结果是 ______，10 % 3 的结果是 ______。**

**4. 将整数 123 转换为字符串，应使用函数 ______。**

**5. 列表 fruits = ["苹果", "香蕉", "橙子"]，fruits[1] 的值是 ______。**

**6. Python 中单行注释以 ______ 开头。**

**7. 表达式 2 ** 3 的结果是 ______。**

**8. 布尔值只有两个值：______ 和 ______。**

### 四、编程题（每题10分，共30分）

**1. 编写程序，输入姓名和年龄，输出"我叫xx，今年xx岁"。**

**2. 编写程序，输入一个三位数，分别输出其百位、十位、个位数字。**

**3. 编写程序，创建一个列表 [10, 20, 30, 40, 50]，完成以下操作：**
- 输出列表的长度
- 输出列表的第一个和最后一个元素
- 在列表末尾添加数字 60
- 删除列表中的数字 30
- 输出修改后的列表

---

## 📋 答案与解析

### 一、选择题

1. **C** - my_name 符合命名规则，1name 数字开头错误，my-name 含减号错误，class 是关键字

2. **B** - 17 // 5 = 3（整除，取整数部分）

3. **C** - 17 % 5 = 2（取余，17 = 5 × 3 + 2）

4. **C** - input() 返回字符串类型，需要用 int() 或 float() 转换

5. **B** - 5 > 3 or 3 > 5，只要有一个为 True 结果就为 True

6. **B** - int() 函数将字符串转换为整数

7. **C** - 负数索引 -1 表示最后一个元素，即"橙子"

8. **C** - x += 5 等价于 x = x + 5 = 10 + 5 = 15

9. **B** - print() 用于输出，input() 用于输入

10. **C** - 多行注释使用三引号包围，单行注释用 # 开头

### 二、判断题

1. **√** - Python 区分大小写，Name 和 name 是不同的变量

2. **×** - 变量名不能以数字开头

3. **×** - 3.14 是 float 类型，3 是 int 类型

4. **×** - 2 ** 3 = 8（2的3次方），不是 6

5. **×** - Python 使用缩进表示代码块，缩进错误会导致程序报错

6. **×** - 列表索引从 0 开始

7. **√** - append() 在列表末尾添加元素

8. **×** - 字符串和整数是不同类型，不相等

9. **×** - int(3.9) = 3，截断小数部分，不是四舍五入

10. **√** - True 和 False 是 Python 的关键字（保留字）

### 三、填空题

1. print()、input()

2. 浮点数（float）、布尔值（bool）

3. 3、1

4. str()

5. "香蕉"

6. #

7. 8

8. True、False

### 四、编程题

**1. 输入姓名和年龄：**

```python
name = input("请输入姓名：")
age = input("请输入年龄：")
print(f"我叫{name}，今年{age}岁")
```

**2. 输出三位数的各位数字：**

```python
num = int(input("请输入一个三位数："))
bai = num // 100
shi = num // 10 % 10
ge = num % 10
print(f"百位：{bai}，十位：{shi}，个位：{ge}")
```

**3. 列表操作：**

```python
numbers = [10, 20, 30, 40, 50]

print(f"列表长度：{len(numbers)}")
print(f"第一个元素：{numbers[0]}")
print(f"最后一个元素：{numbers[-1]}")

numbers.append(60)
numbers.remove(30)

print(f"修改后的列表：{numbers}")
```

---

## ✅ 本章检查清单

完成本章后，你应该能够：

- [ ] 了解 Python 语言的特点和应用
- [ ] 正确命名变量
- [ ] 使用四种基本数据类型
- [ ] 进行类型转换
- [ ] 使用算术、比较、逻辑运算符
- [ ] 使用 print() 输出和 input() 输入
- [ ] 创建和操作列表
- [ ] 编写简单的 Python 程序

---

**下一章**：[15-python-programming](../15-python-programming/README.md) →
