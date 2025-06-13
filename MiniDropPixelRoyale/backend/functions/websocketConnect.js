const AWS = require('aws-sdk');
const { handleError, createWebSocketResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Handles WebSocket connection
 */
exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const timestamp = new Date().toISOString();
    
    // Store connection in DynamoDB
    await dynamoDB.put({
      TableName: process.env.CONNECTION_TABLE,
      Item: {
        connectionId,
        timestamp,
        ttl: Math.floor(Date.now() / 1000) + 3600 // TTL of 1 hour
      }
    }).promise();
    
    return createWebSocketResponse(200, 'Connected');
  } catch (error) {
    return handleError(error);
  }
};
