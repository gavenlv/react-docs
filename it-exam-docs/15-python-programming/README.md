# 第15章 - Python 编程实践

## 🎯 本章目标

- 掌握条件语句（if-elif-else）
- 学会使用循环结构（for、while）
- 掌握循环控制语句（break、continue）
- 学会定义和调用函数
- 能够实现基本算法
- 综合运用所学知识解决问题

---

## 🔀 第一部分：条件语句

### 1.1 if 语句基础

#### 基本语法

```python
if 条件:
    代码块
```

#### 执行流程

```
条件为 True → 执行代码块
条件为 False → 跳过代码块
```

#### 示例

```python
age = 18

if age >= 18:
    print("你已成年")

score = 85
if score >= 60:
    print("及格了！")
```

### 1.2 if-else 语句

#### 基本语法

```python
if 条件:
    代码块1
else:
    代码块2
```

#### 执行流程

```
条件为 True → 执行代码块1
条件为 False → 执行代码块2
```

#### 示例

```python
age = 15

if age >= 18:
    print("你已成年")
else:
    print("你未成年")

score = 55
if score >= 60:
    print("及格")
else:
    print("不及格")
```

### 1.3 if-elif-else 语句

#### 基本语法

```python
if 条件1:
    代码块1
elif 条件2:
    代码块2
elif 条件3:
    代码块3
else:
    代码块4
```

#### 执行流程

```
条件1为 True → 执行代码块1
条件1为 False，条件2为 True → 执行代码块2
条件1、2都为 False，条件3为 True → 执行代码块3
所有条件都为 False → 执行代码块4
```

#### 成绩等级判断

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

#### 多条件判断

```python
age = 25

if age < 12:
    print("儿童")
elif age < 18:
    print("青少年")
elif age < 35:
    print("青年")
elif age < 60:
    print("中年")
else:
    print("老年")
```

### 1.4 条件嵌套

#### 基本语法

```python
if 条件1:
    if 条件2:
        代码块
```

#### 示例：判断闰年

```python
year = 2024

if year % 4 == 0:
    if year % 100 == 0:
        if year % 400 == 0:
            print(f"{year}年是闰年")
        else:
            print(f"{year}年不是闰年")
    else:
        print(f"{year}年是闰年")
else:
    print(f"{year}年不是闰年")
```

#### 示例：登录验证

```python
username = input("请输入用户名：")
password = input("请输入密码：")

if username == "admin":
    if password == "123456":
        print("登录成功！")
    else:
        print("密码错误！")
else:
    print("用户名不存在！")
```

### 1.5 比较运算符与逻辑运算符

#### 比较运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| == | 等于 | a == b |
| != | 不等于 | a != b |
| > | 大于 | a > b |
| < | 小于 | a < b |
| >= | 大于等于 | a >= b |
| <= | 小于等于 | a <= b |

#### 逻辑运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| and | 与（两边都为真） | a > 0 and b > 0 |
| or | 或（一边为真） | a > 0 or b > 0 |
| not | 非（取反） | not a > 0 |

#### 综合示例

```python
age = 20
score = 85

if age >= 18 and score >= 60:
    print("成年且及格")

if age < 18 or score < 60:
    print("未成年或不及格")

if not age < 18:
    print("已成年")

if 60 <= score <= 100:
    print("成绩有效")
```

---

## 🔄 第二部分：循环结构

### 2.1 for 循环

#### 基本语法

```python
for 变量 in 序列:
    代码块
```

#### 遍历列表

```python
fruits = ["苹果", "香蕉", "橙子"]

for fruit in fruits:
    print(fruit)

for i in range(5):
    print(i)
```

### 2.2 range() 函数

#### range() 的用法

| 用法 | 说明 | 生成的序列 |
|------|------|------------|
| range(n) | 0 到 n-1 | range(5) → 0,1,2,3,4 |
| range(m, n) | m 到 n-1 | range(1, 5) → 1,2,3,4 |
| range(m, n, step) | m 到 n-1，步长为 step | range(0, 10, 2) → 0,2,4,6,8 |

