const { Web3 } = require('web3');
const fs = require('fs');

// Initialize Web3 without a provider for account creation
const web3 = new Web3();

// Function to create an Ethereum account
function createAccount() {
    return web3.eth.accounts.create();
}

// Function to save account to a file
function saveAccountToFile(account, filePath) {
    const data = JSON.stringify(account, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
    console.log('Account saved to', filePath);
}

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.error('Usage: node createEthAccount.js <outputFilePath>');
    process.exit(1);
}

// Create an Ethereum account
const account = createAccount();

// Save the account to the specified file
saveAccountToFile(account, filePath);
