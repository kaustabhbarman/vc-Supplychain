const crypto = require('crypto');
const fs = require('fs');

// Function to generate RSA key pair
function generateKeyPair(outputFilePath) {
    // Generate an RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Length of the key in bits
        publicKeyEncoding: {
            type: 'spki', // Recommended to use 'spki' for public key
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8', // Recommended to use 'pkcs8' for private key
            format: 'pem'
        }
    });

    // Prepare the content for the txt file
    const content = `private key:\n${privateKey}\npublic key:\n${publicKey}`;

    // Save the keys to a single txt file
    fs.writeFileSync(outputFilePath, content, 'utf-8');

    console.log(`Keys generated and saved to ${outputFilePath}`);
}

// Get the output file path from command line arguments
const outputFilePath = process.argv[2];

if (!outputFilePath) {
    console.error('Please provide the output file path as a parameter.');
    process.exit(1);
}

// Generate the keys and save to the specified file
generateKeyPair(outputFilePath);
