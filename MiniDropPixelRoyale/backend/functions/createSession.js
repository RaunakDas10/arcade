const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new game session
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { playerName } = body;
    
    if (!playerName) {
      return createResponse(400, { error: 'Player name is required' });
    }
    
    // Generate session ID
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create player ID
    const playerId = uuidv4();
    
    // Create session record
    const session = {
      sessionId,
      status: 'waiting',
      createdAt: timestamp,
      updatedAt: timestamp,
      players: [
        {
          playerId,
          playerName,
          isHost: true,
          joinedAt: timestamp
        }
      ],
      maxPlayers: 16,
      currentPlayers: 1
    };
    
    // Save session to DynamoDB
    await dynamoDB.put({
      TableName: process.env.MATCH_TABLE,
      Item: session
    }).promise();
    
    // Return session info
    return createResponse(201, {
      sessionId,
      playerId,
      playerName,
      isHost: true
    });
  } catch (error) {
    return handleError(error);
  }
};
