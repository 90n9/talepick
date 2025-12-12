import { HelloRequest, HelloResponse } from '../dto/HelloRequest';

export class HelloUseCase {
  async execute(request: HelloRequest): Promise<HelloResponse> {
    // Simple business logic to process the hello request
    const greeting = 'hi';

    return {
      greeting,
      receivedMessage: request.message,
    };
  }
}
