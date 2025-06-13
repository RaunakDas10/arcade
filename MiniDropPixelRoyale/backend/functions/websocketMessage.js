const AWS = require('aws-sdk');
const { handleError, createWebSocketResponse } = require('../lib/utils');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

/**
 * Handles WebSocket messages
 */
exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body);
    const { action, sessionId, data } = body;
    
    if (!action || !sessionId) {
      return createWebSocketResponse(400, 'Action and session ID are required');
    }
    
    // Handle different actions
    switch (action) {
      case 'join':
        return handleJoin(connectionId, sessionId, data);
      case 'update':
        return handleUpdate(connectionId, sessionId, data);
      case 'leave':
        return handleLeave(connectionId, sessionId, data);
      default:
        return createWebSocketResponse(400, `Unknown action: ${action}`);
    }
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Handles a player joining a session
 */
async function handleJoin(connectionId, sessionId, data) {
  // Add connection to session mapping
  await dynamoDB.put({
    TableName: process.env.SESSION_CONNECTION_TABLE,
    Item: {
      connectionId,
      sessionId,
      playerId: data.playerId,
      joinedAt: new Date().toISOString()
    }
  }).promise();
  
  // Get all connections for this session
  const connections = await getSessionConnections(sessionId);
  
  // Broadcast join event to all connections
  await broadcastToSession(connections, {
    action: 'playerJoined',
    sessionId,
    player: {
      playerId: data.playerId,
      playerName: data.playerName
    }
  });
  
  return createWebSocketResponse(200, 'Joined session');
}

/**
 * Handles a player updating their state
 */
async function handleUpdate(connectionId, sessionId, data) {
  // Get all connections for this session
  const connections = await getSessionConnections(sessionId);
  
  // Broadcast update to all connections except sender
  await broadcastToSession(
    connections.filter(conn => conn.connectionId !== connectionId),
    {
      action: 'playerUpdate',
      sessionId,
      playerId: data.playerId,
      position: data.position,
      rotation: data.rotation,
      health: data.health,
      weapon: data.weapon,
      action: data.action
    }
  );
  
  return createWebSocketResponse(200, 'Update broadcast');
}

/**
 * Handles a player leaving a session
 */
async function handleLeave(connectionId, sessionId, data) {
  // Remove connection from session mapping
  await dynamoDB.delete({
    TableName: process.env.SESSION_CONNECTION_TABLE,
    Key: { connectionId }
  }).promise();
  
  // Get all connections for this session
  const connections = await getSessionConnections(sessionId);
  
  // Broadcast leave event to all connections
  await broadcastToSession(connections, {
    action: 'playerLeft',
    sessionId,
    playerId: data.playerId
  });
  
  return createWebSocketResponse(200, 'Left session');
}

/**
 * Gets all connections for a session
 */
async function getSessionConnections(sessionId) {
  const result = await dynamoDB.query({
    TableName: process.env.SESSION_CONNECTION_TABLE,
    IndexName: 'SessionIdIndex',
    KeyConditionExpression: 'sessionId = :sessionId',
    ExpressionAttributeValues: {
      ':sessionId': sessionId
    }
  }).promise();
  
  return result.Items || [];
}

/**
 * Broadcasts a message to all connections in a session
 */
async function broadcastToSession(connections, message) {
  const postData = JSON.stringify(message);
  
  // Send message to each connection
  const sendPromises = connections.map(async ({ connectionId }) => {
    try {
      await apiGateway.postToConnection({
        ConnectionId: connectionId,
        Data: postData
      }).promise();
    } catch (error) {
      // Connection might be stale, remove it
      if (error.statusCode === 410) {
        await dynamoDB.delete({
          TableName: process.env.SESSION_CONNECTION_TABLE,
          Key: { connectionId }
        }).promise();
      }
    }
  });
  
  await Promise.all(sendPromises);
}
