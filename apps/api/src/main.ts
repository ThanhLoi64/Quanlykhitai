import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .setTitle("Hệ thống quản lý khí tài")
  .setDescription("API quản lý khí tài")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup("api", app, document);
  

  app.enableCors();

  await app.listen(
  3000,
  "0.0.0.0" 
);
}

bootstrap();