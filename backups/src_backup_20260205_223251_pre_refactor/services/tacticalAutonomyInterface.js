// Tactical Action Autonomy Interface
// Handles incoming orders from external tactical systems

export class TacticalAutonomyInterface {
  constructor() {
    this.orderQueue = [];
    this.processingCallbacks = [];
    this.isListening = false;
  }

  // Register callback for when orders are received
  onOrderReceived(callback) {
    this.processingCallbacks.push(callback);
  }

  // Accept orders from tactical action autonomy systems
  acceptOrder(order) {
    const processedOrder = this.validateOrder(order);
    if (processedOrder) {
      this.orderQueue.push(processedOrder);
      this.notifyCallbacks(processedOrder);
      return { success: true, orderId: processedOrder.id };
    }
    return { success: false, error: "Invalid order format" };
  }

  // Validate incoming order structure
  validateOrder(order) {
    const requiredFields = ['squadronId', 'missionObjective', 'priority'];
    
    for (const field of requiredFields) {
      if (!order[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      squadronId: order.squadronId,
      missionObjective: order.missionObjective,
      priority: order.priority || 'medium',
      parameters: order.parameters || {},
      status: 'pending',
      source: order.source || 'tactical_autonomy'
    };
  }

  // Notify all registered callbacks
  notifyCallbacks(order) {
    this.processingCallbacks.forEach(callback => {
      try {
        callback(order);
      } catch (error) {
        console.error('Error in order processing callback:', error);
      }
    });
  }

  // Get pending orders for a specific squadron
  getOrdersForSquadron(squadronId) {
    return this.orderQueue.filter(order => 
      order.squadronId === squadronId && order.status === 'pending'
    );
  }

  // Update order status
  updateOrderStatus(orderId, status, result = null) {
    const orderIndex = this.orderQueue.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      this.orderQueue[orderIndex].status = status;
      this.orderQueue[orderIndex].lastUpdated = new Date().toISOString();
      if (result) {
        this.orderQueue[orderIndex].result = result;
      }
      return true;
    }
    return false;
  }

  // Clear completed orders
  clearCompletedOrders() {
    this.orderQueue = this.orderQueue.filter(order => 
      order.status !== 'completed' && order.status !== 'failed'
    );
  }

  // Get all orders with optional filtering
  getAllOrders(filters = {}) {
    let orders = [...this.orderQueue];
    
    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    if (filters.squadronId) {
      orders = orders.filter(order => order.squadronId === filters.squadronId);
    }
    
    if (filters.missionObjective) {
      orders = orders.filter(order => order.missionObjective === filters.missionObjective);
    }
    
    return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

// Singleton instance
export const tacticalInterface = new TacticalAutonomyInterface();

// Standard mission objectives
export const MISSION_OBJECTIVES = {
  RECONNAISSANCE: 'reconnaissance',
  TARGET_DESTRUCTION: 'target_destruction', 
  SURVEILLANCE: 'surveillance',
  ESCORT: 'escort',
  PATROL: 'patrol',
  INTERDICTION: 'interdiction',
  SEARCH_RESCUE: 'search_rescue',
  LOGISTICS_SUPPORT: 'logistics_support'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

export default tacticalInterface;