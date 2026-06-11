import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.explicitDisconnect = false;
  }

  connect(token) {
    if (this.client && this.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    this.explicitDisconnect = false;

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => {
            return new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws');
          },
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log('WebSocket:', str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('✅ WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            resolve();
          },
          onStompError: (frame) => {
            console.error('WebSocket STOMP error:', frame);
            this.connected = false;
            reject(frame);
          },
          onWebSocketClose: () => {
            console.log('WebSocket disconnected');
            this.connected = false;
            if (!this.explicitDisconnect) {
              this.handleReconnect(token);
            }
          },
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
          },
        });

        this.client.activate();
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        if (!this.explicitDisconnect) {
          this.connect(token);
        }
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    this.explicitDisconnect = true;
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnected explicitly');
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log(`📨 Received message from ${destination}:`, data);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  publish(destination, message) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(message),
      });
      console.log(`📤 Published message to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error('Error publishing message:', error);
      return false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
