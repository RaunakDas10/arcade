const AWS = require('aws-sdk');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Starts a game session
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, playerId } = body;
    
    if (!sessionId || !playerId) {
      return createResponse(400, { error: 'Session ID and player ID are required' });
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
    
    // Check if player is host
    const player = session.players.find(p => p.playerId === playerId);
    if (!player || !player.isHost) {
      return createResponse(403, { error: 'Only the host can start the game' });
    }
    
    // Check if session has enough players
    if (session.currentPlayers < 2) {
      return createResponse(400, { error: 'Need at least 2 players to start' });
    }
    
    // Update session status
    const timestamp = new Date().toISOString();
    await dynamoDB.update({
      TableName: process.env.MATCH_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET status = :status, gameStartedAt = :timestamp, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':status': 'in_progress',
        ':timestamp': timestamp
      }
    }).promise();
    
    // Return success
    return createResponse(200, {
      sessionId,
      status: 'in_progress',
      startedAt: timestamp
    });
  } catch (error) {
    return handleError(error);
  }
};
