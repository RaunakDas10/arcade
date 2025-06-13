const AWS = require('aws-sdk');
const { handleError, createWebSocketResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Handles WebSocket disconnection
 */
exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    
    // Remove connection from DynamoDB
    await dynamoDB.delete({
      TableName: process.env.CONNECTION_TABLE,
      Key: { connectionId }
    }).promise();
    
    return createWebSocketResponse(200, 'Disconnected');
  } catch (error) {
    return handleError(error);
  }
};
