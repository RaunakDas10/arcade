# Mini Drop: Pixel Royale

A 2D top-down multiplayer battle arena game inspired by battle royale games like PUBG/BGMI.

## Game Overview

Mini Drop: Pixel Royale is a fast-paced battle royale game where players fight to be the last one standing in a shrinking play zone. The game features:

- Top-down 2D gameplay with simple visual style
- Real-time multiplayer functionality using WebSockets
- Shrinking safe zone mechanics
- Weapon pickups and combat
- Player stats and match history

## Project Structure

```
MiniDropPixelRoyale/
├── frontend/       # Phaser.js game implementation
│   ├── src/        # Game source code
│   │   ├── scenes/ # Game scenes (menu, game, etc.)
│   │   ├── objects/ # Game objects (player, weapons, etc.)
│   │   ├── utils/  # Utility functions
│   │   └── assets/ # Game assets (images, audio)
│   └── tests/      # Frontend tests
├── backend/        # AWS Lambda functions (Node.js)
│   ├── functions/  # Lambda function handlers
│   ├── lib/        # Shared backend code
│   └── tests/      # Backend tests
├── infra/          # AWS CDK infrastructure code
│   ├── bin/        # CDK app entry point
│   └── lib/        # Stack definitions
└── README.md       # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the frontend development server:
   ```
   npm run start
   ```

3. Run tests:
   ```
   npm run test
   ```

4. Deploy to AWS:
   ```
   npm run deploy
   ```

## Game Controls

- **Desktop:**
  - Movement: Arrow keys or WASD
  - Aim: Mouse
  - Shoot: Space bar or left mouse click

- **Mobile:**
  - Movement: On-screen joystick (left side)
  - Shoot: Action button (right side)

## AWS Services Used

- **Amazon API Gateway:** REST API and WebSockets for real-time communication
- **AWS Lambda:** Serverless backend functions
- **Amazon DynamoDB:** NoSQL database for player data and match history
- **Amazon Cognito:** Anonymous authentication for players

## Development Notes

- The frontend uses Phaser.js for game rendering and physics
- The backend is built with AWS serverless services
- Infrastructure is defined as code using AWS CDK
- Local development uses Vite for fast reloading

## Future Enhancements

- Add more weapon types and power-ups
- Implement different maps and environments
- Add customizable player characters
- Implement team-based game modes
- Add leaderboards and achievements
