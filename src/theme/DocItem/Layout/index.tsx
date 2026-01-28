import React from 'react';
import Layout from '@theme-original/DocItem/Layout'; // 這是原本的文件佈局
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common'; // 用來偵測目前的深色/淺色模式

export default function LayoutWrapper(props) {
  // 取得目前的顏色模式 ('light' 或 'dark')
  const { colorMode } = useColorMode();

  return (
    <>
      {/* 1. 先渲染原本的文件內容 */}
      <Layout {...props} />

      {/* 2. 在文件下方加入 Giscus */}
      <div style={{ marginTop: '20px', padding: '0 20px 20px 20px' }}>
        <Giscus
          // 以下是從你提供的檔案中提取的設定
          repo="Shen-Jing/Shen-Jing.github.io"
          repoId="MDEwOlJlcG9zaXRvcnkxMzMyOTcyMDY="
          category="General"
          categoryId="DIC_kwDOB_H0Ns4Cs5Bg"
          
          // 注意：Doc 建議改用 'pathname'，因為文件標題(title)可能會改，但網址路徑通常比較固定
          mapping="pathname" 
          
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          
          // 這裡改成綁定 Docusaurus 的主題狀態，體驗會更順暢
          theme={colorMode} 
          
          lang="zh-TW"
          loading="lazy"
          crossorigin="anonymous"
        />
      </div>
    </>
  );
}