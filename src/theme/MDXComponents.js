import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Map the "<YouTube>" tag to our component
  YouTube: (props) => (
    <div className="youtube-container" style={{ margin: '20px 0' }}>
      <LiteYouTubeEmbed 
        id={props.id} 
        title={props.title || "YouTube video player"} 
        {...props} 
      />
    </div>
  ),
};
