#!/bin/bash

# Synergy Network AIVM GPT-OSS Setup Script
# This script sets up the GPT-OSS-20B model for AIVM interactions

echo "🤖 Setting up GPT-OSS-20B for Synergy Network AIVM..."
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3 and try again."
    exit 1
fi

echo "✅ Python and pip found"

# Install required packages
echo "📦 Installing required Python packages..."
pip3 install transformers torch

if [ $? -ne 0 ]; then
    echo "❌ Failed to install required packages"
    echo "Please install manually: pip3 install transformers torch"
    exit 1
fi

echo "✅ Packages installed successfully"

# Start the transformers server
echo "🚀 Starting GPT-OSS model server..."
echo "Note: This will download the GPT-OSS-20B model (~20GB)"
echo "Press Ctrl+C to stop the server"

# Start the server in background
transformers serve &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# Test the server
echo "🔍 Testing server connection..."
curl -s http://localhost:8000/health || echo "Server may still be starting..."

echo ""
echo "🎉 GPT-OSS setup complete!"
echo ""
echo "Server Details:"
echo "- URL: http://localhost:8000"
echo "- Model: openai/gpt-oss-20b"
echo "- Status: Running (PID: $SERVER_PID)"
echo ""
echo "To start chatting with the model:"
echo "transformers chat localhost:8000 --model-name-or-path openai/gpt-oss-20b"
echo ""
echo "To stop the server:"
echo "kill $SERVER_PID"
echo ""
echo "The AIVM will now be able to use GPT-OSS for personable interactions!"
echo "You can now use AIVM features in the Synergy Network testnet."

# Keep the script running to show server status
wait $SERVER_PID
