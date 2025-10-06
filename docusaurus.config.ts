import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Shen Jing',
  tagline: '生活與思緒的隨筆',
  favicon: 'img/ShenJing_favicon48_48.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://Shen-Jing.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Shen-Jing', // Usually your GitHub org/user name.
  projectName: 'Shen-Jing.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
           // Path to the docs content directory on the file system, relative to site directory.
          path: 'mediashelf',
          // URL route
          routeBasePath: 'mediashelf',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/ShneJing_social-card_1200_800.png',
    navbar: {
      title: 'Shen Jing',
      logo: {
        alt: '審經，偶爾神經',
        src: 'img/ShenJing_logo_120_80.png',
      },
      items: [
        {to: '/blog', label: '貼文', position: 'left'},
        {to: '/blog/archive', label: '貼文列表', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'mediaShelfSidebar',
          position: 'left',
          label: '媒體櫃',
        },
        {to: '/about', label: '關於我', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '外部連結',
          items: [
            {
              label: 'Steam',
              href: 'https://steamcommunity.com/id/sortof-jing/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Shen-Jing',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shen Jing`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 85,           // 壓縮品質（0~100）
        steps: 2,              // 產生中間尺寸數量
        disableInDev: false,   // 是否在開發模式禁用
      }
    ],
  ],
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en", "zh"],
      },
    ],
  ],
};

export default config;
