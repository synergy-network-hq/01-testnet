// File: src/components/pages/DocsPage.js

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, Box } from '@chakra-ui/react';
import DocSidebar from '../layout/DocSidebar';
import DocViewer from '../DocViewer';
import DocSearchBar from '../DocSearchBar';
import '../../styles/docs.css';

const DocsPage = () => {
  const { category, slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!category || !slug) {
      fetch('/docs/docs_index.json')
        .then((res) => res.json())
        .then((data) => {
          const firstCategory = Object.keys(data)[0];
          const firstDoc = data[firstCategory][0]?.slug;
          if (firstCategory && firstDoc) {
            navigate(`/docs/${firstCategory}/${firstDoc}`, { replace: true });
          }
        });
    }
  }, [category, slug, navigate]);

  return (
    <Flex className="docs-page-layout" direction="column" minH="100vh">
      <Flex flex="1" className="docs-page-container">
        <Box className="docs-sidebar">
          <DocSidebar />
        </Box>
        <Box className="docs-content-container">
          <DocSearchBar />
          {category && slug && <DocViewer category={category} doc={slug} />}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DocsPage;
