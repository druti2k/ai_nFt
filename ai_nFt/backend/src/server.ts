import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

interface GenerateRequest {
  prompt: string;
  walletAddress: string;
  size?: 'small' | 'medium' | 'large';
  share?: boolean;
}

interface MintRequest {
  imageUrl: string;
  walletAddress: string;
}

const app = express();
const port = process.env.PORT || 3001;

// Set up directory paths first
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const imagesDir = join(dirname(__dirname), 'images');

// Create images directory if it doesn't exist
try {
  await mkdir(imagesDir, { recursive: true });
} catch (error) {
  if ((error as any).code !== 'EEXIST') {
    console.error('Error creating images directory:', error);
  }
}

// Create .gitkeep file
try {
  await writeFile(join(imagesDir, '.gitkeep'), '');
} catch (error) {
  console.warn('Could not create .gitkeep file:', error);
}

// Set up middleware after directory is created
app.use(cors());
app.use(express.json());
app.use('/images', express.static(imagesDir));

app.post('/generate', (async (req: Request, res: Response) => {
  try {
    const { prompt, walletAddress, size = 'medium', share = false } = req.body as GenerateRequest;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a prompt'
      });
    }

    // Get dimensions based on size
    let width = 1024, height = 1024;
    switch(size) {
      case 'small':
        width = height = 512;
        break;
      case 'medium':
        width = height = 768;
        break;
      case 'large':
        width = height = 1024;
        break;
    }

    // Using Stability AI API (free tier)
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }

    const responseData = await response.json();
    const base64Image = responseData.artifacts[0].base64;
    
    // Save image locally
    const timestamp = Date.now();
    const filename = `image_${timestamp}.png`;
    const filepath = join(imagesDir, filename);
    await writeFile(filepath, Buffer.from(base64Image, 'base64'));
    
    // Create image URL
    const imageUrl = `http://localhost:${port}/images/${filename}`;
    
    // Create metadata
    const metadata = {
      name: `AI NFT: ${prompt.substring(0, 30)}...`,
      description: prompt,
      image: imageUrl,
      attributes: [
        {
          trait_type: 'Generator',
          value: 'Stable Diffusion'
        },
        {
          trait_type: 'Prompt',
          value: prompt
        },
        {
          trait_type: 'Creator',
          value: walletAddress
        },
        {
          trait_type: 'Generation Date',
          value: new Date().toISOString()
        }
      ]
    };
    
    // Save metadata locally
    const metadataFilename = `metadata_${timestamp}.json`;
    const metadataFilepath = join(imagesDir, metadataFilename);
    await writeFile(metadataFilepath, JSON.stringify(metadata, null, 2));
    const metadataUrl = `http://localhost:${port}/images/${metadataFilename}`;

    // Add sharing URL if requested
    const shareUrl = share ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${filename}` : null;

    res.json({
      success: true,
      imageUri: imageUrl,
      metadataUri: metadataUrl,
      shareUrl
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    });
  }
}) as RequestHandler);

// Add mint endpoint
app.post('/mint', (async (req: Request, res: Response) => {
  try {
    const { imageUrl, walletAddress } = req.body as MintRequest;

    if (!imageUrl || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both imageUrl and walletAddress'
      });
    }

    // For now, we'll simulate minting by creating a mock transaction
    const mockSignature = `mock_tx_${Date.now()}`;

    // In a real implementation, you would:
    // 1. Connect to Solana
    // 2. Create NFT metadata
    // 3. Upload to Arweave
    // 4. Mint the NFT
    // 5. Return the real transaction signature

    res.json({
      success: true,
      signature: mockSignature
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint NFT'
    });
  }
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 