/**
 * API service for communicating with the backend
 */
class ApiService {
  constructor() {
    // In a real implementation, these would be set from environment variables
    this.apiUrl = 'http://localhost:3001/api'; // Local development API URL
    this.websocketUrl = 'ws://localhost:3001/ws'; // Local development WebSocket URL
    
    this.websocket = null;
    this.sessionId = null;
    this.playerId = null;
    this.messageHandlers = new Map();
  }
  
  /**
   * Creates a new game session
   * @param {string} playerName - The player's name
   * @returns {Promise<object>} Session information
   */
  async createSession(playerName) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.sessionId = data.sessionId;
      this.playerId = data.playerId;
      
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  /**
   * Joins an existing game session
   * @param {string} sessionId - The session ID to join
   * @param {string} playerName - The player's name
   * @returns {Promise<object>} Session information
   */
  async joinSession(sessionId, playerName) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to join session: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.sessionId = data.sessionId;
      this.playerId = data.playerId;
      
      return data;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }
  
  /**
   * Starts a game session
   * @param {string} sessionId - The session ID
   * @param {string} playerId - The player ID (must be host)
   * @returns {Promise<object>} Session information
   */
  async startGame(sessionId, playerId) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start game: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }
  
  /**
   * Gets the current state of a game session
   * @param {string} sessionId - The session ID
   * @returns {Promise<object>} Session state
   */
  async getSessionState(sessionId) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get session state: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting session state:', error);
      throw error;
    }
  }
  
  /**
   * Updates a player's state
   * @param {string} sessionId - The session ID
   * @param {string} playerId - The player ID
   * @param {object} state - The player state to update
   * @returns {Promise<object>} Update confirmation
   */
  async updatePlayerState(sessionId, playerId, state) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          playerId,
          ...state
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update player state: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating player state:', error);
      throw error;
    }
  }
  
  /**
   * Ends a game session
   * @param {string} sessionId - The session ID
   * @param {string} winnerId - The winner's player ID
   * @param {object} gameStats - Game statistics
   * @returns {Promise<object>} End game confirmation
   */
  async endGame(sessionId, winnerId, gameStats = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          winnerId,
          gameStats
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to end game: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  }
  
  /**
   * Gets a player's stats
   * @param {string} playerId - The player ID
   * @returns {Promise<object>} Player stats
   */
  async getPlayerStats(playerId) {
    try {
      const response = await fetch(`${this.apiUrl}/players/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get player stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting player stats:', error);
      throw error;
    }
  }
  
  /**
   * Connects to the WebSocket server
   * @returns {Promise<void>}
   */
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.websocketUrl);
        
        this.websocket.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };
        
        this.websocket.onclose = () => {
          console.log('WebSocket disconnected');
          this.websocket = null;
        };
        
        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnects from the WebSocket server
   */
  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
  
  /**
   * Joins a session via WebSocket
   * @param {string} sessionId - The session ID
   * @param {string} playerId - The player ID
   * @param {string} playerName - The player's name
   */
  joinSessionWebSocket(sessionId, playerId, playerName) {
    if (!this.websocket) {
      throw new Error('WebSocket not connected');
    }
    
    this.websocket.send(JSON.stringify({
      action: 'join',
      sessionId,
      data: {
        playerId,
        playerName
      }
    }));
  }
  
  /**
   * Updates player state via WebSocket
   * @param {string} sessionId - The session ID
   * @param {string} playerId - The player ID
   * @param {object} data - The player state data
   */
  updatePlayerStateWebSocket(sessionId, playerId, data) {
    if (!this.websocket) {
      return; // Silently fail if WebSocket is not connected
    }
    
    this.websocket.send(JSON.stringify({
      action: 'update',
      sessionId,
      data: {
        playerId,
        ...data
      }
    }));
  }
  
  /**
   * Leaves a session via WebSocket
   * @param {string} sessionId - The session ID
   * @param {string} playerId - The player ID
   */
  leaveSessionWebSocket(sessionId, playerId) {
    if (!this.websocket) {
      return; // Silently fail if WebSocket is not connected
    }
    
    this.websocket.send(JSON.stringify({
      action: 'leave',
      sessionId,
      data: {
        playerId
      }
    }));
  }
  
  /**
   * Registers a handler for WebSocket messages
   * @param {string} action - The action to handle
   * @param {function} handler - The handler function
   */
  onWebSocketMessage(action, handler) {
    this.messageHandlers.set(action, handler);
  }
  
  /**
   * Handles WebSocket messages
   * @param {object} message - The message object
   */
  handleWebSocketMessage(message) {
    const { action } = message;
    
    if (action && this.messageHandlers.has(action)) {
      this.messageHandlers.get(action)(message);
    }
  }
  
  /**
   * For local development/testing without a backend
   * Creates a simulated session
   * @param {string} playerName - The player's name
   * @returns {Promise<object>} Session information
   */
  simulateCreateSession(playerName) {
    return new Promise((resolve) => {
      // Generate random IDs
      const sessionId = Math.random().toString(36).substring(2, 15);
      const playerId = Math.random().toString(36).substring(2, 15);
      
      // Store session info
      this.sessionId = sessionId;
      this.playerId = playerId;
      
      // Simulate network delay
      setTimeout(() => {
        resolve({
          sessionId,
          playerId,
          playerName,
          isHost: true
        });
      }, 300);
    });
  }
}

// Export singleton instance
export default new ApiService();
