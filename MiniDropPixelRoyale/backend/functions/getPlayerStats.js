const AWS = require('aws-sdk');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Gets a player's stats
 */
exports.handler = async (event) => {
  try {
    // Get player ID from path parameters
    const playerId = event.pathParameters?.playerId;
    
    if (!playerId) {
      return createResponse(400, { error: 'Player ID is required' });
    }
    
    // Get player from DynamoDB
    const result = await dynamoDB.get({
      TableName: process.env.PLAYER_TABLE,
      Key: { playerId }
    }).promise();
    
    const player = result.Item;
    
    // Check if player exists
    if (!player) {
      return createResponse(404, { error: 'Player not found' });
    }
    
    // Return player stats
    return createResponse(200, {
      playerId: player.playerId,
      playerName: player.playerName,
      matches: player.matches,
      wins: player.wins,
      winRate: player.matches > 0 ? (player.wins / player.matches) * 100 : 0,
      lastPlayed: player.lastPlayed
    });
  } catch (error) {
    return handleError(error);
  }
};
