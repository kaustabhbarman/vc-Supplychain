const { EthrDID } = require('ethr-did');
const fs = require('fs');

function generateIdentity(identityPath) {

    //create Keys using ethr-did library
    const identity = EthrDID.createKeyPair();

    // Save the keypair to a  txt file
    fs.writeFileSync(identityPath, JSON.stringify(identity, null, 2), 'utf-8');

    console.log(`Keys generated and saved to ${identityPath}`);
}

// Get Entity for which to generate an Identity from command line arguments
const entity = process.argv[2];
// set the Path for the identity document
identityPath = "../../VC Prototype/Battery Use Case/"+entity+"/identity.txt"

if (!entity) {
    console.error('Please provide an existing entity as a parameter.');
    process.exit(1);
}

// Generate the keys and save to the specified file
generateIdentity(identityPath);
