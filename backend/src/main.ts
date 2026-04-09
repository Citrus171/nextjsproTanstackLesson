import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS（フロントエンドからのアクセスを許可）
  app.enableCors({ origin: 'http://localhost:5173' });

  // バリデーション有効化
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('NestJS + Swagger 学習用 Todo API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // UI: http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
  console.log('Swagger UI:   http://localhost:3000/api');
  console.log('OpenAPI JSON: http://localhost:3000/api-json');
}
bootstrap();
