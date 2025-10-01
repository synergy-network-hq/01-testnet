import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Flex,
  Icon,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { FaWallet, FaPlusCircle } from 'react-icons/fa';

const WalletOptionsModal = ({ isOpen, onClose, onConnectExisting, onCreateNew }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="xl">
        <ModalHeader>Wallet Options</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>Choose an option to continue:</Text>
            
            <Button 
              variant="outline" 
              height="60px"
              onClick={onConnectExisting}
              borderColor={borderColor}
              _hover={{ bg: 'synergy.50' }}
            >
              <Flex width="100%" align="center">
                <Icon as={FaWallet} boxSize={5} mr={3} color="synergy.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Connect Existing Wallet</Text>
                  <Text fontSize="sm" color="gray.500">Use MetaMask or other wallet providers</Text>
                </VStack>
              </Flex>
            </Button>
            
            <Divider />
            
            <Button 
              variant="outline" 
              height="60px"
              onClick={onCreateNew}
              borderColor={borderColor}
              _hover={{ bg: 'synergy.50' }}
            >
              <Flex width="100%" align="center">
                <Icon as={FaPlusCircle} boxSize={5} mr={3} color="synergy.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Create New Wallet</Text>
                  <Text fontSize="sm" color="gray.500">Generate a new Synergy wallet</Text>
                </VStack>
              </Flex>
            </Button>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WalletOptionsModal;
