/**
 * このスクリプトを実行すると openapi.json を出力します
 * 使い方: npm run export:openapi
 * 出力先: backend/openapi.json → frontend の codegen に使用
 */
import * as fs from "fs";
import * as path from "path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function exportOpenApi() {
  try {
    // Set dummy DATABASE_URL to allow Prisma adapter creation during OpenAPI export
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:pass@localhost:3306/db';
    // Set NODE_ENV to test to prevent actual connection
    process.env.NODE_ENV = 'test';
    const app = await NestFactory.create(AppModule, { logger: console });

    const config = new DocumentBuilder()
      .setTitle("Todo API")
      .setDescription("NestJS + Swagger 学習用 Todo API")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    console.log('Creating Swagger document...');
    const document = SwaggerModule.createDocument(app, config);
    console.log('Document created, writing to file...');
    const outputPath = path.resolve(__dirname, "../../frontend/openapi.json");
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log('File written, closing app...');
    await app.close();

    console.log(`OpenAPI spec exported to: ${outputPath}`);
  } catch (error) {
    console.error('Error exporting OpenAPI:', error);
    throw error;
  }
}

exportOpenApi();
