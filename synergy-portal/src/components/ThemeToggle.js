import React from 'react';
import { useColorMode, IconButton, Tooltip } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Tooltip label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
        onClick={toggleColorMode}
        variant="ghost"
        color={colorMode === 'dark' ? '#1399FF' : '#0500A3'}
        _hover={{
          bg: colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200',
        }}
        size="md"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
