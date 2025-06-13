/**
 * Creates a standardized API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @returns {object} API Gateway response object
 */
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Creates a standardized WebSocket response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @returns {object} WebSocket response object
 */
function createWebSocketResponse(statusCode, message) {
  return {
    statusCode,
    body: JSON.stringify({ message })
  };
}

/**
 * Handles errors in Lambda functions
 * @param {Error} error - The error object
 * @returns {object} API Gateway response with error details
 */
function handleError(error) {
  console.error('Error:', error);
  
  return createResponse(500, {
    error: 'Internal Server Error',
    message: error.message
  });
}

module.exports = {
  createResponse,
  createWebSocketResponse,
  handleError
};
