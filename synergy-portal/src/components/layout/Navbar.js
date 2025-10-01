import React from "react";
import {
    Box,
    Flex,
    Text,
    IconButton,
    Button,
    Stack,
    Collapse,
    Link,
    Image,
    useColorModeValue,
    useDisclosure,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import {AiOutlineMenu, AiOutlineClose, AiOutlineDown} from "react-icons/ai";
import {Link as RouterLink} from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import WalletOptionsModal from "../WalletOptionsModal";

const Links = [
    { name: "Home", path: "/" },
    { name: "ICO Pre-sale", path: "/ico-presale" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Synergy Score", path: "/synergy-score" },   // ← NEW!
    { name: "Explorer", path: "/explorer" },
    { name: "Wallet", path: "/wallet" },
    { name: "Gas Station", path: "/gas-station" },
    { name: "Settings", path: "/settings" },
    { name: "Docs", path: "/docs" },
];


const NavLink = ({children, path}) => {
  console.log("Rendering NavLink with children:", children);
  const bgHover = useColorModeValue("gray.200", "gray.700");
    return (
        <Link
            as={RouterLink}
            to={path}
            px={2}
            py={1}
            rounded={"md"}
            _hover={{
                textDecoration: "none",
                bg: bgHover,
            }}
        >
            {children}
        </Link>
    );
};

export default function Navbar() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isWalletConnected, setIsWalletConnected] = React.useState(false);
    const { colorMode } = useColorMode();
    const logoSrc = colorMode === 'light' ? '/images/syn-l.png' : '/images/syn-d.png';

    const handleConnectWallet = async () => {
        try {
            // Import the wallet service dynamically to avoid circular dependencies
            const { walletConnectorService } = await import('../../services/walletConnectorService');

            // Check if MetaMask is installed
            if (!walletConnectorService.isMetaMaskInstalled()) {
                // Show wallet options modal instead of just setting state
                // This will be implemented in the wallet options component
                onOpenWalletOptions();
                return;
            }

            // Connect to MetaMask
            const account = await walletConnectorService.connectMetaMask();

            // Check if connected to Synergy Network, if not, switch
            const isConnected = await walletConnectorService.isConnectedToSynergyNetwork('testnet');
            if (!isConnected) {
                await walletConnectorService.switchToSynergyNetwork('testnet');
            }

            setIsWalletConnected(true);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            // Handle error appropriately
        }
    };

    // State for wallet options modal
    const [isWalletOptionsOpen, setIsWalletOptionsOpen] = React.useState(false);
    const onOpenWalletOptions = () => setIsWalletOptionsOpen(true);
    const onCloseWalletOptions = () => setIsWalletOptionsOpen(false);

    const toast = useToast();

    const handleConnectExistingWallet = async () => {
        try {
            // Import the wallet service dynamically to avoid circular dependencies
            const { walletConnectorService } = await import('../../services/walletConnectorService');

            // Connect to MetaMask
            const account = await walletConnectorService.connectMetaMask();

            // Check if connected to Synergy Network, if not, switch
            const isConnected = await walletConnectorService.isConnectedToSynergyNetwork('testnet');
            if (!isConnected) {
                await walletConnectorService.switchToSynergyNetwork('testnet');
            }

            setIsWalletConnected(true);
            onCloseWalletOptions();

            toast({
                title: "Wallet connected",
                description: "Your wallet has been connected successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error connecting wallet:', error);
            toast({
                title: "Connection failed",
                description: error.message || "Failed to connect wallet",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleCreateNewWallet = () => {
        // Navigate to wallet creation page or show wallet creation modal
        toast({
            title: "Creating new wallet",
            description: "Redirecting to wallet creation...",
            status: "info",
            duration: 3000,
            isClosable: true,
        });

        // In a real implementation, this would redirect to a wallet creation flow
        // For now, we'll just close the modal and show a message
        onCloseWalletOptions();

        // Simulate wallet creation after a delay
        setTimeout(() => {
            setIsWalletConnected(true);
            toast({
                title: "Wallet created",
                description: "Your new Synergy wallet has been created successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }, 2000);
    };

    return (
        <Box className="glass-nav" px={4} boxShadow="sm">
            <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
                <IconButton
                    size={"md"}
                    icon={isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
                    aria-label={"Open Menu"}
                    display={{md: "none"}}
                    onClick={isOpen ? onClose : onOpen}
                    className="glass-button"
                />
                <HStack spacing={8} alignItems={"center"}>
                    <Box>
                        <RouterLink to="/">
                            <Flex align="center">
                                <Image src={logoSrc} alt="Synergy Network" height="40px" />
                                <Text
                                    ml={3}
                                    fontWeight="bold"
                                    fontSize="xl"
                                    bgGradient="linear(to-r, #1399FF, #0500A3)"
                                    bgClip="text"
                                >
                                    Synergy Network
                                </Text>
                            </Flex>
                        </RouterLink>
                    </Box>
                    <HStack as={"nav"} spacing={4} display={{base: "none", md: "flex"}}>
                        {Links.map((link) => (
                            <NavLink key={link.name} path={link.path}>
                                {link.name}
                            </NavLink>
                        ))}
                    </HStack>
                </HStack>
                <Flex alignItems={"center"}>
                    {/* Theme Toggle Button */}
                    <Box mr={3}>
                        <ThemeToggle />
                    </Box>

                    {isWalletConnected ? (
                        <Menu>
                            <MenuButton
                                as={Button}
                                rounded={"full"}
                                variant={"link"}
                                cursor={"pointer"}
                                minW={0}
                                rightIcon={<AiOutlineDown />}
                                bgGradient="linear(to-r, #1399FF, #0500A3)"
                                color="white"
                                px={4}
                                py={2}
                                className="glass-button"
                            >
                                0x1a2...3b4c
                            </MenuButton>
                            <MenuList className="glass-dark">
                                <MenuItem as={RouterLink} to="/wallet">My Wallet</MenuItem>
                                <MenuItem>Transactions</MenuItem>
                                <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
                                <MenuItem onClick={() => setIsWalletConnected(false)}>Disconnect</MenuItem>
                            </MenuList>
                        </Menu>
                    ) : (
                        <Button
                            bgGradient="linear(to-r, #1399FF, #0500A3)"
                            color="white"
                            _hover={{
                                bgGradient: "linear(to-r, #1399FF, #0500A3)",
                                opacity: 0.9
                            }}
                            onClick={onOpenWalletOptions}
                            className="glass-button glow-effect"
                        >
                            Connect Wallet
                        </Button>
                    )}
                </Flex>
            </Flex>
            {isOpen ? (
                <Box pb={4} display={{md: "none"}}>
                    <Stack as={"nav"} spacing={4}>
                        {Links.map((link) => (
                            <NavLink key={link.name} path={link.path}>
                                {link.name}
                            </NavLink>
                        ))}
                    </Stack>
                </Box>
            ) : null}

            {/* Wallet Options Modal */}
            <WalletOptionsModal
                isOpen={isWalletOptionsOpen}
                onClose={onCloseWalletOptions}
                onConnectExisting={handleConnectExistingWallet}
                onCreateNew={handleCreateNewWallet}
            />
        </Box>
    );
}
