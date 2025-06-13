const AWS = require('aws-sdk');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Gets the current state of a game session
 */
exports.handler = async (event) => {
  try {
    // Get session ID from path parameters
    const sessionId = event.pathParameters?.sessionId;
    
    if (!sessionId) {
      return createResponse(400, { error: 'Session ID is required' });
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
    
    // Return session state
    return createResponse(200, {
      sessionId: session.sessionId,
      status: session.status,
      players: session.players.map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        isHost: player.isHost,
        position: player.position,
        health: player.health,
        weapon: player.weapon,
        lastAction: player.lastAction
      })),
      currentPlayers: session.currentPlayers,
      maxPlayers: session.maxPlayers,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      gameStartedAt: session.gameStartedAt
    });
  } catch (error) {
    return handleError(error);
  }
};
