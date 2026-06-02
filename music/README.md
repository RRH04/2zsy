# 音乐文件夹 / Music Folder

这是一个用于存放 MP3 格式音乐文件的文件夹。

## 如何使用 / How to Use

1. **放入 MP3 文件**：
   请将您的 `.mp3` 格式音乐文件直接放入此文件夹中。例如，命名为 `ambient.mp3`。

2. **在项目代码中引用**：
   由于此文件夹位于 Vite 项目的 `public` 目录下，其中的所有文件都会在构建时被直接复制到根目录，并且可以通过浏览器直接以根路径访问。
   
   例如，如果您放入的文件名为 `ambient.mp3`，您可以在前端代码中直接通过 `/music/ambient.mp3` 路径来访问它，无需使用 `import` 语句导入。

3. **修改播放器中的音乐路径**：
   在 `src/components/AudioPlayer.tsx` 文件中，找到第 19 行附近的 `audioUrl` 定义：
   ```typescript
   const audioUrl = '/music/您的音乐文件名.mp3';
   ```
   将其修改为您放入的文件路径即可。
