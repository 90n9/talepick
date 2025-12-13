import { performHealthCheck, connectDB } from '@talepick/backend';

// Force Node.js runtime (Mongoose is not Edge-compatible)
export const runtime = 'nodejs';

// Ensure the endpoint is not cached
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ensure database connection is established
    await connectDB();

    const health = await performHealthCheck();

    // Determine overall health status
    const isHealthy = health.database.status === 'connected';
    const statusCode = isHealthy ? 200 : 503;

    return Response.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        ...health,
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'error',
          error: 'Failed to perform health check',
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
