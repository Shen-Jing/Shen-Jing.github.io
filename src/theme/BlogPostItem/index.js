import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import { useColorMode } from '@docusaurus/theme-common'; // 用來偵測目前的深色/淺色模式
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import Giscus from '@giscus/react';
// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}
export default function BlogPostItem({children, className}) {
  // 取得目前的顏色模式 ('light' 或 'dark')
  const { colorMode } = useColorMode();
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}
      {/* 這裡是文章內容底部 -- 加上 Giscus 留言區 */}
      <Giscus
        repo="Shen-Jing/Shen-Jing.github.io"
        repoId="MDEwOlJlcG9zaXRvcnkxMzMyOTcyMDY="
        category="General"
        categoryId="DIC_kwDOB_H0Ns4Cs5Bg"
        mapping="title"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={colorMode}
        lang="zh-TW"
        loading="lazy"
        crossorigin="anonymous"
      />
      </BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
