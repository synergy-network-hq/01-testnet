import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Link,
  HStack,
  VStack,
  Icon
} from '@chakra-ui/react';
import { FaCube, FaExchangeAlt, FaUser, FaCheck, FaClock, FaSearch } from 'react-icons/fa';

// Mock data for demonstration
const recentBlocks = [
  { number: 1458732, timestamp: '2 seconds ago', validator: 'sYnQ1zx...9m3kmjx3', transactions: 156, size: '1.2 MB' },
  { number: 1458731, timestamp: '5 seconds ago', validator: 'sYnQ8ab...7k2pqrs9', transactions: 142, size: '1.1 MB' },
  { number: 1458730, timestamp: '8 seconds ago', validator: 'sYnQ3ef...2j5mnpq4', transactions: 168, size: '1.3 MB' },
  { number: 1458729, timestamp: '11 seconds ago', validator: 'sYnQ9cd...4f7ghij6', transactions: 131, size: '1.0 MB' },
  { number: 1458728, timestamp: '14 seconds ago', validator: 'sYnQ5gh...8d1efgh0', transactions: 149, size: '1.2 MB' },
];

const recentTransactions = [
  { hash: '0x8f7e...3a2b', from: 'sYnQ1zx...9m3kmjx3', to: 'sYnQ8ab...7k2pqrs9', amount: '125.5 SYN', status: 'Confirmed', timestamp: '15 seconds ago' },
  { hash: '0x6d5c...9e8f', from: 'sYnQ3ef...2j5mnpq4', to: 'sYnQ9cd...4f7ghij6', amount: '500.0 SYN', status: 'Confirmed', timestamp: '42 seconds ago' },
  { hash: '0x2b3a...7e8f', from: 'sYnQ5gh...8d1efgh0', to: 'sYnQ1zx...9m3kmjx3', amount: '75.25 SYN', status: 'Confirmed', timestamp: '1 minute ago' },
  { hash: '0x9e8f...5d6c', from: 'sYnQ8ab...7k2pqrs9', to: 'sYnQ3ef...2j5mnpq4', amount: '1,000.0 SYN', status: 'Confirmed', timestamp: '2 minutes ago' },
  { hash: '0x4b5c...1a2b', from: 'sYnQ9cd...4f7ghij6', to: 'sYnQ5gh...8d1efgh0', amount: '250.75 SYN', status: 'Confirmed', timestamp: '3 minutes ago' },
];

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSearch = () => {
    // In a real implementation, this would search for blocks, transactions, or addresses
    console.log('Searching for:', searchQuery);
  };

  return (
    <Container maxW="7xl" py={8} className="content-container">
      <Box className="glass-container">
        <Heading as="h1" mb={8}>Blockchain Explorer</Heading>

        {/* Search Bar */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={8} className="glass-card">
          <CardBody>
            <VStack spacing={4}>
              <Text fontSize="lg">Search for Block / Transaction / Address</Text>
              <InputGroup size="lg">
                <Input
                  placeholder="Enter block number, transaction hash, or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleSearch} colorScheme="synergy" className="glass-button">
                    <Icon as={FaSearch} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Explorer Tabs */}
        <Tabs colorScheme="synergy" variant="enclosed" isLazy>
          <TabList>
            <Tab><Icon as={FaCube} mr={2} /> Blocks</Tab>
            <Tab><Icon as={FaExchangeAlt} mr={2} /> Transactions</Tab>
            <Tab><Icon as={FaUser} mr={2} /> Validators</Tab>
          </TabList>

          <TabPanels>
            {/* Blocks Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" className="glass-card">
                <CardHeader>
                  <Heading size="md">Recent Blocks</Heading>
                </CardHeader>
                <CardBody>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Block</Th>
                          <Th>Age</Th>
                          <Th>Validator</Th>
                          <Th isNumeric>Txns</Th>
                          <Th>Size</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentBlocks.map((block, index) => (
                          <Tr key={index}>
                            <Td>
                              <HStack>
                                <Icon as={FaCube} color="synergy.500" />
                                <Link color="synergy.500">{block.number}</Link>
                              </HStack>
                            </Td>
                            <Td>{block.timestamp}</Td>
                            <Td>
                              <Link color="synergy.500">{block.validator}</Link>
                            </Td>
                            <Td isNumeric>{block.transactions}</Td>
                            <Td>{block.size}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Transactions Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" className="glass-card">
                <CardHeader>
                  <Heading size="md">Recent Transactions</Heading>
                </CardHeader>
                <CardBody>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Tx Hash</Th>
                          <Th>From</Th>
                          <Th>To</Th>
                          <Th>Amount</Th>
                          <Th>Status</Th>
                          <Th>Age</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentTransactions.map((tx, index) => (
                          <Tr key={index}>
                            <Td>
                              <HStack>
                                <Icon as={FaExchangeAlt} color="synergy.500" />
                                <Link color="synergy.500">{tx.hash}</Link>
                              </HStack>
                            </Td>
                            <Td>
                              <Link color="synergy.500">{tx.from}</Link>
                            </Td>
                            <Td>
                              <Link color="synergy.500">{tx.to}</Link>
                            </Td>
                            <Td>{tx.amount}</Td>
                            <Td>
                              <Badge colorScheme="green">
                                <Flex align="center">
                                  <Icon as={FaCheck} mr={1} />
                                  {tx.status}
                                </Flex>
                              </Badge>
                            </Td>
                            <Td>{tx.timestamp}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Validators Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" className="glass-card">
                <CardHeader>
                  <Heading size="md">Active Validators</Heading>
                </CardHeader>
                <CardBody>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Rank</Th>
                          <Th>Validator</Th>
                          <Th>Cluster</Th>
                          <Th>Synergy Points</Th>
                          <Th>Staked SYN</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>1</Td>
                          <Td>
                            <Link color="synergy.500">sYnQ1zx...9m3kmjx3</Link>
                          </Td>
                          <Td>Cluster #2</Td>
                          <Td>24,567</Td>
                          <Td>500,000</Td>
                          <Td>
                            <Badge colorScheme="green">
                              <Flex align="center">
                                <Icon as={FaCheck} mr={1} />
                                Active
                              </Flex>
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>2</Td>
                          <Td>
                            <Link color="synergy.500">sYnQ8ab...7k2pqrs9</Link>
                          </Td>
                          <Td>Cluster #5</Td>
                          <Td>23,812</Td>
                          <Td>450,000</Td>
                          <Td>
                            <Badge colorScheme="green">
                              <Flex align="center">
                                <Icon as={FaCheck} mr={1} />
                                Active
                              </Flex>
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>3</Td>
                          <Td>
                            <Link color="synergy.500">sYnQ3ef...2j5mnpq4</Link>
                          </Td>
                          <Td>Cluster #1</Td>
                          <Td>22,945</Td>
                          <Td>400,000</Td>
                          <Td>
                            <Badge colorScheme="green">
                              <Flex align="center">
                                <Icon as={FaCheck} mr={1} />
                                Active
                              </Flex>
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>4</Td>
                          <Td>
                            <Link color="synergy.500">sYnQ9cd...4f7ghij6</Link>
                          </Td>
                          <Td>Cluster #3</Td>
                          <Td>21,678</Td>
                          <Td>350,000</Td>
                          <Td>
                            <Badge colorScheme="green">
                              <Flex align="center">
                                <Icon as={FaCheck} mr={1} />
                                Active
                              </Flex>
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>5</Td>
                          <Td>
                            <Link color="synergy.500">sYnQ5gh...8d1efgh0</Link>
                          </Td>
                          <Td>Cluster #4</Td>
                          <Td>20,543</Td>
                          <Td>300,000</Td>
                          <Td>
                            <Badge colorScheme="yellow">
                              <Flex align="center">
                                <Icon as={FaClock} mr={1} />
                                Syncing
                              </Flex>
                            </Badge>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
