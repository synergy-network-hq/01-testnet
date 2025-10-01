// File: src/components/layout/DocSidebar.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/docs.css';

const DocSidebar = () => {
  const [docsIndex, setDocsIndex] = useState({});
  const [openSections, setOpenSections] = useState({});
  const location = useLocation();

  useEffect(() => {
    fetch('/docs/docs_index.json')
      .then((res) => res.json())
      .then((data) => {
        setDocsIndex(data);
        const firstOnlyOpen = {};
        const keys = Object.keys(data);
        keys.forEach((key, i) => {
          firstOnlyOpen[key] = i === 0; // Only first category expanded
        });
        setOpenSections(firstOnlyOpen);
      })
      .catch((err) => {
        console.error('Failed to load docs_index.json', err);
      });
  }, []);

  const toggleSection = (category) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <aside className="docs-sidebar">
      {Object.entries(docsIndex).map(([category, pages]) => (
        <div key={category} className="sidebar-category">
          <div className="sidebar-category-header" onClick={() => toggleSection(category)}>
            <strong>{category.replace(/-/g, ' ')}</strong>
            <span>{openSections[category] ? '−' : '+'}</span>
          </div>
          {openSections[category] && (
            <ul>
              {pages.map(({ title, slug }) => {
                const isActive = location.pathname.includes(`/${category}/${slug}`);
                return (
                  <li key={slug}>
                    <Link to={`/docs/${category}/${slug}`} className={isActive ? 'active-link' : ''}>
                      • {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
};

export default DocSidebar;
