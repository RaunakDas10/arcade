const AWS = require('aws-sdk');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB clients
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Ends a game session and records the results
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, winnerId, gameStats } = body;
    
    if (!sessionId || !winnerId) {
      return createResponse(400, { error: 'Session ID and winner ID are required' });
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
    
    // Check if winner is in session
    const winner = session.players.find(p => p.playerId === winnerId);
    if (!winner) {
      return createResponse(404, { error: 'Winner not found in session' });
    }
    
    // Update session status
    const timestamp = new Date().toISOString();
    await dynamoDB.update({
      TableName: process.env.MATCH_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET status = :status, gameEndedAt = :timestamp, updatedAt = :timestamp, winnerId = :winnerId, gameStats = :gameStats',
      ExpressionAttributeValues: {
        ':status': 'completed',
        ':timestamp': timestamp,
        ':winnerId': winnerId,
        ':gameStats': gameStats || {}
      }
    }).promise();
    
    // Record match results for each player
    for (const player of session.players) {
      const isWinner = player.playerId === winnerId;
      
      // Get player record
      const playerResult = await dynamoDB.get({
        TableName: process.env.PLAYER_TABLE,
        Key: { playerId: player.playerId }
      }).promise();
      
      const playerRecord = playerResult.Item || {
        playerId: player.playerId,
        playerName: player.playerName,
        matches: 0,
        wins: 0,
        lastPlayed: timestamp
      };
      
      // Update player stats
      await dynamoDB.put({
        TableName: process.env.PLAYER_TABLE,
        Item: {
          ...playerRecord,
          matches: playerRecord.matches + 1,
          wins: playerRecord.wins + (isWinner ? 1 : 0),
          lastPlayed: timestamp
        }
      }).promise();
    }
    
    // Return success
    return createResponse(200, {
      sessionId,
      status: 'completed',
      winnerId,
      winnerName: winner.playerName,
      endedAt: timestamp
    });
  } catch (error) {
    return handleError(error);
  }
};
