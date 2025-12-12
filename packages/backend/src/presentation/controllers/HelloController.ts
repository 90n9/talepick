import { NextRequest, NextResponse } from 'next/server';
import { HelloUseCase } from '../../application/use-cases/HelloUseCase';
import { HelloRequest } from '../../application/dto/HelloRequest';

export class HelloController {
  constructor(private helloUseCase: HelloUseCase) {}

  async handlePost(request: NextRequest): Promise<NextResponse> {
    try {
      const body = (await request.json()) as { message?: string };

      // Validate the request body
      if (!body.message || typeof body.message !== 'string') {
        return NextResponse.json(
          { error: 'Message field is required and must be a string' },
          { status: 400 }
        );
      }

      const helloRequest: HelloRequest = {
        message: body.message,
      };

      const result = await this.helloUseCase.execute(helloRequest);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('Error in HelloController:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
