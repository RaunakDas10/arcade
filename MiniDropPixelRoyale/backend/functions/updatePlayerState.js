const AWS = require('aws-sdk');
const { handleError, createResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Updates a player's state in a game session
 */
exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, playerId, position, health, weapon, action } = body;
    
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
    
    // Check if player is in session
    const playerIndex = session.players.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) {
      return createResponse(404, { error: 'Player not found in session' });
    }
    
    // Update player state
    const timestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeValues = {
      ':timestamp': timestamp
    };
    
    if (position) {
      updateExpressions.push(`players[${playerIndex}].position = :position`);
      expressionAttributeValues[':position'] = position;
    }
    
    if (health !== undefined) {
      updateExpressions.push(`players[${playerIndex}].health = :health`);
      expressionAttributeValues[':health'] = health;
    }
    
    if (weapon) {
      updateExpressions.push(`players[${playerIndex}].weapon = :weapon`);
      expressionAttributeValues[':weapon'] = weapon;
    }
    
    if (action) {
      updateExpressions.push(`players[${playerIndex}].lastAction = :action`);
      expressionAttributeValues[':action'] = action;
    }
    
    updateExpressions.push('updatedAt = :timestamp');
    
    // Update session in DynamoDB
    await dynamoDB.update({
      TableName: process.env.MATCH_TABLE,
      Key: { sessionId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();
    
    // Return success
    return createResponse(200, {
      sessionId,
      playerId,
      updatedAt: timestamp
    });
  } catch (error) {
    return handleError(error);
  }
};
