import { createServerWallet } from "thirdweb/engine";
import { CLIENT_ID, ENGINE_ADMIN_WALLET_ADDRESS, PLANT_SCAN_EDITION_ADDRESS, SECRET_KEY, WEATHER_API_KEY } from "./src/utils/constants";
import { createThirdwebClient, Engine, getContract } from "thirdweb"
import { mintTo } from "thirdweb/extensions/erc1155";
import type { PlantImageScanParams } from "./src/ai.services/plant.ai.team.service/plant.interface";
import { arbitrumSepolia, base, baseSepolia, polygon } from "thirdweb/chains";
import { transactionContract } from "./src/utils/utils.thirdweb";
    export const getCurrentWeather = async (lat: number, lng: number): Promise<any> => {
        const url: string = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lng}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather: ${response.statusText}`);
        }
        return await response.json();
    };

const originalFetch = globalThis.fetch;

//@ts-ignore
globalThis.fetch = async (input, init) => {
    console.log("\n🔍 FETCH DEBUG");
    console.log("➡️ Request URL:", input);
    console.log("➡️ Request Method:", init?.method);
    console.log("➡️ Request Headers:", init?.headers);
    console.log("➡️ Request Body:", init?.body ? await streamToString(init.body) : null);

    const response = await originalFetch(input, init);

    const cloned = response.clone();
    const bodyText = await cloned.text();
    console.log("⬅️ Response Status:", cloned.status);
    console.log("⬅️ Response Body:", bodyText);

    return response;
};


const client = createThirdwebClient({
    secretKey: SECRET_KEY,
    clientId: CLIENT_ID
})


async function streamToString(body: any) {
	if (typeof body === "string") return body;
	if (body instanceof ReadableStream) {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let result = "", done, value;
		while (!done) {
			({ done, value } = await reader.read());
			if (value) result += decoder.decode(value);
		}
		return result;
	}
	return "[unknown body type]";
}



// const result = await createServerWallet({
//     client,
//     label: "Server Wallet",
// })  



// console.log(result)






const savePlantScanToNFT = async (data: PlantImageScanParams,image: string | number[]): Promise<void> => {
    const serverWallet = Engine.serverWallet({
        client,
        address: "0x03934397d7146f1cD19B705E248e58307D1b7a08",
        vaultAccessToken: process.env.VAULT_ACCESS_TOKEN!,
    });

    let imageFile: File;
    
    if (Array.isArray(image)) {
        // Handle case when image is already a byte array
        const buffer = Buffer.from(image);
        imageFile = new File([buffer], "plant-scan.png", {
            type: "image/png",
        });
    } else if (image.startsWith('http')) {
        // Handle case when image is a URL
        const response = await fetch(image);
        const blob = await response.blob();
        imageFile = new File([blob], "plant-scan.png", { type: blob.type });
    } else {
        // Handle case when image is a base64 string or other format
        try {
            const byteArray = JSON.parse(image);
            const buffer = Buffer.from(byteArray);
            imageFile = new File([buffer], "plant-scan.png", {
                type: "image/png",
            });
        } catch (e) {
            throw new Error("Invalid image format. Expected URL, byte RETURN array, or JSON string of bytes.");
        }
    }
    
    const contract = getContract({
        client,
        address: "0x03934397d7146f1cD19B705E248e58307D1b7a08",
        chain: arbitrumSepolia,
    });

    const attributes = [
        {
            trait_type: "AI Evaluation",
            value: data.interpretation,
        },
        {
            trait_type: "Crop Type",
            value: data.cropType,
        },
    ];

    const metadata = {
        name: "Plant Health NFT",
        description: "Visual health check of crop using AI analysis.",
        image: imageFile,
        external_url: "https://decentragri.com/plant-scans",
        background_color: "#E0FFE0",
        properties: {
            image: "Uploaded via buffer", // fallback text
            cropType: data.cropType,
            timestamp: new Date().toISOString(),
            note: data.note ?? "No additional notes",
            interpretation: data.interpretation,
        },
        attributes,
    };

    const transaction = mintTo({
        contract,
        to: "0x17dE000e4E342a74E77EDf6C94aC211099BE4862",
         // receiver smart wallet
        supply: 1n,
        nft: metadata,
    });

    try {
        const { transactionId } = await serverWallet.enqueueTransaction({
            transaction,
        });
        

    } catch (error) {
        console.error("Error minting plant scan NFT:", error);
        throw new Error("Failed to mint plant scan NFT");
    }
}

savePlantScanToNFT({
    farmName: "Farm 1",
    cropType: "Tomato",
    note: "No additional notes",
    interpretation: "Healthy plant",
    imageBytes: "https://d391b93f5f62d9c15f67142e43841acc.ipfscdn.io/ipfs/QmdRtWRHQwEkKA7nciqRQmgW7y6yygT589aogfUYaoc3Ea/ChatGPT%20Image%20Apr%2021%2C%202025%2C%2012_14_42%20PM.png"
}, "https://example.com/image.jpg");



// Example usage (commented out to prevent execution during tests)
/*
// Example with URL
const exampleParams: PlantImageScanParams = {
    farmName: "Farm 1",
    cropType: "Tomato",
    note: "No additional notes",
    interpretation: "Healthy plant",
    imageBytes: "https://example.com/image.jpg"
};

// Uncomment to run the example with URL
// savePlantScanToNFT(exampleParams, exampleParams.imageBytes, "username");

// Example with byte array
const byteArrayExample: number[] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]; // Example PNG header
const byteArrayParams: PlantImageScanParams = {
    farmName: "Farm 1",
    cropType: "Tomato",
    note: "No additional notes",
    interpretation: "Healthy plant",
    imageBytes: "data:image/png;base64,..." // or any other placeholder
};

// Uncomment to run the example with byte array
// savePlantScanToNFT(byteArrayParams, byteArrayExample, "username");
*/


