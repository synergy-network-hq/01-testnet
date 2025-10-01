import React, {useState, useEffect} from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardHeader,
    CardBody,
    FormControl,
    FormLabel,
    Input,
    Select,
    Divider,
    useToast,
    useColorModeValue,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Image,
    Flex,
    Tooltip,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Progress,
} from "@chakra-ui/react";
import {FaGasPump, FaExchangeAlt, FaInfoCircle, FaTint, FaHistory} from "react-icons/fa";
import {Icon} from "@chakra-ui/react";
import {useWallet} from "../../services/walletContext";

export default function GasStationPage() {
    const {isConnected, account, walletData, network, isLoading, error, connectWallet, sendTransaction, switchNetwork} =
        useWallet();

    const [purchaseAmount, setPurchaseAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("eth");
    const [faucetRequestPending, setFaucetRequestPending] = useState(false);
    const [faucetCooldown, setFaucetCooldown] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    const [faucetHistory, setFaucetHistory] = useState([]);
    const [gasPrice, setGasPrice] = useState(5);
    const [showTestnetWarning, setShowTestnetWarning] = useState(true);

    const toast = useToast();
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Check if user is on testnet
    useEffect(() => {
        if (isConnected && network !== "testnet") {
            toast({
                title: "Network Warning",
                description: "Gas Station features require testnet connection. Please switch to testnet.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [isConnected, network, toast]);

    // Mock faucet history
    useEffect(() => {
        if (isConnected && account) {
            // In a real implementation, this would fetch from a backend
            setFaucetHistory([
                {
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: "10 SYN",
                    status: "Completed",
                    txHash: "0x1234...5678",
                },
                {
                    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: "10 SYN",
                    status: "Completed",
                    txHash: "0xabcd...efgh",
                },
            ]);
        }
    }, [isConnected, account]);

    // Handle wallet connection
    const handleConnect = async () => {
        try {
            const success = await connectWallet();

            if (success) {
                toast({
                    title: "Wallet connected",
                    description: `Successfully connected to your wallet on ${network}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            toast({
                title: "Connection failed",
                description: err.message || "Failed to connect wallet",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Handle network switch
    const handleNetworkSwitch = async () => {
        try {
            const success = await switchNetwork("testnet");

            if (success) {
                toast({
                    title: "Network switched",
                    description: "Successfully switched to Synergy Testnet",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            toast({
                title: "Network switch failed",
                description: err.message || "Failed to switch network",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Handle gas purchase
    const handlePurchaseGas = async () => {
        if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount to purchase",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        // In a real implementation, this would interact with a cross-chain bridge or exchange
        toast({
            title: "Purchase initiated",
            description: `Purchasing ${purchaseAmount} SYN gas tokens using ${paymentMethod.toUpperCase()}`,
            status: "info",
            duration: 5000,
            isClosable: true,
        });

        // Simulate transaction processing
        setTimeout(() => {
            toast({
                title: "Purchase successful",
                description: `Successfully purchased ${purchaseAmount} SYN gas tokens`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setPurchaseAmount("");
        }, 2000);
    };

    // Handle faucet request
    const handleFaucetRequest = () => {
        if (faucetCooldown) {
            toast({
                title: "Cooldown active",
                description: `Please wait ${cooldownTime} hours before requesting again`,
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setFaucetRequestPending(true);

        // Simulate faucet request
        setTimeout(() => {
            setFaucetRequestPending(false);
            setFaucetCooldown(true);
            setCooldownTime(24);

            // Add to history
            setFaucetHistory([
                {
                    date: new Date().toISOString(),
                    amount: "10 SYN",
                    status: "Completed",
                    txHash:
                        "0x" +
                        Math.random().toString(16).substring(2, 10) +
                        "..." +
                        Math.random().toString(16).substring(2, 10),
                },
                ...faucetHistory,
            ]);

            toast({
                title: "Faucet request successful",
                description: "You have received 10 SYN testnet tokens",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }, 3000);
    };

    // Calculate exchange rate based on selected payment method
    const getExchangeRate = () => {
        switch (paymentMethod) {
            case "eth":
                return 1000; // 1 ETH = 1000 SYN
            case "bnb":
                return 250; // 1 BNB = 250 SYN
            case "matic":
                return 500; // 1 MATIC = 500 SYN
            case "avax":
                return 100; // 1 AVAX = 100 SYN
            default:
                return 1000;
        }
    };

    // Calculate estimated gas tokens
    const calculateEstimatedTokens = () => {
        if (!purchaseAmount || isNaN(parseFloat(purchaseAmount))) return "0";
        return (parseFloat(purchaseAmount) * getExchangeRate()).toFixed(2);
    };

    return (
        <Container maxW="container.xl" py={8}>
            {/* Testnet Warning Banner */}
            {showTestnetWarning && network === "testnet" && (
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
                    <Text fontWeight="bold">You are currently on the Synergy Testnet. Tokens have no real value.</Text>
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

            <Heading size="xl" mb={6}>
                Gas Station
            </Heading>
            <Text mb={8}>Purchase gas tokens for various networks or request free testnet tokens from our faucet.</Text>

            {!isConnected ? (
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={6} align="center" py={10}>
                            <Icon as={FaGasPump} boxSize={16} color="synergy.500" />
                            <Heading size="lg">Connect Your Wallet</Heading>
                            <Text textAlign="center" maxW="md">
                                Connect your wallet to access the Gas Station and Faucet features.
                            </Text>
                            <Button colorScheme="synergy" size="lg" isLoading={isLoading} onClick={handleConnect}>
                                Connect Wallet
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            ) : network !== "testnet" ? (
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={6} align="center" py={10}>
                            <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <Box flex="1">
                                    <AlertTitle>Network not supported</AlertTitle>
                                    <AlertDescription>
                                        Gas Station features are only available on the Synergy Testnet.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                            <Button colorScheme="synergy" size="lg" isLoading={isLoading} onClick={handleNetworkSwitch}>
                                Switch to Testnet
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            ) : (
                <Tabs colorScheme="synergy" isLazy>
                    <TabList>
                        <Tab>
                            <Icon as={FaGasPump} mr={2} /> Purchase Gas
                        </Tab>
                        <Tab>
                            <Icon as={FaTint} mr={2} /> Testnet Faucet
                        </Tab>
                        <Tab>
                            <Icon as={FaHistory} mr={2} /> Request History
                        </Tab>
                    </TabList>

                    <TabPanels>
                        {/* Purchase Gas Tab */}
                        <TabPanel>
                            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                                <CardHeader>
                                    <Heading size="md">Purchase Gas Tokens</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6} align="stretch">
                                        <Alert status="info" borderRadius="md">
                                            <AlertIcon />
                                            <Box flex="1">
                                                <AlertDescription>
                                                    Gas tokens are used to pay for transaction fees on various networks.
                                                </AlertDescription>
                                            </Box>
                                        </Alert>

                                        <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                                            <FormControl isRequired>
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                >
                                                    <option value="eth">Ethereum (ETH)</option>
                                                    <option value="bnb">Binance Coin (BNB)</option>
                                                    <option value="matic">Polygon (MATIC)</option>
                                                    <option value="avax">Avalanche (AVAX)</option>
                                                </Select>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Amount</FormLabel>
                                                <Input
                                                    placeholder="Enter amount"
                                                    type="number"
                                                    value={purchaseAmount}
                                                    onChange={(e) => setPurchaseAmount(e.target.value)}
                                                />
                                                <Text fontSize="sm" color="gray.500" mt={1}>
                                                    Available: {walletData?.balance || "0"} SYN
                                                </Text>
                                            </FormControl>
                                        </SimpleGrid>

                                        <Box p={4} bg="gray.50" borderRadius="md" _dark={{bg: "gray.700"}}>
                                            <Heading size="sm" mb={4}>
                                                Transaction Summary
                                            </Heading>
                                            <SimpleGrid columns={2} spacing={4}>
                                                <Text>Payment:</Text>
                                                <Text fontWeight="bold">
                                                    {purchaseAmount || "0"} {paymentMethod.toUpperCase()}
                                                </Text>

                                                <Text>Exchange Rate:</Text>
                                                <Text fontWeight="bold">
                                                    1 {paymentMethod.toUpperCase()} = {getExchangeRate()} SYN
                                                </Text>

                                                <Text>Estimated Gas Tokens:</Text>
                                                <Text fontWeight="bold">{calculateEstimatedTokens()} SYN</Text>

                                                <Text>Network Fee:</Text>
                                                <Text fontWeight="bold">{gasPrice} Gwei</Text>
                                            </SimpleGrid>
                                        </Box>

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
                                            <HStack justify="space-between">
                                                <Text fontSize="sm">Slow</Text>
                                                <Text fontSize="sm">Fast</Text>
                                            </HStack>
                                        </FormControl>

                                        <Button
                                            leftIcon={<FaGasPump />}
                                            colorScheme="synergy"
                                            size="lg"
                                            isLoading={isLoading}
                                            onClick={handlePurchaseGas}
                                            isDisabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0}
                                        >
                                            Purchase Gas Tokens
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Testnet Faucet Tab */}
                        <TabPanel>
                            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                                <CardHeader>
                                    <Heading size="md">Testnet Faucet</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6} align="stretch">
                                        <Alert status="info" borderRadius="md">
                                            <AlertIcon />
                                            <Box flex="1">
                                                <AlertTitle>Testnet Tokens</AlertTitle>
                                                <AlertDescription>
                                                    Request free Synergy testnet tokens for development and testing
                                                    purposes. Limited to 10 SYN per request with a 24-hour cooldown
                                                    period.
                                                </AlertDescription>
                                            </Box>
                                        </Alert>

                                        <Box p={4} bg="gray.50" borderRadius="md" _dark={{bg: "gray.700"}}>
                                            <SimpleGrid columns={{base: 1, md: 3}} spacing={6}>
                                                <Stat>
                                                    <StatLabel>Your Wallet</StatLabel>
                                                    <StatNumber>
                                                        {account
                                                            ? `${account.substring(0, 6)}...${account.substring(
                                                                  account.length - 4
                                                              )}`
                                                            : "Not connected"}
                                                    </StatNumber>
                                                    <StatHelpText>
                                                        <Badge colorScheme="green">Testnet</Badge>
                                                    </StatHelpText>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Current Balance</StatLabel>
                                                    <StatNumber>{walletData?.balance || "0"} SYN</StatNumber>
                                                    <StatHelpText>Testnet tokens</StatHelpText>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Request Limit</StatLabel>
                                                    <StatNumber>10 SYN</StatNumber>
                                                    <StatHelpText>Per 24 hours</StatHelpText>
                                                </Stat>
                                            </SimpleGrid>
                                        </Box>

                                        {faucetCooldown ? (
                                            <Box p={4} bg="orange.50" borderRadius="md" _dark={{bg: "orange.900"}}>
                                                <VStack spacing={3} align="stretch">
                                                    <Heading size="sm" color="orange.500">
                                                        Cooldown Period Active
                                                    </Heading>
                                                    <Text>You can request more tokens in {cooldownTime} hours.</Text>
                                                    <Progress
                                                        value={((24 - cooldownTime) / 24) * 100}
                                                        colorScheme="orange"
                                                        borderRadius="md"
                                                    />
                                                </VStack>
                                            </Box>
                                        ) : (
                                            <Button
                                                leftIcon={<FaTint />}
                                                colorScheme="synergy"
                                                size="lg"
                                                isLoading={faucetRequestPending}
                                                loadingText="Processing Request"
                                                onClick={handleFaucetRequest}
                                            >
                                                Request 10 SYN Testnet Tokens
                                            </Button>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Request History Tab */}
                        <TabPanel>
                            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                                <CardHeader>
                                    <Heading size="md">Request History</Heading>
                                </CardHeader>
                                <CardBody>
                                    {faucetHistory.length > 0 ? (
                                        <VStack spacing={4} align="stretch">
                                            {faucetHistory.map((request, index) => (
                                                <Box
                                                    key={index}
                                                    p={4}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    borderColor={borderColor}
                                                >
                                                    <SimpleGrid columns={{base: 1, md: 4}} spacing={4}>
                                                        <Box>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Date
                                                            </Text>
                                                            <Text>{new Date(request.date).toLocaleDateString()}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Amount
                                                            </Text>
                                                            <Text>{request.amount}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Status
                                                            </Text>
                                                            <Badge
                                                                colorScheme={
                                                                    request.status === "Completed" ? "green" : "yellow"
                                                                }
                                                            >
                                                                {request.status}
                                                            </Badge>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Transaction
                                                            </Text>
                                                            <Text>{request.txHash}</Text>
                                                        </Box>
                                                    </SimpleGrid>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text>No request history found.</Text>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </Container>
    );
}
