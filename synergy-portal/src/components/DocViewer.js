// File: src/components/DocViewer.js

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/docs.css';

const DocViewer = ({ category, doc }) => {
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const path = `/docs/${category}/${doc}.md`;
    fetch(path)
      .then((res) => {
        setLastUpdated(new Date(res.headers.get('Last-Modified')).toLocaleString());
        return res.text();
      })
      .then(setContent)
      .catch(() => setContent('## 404\nDocument not found.'));
  }, [category, doc]);

  return (
    <div className="doc-viewer fade-in">
      <ReactMarkdown>{content}</ReactMarkdown>
      <div className="doc-updated">Last updated: {lastUpdated}</div>
    </div>
  );
};

export default DocViewer;
