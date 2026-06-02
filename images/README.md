# 照片文件夹 / Images Folder

这是一个用于存放本地照片文件的文件夹。

## 如何使用 / How to Use

1. **放入照片文件**：
   请将您的照片文件（支持 `.jpg`, `.jpeg`, `.png`, `.webp` 等格式）放入此文件夹中。例如，命名为 `photo1.jpg`。

2. **在项目代码中引用**：
   由于此文件夹位于 Vite 项目的 `public` 目录下，其中的所有照片在构建时都会被原样复制到根目录，并且可以通过浏览器直接以根路径访问。
   
   例如，如果您放入的照片文件名为 `photo1.jpg`，您可以在 `src/data.ts` 中直接通过 `/images/photo1.jpg` 路径来访问它，无需使用 `import` 语句。

3. **修改数据源中的图片路径**：
   在 `src/data.ts` 文件中，找到对应的照片项，将 `url` 属性修改为您的本地照片路径。例如：
   ```typescript
   {
     id: 1,
     url: '/images/photo1.jpg',
     title: '安静温柔 / QUIET SMILE',
     desc: '你在这儿，就是最安静、最温柔的时光。',
     date: '2022.12.25',
     location: '图书馆角落 / Library Corner'
   }
   ```
