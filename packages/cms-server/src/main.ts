import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';

import bytes from 'bytes';
import { useContainer } from 'class-validator';
import session from 'express-session';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

import { NodeEnvironment } from 'src/engine/core-modules/cms-config/interfaces/node-environment.interface';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';

// Desktop app ready marker - Tauri sidecar looks for this
const CMS_SERVER_READY_MARKER = 'CMS_SERVER_READY';

// Check if we should embed the worker in the main process (for desktop app)
const shouldEmbedWorker = process.env.EMBED_WORKER === 'true';

const warmUpDatabase = async () => {
  const dbUrl = process.env.PG_DATABASE_URL;

  if (!dbUrl) {
    console.log('[warm-up] No PG_DATABASE_URL set, skipping database warm-up');

    return;
  }

  const { Client } = await import('pg');
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = new Client({
        connectionString: dbUrl,
        ssl:
          process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true'
            ? { rejectUnauthorized: false }
            : dbUrl.includes('sslmode=require')
              ? { rejectUnauthorized: false }
              : undefined,
        connectionTimeoutMillis: 30000,
        query_timeout: 30000,
      });

      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log(
        `[warm-up] Database connection established (attempt ${attempt}/${maxAttempts})`,
      );

      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      console.log(
        `[warm-up] Attempt ${attempt}/${maxAttempts} failed: ${message}`,
      );

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(
    '[warm-up] WARNING: Could not establish database connection after all attempts. Proceeding anyway...',
  );
};

const bootstrap = async () => {
  // Wake up the database before NestJS tries to connect (handles Neon auto-suspend)
  await warmUpDatabase();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
    ...(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });
  const logger = app.get(LoggerService);
  const cmsConfigService = app.get(CMSConfigService);

  app.use(session(getSessionStorageOptions(cmsConfigService)));

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new UnhandledExceptionFilter());

  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });

  // Graphql file upload
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  app.use(
    '/metadata',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  // Inject the server url in the frontend page
  generateFrontConfig();

  const port = cmsConfigService.get('NODE_PORT');

  await app.listen(port);

  // Embed worker in main process if configured (for desktop app)
  if (shouldEmbedWorker) {
    logger.log('Embedding worker in main process...');
    try {
      const { QueueWorkerModule } = await import(
        'src/queue-worker/queue-worker.module'
      );
      const workerApp = await NestFactory.createApplicationContext(
        QueueWorkerModule,
        {
          bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
        },
      );
      workerApp.useLogger(logger);
      logger.log('Worker embedded successfully');
    } catch (err) {
      logger.error('Failed to embed worker:', err);
    }
  }

  // Output ready marker for Tauri sidecar detection
  // This MUST be printed to stdout for the desktop app to detect server readiness
  console.log(CMS_SERVER_READY_MARKER);
  logger.log(`CMS server started on port ${port}`);

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

bootstrap();
