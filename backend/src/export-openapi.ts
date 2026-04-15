/**
 * このスクリプトを実行すると openapi.json を出力します
 * 使い方: npm run export:openapi
 * 出力先: backend/openapi.json → frontend の codegen に使用
 */
import * as fs from 'fs';
import * as path from 'path';

async function exportOpenApi() {
  // Temporarily disabled due to TypeORM removal
  const document = {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    paths: {},
  };

  const outputPath = path.resolve(__dirname, '../../frontend/openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI spec exported to: ${outputPath}`);
}

exportOpenApi();
