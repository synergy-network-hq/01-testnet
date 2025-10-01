import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Services
import rpcService from '../services/rpcService';

const steps = [
  'Testnet Connection',
  'Validator Configuration',
  'Key Generation',
  'Registration',
  'Verification'
];

function ValidatorSetup({ onComplete, currentStep, setCurrentStep }) {
  const [activeStep, setActiveStep] = useState(currentStep || 0);
  const [formData, setFormData] = useState({
    testnetRpcUrl: 'http://localhost:8545',
    validatorName: '',
    validatorWebsite: '',
    validatorDescription: '',
    validatorEmail: '',
    stakeAmount: '1000',
    commissionRate: '10',
    keysGenerated: false,
    registrationComplete: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [testnetConnected, setTestnetConnected] = useState(false);
  const [validatorAddress, setValidatorAddress] = useState('');

  // Test testnet connection
  useEffect(() => {
    testConnection();
  }, [formData.testnetRpcUrl]);

  const testConnection = async () => {
    try {
      // Update RPC service endpoint
      rpcService.setEndpoint(formData.testnetRpcUrl);
      const response = await rpcService.getBlockNumber();
      if (response) {
        setTestnetConnected(true);
        setErrors(prev => ({ ...prev, testnetRpcUrl: null }));
      }
    } catch (error) {
      setTestnetConnected(false);
      setErrors(prev => ({ ...prev, testnetRpcUrl: 'Cannot connect to testnet RPC' }));
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Testnet Connection
        if (!formData.testnetRpcUrl) {
          newErrors.testnetRpcUrl = 'RPC URL is required';
        } else if (!testnetConnected) {
          newErrors.testnetRpcUrl = 'Cannot connect to testnet';
        }
        break;

      case 1: // Validator Configuration
        if (!formData.validatorName.trim()) {
          newErrors.validatorName = 'Validator name is required';
        }
        if (!formData.stakeAmount || parseFloat(formData.stakeAmount) < 1000) {
          newErrors.stakeAmount = 'Minimum stake is 1000 SNRG';
        }
        break;

      case 2: // Key Generation
        if (!formData.keysGenerated) {
          newErrors.keysGenerated = 'Validator keys must be generated';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      if (setCurrentStep) setCurrentStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    if (setCurrentStep) setCurrentStep(activeStep - 1);
  };

  const generateKeys = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the validator key generation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate key generation
      setFormData(prev => ({ ...prev, keysGenerated: true }));
      setValidatorAddress('sYnQ' + Math.random().toString(36).substring(2, 15));
    } catch (error) {
      setErrors(prev => ({ ...prev, keysGenerated: 'Key generation failed' }));
    }
    setLoading(false);
  };

  const registerValidator = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the validator registration RPC
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate registration
      setFormData(prev => ({ ...prev, registrationComplete: true }));
      onComplete({
        ...formData,
        validatorAddress,
        setupComplete: true
      });
    } catch (error) {
      setErrors(prev => ({ ...prev, registration: 'Registration failed' }));
    }
    setLoading(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Connect to Synergy Testnet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure the connection to the Synergy testnet RPC endpoint.
            </Typography>

            <TextField
              fullWidth
              label="Testnet RPC URL"
              value={formData.testnetRpcUrl}
              onChange={handleInputChange('testnetRpcUrl')}
              error={!!errors.testnetRpcUrl}
              helperText={errors.testnetRpcUrl}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {testnetConnected ? (
                <CheckIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              <Typography variant="body2" color={testnetConnected ? 'success.main' : 'error'}>
                {testnetConnected ? 'Connected to testnet' : 'Not connected'}
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Validator Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up your validator's basic information and staking parameters.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Validator Name"
                  value={formData.validatorName}
                  onChange={handleInputChange('validatorName')}
                  error={!!errors.validatorName}
                  helperText={errors.validatorName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stake Amount (SNRG)"
                  type="number"
                  value={formData.stakeAmount}
                  onChange={handleInputChange('stakeAmount')}
                  error={!!errors.stakeAmount}
                  helperText={errors.stakeAmount || 'Minimum 1000 SNRG'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Commission Rate (%)"
                  type="number"
                  value={formData.commissionRate}
                  onChange={handleInputChange('commissionRate')}
                  helperText="Percentage of rewards you keep (0-100)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  value={formData.validatorWebsite}
                  onChange={handleInputChange('validatorWebsite')}
                  placeholder="https://your-validator.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={formData.validatorDescription}
                  onChange={handleInputChange('validatorDescription')}
                  multiline
                  rows={3}
                  placeholder="Brief description of your validator"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={formData.validatorEmail}
                  onChange={handleInputChange('validatorEmail')}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Generate Validator Keys
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate cryptographic keys for your validator. These keys will be used to sign blocks and participate in consensus.
            </Typography>

            {!formData.keysGenerated ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={generateKeys}
                  disabled={loading}
                  startIcon={loading ? null : <AddIcon />}
                >
                  {loading ? 'Generating Keys...' : 'Generate Validator Keys'}
                </Button>
                {errors.keysGenerated && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.keysGenerated}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Keys Generated Successfully!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your validator keys have been generated and are ready for registration.
                </Typography>
                {validatorAddress && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Validator Address:
                    </Typography>
                    <Chip label={validatorAddress} variant="outlined" />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Register Validator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Register your validator on the Synergy testnet. This will submit your validator information to the network.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Registration Summary:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {formData.validatorName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Stake:</strong> {formData.stakeAmount} SNRG
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Address:</strong> {validatorAddress}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Commission:</strong> {formData.commissionRate}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {!formData.registrationComplete ? (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={registerValidator}
                  disabled={loading}
                >
                  {loading ? 'Registering Validator...' : 'Register Validator'}
                </Button>
                {errors.registration && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.registration}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Registration Complete!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your validator has been successfully registered on the Synergy testnet.
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon color="success" sx={{ fontSize: 64, mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Validator Setup Complete!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Your validator is now configured and ready to participate in the Synergy testnet.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Next Steps:
              </Typography>
              <Stack spacing={1} alignItems="flex-start" sx={{ maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body2">• Start your validator node</Typography>
                <Typography variant="body2">• Monitor your validator's performance</Typography>
                <Typography variant="body2">• Participate in consensus and earn rewards</Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={() => onComplete({ ...formData, validatorAddress })}
            >
              Go to Dashboard
            </Button>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Synergy Validator Setup
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card className="content-overlay">
          <CardContent>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!testnetConnected && activeStep === 0}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default ValidatorSetup;
