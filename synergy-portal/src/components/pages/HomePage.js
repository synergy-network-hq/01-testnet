import React from 'react';
import { Box, Container, Heading, Text, SimpleGrid, Button, useColorMode, Image, Flex } from '@chakra-ui/react';

const HomePage = () => {
  const { colorMode } = useColorMode();
  
  return (
    <Container maxW="container.xl" className="content-container">
      <Box className="glass-container" mb={8}>
        <Flex align="center" mb={6}>
          <Image src={colorMode === 'light' ? "/images/syn-l.png" : "/images/syn-d.png"} alt="Synergy Network" height="80px" mr={4} />
          <Heading 
            as="h1" 
            size="2xl" 
            bgGradient="linear(to-r, #1399FF, #0500A3)"
            bgClip="text"
          >
            Welcome to Synergy Network
          </Heading>
        </Flex>
        <Text fontSize="xl" mb={6}>
          The next generation blockchain platform for decentralized applications and digital assets.
        </Text>
        <Button 
          size="lg" 
          className="glass-button glow-effect"
          bgGradient="linear(to-r, #1399FF, #0500A3)"
          color="white"
          _hover={{
            bgGradient: "linear(to-r, #1399FF, #0500A3)",
            opacity: 0.9
          }}
          mr={4}
        >
          Get Started
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="glass-button"
          borderColor="#1399FF"
          color={colorMode === 'dark' ? '#1399FF' : '#0500A3'}
        >
          Learn More
        </Button>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={12}>
        <Box className="glass-container glass-card">
          <Heading as="h3" size="lg" mb={4} color={colorMode === 'dark' ? '#1399FF' : '#0500A3'}>
            Fast & Scalable
          </Heading>
          <Text>
            Process thousands of transactions per second with minimal fees and instant finality.
          </Text>
        </Box>
        
        <Box className="glass-container glass-card">
          <Heading as="h3" size="lg" mb={4} color={colorMode === 'dark' ? '#1399FF' : '#0500A3'}>
            Secure & Reliable
          </Heading>
          <Text>
            Built on proven consensus mechanisms with enterprise-grade security features.
          </Text>
        </Box>
        
        <Box className="glass-container glass-card">
          <Heading as="h3" size="lg" mb={4} color={colorMode === 'dark' ? '#1399FF' : '#0500A3'}>
            Developer Friendly
          </Heading>
          <Text>
            Comprehensive SDK, documentation, and tools to build your next blockchain application.
          </Text>
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default HomePage;
