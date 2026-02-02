import { createContext, useContext, useState } from 'react';

const TicketContext = createContext(null);

// Initial mock tickets
const initialTickets = [
  {
    id: 'TKT-001',
    assetId: 'ASSET-PC-101',
    callType: 'Hardware Issue',
    problemDescription: 'Monitor not displaying properly, flickering screen',
    location: 'Building A, Floor 2, Room 201',
    raisedBy: 'EMP004',
    raisedByName: 'Mike Smith',
    status: 'raised',
    severity: null,
    assignedTo: null,
    assignedToName: null,
    actionLogs: [],
    reassignRequest: null,
    timestamps: {
      raised: '2026-02-01T09:30:00',
      assigned: null,
      inProgress: null,
      resolved: null,
    },
  },
  {
    id: 'TKT-002',
    assetId: 'ASSET-PR-045',
    callType: 'Network Issue',
    problemDescription: 'Unable to connect to network printer',
    location: 'Building B, Floor 1, Room 105',
    raisedBy: 'EMP005',
    raisedByName: 'Sarah Johnson',
    status: 'assigned',
    severity: 2,
    assignedTo: 'EMP002',
    assignedToName: 'John Engineer',
    actionLogs: [],
    reassignRequest: null,
    timestamps: {
      raised: '2026-02-01T10:15:00',
      assigned: '2026-02-01T11:00:00',
      inProgress: null,
      resolved: null,
    },
  },
  {
    id: 'TKT-003',
    assetId: 'ASSET-SRV-002',
    callType: 'Software Issue',
    problemDescription: 'Email client crashing on startup',
    location: 'Building A, Floor 3, Room 302',
    raisedBy: 'EMP004',
    raisedByName: 'Mike Smith',
    status: 'inProgress',
    severity: 1,
    assignedTo: 'EMP003',
    assignedToName: 'Jane Engineer',
    actionLogs: [
      {
        id: 'LOG-001',
        description: 'Initiated remote diagnostic session',
        timestamp: '2026-02-01T14:30:00',
        engineerId: 'EMP003',
        engineerName: 'Jane Engineer',
      },
    ],
    reassignRequest: null,
    timestamps: {
      raised: '2026-02-01T08:00:00',
      assigned: '2026-02-01T08:45:00',
      inProgress: '2026-02-01T14:30:00',
      resolved: null,
    },
  },
];

