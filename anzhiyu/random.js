var posts=["2025/07/12/Hexo 初建踩雷/","2025/07/12/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };