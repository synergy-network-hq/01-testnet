// Use the backend as a proxy for all explorer data
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const fetchLatestBlocks = async () => {
  const response = await fetch(`${API_BASE_URL}/blocks`);
  if (!response.ok) throw new Error("Failed to fetch blocks");
  return response.json();
};

export const fetchLatestTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
};

export const fetchTransaction = async (txHash: string) => {
  const response = await fetch(`${API_BASE_URL}/transaction/${txHash}`);
  if (!response.ok) throw new Error("Transaction not found");
  return response.json();
};

export const fetchBlocks = fetchLatestBlocks;

export const fetchAddress = async (address: string) => {
  const response = await fetch(`${API_BASE_URL}/address/${address}`);
  if (!response.ok) throw new Error("Address not found");
  return response.json();
};

export const fetchBlock = async (blockNumberOrHash: string) => {
  const response = await fetch(`${API_BASE_URL}/block/${blockNumberOrHash}`);
  if (!response.ok) throw new Error("Block not found");
  return response.json();
};

export const fetchLiveData = async () => {
  const response = await fetch(`${API_BASE_URL}/live`);
  if (!response.ok) throw new Error("Failed to fetch live data");
  return response.json();
};

export const fetchFeeEstimate = async () => {
  const response = await fetch(`${API_BASE_URL}/fees`);
  if (!response.ok) throw new Error("Failed to fetch fee estimate");
  return response.json();
};
