const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Joins an existing game session
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, playerName } = body;
    
    if (!sessionId || !playerName) {
      return createResponse(400, { error: 'Session ID and player name are required' });
    }
    
    // Get session from DynamoDB
    const result = await dynamoDB.get({
      TableName: process.env.MATCH_TABLE,
      Key: { sessionId }
    }).promise();
    
    const session = result.Item;
    
    // Check if session exists
    if (!session) {
      return createResponse(404, { error: 'Session not found' });
    }
    
    // Check if session is full
    if (session.currentPlayers >= session.maxPlayers) {
      return createResponse(400, { error: 'Session is full' });
    }
    
    // Check if session is in progress
    if (session.status === 'in_progress') {
      return createResponse(400, { error: 'Game is already in progress' });
    }
    
    // Create player ID
    const playerId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Add player to session
    const newPlayer = {
      playerId,
      playerName,
      isHost: false,
      joinedAt: timestamp
    };
    
    // Update session in DynamoDB
    await dynamoDB.update({
      TableName: process.env.MATCH_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET players = list_append(players, :player), currentPlayers = currentPlayers + :inc, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':player': [newPlayer],
        ':inc': 1,
        ':timestamp': timestamp
      }
    }).promise();
    
    // Return player info
    return createResponse(200, {
      sessionId,
      playerId,
      playerName,
      isHost: false
    });
  } catch (error) {
    return handleError(error);
  }
};
