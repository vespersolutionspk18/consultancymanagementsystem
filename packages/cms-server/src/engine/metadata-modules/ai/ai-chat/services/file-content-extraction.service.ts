import { Injectable, Logger } from '@nestjs/common';
import { fork } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import mammoth from 'mammoth';
import type { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FileService } from 'src/engine/core-modules/file/services/file.service';

export interface ExtractedFileContent {
  filename: string;
  mimeType: string;
  content: string;
  chunks: string[];
  isImage: boolean;
  imageBase64?: string;
}

export interface FileExtractionResult {
  success: boolean;
  data?: ExtractedFileContent;
  error?: string;
}

// Chunk size for splitting large documents (approximately 4000 tokens worth of text)
const DEFAULT_CHUNK_SIZE = 16000; // characters
const DEFAULT_CHUNK_OVERLAP = 500; // characters - reduced to lower memory usage
const MAX_TEXT_LENGTH = 200000; // Max characters to process (prevents OOM)

@Injectable()
export class FileContentExtractionService {
  private readonly logger = new Logger(FileContentExtractionService.name);

  constructor(private readonly fileService: FileService) {}

  async extractFileContent(
    fullPath: string,
    workspaceId: string,
    mimeType?: string,
  ): Promise<FileExtractionResult> {
    try {
      const filename = this.extractFilename(fullPath);
      const folderPath = this.extractFolderPath(fullPath);
      const detectedMimeType = mimeType || this.detectMimeType(filename);

      this.logger.log(
        `Extracting content from ${filename} (${detectedMimeType})`,
      );

      // Handle images - return base64 for Gemini vision
      if (this.isImage(detectedMimeType)) {
        return this.extractImageContent(
          folderPath,
          filename,
          workspaceId,
          detectedMimeType,
        );
      }

      // Handle PDFs
      if (detectedMimeType === 'application/pdf') {
        return this.extractPdfContent(
          folderPath,
          filename,
          workspaceId,
          detectedMimeType,
        );
      }

      // Handle DOCX
      if (
        detectedMimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        filename.endsWith('.docx')
      ) {
        return this.extractDocxContent(
          folderPath,
          filename,
          workspaceId,
          detectedMimeType,
        );
      }

      // Handle plain text files
      if (this.isTextFile(detectedMimeType)) {
        return this.extractTextContent(
          folderPath,
          filename,
          workspaceId,
          detectedMimeType,
        );
      }

      return {
        success: false,
        error: `Unsupported file type: ${detectedMimeType}`,
      };
    } catch (error) {
      this.logger.error(`Failed to extract content from ${fullPath}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async extractMultipleFiles(
    files: Array<{ fullPath: string; mimeType?: string }>,
    workspaceId: string,
  ): Promise<Map<string, FileExtractionResult>> {
    const results = new Map<string, FileExtractionResult>();

    // Process files SEQUENTIALLY to avoid memory spikes
    for (const file of files) {
      const result = await this.extractFileContent(
        file.fullPath,
        workspaceId,
        file.mimeType,
      );
      results.set(file.fullPath, result);
    }

    return results;
  }

  private async extractPdfContent(
    folderPath: string,
    filename: string,
    workspaceId: string,
    mimeType: string,
  ): Promise<FileExtractionResult> {
    try {
      this.logger.log(`[PDF] Starting extraction for ${filename}`);
      this.logger.log(`[PDF] Step 1: Getting file buffer from storage...`);

      let fileBuffer: Buffer | null = await this.getFileBuffer(
        folderPath,
        filename,
        workspaceId,
      );

      this.logger.log(`[PDF] Step 2: Got buffer, size: ${fileBuffer.length} bytes`);
      this.logger.log(`[PDF] Step 3: Starting child process extraction...`);

      // Run PDF extraction in a SEPARATE child process for memory isolation
      let rawContent = await this.extractPdfInChildProcess(fileBuffer);

      // Release buffer immediately - no longer needed
      fileBuffer = null;

      this.logger.log(`[PDF] Step 4: Child process returned ${rawContent.length} characters`);

      // Truncate if too large to prevent OOM during chunking
      let content: string;

      if (rawContent.length > MAX_TEXT_LENGTH) {
        this.logger.warn(`[PDF] Text too large (${rawContent.length}), truncating to ${MAX_TEXT_LENGTH}`);
        content = rawContent.slice(0, MAX_TEXT_LENGTH);
        // Release original
        rawContent = '';
      } else {
        content = rawContent;
        rawContent = '';
      }

      this.logger.log(`[PDF] Step 5: Chunking ${content.length} characters...`);

      const chunks = this.chunkTextEfficient(content);

      // Release content after chunking
      content = '';

      this.logger.log(`[PDF] Step 6: Created ${chunks.length} chunks. DONE.`);

      return {
        success: true,
        data: {
          filename,
          mimeType,
          content: '',
          chunks,
          isImage: false,
        },
      };
    } catch (error) {
      this.logger.error(`[PDF] FAILED to extract PDF content:`, error);

      return {
        success: false,
        error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Extracts PDF text in a SEPARATE child process.
   * Uses temp file to avoid IPC size limits for large PDFs.
   * When the child process exits, the OS frees ALL its memory immediately.
   */
  private async extractPdfInChildProcess(buffer: Buffer): Promise<string> {
    // Write buffer to temp file to avoid IPC size limits
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `pdf-extract-${uuidv4()}.pdf`);

    this.logger.log(`[FORK] Writing ${buffer.length} bytes to temp file: ${tempFilePath}`);

    try {
      fs.writeFileSync(tempFilePath, buffer);
      this.logger.log(`[FORK] Temp file written successfully`);
    } catch (writeError) {
      this.logger.error(`[FORK] Failed to write temp file:`, writeError);
      throw new Error(`Failed to write temp file: ${writeError instanceof Error ? writeError.message : 'Unknown'}`);
    }

    try {
      const result = await this.runPdfWorker(tempFilePath);

      return result;
    } finally {
      // Always clean up temp file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          this.logger.log(`[FORK] Temp file deleted`);
        }
      } catch (deleteError) {
        this.logger.warn(`[FORK] Failed to delete temp file: ${deleteError}`);
      }
    }
  }

  private runPdfWorker(tempFilePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Try multiple paths to find the worker file
      const possiblePaths = [
        path.join(__dirname, 'pdf-worker.cjs'),
        path.resolve(process.cwd(), 'dist/engine/metadata-modules/ai/ai-chat/services/pdf-worker.cjs'),
        path.resolve(process.cwd(), 'packages/cms-server/dist/engine/metadata-modules/ai/ai-chat/services/pdf-worker.cjs'),
      ];

      let workerPath = '';

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          workerPath = p;
          break;
        }
      }

      if (!workerPath) {
        this.logger.error(`[FORK] Worker not found. __dirname=${__dirname}, cwd=${process.cwd()}`);
        reject(new Error(`PDF worker file not found`));

        return;
      }

      this.logger.log(`[FORK] Worker path: ${workerPath}`);

      let child;

      try {
        child = fork(workerPath, [], {
          execArgv: [],
          // Limit child process memory to 1.5GB
          env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=1536',
          },
        });
        this.logger.log(`[FORK] Child spawned, PID: ${child.pid}`);
      } catch (forkError) {
        this.logger.error(`[FORK] Fork failed:`, forkError);
        reject(new Error(`Failed to fork: ${forkError instanceof Error ? forkError.message : 'Unknown'}`));

        return;
      }

      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          this.logger.error(`[FORK] Timeout after 120 seconds`);
          resolved = true;
          child.kill('SIGKILL');
          reject(new Error('PDF extraction timed out after 120 seconds'));
        }
      }, 120000);

      child.on('message', (message: { type: string; text?: string; error?: string }) => {
        this.logger.log(`[FORK] Message: ${message.type}`);

        if (message.type === 'ready') {
          this.logger.log(`[FORK] Sending file path to worker...`);
          child.send({ type: 'extract_file', filePath: tempFilePath });
        } else if (message.type === 'success' && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.logger.log(`[FORK] SUCCESS: ${message.text?.length || 0} chars`);
          resolve(message.text || '');
        } else if (message.type === 'error' && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.logger.error(`[FORK] Worker error: ${message.error}`);
          reject(new Error(message.error || 'PDF worker failed'));
        }
      });

      child.on('error', (error) => {
        this.logger.error(`[FORK] Child error:`, error);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(new Error(`PDF worker error: ${error.message}`));
        }
      });

      child.on('exit', (code, signal) => {
        this.logger.log(`[FORK] Child exited: code=${code}, signal=${signal}`);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (code !== 0) {
            reject(new Error(`PDF worker crashed with code ${code}`));
          }
        }
      });
    });
  }

  private async extractDocxContent(
    folderPath: string,
    filename: string,
    workspaceId: string,
    mimeType: string,
  ): Promise<FileExtractionResult> {
    try {
      let fileBuffer: Buffer | null = await this.getFileBuffer(
        folderPath,
        filename,
        workspaceId,
      );
      const result = await mammoth.extractRawText({ buffer: fileBuffer });

      // Release buffer immediately
      fileBuffer = null;

      const content = result.value;
      const chunks = this.chunkText(content);

      this.logger.log(
        `Extracted ${content.length} characters from DOCX`,
      );

      return {
        success: true,
        data: {
          filename,
          mimeType,
          content: '', // Don't duplicate
          chunks,
          isImage: false,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to extract DOCX content:`, error);

      return {
        success: false,
        error: `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async extractTextContent(
    folderPath: string,
    filename: string,
    workspaceId: string,
    mimeType: string,
  ): Promise<FileExtractionResult> {
    try {
      let fileBuffer: Buffer | null = await this.getFileBuffer(
        folderPath,
        filename,
        workspaceId,
      );
      const content = fileBuffer.toString('utf-8');

      // Release buffer
      fileBuffer = null;

      const chunks = this.chunkText(content);

      this.logger.log(
        `Extracted ${content.length} characters from text file`,
      );

      return {
        success: true,
        data: {
          filename,
          mimeType,
          content: '', // Don't duplicate
          chunks,
          isImage: false,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to extract text content:`, error);

      return {
        success: false,
        error: `Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async extractImageContent(
    folderPath: string,
    filename: string,
    workspaceId: string,
    mimeType: string,
  ): Promise<FileExtractionResult> {
    try {
      let fileBuffer: Buffer | null = await this.getFileBuffer(
        folderPath,
        filename,
        workspaceId,
      );
      const base64 = fileBuffer.toString('base64');

      // Release buffer
      fileBuffer = null;

      this.logger.log(
        `Extracted image ${filename} as base64 (${base64.length} chars)`,
      );

      return {
        success: true,
        data: {
          filename,
          mimeType,
          content: '',
          chunks: [],
          isImage: true,
          imageBase64: base64,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to extract image content:`, error);

      return {
        success: false,
        error: `Failed to read image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async getFileBuffer(
    folderPath: string,
    filename: string,
    workspaceId: string,
  ): Promise<Buffer> {
    this.logger.log(`[GET_BUFFER] Getting stream for ${folderPath}/${filename}`);

    // Add timeout for getting file stream
    const streamPromise = this.fileService.getFileStream(
      folderPath,
      filename,
      workspaceId,
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout getting file stream for ${filename}`)), 30000);
    });

    const stream = await Promise.race([streamPromise, timeoutPromise]);

    this.logger.log(`[GET_BUFFER] Got stream, converting to buffer...`);

    // Add timeout for stream to buffer conversion
    const bufferPromise = this.streamToBuffer(stream);
    const bufferTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout reading file buffer for ${filename}`)), 60000);
    });

    const buffer = await Promise.race([bufferPromise, bufferTimeoutPromise]);

    this.logger.log(`[GET_BUFFER] Got buffer: ${buffer.length} bytes`);

    return buffer;
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Memory-efficient text chunking.
   * Limits chunks and avoids excessive substring operations.
   */
  private chunkTextEfficient(
    text: string,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    overlap: number = DEFAULT_CHUNK_OVERLAP,
  ): string[] {
    const maxChunks = 15; // Limit chunks to prevent memory issues

    if (!text || text.length === 0) {
      return [];
    }

    if (text.length <= chunkSize) {
      return [text.trim()].filter(c => c.length > 0);
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length && chunks.length < maxChunks) {
      let endIndex = Math.min(startIndex + chunkSize, text.length);

      // Simple boundary detection - just find last period or newline
      if (endIndex < text.length) {
        // Look back up to 500 chars for a break point
        const lookback = Math.min(500, endIndex - startIndex);
        let breakPoint = -1;

        for (let i = endIndex - 1; i >= endIndex - lookback; i--) {
          const char = text[i];

          if (char === '\n' || (char === '.' && i + 1 < text.length && text[i + 1] === ' ')) {
            breakPoint = i + 1;
            break;
          }
        }

        if (breakPoint > startIndex) {
          endIndex = breakPoint;
        }
      }

      const chunk = text.slice(startIndex, endIndex).trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move forward, with minimal overlap to save memory
      const newStart = endIndex - Math.min(overlap, 200);

      if (newStart <= startIndex) {
        startIndex = endIndex; // Prevent infinite loop
      } else {
        startIndex = newStart;
      }
    }

    if (chunks.length >= maxChunks && startIndex < text.length) {
      this.logger.warn(`[CHUNK] Truncated to ${maxChunks} chunks, ${text.length - startIndex} chars remaining`);
    }

    return chunks;
  }

  private chunkText(
    text: string,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    overlap: number = DEFAULT_CHUNK_OVERLAP,
  ): string[] {
    // Use the efficient version
    return this.chunkTextEfficient(text, chunkSize, overlap);
  }

  private extractFilename(fullPath: string): string {
    const parts = fullPath.split('/');

    return parts[parts.length - 1];
  }

  private extractFolderPath(fullPath: string): string {
    const parts = fullPath.split('/');
    parts.pop(); // Remove filename

    return parts.join('/');
  }

  private detectMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      htm: 'text/html',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private isTextFile(mimeType: string): boolean {
    return (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml'
    );
  }

  // Build context string for AI from extracted files
  buildContextFromExtractedFiles(
    extractedFiles: Map<string, FileExtractionResult>,
    maxContextLength: number = 100000,
  ): {
    textContext: string;
    images: Array<{ filename: string; mimeType: string; base64: string }>;
  } {
    const textParts: string[] = [];
    const images: Array<{ filename: string; mimeType: string; base64: string }> =
      [];
    let currentLength = 0;

    for (const [_path, result] of extractedFiles) {
      if (!result.success || !result.data) {
        continue;
      }

      if (result.data.isImage && result.data.imageBase64) {
        images.push({
          filename: result.data.filename,
          mimeType: result.data.mimeType,
          base64: result.data.imageBase64,
        });
      } else {
        const fileHeader = `\n--- File: ${result.data.filename} ---\n`;

        // Use chunks if content is too large
        for (const chunk of result.data.chunks) {
          if (currentLength + chunk.length + fileHeader.length > maxContextLength) {
            break;
          }

          if (textParts.length === 0 || !textParts[textParts.length - 1].includes(result.data.filename)) {
            textParts.push(fileHeader);
            currentLength += fileHeader.length;
          }

          textParts.push(chunk);
          currentLength += chunk.length;
        }
      }
    }

    return {
      textContext: textParts.join('\n'),
      images,
    };
  }
}
