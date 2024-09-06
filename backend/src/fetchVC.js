const ipfs_base_link = "https://ipfs.filebase.io/ipfs/"

async function fetchVC(cid) {
    try {
        // Use fetch to get the response from the URL
        const response = await fetch(ipfs_base_link + cid);

        // Check if the response status is OK (status code 200)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the response as JSON
        const vcJsonData = await response.json();
        //check if vc is a certificate
        return vcJsonData
    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching JSON data:', error);
    }
}

module.exports = { fetchVC };