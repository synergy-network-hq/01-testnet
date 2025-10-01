import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Flex,
  Icon,
  Input,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Switch,
  Checkbox,
  Tooltip
} from '@chakra-ui/react';
import { FaWallet, FaPaperPlane, FaHistory, FaQrcode, FaCog, FaKey, FaShieldAlt, FaSignOutAlt, FaSave } from 'react-icons/fa';
import { useWallet } from '../../services/walletContext';

export default function WalletPage() {
  const {
    isConnected,
    account,
    walletData,
    transactions,
    stakingInfo,
    network,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    stakeTokens,
    unstakeTokens,
    switchNetwork,
    refreshWalletData
  } = useWallet();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [txSpeed, setTxSpeed] = useState('standard');
  const [displayCurrency, setDisplayCurrency] = useState('usd');
  const [notifications, setNotifications] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('15');
  const [gasLimit, setGasLimit] = useState('21000');
  const [showTestnetWarning, setShowTestnetWarning] = useState(true);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Refresh wallet data periodically
  useEffect(() => {
    if (isConnected) {
      // Initial fetch
      refreshWalletData();

      // Set up interval for periodic refresh
      const intervalId = setInterval(() => {
        refreshWalletData();
      }, 30000); // Refresh every 30 seconds

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [isConnected, refreshWalletData]);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      const success = await connectWallet();

      if (success) {
        toast({
          title: 'Wallet connected',
          description: `Successfully connected to your Synergy wallet on ${network}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Connection failed',
        description: err.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnectWallet();

    toast({
      title: 'Wallet disconnected',
      description: 'Successfully disconnected your wallet',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  // Handle send transaction
  const handleSendTransaction = async () => {
    if (!recipientAddress || !amount) {
      toast({
        title: 'Invalid input',
        description: 'Please enter both recipient address and amount',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await sendTransaction(recipientAddress, amount);

      toast({
        title: 'Transaction sent',
        description: `Successfully sent ${amount} SYN to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setRecipientAddress('');
      setAmount('');
    } catch (err) {
      toast({
        title: 'Transaction failed',
        description: err.message || 'Failed to send transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle stake tokens
  const handleStakeTokens = async () => {
    if (!stakeAmount) {
      toast({
        title: 'Invalid input',
        description: 'Please enter amount to stake',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await stakeTokens(stakeAmount);

      toast({
        title: 'Tokens staked',
        description: `Successfully staked ${stakeAmount} SYN`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setStakeAmount('');
    } catch (err) {
      toast({
        title: 'Staking failed',
        description: err.message || 'Failed to stake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle unstake tokens
  const handleUnstakeTokens = async () => {
    if (!unstakeAmount) {
      toast({
        title: 'Invalid input',
        description: 'Please enter amount to unstake',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await unstakeTokens(unstakeAmount);

      toast({
        title: 'Tokens unstaked',
        description: `Successfully unstaked ${unstakeAmount} SYN`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setUnstakeAmount('');
    } catch (err) {
      toast({
        title: 'Unstaking failed',
        description: err.message || 'Failed to unstake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real implementation, these settings would be saved to local storage or a backend
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

  return (
    <Container maxW="container.xl" py={8}>
      {/* Testnet Warning Banner */}
      {showTestnetWarning && network === 'testnet' && (
        <Box
          bg="orange.500"
          color="white"
          p={4}
          borderRadius="md"
          mb={6}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontWeight="bold">
            You are currently on the Synergy Testnet. Tokens have no real value.
          </Text>
          <Button
            size="sm"
            onClick={() => setShowTestnetWarning(false)}
            variant="outline"
            colorScheme="white"
          >
            Dismiss
          </Button>
        </Box>
      )}

      {/* Wallet Connection Card */}
      {!isConnected ? (
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={6} align="center" py={10}>
              <Icon as={FaWallet} boxSize={16} color="synergy.500" />
              <Heading size="lg">Connect Your Wallet</Heading>
              <Text textAlign="center" maxW="md">
                Connect your wallet to access your Synergy tokens, view transaction history, and manage your assets.
              </Text>
              <Button
                leftIcon={<FaWallet />}
                colorScheme="synergy"
                size="lg"
                isLoading={isLoading}
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Box>
          {/* Wallet Overview */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={8}>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Wallet Address</Text>
                  <Text fontWeight="bold" fontSize="md" isTruncated maxW="100%">
                    {account}
                  </Text>
                  <Badge colorScheme={network === 'testnet' ? 'orange' : 'green'}>
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </Badge>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Balance</Text>
                  <Text fontWeight="bold" fontSize="2xl">{walletData?.balance || '0'} SYN</Text>
                  <Text fontSize="sm" color="gray.500">{walletData?.usdValue || '$0.00'}</Text>
                </VStack>
                <HStack justify="flex-end">
                  <Button
                    leftIcon={<FaQrcode />}
                    colorScheme="synergy"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: 'QR Code',
                        description: 'QR Code feature will be implemented in a future update',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Show QR
                  </Button>
                  <Button
                    leftIcon={<FaSignOutAlt />}
                    colorScheme="red"
                    variant="outline"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Wallet Tabs */}
          <Tabs colorScheme="synergy" isLazy>
            <TabList>
              <Tab><Icon as={FaPaperPlane} mr={2} /> Send</Tab>
              <Tab><Icon as={FaHistory} mr={2} /> Transactions</Tab>
              <Tab><Icon as={FaWallet} mr={2} /> Staking</Tab>
              <Tab><Icon as={FaCog} mr={2} /> Settings</Tab>
            </TabList>

            <TabPanels>
              {/* Send Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Send Tokens</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl isRequired>
                        <FormLabel>Recipient Address</FormLabel>
                        <Input
                          placeholder="Enter recipient address"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Amount (SYN)</FormLabel>
                        <Input
                          placeholder="Enter amount to send"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Available: {walletData?.balance || '0'} SYN
                        </Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Transaction Speed</FormLabel>
                        <Select
                          value={txSpeed}
                          onChange={(e) => setTxSpeed(e.target.value)}
                        >
                          <option value="slow">Slow (Low Fee)</option>
                          <option value="standard">Standard</option>
                          <option value="fast">Fast (High Fee)</option>
                        </Select>
                      </FormControl>
                      <Button
                        leftIcon={<FaPaperPlane />}
                        colorScheme="synergy"
                        size="lg"
                        isLoading={isLoading}
                        onClick={handleSendTransaction}
                        isDisabled={!recipientAddress || !amount}
                      >
                        Send Tokens
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Transactions Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Transaction History</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Type</Th>
                            <Th>Amount</Th>
                            <Th>From/To</Th>
                            <Th>Date</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {transactions && transactions.length > 0 ? (
                            transactions.map((tx, index) => (
                              <Tr key={index}>
                                <Td>
                                  <Badge colorScheme={tx.type === 'Received' ? 'green' : tx.type === 'Staking Reward' ? 'purple' : 'blue'}>
                                    {tx.type}
                                  </Badge>
                                </Td>
                                <Td>{tx.amount}</Td>
                                <Td>{tx.type === 'Received' ? tx.from : tx.to}</Td>
                                <Td>{new Date(tx.date).toLocaleString()}</Td>
                                <Td>
                                  <Badge colorScheme={tx.status === 'Confirmed' ? 'green' : 'yellow'}>
                                    {tx.status}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center">No transactions found</Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Staking Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Staking</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={8} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Stat>
                          <StatLabel>Total Staked</StatLabel>
                          <StatNumber>{stakingInfo?.stakedBalance || '0'} SYN</StatNumber>
                          <StatHelpText>{stakingInfo?.percentageStaked || '0%'} of your balance</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Estimated Rewards</StatLabel>
                          <StatNumber>{stakingInfo?.estimatedMonthlyReward || '0'} SYN/month</StatNumber>
                          <StatHelpText>{stakingInfo?.annualRewardRate || '0%'} APY</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Next Reward</StatLabel>
                          <StatNumber>~{(parseFloat(stakingInfo?.estimatedMonthlyReward || 0) / 30).toFixed(2)} SYN</StatNumber>
                          <StatHelpText>
                            {stakingInfo?.nextRewardTime ? `In ${Math.floor((new Date(stakingInfo.nextRewardTime) - new Date()) / (1000 * 60 * 60))} hours` : 'Unknown'}
                          </StatHelpText>
                        </Stat>
                      </SimpleGrid>
                      <Divider />
                      <Heading size="sm">Stake Additional Tokens</Heading>
                      <HStack>
                        <Input
                          placeholder="Enter amount to stake"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                        />
                        <Button
                          colorScheme="synergy"
                          isLoading={isLoading}
                          onClick={handleStakeTokens}
                        >
                          Stake
                        </Button>
                      </HStack>
                      <Divider />
                      <Heading size="sm">Unstake Tokens</Heading>
                      <HStack>
                        <Input
                          placeholder="Enter amount to unstake"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          colorScheme="synergy"
                          isLoading={isLoading}
                          onClick={handleUnstakeTokens}
                        >
                          Unstake
                        </Button>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Note: Unstaking has a 7-day cooldown period before tokens are returned to your wallet.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Wallet Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
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
                        <FormLabel>Display Currency</FormLabel>
                        <Select
                          value={displayCurrency}
                          onChange={(e) => setDisplayCurrency(e.target.value)}
                        >
                          <option value="usd">USD</option>
                          <option value="eur">EUR</option>
                          <option value="gbp">GBP</option>
                          <option value="jpy">JPY</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Network</FormLabel>
                        <Select
                          value={network}
                          onChange={(e) => handleNetworkSwitch(e.target.value)}
                        >
                          <option value="testnet">Testnet</option>
                          <option value="mainnet">Mainnet</option>
                        </Select>
                        {network === 'testnet' && (
                          <Text fontSize="sm" color="orange.500" mt={1}>
                            Testnet tokens have no real value and are for testing purposes only.
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Default Gas Limit</FormLabel>
                        <Input
                          value={gasLimit}
                          onChange={(e) => setGasLimit(e.target.value)}
                          type="number"
                        />
                      </FormControl>

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

                      <Divider />
                      <Heading size="sm">Security</Heading>

                      <Button leftIcon={<FaKey />} colorScheme="synergy" variant="outline">
                        Export Private Key
                      </Button>

                      <Button leftIcon={<FaShieldAlt />} colorScheme="synergy" variant="outline">
                        Enable 2FA
                      </Button>

                      <Divider />

                      <HStack spacing={4}>
                        <Button
                          leftIcon={<FaSave />}
                          colorScheme="synergy"
                          onClick={handleSaveSettings}
                        >
                          Save Settings
                        </Button>

                        <Button
                          leftIcon={<FaSignOutAlt />}
                          colorScheme="red"
                          variant="outline"
                          onClick={handleDisconnect}
                        >
                          Disconnect Wallet
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
}
