import React, { useState, useEffect } from 'react';
import { Box, Flex, Image, Text, Progress, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const fadeOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const LoadingScreen = ({ isLoading }) => {
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOutAnimation, setFadeOutAnimation] = useState(false);

  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('white', 'white');
  const logoSrc = '/images/syn-a.gif';

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setFadeOutAnimation(true); // Start fade-out
            }, 500); // Wait a little after 100% before starting fade-out
            return 100;
          }
          return prev + 1; // 1% every 100ms
        });
      }, 100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (fadeOutAnimation) {
      const timer = setTimeout(() => {
        setShowLoader(false); // Remove the loader after fade-out animation
      }, 1000); // Match the fade-out animation duration (1 second)
      return () => clearTimeout(timer);
    }
  }, [fadeOutAnimation]);

  if (!showLoader) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={bgColor}
      zIndex="9999"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      animation={`${fadeOutAnimation ? fadeOut : fadeIn} 1s ease-in-out`}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
      >
        <Box
          position="relative"
          width="200px"
          height="200px"
          mb={6}
        >
          {/* Centered Logo */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="200px"
            height="200px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src={logoSrc}
              alt="Synergy Network"
              width="100%"
              height="100%"
              objectFit="contain"
            />
          </Box>
        </Box>

        {/* Synergy Network Text */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, #1399FF, #0500A3)"
          bgClip="text"
          letterSpacing="wider"
          mb={4}
        >
          SYNERGY NETWORK
        </Text>

        {/* Loading Bar */}
        <Box width="300px">
          <Progress
            value={progress}
            size="md"
            colorScheme="blue"
            borderRadius="full"
            hasStripe
            isAnimated
          />
          <Text
            mt={2}
            color={textColor}
            fontSize="sm"
            textAlign="center"
          >
            {progress}%
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default LoadingScreen;