#### 示例

```python
for i in range(5):
    print(i)

for i in range(1, 6):
    print(i)

for i in range(0, 10, 2):
    print(i)

for i in range(10, 0, -1):
    print(i)

for i in range(5):
    print(f"第{i+1}次循环")
```

### 2.3 while 循环

#### 基本语法

```python
while 条件:
    代码块
```

#### 执行流程

```
条件为 True → 执行代码块 → 再次判断条件
条件为 False → 退出循环
```

#### 示例

```python
count = 0
while count < 5:
    print(count)
    count += 1

total = 0
num = 1
while num <= 100:
    total += num
    num += 1
print(f"1到100的和是：{total}")
```

#### 猜数字游戏

```python
import random

target = random.randint(1, 100)
guess = 0

while guess != target:
    guess = int(input("请猜一个数字（1-100）："))
    if guess < target:
        print("太小了，再试一次！")
    elif guess > target:
        print("太大了，再试一次！")
    else:
        print("恭喜你，猜对了！")
```

### 2.4 for vs while

| 特点 | for 循环 | while 循环 |
|------|----------|------------|
| 适用场景 | 已知循环次数 | 未知循环次数 |
| 遍历方式 | 遍历序列 | 条件控制 |
| 典型用途 | 遍历列表、计数 | 用户输入、游戏循环 |

```python
for i in range(5):
    print(i)

count = 0
while count < 5:
    print(count)
    count += 1
```

### 2.5 循环嵌套

#### 基本语法

```python
for i in range(n):
    for j in range(m):
        代码块
```

#### 打印九九乘法表

```python
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="  ")
    print()
```

#### 打印图形

```python
for i in range(5):
    for j in range(i + 1):
        print("*", end="")
    print()

for i in range(5):
    for j in range(5 - i):
        print(" ", end="")
    for k in range(i + 1):
        print("*", end="")
    print()
```

---

## ⏹️ 第三部分：循环控制

### 3.1 break 语句

#### 作用

**break** 用于立即跳出整个循环，不再执行后续循环。

#### 示例

```python
for i in range(10):
    if i == 5:
        break
    print(i)

count = 0
while True:
    print(count)
    count += 1
    if count >= 5:
        break
```

#### 查找元素

```python
numbers = [3, 7, 2, 9, 1, 5]
target = 9

for num in numbers:
    if num == target:
        print(f"找到了：{num}")
        break
```

### 3.2 continue 语句

#### 作用

**continue** 用于跳过本次循环，直接进入下一次循环。

#### 示例

```python
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)

for i in range(1, 11):
    if i == 5:
        continue
    print(i)
```

#### 过滤数据

```python
scores = [85, 55, 90, 45, 78, 60]

for score in scores:
    if score < 60:
        continue
    print(f"及格分数：{score}")
```

### 3.3 break vs continue

| 语句 | 作用 | 执行后 |
|------|------|--------|
| break | 跳出整个循环 | 不再执行循环 |
| continue | 跳过本次循环 | 继续下一次循环 |

```python
print("break 示例：")
for i in range(5):
    if i == 3:
        break
    print(i)

print("\ncontinue 示例：")
for i in range(5):
    if i == 3:
        continue
    print(i)
```

### 3.4 循环中的 else

#### 语法

```python
for 变量 in 序列:
    代码块
else:
    循环正常结束后执行的代码
```

#### 示例

```python
for i in range(5):
    print(i)
else:
    print("循环正常结束")

for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print("循环被 break 打断，不执行 else")
```

---

## 📦 第四部分：函数

### 4.1 函数概述

#### 什么是函数

**函数**是一段可重复使用的代码块，用于完成特定的任务。

#### 函数的优点

