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
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle("Todo API")
    .setDescription("NestJS + Swagger 学習用 Todo API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.resolve(__dirname, "../../frontend/openapi.json");
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  await app.close();

  console.log(`OpenAPI spec exported to: ${outputPath}`);
}

exportOpenApi();