// Initial notifications
const initialNotifications = [
  {
    id: 'NOTIF-001',
    type: 'new_ticket',
    title: 'New Ticket Raised',
    message: 'TKT-001: Monitor not displaying properly - Mike Smith',
    ticketId: 'TKT-001',
    forRole: 'admin',
    forUserId: null,
    timestamp: '2026-02-01T09:30:00',
    read: false,
  },
  {
    id: 'NOTIF-002',
    type: 'assigned',
    title: 'Ticket Assigned to You',
    message: 'TKT-002: Network printer issue has been assigned to you',
    ticketId: 'TKT-002',
    forRole: null,
    forUserId: 'EMP002',
    timestamp: '2026-02-01T11:00:00',
    read: false,
  },
  {
    id: 'NOTIF-003',
    type: 'severity_high',
    title: 'Critical Ticket',
    message: 'TKT-003: Email client issue marked as Critical severity',
    ticketId: 'TKT-003',
    forRole: 'admin',
    forUserId: null,
    timestamp: '2026-02-01T08:45:00',
    read: true,
  },
];

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [notifications, setNotifications] = useState(initialNotifications);

  const generateTicketId = () => {
    const maxId = tickets.reduce((max, ticket) => {
      const num = parseInt(ticket.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `TKT-${String(maxId + 1).padStart(3, '0')}`;
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const createTicket = (ticketData, user) => {
    const newTicket = {
      id: generateTicketId(),
      assetId: ticketData.assetId,
      callType: ticketData.callType,
      problemDescription: ticketData.problemDescription,
      location: ticketData.location,
      raisedBy: user.id,
      raisedByName: user.name,
      status: 'raised',
      severity: null,
      assignedTo: null,
      assignedToName: null,
      actionLogs: [],
      reassignRequest: null,
      timestamps: {
        raised: new Date().toISOString(),
        assigned: null,
        inProgress: null,
        resolved: null,
      },
    };
    setTickets([...tickets, newTicket]);
    
    // Add notification for admin
    addNotification({
      type: 'new_ticket',
      title: 'New Ticket Raised',
      message: `${newTicket.id}: ${ticketData.problemDescription.substring(0, 50)}... - ${user.name}`,
      ticketId: newTicket.id,
      forRole: 'admin',
      forUserId: null,
    });
    
    return newTicket;
  };

  const assignTicket = (ticketId, engineerId, engineerName, severity) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            assignedTo: engineerId,
            assignedToName: engineerName,
            severity: severity,
            status: 'assigned',
            reassignRequest: null,
            timestamps: {
              ...ticket.timestamps,
              assigned: new Date().toISOString(),
            },
          };
        }
        return ticket;
      })
    );
    
    // Notify the engineer
    addNotification({
      type: 'assigned',
      title: 'Ticket Assigned to You',
      message: `${ticketId} has been assigned to you with ${severity === 1 ? 'Critical' : severity === 2 ? 'High' : 'Medium'} severity`,
      ticketId: ticketId,
      forRole: null,
      forUserId: engineerId,
    });
    
    // Notify admin if high severity
    if (severity === 1) {
      addNotification({
        type: 'severity_high',
        title: 'Critical Ticket Assigned',
        message: `${ticketId} assigned to ${engineerName} with Critical severity`,
        ticketId: ticketId,
        forRole: 'admin',
        forUserId: null,
      });
    }
  };

  const startProgress = (ticketId) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId && ticket.status === 'assigned') {
          return {
            ...ticket,
            status: 'inProgress',
            timestamps: {
              ...ticket.timestamps,
              inProgress: new Date().toISOString(),
            },
          };
        }
        return ticket;
      })
    );
  };

  const addActionLog = (ticketId, description, engineer) => {
    const logId = `LOG-${Date.now()}`;
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newLog = {
            id: logId,
            description,
            timestamp: new Date().toISOString(),
            engineerId: engineer.id,
            engineerName: engineer.name,
          };
          
          // If this is the first action log and status is 'assigned', move to 'inProgress'
          const newStatus = ticket.status === 'assigned' ? 'inProgress' : ticket.status;
          const newTimestamps = ticket.status === 'assigned' 
            ? { ...ticket.timestamps, inProgress: new Date().toISOString() }
            : ticket.timestamps;
          
          return {
            ...ticket,
            status: newStatus,
            timestamps: newTimestamps,
            actionLogs: [...ticket.actionLogs, newLog],
          };
        }
        return ticket;
      })
    );
  };

  const resolveTicket = (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };
    if (ticket.actionLogs.length === 0) {
      return {
        success: false,
        error: 'Cannot resolve ticket without at least one action log entry',
      };
    }
    setTickets(
      tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'resolved',
            timestamps: {
              ...t.timestamps,
              resolved: new Date().toISOString(),
            },
          };
        }
        return t;
      })
    );
    return { success: true };
  };

  // Request reassignment
  const requestReassign = (ticketId, reason, engineer) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            reassignRequest: {
              requestedBy: engineer.id,
              requestedByName: engineer.name,
              reason: reason,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return ticket;
      })
    );
    
    // Notify admin
    addNotification({
      type: 'reassign_request',
      title: 'Reassignment Requested',
      message: `${engineer.name} requests reassignment of ${ticketId}: ${reason.substring(0, 50)}...`,
      ticketId: ticketId,
      forRole: 'admin',
      forUserId: null,
    });
    
    return { success: true };
  };

  // Get notifications for a user
  const getNotifications = (userId, role) => {
    return notifications.filter((n) => {
      if (n.forUserId === userId) return true;
      if (n.forRole === role) return true;
      return false;
    });
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Clear all notifications for user
  const clearNotifications = (userId) => {
    setNotifications(
      notifications.filter((n) => n.forUserId !== userId && n.forRole !== 'admin')
    );
  };

  // Get unread notification count
  const getUnreadCount = (userId, role) => {
    return getNotifications(userId, role).filter((n) => !n.read).length;
  };

  // Get tickets with reassign requests
  const getReassignRequests = () => {
    return tickets.filter((t) => t.reassignRequest !== null);
  };

  // Handle reassignment by admin
  const handleReassign = (ticketId, newEngineerId, newEngineerName) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };
    
    const oldEngineerName = ticket.assignedToName;
    
    setTickets(
      tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            assignedTo: newEngineerId,
            assignedToName: newEngineerName,
            reassignRequest: null,
            actionLogs: [
              ...t.actionLogs,
              {
                id: `LOG-${Date.now()}`,
                description: `Ticket reassigned from ${oldEngineerName} to ${newEngineerName}`,
                timestamp: new Date().toISOString(),
                engineerId: 'SYSTEM',
                engineerName: 'System',
              },
            ],
          };
        }
        return t;
      })
    );
    
    // Notify the new engineer
    addNotification({
      type: 'assigned',
      title: 'Ticket Reassigned to You',
      message: `${ticketId} has been reassigned to you from ${oldEngineerName}`,
      ticketId: ticketId,
      forRole: null,
      forUserId: newEngineerId,
    });
    
    // Notify the old engineer
    addNotification({
      type: 'reassigned',
      title: 'Ticket Reassigned',
      message: `${ticketId} has been reassigned to ${newEngineerName} as per your request`,
      ticketId: ticketId,
      forRole: null,
      forUserId: ticket.assignedTo,
    });
    
    return { success: true };
  };

  const getTicketsByUser = (userId) => {
    return tickets.filter((ticket) => ticket.raisedBy === userId);
  };

  const getTicketsByEngineer = (engineerId) => {
    return tickets.filter(
      (ticket) => ticket.assignedTo === engineerId && ticket.status !== 'resolved'
    );
  };

  const getUnassignedTickets = () => {
    return tickets.filter((ticket) => ticket.status === 'raised');
  };

  const getActiveTickets = () => {
    return tickets.filter(
      (ticket) => ticket.status === 'assigned' || ticket.status === 'inProgress'
    );
  };

  const getEngineerWorkload = () => {
    const workload = {};
    tickets.forEach((ticket) => {
      if (ticket.assignedTo && ticket.status !== 'resolved') {
        if (!workload[ticket.assignedTo]) {
          workload[ticket.assignedTo] = {
            name: ticket.assignedToName,
            count: 0,
          };
        }
        workload[ticket.assignedTo].count++;
      }
    });
    return workload;
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        notifications,
        createTicket,
        assignTicket,
        startProgress,
        addActionLog,
        resolveTicket,
        requestReassign,
        handleReassign,
        getTicketsByUser,
        getTicketsByEngineer,
        getUnassignedTickets,
        getActiveTickets,
        getEngineerWorkload,
        getNotifications,
        markNotificationRead,
        clearNotifications,
        getUnreadCount,
        getReassignRequests,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
