# AI NFT Project

    A decentralized NFT platform built on Solana blockchain with AI integration.

## Project Overview

This project is a full-stack decentralized application (dApp) that combines AI capabilities with NFT functionality on the Solana blockchain. The project is structured into multiple components:

- Frontend: React-based web application
- Backend: Node.js/TypeScript server
- Smart Contracts: Solana program for NFT operations
- SDK: Development tools and utilities

## Project Structure

```
ai_nFt/
├── frontend/           # React frontend application
│   ├── public/        # Static assets
│   ├── src/          # Source code
│   └── package.json  # Frontend dependencies
├── backend/           # Node.js backend server
│   ├── src/          # Backend source code
│   ├── images/       # Image assets
│   └── package.json  # Backend dependencies
├── ai_nft_solana/    # Solana smart contracts
├── sdk/              # Development SDK
└── package.json      # Root project dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- TypeScript
- Solana CLI tools
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd ai_nFt
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
   - Create necessary `.env` files in frontend and backend directories
   - Configure Solana network settings
   - Set up Arweave keys (if using)

4. Start development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend development server
cd frontend
npm start
```

## Features

- AI-powered NFT generation
- Solana blockchain integration
- Decentralized storage using Arweave
- Modern web interface
- Smart contract integration

## AI Image Generation

The project uses Stability AI's Stable Diffusion XL 1024 v1.0 model for generating unique NFT images. Here's how the image generation system works:

### Technology Stack
- **Model**: Stable Diffusion XL 1024 v1.0
- **API**: Stability AI API
- **Image Sizes**: 
  - Small: 512x512 pixels
  - Medium: 768x768 pixels
  - Large: 1024x1024 pixels

### Generation Process
1. User submits a text prompt and wallet address
2. The backend processes the request with the following parameters:
   - Configuration Scale: 7
   - Generation Steps: 30
   - Samples per generation: 1
3. Generated images are saved locally with associated metadata
4. Each NFT includes metadata with:
   - Name
   - Description
   - Image URL
   - Attributes (Generator, Prompt, Creator, Generation Date)

### Setup Requirements
1. Stability AI API Key
   - Sign up at [Stability AI](https://stability.ai)
   - Get your API key
   - Add to environment variables as `STABILITY_API_KEY`

2. Environment Configuration
   ```bash
   # .env file in backend directory
   STABILITY_API_KEY=your_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

### API Endpoints
- `POST /generate`
  - Generates new AI images
  - Required parameters:
    - `prompt`: Text description for image generation
    - `walletAddress`: User's wallet address
    - `size`: Optional image size ('small', 'medium', 'large')
    - `share`: Optional boolean for sharing

- `POST /mint`
  - Mints generated images as NFTs
  - Required parameters:
    - `imageUrl`: URL of the generated image
    - `walletAddress`: User's wallet address

## Development

- Frontend is built with React and TypeScript
- Backend uses Node.js with TypeScript
- Smart contracts are written in Rust for Solana
- Uses modern development tools and practices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please open an issue in the repository.
