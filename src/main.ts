import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
      },
      consumer: {
        groupId: 'api-gateway-group', // Unique consumer group id
      },
    },
  });

  await app.listen();
  console.log('Consumer is listening to Kafka events...');
}
bootstrap();
