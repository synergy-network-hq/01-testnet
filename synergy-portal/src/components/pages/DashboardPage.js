import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Card,
  CardBody,
  useColorModeValue,
  HStack,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { FaServer, FaCubes, FaExchangeAlt, FaUsers, FaNetworkWired, FaClock } from 'react-icons/fa';

const RPC_URL = 'http://localhost:8545';

const fetchRPC = async (method, params = []) => {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    });
    const data = await response.json();
    return data.result;
  } catch (err) {
    console.error("RPC Fetch Error:", err);
    throw err;
  }
};

const StatCard = ({ title, value, helpText, icon, change, isIncrease }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <Flex justify="space-between">
          <Stat>
            <StatLabel>{title}</StatLabel>
            <StatNumber>{value}</StatNumber>
            {helpText && (
              <StatHelpText>
                {change && (
                  <StatArrow type={isIncrease ? 'increase' : 'decrease'} />
                )}
                {helpText}
              </StatHelpText>
            )}
          </Stat>
          <Flex
            w={12}
            h={12}
            align={'center'}
            justify={'center'}
            rounded={'full'}
            bg={'synergy.100'}
            color={'synergy.500'}
          >
            {icon}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default function DashboardPage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [stats, setStats] = useState(null);
  const [networkOnline, setNetworkOnline] = useState(true);

  const formatNumber = (num) => {
    return num?.toLocaleString() ?? '-';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '-';
    const secondsAgo = Math.floor(Date.now() / 1000) - Number(timestamp);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const [blockNumber, lastBlockTime, txCount, avgBlockTime, recentTxs] = await Promise.all([
          fetchRPC('synergy_getBlockNumber'),
          fetchRPC('synergy_getLastBlockTime'),
          fetchRPC('synergy_getTotalTxCount'),
          fetchRPC('synergy_getAvgBlockTime'),
          fetchRPC('synergy_getRecentActivity', [10])
        ]);

        setStats({
          blockNumber,
          lastBlockTime,
          txCount,
          avgBlockTime,
          recentTxs
        });
        setNetworkOnline(true);
      } catch (err) {
        setNetworkOnline(false);
      }
    }
    loadStats();
  }, []);

  return (
    <Container maxW="7xl" py={8}>
      <Heading as="h1" mb={8}>Network Dashboard</Heading>

      <Card bg={networkOnline ? "synergy.500" : "red.500"} color="white" mb={8} borderRadius="lg" overflow="hidden">
        <CardBody>
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={FaNetworkWired} w={6} h={6} />
              <Text fontWeight="bold" fontSize="lg">Network Status:</Text>
              <Badge colorScheme={networkOnline ? "green" : "red"} p={1} fontSize="md">
                {networkOnline ? "OPERATIONAL" : "OFFLINE"}
              </Badge>
            </HStack>
            <HStack>
              <Text>Current Block:</Text>
              <Text fontWeight="bold">{networkOnline ? formatNumber(stats?.blockNumber) : '-'}</Text>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {!networkOnline ? (
        <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" bg={cardBg}>
          <Text fontSize="md" textAlign="center">
            ⚠️ Data will be available once the Synergy Testnet reconnects.
          </Text>
        </Box>
      ) : (
        <>
          {stats && (<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <StatCard
              title="Total Transactions"
              value={formatNumber(stats.txCount)}
              helpText={"Live Count"}
              icon={<FaExchangeAlt />}
            />
            <StatCard
              title="Average Block Time"
              value={`${stats.avgBlockTime?.toFixed(2)}s`}
              helpText={"Testnet Measurement"}
              icon={<FaCubes />}
            />
            <StatCard
              title="Block Height"
              value={formatNumber(stats.blockNumber)}
              icon={<FaServer />}
            />
            <StatCard
              title="Time Since Last Block"
              value={formatTimeAgo(stats.lastBlockTime)}
              helpText={`@ ${stats.lastBlockTime}`}
              icon={<FaClock />}
            />
          </SimpleGrid>)}

          <Box>
            <Heading size="md" mb={2}>Recent Activity</Heading>
            <Box p={4} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="md">
              {stats?.recentTxs?.length > 0 ? (
                stats.recentTxs.map((tx, idx) => (
                  <Text key={idx} mb={1} fontSize="sm">{JSON.stringify(tx)}</Text>
                ))
              ) : (
                <Text>No activity yet.</Text>
              )}
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}
