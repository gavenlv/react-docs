# 09 - 多媒体

## 🎯 本节目标
- 掌握音频和视频的嵌入
- 学会使用 iframe 嵌入内容
- 了解多媒体格式
- 掌握多媒体属性

---

## 🎵 音频

### 基本语法

```html
<audio src="music.mp3" controls>
  您的浏览器不支持 audio 标签。
</audio>
```

### 多格式支持

```html
<audio controls>
  <source src="music.mp3" type="audio/mpeg">
  <source src="music.ogg" type="audio/ogg">
  您的浏览器不支持 audio 标签。
</audio>
```

### 音频属性

| 属性 | 描述 |
|------|------|
| `src` | 音频路径 |
| `controls` | 显示控制面板 |
| `autoplay` | 自动播放 |
| `loop` | 循环播放 |
| `muted` | 静音 |
| `preload` | 预加载策略 |

---

## 🎬 视频

### 基本语法

```html
<video src="video.mp4" controls width="640" height="360">
  您的浏览器不支持 video 标签。
</video>
```

### 多格式支持

```html
<video controls width="640" height="360" poster="poster.jpg">
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  您的浏览器不支持 video 标签。
</video>
```

### 视频属性

| 属性 | 描述 |
|------|------|
| `src` | 视频路径 |
| `controls` | 显示控制面板 |
| `autoplay` | 自动播放 |
| `loop` | 循环播放 |
| `muted` | 静音 |
| `poster` | 封面图片 |
| `width` | 宽度 |
| `height` | 高度 |
| `preload` | 预加载策略 |

---

## 📺 iframe

### 基本语法

```html
<iframe src="https://www.example.com" width="600" height="400"></iframe>
```

### 嵌入视频

```html
<iframe 
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

### iframe 属性

| 属性 | 描述 |
|------|------|
| `src` | 嵌入页面地址 |
| `width` | 宽度 |
| `height` | 高度 |
| `frameborder` | 边框（0/1） |
| `allowfullscreen` | 允许全屏 |
| `sandbox` | 安全限制 |

---

## 📋 多媒体格式

### 音频格式

| 格式 | MIME 类型 | 描述 |
|------|-----------|------|
| MP3 | audio/mpeg | 最广泛支持 |
| WAV | audio/wav | 无损音质 |
| OGG | audio/ogg | 开源格式 |
| AAC | audio/aac | 高质量 |

### 视频格式

| 格式 | MIME 类型 | 描述 |
|------|-----------|------|
| MP4 | video/mp4 | 最广泛支持 |
| WebM | video/webm | 开源格式 |
| OGG | video/ogg | 开源格式 |

---

## 💻 完整示例

```html
<article>
  <h1>多媒体示例</h1>
  
  <section>
    <h2>音频播放器</h2>
    <audio controls>
      <source src="music.mp3" type="audio/mpeg">
      您的浏览器不支持 audio 标签。
    </audio>
  </section>
  
  <section>
    <h2>视频播放器</h2>
    <video controls width="640" poster="poster.jpg">
      <source src="video.mp4" type="video/mp4">
      您的浏览器不支持 video 标签。
    </video>
  </section>
</article>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 嵌入音频文件
- [ ] 嵌入视频文件
- [ ] 使用 iframe 嵌入内容
- [ ] 了解多媒体格式
- [ ] 设置多媒体属性

---

## 🔗 相关资源

- [MDN - 音频和视频](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding)
