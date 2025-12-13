import mongoose from 'mongoose';

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  host?: string;
  port?: number;
  name?: string;
  responseTime?: number;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();

  try {
    const state = mongoose.connection.readyState;
    let status: DatabaseHealth['status'];

    switch (state) {
      case 1: // connected
        status = 'connected';
        break;
      case 2: // connecting
        status = 'connecting';
        break;
      case 3: // disconnecting
        status = 'disconnected';
        break;
      default:
        status = 'disconnected';
    }

    const responseTime = Date.now() - startTime;

    if (status === 'connected' && mongoose.connection.db) {
      return {
        status,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        responseTime,
      };
    }

    return {
      status,
      responseTime,
    };
  } catch {
    return {
      status: 'error',
      responseTime: Date.now() - startTime,
    };
  }
}

export async function performHealthCheck(): Promise<{
  database: DatabaseHealth;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}> {
  const [databaseHealth] = await Promise.all([getDatabaseHealth()]);

  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;

  return {
    database: databaseHealth,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round((usedMem / totalMem) * 100),
    },
  };
}
