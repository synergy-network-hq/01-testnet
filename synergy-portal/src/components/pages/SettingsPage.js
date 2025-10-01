import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  Divider,
  useToast,
  Switch,
  Card,
  CardHeader,
  CardBody,
  Tooltip,
  Text,
  Badge,
  useColorModeValue,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FaKey, FaShieldAlt, FaSave, FaSignOutAlt, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useWallet } from '../../services/walletContext';

export default function SettingsPage() {
  const {
    isConnected,
    account,
    network,
    disconnectWallet,
    switchNetwork,
    isLoading
  } = useWallet();

  const [txSpeed, setTxSpeed] = useState('standard');
  const [displayCurrency, setDisplayCurrency] = useState('usd');
  const [notifications, setNotifications] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('15');
  const [gasLimit, setGasLimit] = useState('21000');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  const [gasPrice, setGasPrice] = useState(5);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [autoApprove, setAutoApprove] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [backupReminder, setBackupReminder] = useState(true);
  const [language, setLanguage] = useState('en');
  const [savedSettings, setSavedSettings] = useState({});

  const { isOpen: isExportKeyOpen, onOpen: onExportKeyOpen, onClose: onExportKeyClose } = useDisclosure();
  const { isOpen: isDisconnectOpen, onOpen: onDisconnectOpen, onClose: onDisconnectClose } = useDisclosure();

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real implementation, these settings would be saved to local storage or a backend
    const settings = {
      txSpeed,
      displayCurrency,
      notifications,
      autoLockTime,
      gasLimit,
      advancedMode,
      darkTheme,
      gasPrice,
      slippageTolerance,
      autoApprove,
      biometricAuth,
      backupReminder,
      language
    };

    // Save settings to local storage
    localStorage.setItem('synergyWalletSettings', JSON.stringify(settings));
    setSavedSettings(settings);

    toast({
      title: 'Settings saved',
      description: 'Your wallet settings have been saved successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Handle network switch
  const handleNetworkSwitch = async (newNetwork) => {
    try {
      const success = await switchNetwork(newNetwork);

      if (success) {
        toast({
          title: 'Network switched',
          description: `Successfully switched to ${newNetwork}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Network switch failed',
        description: err.message || 'Failed to switch network',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnectWallet();
    onDisconnectClose();

    toast({
      title: 'Wallet disconnected',
      description: 'Successfully disconnected your wallet',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  // Handle export private key (mock)
  const handleExportPrivateKey = () => {
    // In a real implementation, this would require additional security measures
    onExportKeyClose();

    toast({
      title: 'Security notice',
      description: 'Private key export would be implemented with proper security measures in production',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Wallet Settings</Heading>

      {!isConnected ? (
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text>Please connect your wallet to access settings.</Text>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Network Settings */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={6}>
            <CardHeader>
              <Heading size="md">Network Settings</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>
                    Network
                    {network === 'testnet' && (
                      <Badge ml={2} colorScheme="orange">Testnet</Badge>
                    )}
                  </FormLabel>
                  <Select
                    value={network}
                    onChange={(e) => handleNetworkSwitch(e.target.value)}
                  >
                    <option value="testnet">Synergy Testnet</option>
                    <option value="mainnet">Synergy Mainnet</option>
                  </Select>
                  {network === 'testnet' && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      Testnet tokens have no real value and are for testing purposes only.
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Default Transaction Speed</FormLabel>
                  <Select
                    value={txSpeed}
                    onChange={(e) => setTxSpeed(e.target.value)}
                  >
                    <option value="slow">Slow (Low Fee)</option>
                    <option value="standard">Standard</option>
                    <option value="fast">Fast (High Fee)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Default Gas Limit</FormLabel>
                  <Input
                    value={gasLimit}
                    onChange={(e) => setGasLimit(e.target.value)}
                    type="number"
                  />
                </FormControl>

                {advancedMode && (
                  <FormControl>
                    <FormLabel>
                      Gas Price (Gwei)
                      <Tooltip label="Higher gas price means faster transactions but higher fees">
                        <Box as="span" ml={1} cursor="help">
                          <FaInfoCircle />
                        </Box>
                      </Tooltip>
                    </FormLabel>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={gasPrice}
                      onChange={(val) => setGasPrice(val)}
                      mb={2}
                    >
                      <SliderTrack>
                        <SliderFilledTrack bg="synergy.500" />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Text textAlign="right">{gasPrice} Gwei</Text>
                  </FormControl>
                )}

                {advancedMode && (
                  <FormControl>
                    <FormLabel>
                      Slippage Tolerance (%)
                      <Tooltip label="Maximum price difference you're willing to accept for transactions">
                        <Box as="span" ml={1} cursor="help">
                          <FaInfoCircle />
                        </Box>
                      </Tooltip>
                    </FormLabel>
                    <Slider
                      min={0.1}
                      max={5}
                      step={0.1}
                      value={slippageTolerance}
                      onChange={(val) => setSlippageTolerance(val)}
                      mb={2}
                    >
                      <SliderTrack>
                        <SliderFilledTrack bg="synergy.500" />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Text textAlign="right">{slippageTolerance}%</Text>
                  </FormControl>
                )}

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Advanced Mode
                    <Tooltip label="Enable additional settings for advanced users">
                      <Box as="span" ml={1} cursor="help">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Display Settings */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={6}>
            <CardHeader>
              <Heading size="md">Display Settings</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Display Currency</FormLabel>
                  <Select
                    value={displayCurrency}
                    onChange={(e) => setDisplayCurrency(e.target.value)}
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                    <option value="jpy">JPY</option>
                    <option value="cny">CNY</option>
                    <option value="krw">KRW</option>
                    <option value="inr">INR</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Dark Theme</FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={darkTheme}
                    onChange={(e) => setDarkTheme(e.target.checked)}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={6}>
            <CardHeader>
              <Heading size="md">Security Settings</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Auto-Lock Wallet After (minutes)</FormLabel>
                  <Select
                    value={autoLockTime}
                    onChange={(e) => setAutoLockTime(e.target.value)}
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="never">Never</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Enable Transaction Notifications
                  </FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Auto-Approve Trusted Contracts
                    <Tooltip label="Automatically approve interactions with contracts you've previously used">
                      <Box as="span" ml={1} cursor="help">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Biometric Authentication
                    <Tooltip label="Use fingerprint or face recognition for additional security">
                      <Box as="span" ml={1} cursor="help">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={biometricAuth}
                    onChange={(e) => setBiometricAuth(e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Backup Reminder
                    <Tooltip label="Periodically remind you to backup your wallet">
                      <Box as="span" ml={1} cursor="help">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <Switch
                    colorScheme="synergy"
                    isChecked={backupReminder}
                    onChange={(e) => setBackupReminder(e.target.checked)}
                  />
                </FormControl>

                <Button
                  leftIcon={<FaKey />}
                  colorScheme="synergy"
                  variant="outline"
                  onClick={onExportKeyOpen}
                >
                  Export Private Key
                </Button>

                <Button
                  leftIcon={<FaShieldAlt />}
                  colorScheme="synergy"
                  variant="outline"
                >
                  Enable 2FA
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <HStack spacing={4} mt={6}>
            <Button
              leftIcon={<FaSave />}
              colorScheme="synergy"
              onClick={handleSaveSettings}
              isLoading={isLoading}
            >
              Save Settings
            </Button>

            <Button
              leftIcon={<FaSignOutAlt />}
              colorScheme="red"
              variant="outline"
              onClick={onDisconnectOpen}
            >
              Disconnect Wallet
            </Button>
          </HStack>

          {/* Export Private Key Modal */}
          <Modal isOpen={isExportKeyOpen} onClose={onExportKeyClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Export Private Key</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Box p={3} bg="red.100" color="red.800" borderRadius="md">
                    <HStack>
                      <FaExclamationTriangle />
                      <Text fontWeight="bold">Security Warning</Text>
                    </HStack>
                    <Text mt={2}>
                      Your private key is the ultimate access to your funds. Never share it with anyone,
                      and store it securely. Anyone with your private key can steal your funds.
                    </Text>
                  </Box>
                  <Text>
                    This action would require additional security verification in a production environment.
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="gray" mr={3} onClick={onExportKeyClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleExportPrivateKey}>
                  Continue
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Disconnect Wallet Modal */}
          <Modal isOpen={isDisconnectOpen} onClose={onDisconnectClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Disconnect Wallet</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  Are you sure you want to disconnect your wallet? You will need to reconnect to access your wallet again.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="gray" mr={3} onClick={onDisconnectClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
}
