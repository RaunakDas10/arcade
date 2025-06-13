const { createResponse, createWebSocketResponse, handleError } = require('../lib/utils');

describe('Utils', () => {
  test('createResponse should return correct structure', () => {
    const statusCode = 200;
    const body = { message: 'Success' };
    const response = createResponse(statusCode, body);
    
    expect(response).toHaveProperty('statusCode', statusCode);
    expect(response).toHaveProperty('headers');
    expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });
  
  test('createWebSocketResponse should return correct structure', () => {
    const statusCode = 200;
    const message = 'Connected';
    const response = createWebSocketResponse(statusCode, message);
    
    expect(response).toHaveProperty('statusCode', statusCode);
    expect(response).toHaveProperty('body', JSON.stringify({ message }));
  });
  
  test('handleError should return error response', () => {
    const error = new Error('Test error');
    const response = handleError(error);
    
    expect(response).toHaveProperty('statusCode', 500);
    expect(response).toHaveProperty('body');
    
    const parsedBody = JSON.parse(response.body);
    expect(parsedBody).toHaveProperty('error', 'Internal Server Error');
    expect(parsedBody).toHaveProperty('message', 'Test error');
  });
});