| 优点 | 说明 |
|------|------|
| 代码复用 | 避免重复编写相同代码 |
| 模块化 | 将程序分解为小模块 |
| 易于维护 | 修改函数即可影响所有调用 |
| 提高可读性 | 函数名可表达功能含义 |

### 4.2 定义函数

#### 基本语法

```python
def 函数名():
    代码块
```

#### 示例

```python
def greet():
    print("你好！")

greet()
greet()
```

### 4.3 函数参数

#### 位置参数

```python
def greet(name):
    print(f"你好，{name}！")

greet("张三")
greet("李四")
```

#### 多个参数

```python
def add(a, b):
    result = a + b
    print(f"{a} + {b} = {result}")

add(3, 5)
add(10, 20)
```

#### 默认参数

```python
def greet(name, greeting="你好"):
    print(f"{greeting}，{name}！")

greet("张三")
greet("李四", "早上好")
```

### 4.4 返回值

#### return 语句

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
print(add(10, 20))
```

#### 多个返回值

```python
def get_info():
    name = "张三"
    age = 15
    return name, age

n, a = get_info()
print(f"姓名：{n}，年龄：{a}")
```

#### 无返回值

```python
def greet(name):
    print(f"你好，{name}！")

result = greet("张三")
print(result)
```

### 4.5 函数综合示例

#### 计算器函数

```python
def calculator(a, b, op):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        return a / b
    else:
        return "不支持的操作"

print(calculator(10, 5, "+"))
print(calculator(10, 5, "-"))
print(calculator(10, 5, "*"))
print(calculator(10, 5, "/"))
```

#### 判断素数

```python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

print(is_prime(7))
print(is_prime(10))
print(is_prime(13))
```

#### 计算阶乘

```python
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(factorial(5))
print(factorial(10))
```

---

## 🧮 第五部分：常用算法

### 5.1 累加求和

#### 1 到 n 的和

```python
def sum_n(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(sum_n(100))

print(sum(range(1, 101)))
```

#### 偶数求和

```python
def sum_even(n):
    total = 0
    for i in range(2, n + 1, 2):
        total += i
    return total

print(sum_even(100))
```

### 5.2 求最值

#### 最大值

```python
def find_max(numbers):
    max_val = numbers[0]
    for num in numbers:
        if num > max_val:
            max_val = num
    return max_val

nums = [3, 7, 2, 9, 1, 5]
print(find_max(nums))
print(max(nums))
```

#### 最小值

```python
def find_min(numbers):
    min_val = numbers[0]
    for num in numbers:
        if num < min_val:
            min_val = num
    return min_val

nums = [3, 7, 2, 9, 1, 5]
print(find_min(nums))
print(min(nums))
```

### 5.3 计数统计

#### 统计元素出现次数

```python
def count_item(lst, item):
    count = 0
    for x in lst:
        if x == item:
            count += 1
    return count

numbers = [1, 2, 3, 2, 2, 4, 2, 5]
print(count_item(numbers, 2))
print(numbers.count(2))
```

#### 统计及格人数

```python
def count_pass(scores, passing=60):
    count = 0
    for score in scores:
        if score >= passing:
            count += 1
    return count

scores = [85, 55, 90, 45, 78, 60]
print(count_pass(scores))
```

### 5.4 查找算法

#### 顺序查找

```python
def linear_search(lst, target):
    for i in range(len(lst)):
        if lst[i] == target:
            return i
    return -1

numbers = [3, 7, 2, 9, 1, 5]
print(linear_search(numbers, 9))
print(linear_search(numbers, 10))
```

### 5.5 排序算法

#### 冒泡排序

```python
def bubble_sort(lst):
    n = len(lst)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
    return lst

numbers = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(numbers))

