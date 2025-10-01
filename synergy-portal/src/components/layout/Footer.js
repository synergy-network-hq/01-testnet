import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Flex,
  Divider,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FaTwitter, FaGithub, FaDiscord, FaTelegram } from 'react-icons/fa';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <Box as="footer" className="footer-container">
      <Container as={Stack} className="footer-inner">
        <Flex className="footer-top">
          <Stack direction="row" className="footer-nav">
            <Link href="#">Home</Link>
            <Link href="#">About</Link>
            <Link href="#">Blog</Link>
            <Link href="#">Contact</Link>
          </Stack>
          <HStack className="footer-social">
            <Link href="#" isExternal className="glow-effect">
              <Icon as={FaTwitter} />
            </Link>
            <Link href="#" isExternal className="glow-effect">
              <Icon as={FaGithub} />
            </Link>
            <Link href="#" isExternal className="glow-effect">
              <Icon as={FaDiscord} />
            </Link>
            <Link href="#" isExternal className="glow-effect">
              <Icon as={FaTelegram} />
            </Link>
          </HStack>
        </Flex>
        <Divider className="footer-divider" />
        <Text className="footer-copy">
          © {new Date().getFullYear()} Synergy Network. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
