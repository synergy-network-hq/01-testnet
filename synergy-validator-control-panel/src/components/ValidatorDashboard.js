import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Services
import rpcService from '../services/rpcService';

function ValidatorDashboard({ validatorConfig }) {
  const [validatorData, setValidatorData] = useState({
    status: 'active',
    synergyScore: 75.0,
    uptimePercentage: 99.8,
    totalBlocksProduced: 1247,
    totalTransactionsValidated: 8934,
    currentEpochRewards: 156.78,
    totalRewardsEarned: 2847.32,
    rank: 12,
    totalValidators: 156,
    lastBlockTime: '2 minutes ago',
    pendingTransactions: 23,
  });

  const [loading, setLoading] = useState(false);
  const [testnetConnected, setTestnetConnected] = useState(false);

  // Test testnet connection
  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    try {
      const response = await rpcService.getBlockNumber();
      setTestnetConnected(!!response);
    } catch (error) {
      setTestnetConnected(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'jailed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckIcon />;
      case 'inactive': return <WarningIcon />;
      case 'jailed': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  // Mock data for charts
  const synergyData = [
    { time: '00:00', score: 72 },
    { time: '04:00', score: 74 },
    { time: '08:00', score: 73 },
    { time: '12:00', score: 76 },
    { time: '16:00', score: 75 },
    { time: '20:00', score: 77 },
  ];

  const rewardsData = [
    { name: 'Block Rewards', value: 1850, color: '#8884d8' },
    { name: 'Transaction Fees', value: 650, color: '#82ca9d' },
    { name: 'Epoch Bonuses', value: 347, color: '#ffc658' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Validator Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your validator's performance and earnings
        </Typography>
      </Box>

      {/* Connection Status */}
      <Alert
        severity={testnetConnected ? 'success' : 'warning'}
        sx={{ mb: 3 }}
        icon={testnetConnected ? <CheckIcon /> : <ErrorIcon />}
      >
        {testnetConnected ? 'Connected to Synergy Testnet' : 'Cannot connect to testnet RPC'}
      </Alert>

      {/* Validator Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validator Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(validatorData.status)}
                <Chip
                  label={validatorData.status.toUpperCase()}
                  color={getStatusColor(validatorData.status)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Synergy Score
              </Typography>
              <Typography variant="h4" color="primary">
                {validatorData.synergyScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of 100
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="h4" color="success.main">
                {validatorData.uptimePercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={validatorData.uptimePercentage}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rank
              </Typography>
              <Typography variant="h4">
                #{validatorData.rank}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {validatorData.totalValidators} validators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Synergy Score Trend (24h)
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={synergyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rewards Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={rewardsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rewardsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {rewardsData.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: entry.color, borderRadius: '50%' }} />
                    <Typography variant="body2">
                      {entry.name}: {entry.value} SNRG
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Blocks Produced
              </Typography>
              <Typography variant="h4" color="primary">
                {validatorData.totalBlocksProduced.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total blocks validated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transactions Validated
              </Typography>
              <Typography variant="h4" color="success.main">
                {validatorData.totalTransactionsValidated.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transactions processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Epoch Rewards
              </Typography>
              <Typography variant="h4" color="warning.main">
                {validatorData.currentEpochRewards} SNRG
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This epoch's earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="content-overlay">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Rewards Earned
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {validatorData.totalRewardsEarned} SNRG
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All-time earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Block #1247 produced"
                secondary={validatorData.lastBlockTime}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <TrendingUpIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Synergy score increased to 75.0"
                secondary="2 hours ago"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary={`${validatorData.pendingTransactions} pending transactions`}
                secondary="Awaiting validation"
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              sx={{ mr: 2 }}
            >
              Start Validator
            </Button>
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              color="error"
            >
              Stop Validator
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ValidatorDashboard;
