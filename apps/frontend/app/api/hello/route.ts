import { NextRequest } from 'next/server';
import { HelloController } from '@talepick/backend';
import { HelloUseCase } from '@talepick/backend';

// Initialize dependencies
const helloUseCase = new HelloUseCase();
const helloController = new HelloController(helloUseCase);

export async function POST(request: NextRequest) {
  return helloController.handlePost(request);
}

// Optional: Add GET method for testing
export async function GET() {
  return Response.json(
    { message: 'Hello API endpoint. Use POST method to send a message.' },
    { status: 200 }
  );
}