numbers = [64, 34, 25, 12, 22, 11, 90]
numbers.sort()
print(numbers)
```

### 5.6 经典算法示例

#### 斐波那契数列

```python
def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [1]
    elif n == 2:
        return [1, 1]
    
    fib = [1, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(fibonacci(10))
```

#### 水仙花数

```python
def is_narcissistic(n):
    hundreds = n // 100
    tens = n // 10 % 10
    ones = n % 10
    return hundreds ** 3 + tens ** 3 + ones ** 3 == n

for i in range(100, 1000):
    if is_narcissistic(i):
        print(i)
```

---

## ⚠️ 考点提示

### 常考知识点

1. **条件语句**
   - if-elif-else 结构
   - 条件嵌套
   - 比较运算符和逻辑运算符

2. **循环结构**
   - for 循环和 range()
   - while 循环
   - 循环嵌套

3. **循环控制**
   - break 和 continue 的区别
   - 循环中的 else

4. **函数**
   - 函数定义和调用
   - 参数和返回值

5. **算法**
   - 累加求和
   - 求最值
   - 计数统计

---

## 📝 单元测试

### 一、选择题（每题3分，共30分）

**1. 下列代码执行后，输出结果是（  ）**
```python
x = 10
if x > 5:
    print("A")
else:
    print("B")
```

A. A  
B. B  
C. AB  
D. 无输出  

**2. 下列循环执行几次？（  ）**
```python
for i in range(5):
    print(i)
```

A. 4 次  
B. 5 次  
C. 6 次  
D. 无限次  

**3. range(1, 5) 生成的序列是（  ）**

A. 1, 2, 3, 4, 5  
B. 1, 2, 3, 4  
C. 0, 1, 2, 3, 4  
D. 2, 3, 4  

**4. 跳出整个循环使用的关键字是（  ）**

A. continue  
B. break  
C. return  
D. exit  

**5. 下列代码的输出结果是（  ）**
```python
for i in range(5):
    if i == 3:
        break
    print(i)
```

A. 0 1 2 3 4  
B. 0 1 2  
C. 0 1 2 3  
D. 3  

**6. 下列代码的输出结果是（  ）**
```python
for i in range(5):
    if i == 3:
        continue
    print(i)
```

A. 0 1 2 3 4  
B. 0 1 2  
C. 0 1 2 4  
D. 3  

**7. 定义函数使用的关键字是（  ）**

A. function  
B. def  
C. define  
D. func  

**8. 下列代码的输出结果是（  ）**
```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

A. 3  
B. 5  
C. 8  
D. None  

**9. 表达式 5 > 3 and 3 > 1 的结果是（  ）**

A. True  
B. False  
C. 5  
D. 3  

**10. 下列代码的输出结果是（  ）**
```python
x = 75
if x >= 90:
    print("优秀")
elif x >= 80:
    print("良好")
elif x >= 60:
    print("及格")
else:
    print("不及格")
```

A. 优秀  
B. 良好  
C. 及格  
D. 不及格  

### 二、判断题（每题2分，共20分）

**1. if 语句后面必须要有 else。（  ）**

**2. for 循环只能遍历列表。（  ）**

**3. range(10) 生成的序列从 0 开始。（  ）**

**4. break 语句可以跳出所有嵌套的循环。（  ）**

**5. continue 语句会跳过本次循环，继续下一次循环。（  ）**

**6. 函数必须有返回值。（  ）**

**7. 函数可以没有参数。（  ）**

**8. while 循环可能一次都不执行。（  ）**

**9. 在 Python 中，elif 是 else if 的缩写。（  ）**

**10. 函数的 return 语句只能返回一个值。（  ）**

### 三、填空题（每空2分，共20分）

**1. 条件语句中，用于判断多个条件的关键字是 ______。**

**2. range(1, 10, 2) 生成的序列是 ______。**

**3. 跳出整个循环使用 ______ 语句，跳过本次循环使用 ______ 语句。**

**4. 定义函数使用 ______ 关键字，返回值使用 ______ 关键字。**

**5. 表达式 3 > 1 and 1 > 2 的结果是 ______。**

**6. 表达式 3 > 1 or 1 > 2 的结果是 ______。**

**7. while 循环的条件为 ______ 时，循环结束。**

**8. 函数的参数在定义时称为 ______ 参数，在调用时称为 ______ 参数。**

### 四、编程题（每题10分，共30分）

**1. 编写程序，输入一个整数，判断它是奇数还是偶数。**

**2. 编写程序，输出 1 到 100 中所有能被 3 整除但不能被 5 整除的数。**

**3. 编写一个函数，接收一个列表作为参数，返回列表中的最大值和最小值。**

---

## 📋 答案与解析

### 一、选择题

1. **A** - x = 10 > 5，条件为 True，执行 if 分支，输出 A

2. **B** - range(5) 生成 0, 1, 2, 3, 4，共 5 个数，循环 5 次

3. **B** - range(1, 5) 生成 1, 2, 3, 4（不包含 5）

4. **B** - break 跳出整个循环，continue 跳过本次循环

5. **B** - 当 i = 3 时 break，输出 0, 1, 2

6. **C** - 当 i = 3 时 continue 跳过，输出 0, 1, 2, 4

7. **B** - Python 使用 def 关键字定义函数

8. **C** - add(3, 5) 返回 8

9. **A** - 5 > 3 为 True，3 > 1 为 True，True and True = True

10. **C** - x = 75，不满足 >= 90 和 >= 80，满足 >= 60，输出"及格"

### 二、判断题

1. **×** - if 可以单独使用，else 是可选的

2. **×** - for 可以遍历任何可迭代对象，如列表、字符串、range 等

3. **√** - range(10) 生成 0 到 9

4. **×** - break 只跳出当前所在的循环，不跳出嵌套的外层循环

5. **√** - continue 跳过本次循环的剩余代码，继续下一次

6. **×** - 函数可以没有返回值，默认返回 None

7. **√** - 函数可以没有参数，如 def func():

8. **√** - 如果一开始条件就为 False，while 循环一次都不执行

9. **√** - elif 是 else if 的缩写

10. **×** - return 可以返回多个值，以元组形式返回

### 三、填空题

1. elif

2. 1, 3, 5, 7, 9

3. break、continue

4. def、return

5. False

6. True

7. False

8. 形式、实际

### 四、编程题

**1. 判断奇偶数：**

```python
num = int(input("请输入一个整数："))
if num % 2 == 0:
    print(f"{num}是偶数")
else:
    print(f"{num}是奇数")
```

**2. 输出能被3整除但不能被5整除的数：**

```python
for i in range(1, 101):
    if i % 3 == 0 and i % 5 != 0:
        print(i)
```

**3. 返回最大值和最小值的函数：**

```python
def find_max_min(numbers):
    max_val = numbers[0]
    min_val = numbers[0]
    for num in numbers:
        if num > max_val:
            max_val = num
        if num < min_val:
            min_val = num
    return max_val, min_val

nums = [3, 7, 2, 9, 1, 5]
maximum, minimum = find_max_min(nums)
print(f"最大值：{maximum}，最小值：{minimum}")
```

---

## ✅ 本章检查清单

完成本章后，你应该能够：

- [ ] 使用 if-elif-else 进行条件判断
- [ ] 使用 for 循环遍历序列
- [ ] 使用 range() 函数生成数字序列
- [ ] 使用 while 循环处理条件循环
- [ ] 使用 break 和 continue 控制循环
- [ ] 定义和调用函数
- [ ] 使用参数和返回值
- [ ] 实现基本算法（求和、最值、计数等）

---

## 🎉 恭喜完成全部学习！

你已经完成了广州市初中信息科技学业水平考试的全部学习内容！

建议：
1. 复习各章节的重点内容
2. 完成各章节的单元测试
3. 进行模拟试卷练习

祝你考试顺利，取得优异成绩！

---

**返回目录**：[README](../README.md)
