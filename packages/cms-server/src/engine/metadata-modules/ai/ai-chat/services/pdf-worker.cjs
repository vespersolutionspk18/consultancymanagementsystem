// PDF extraction worker - runs in separate process for memory isolation
// When this process exits, ALL its memory is freed by the OS

const fs = require('fs');
const log = (msg) => console.log(`[PDF-WORKER PID:${process.pid}] ${msg}`);

let PDFParser;

try {
  PDFParser = require('pdf2json');
  log('pdf2json loaded successfully');
} catch (err) {
  log(`FATAL: Failed to load pdf2json: ${err.message}`);
  if (process.send) {
    process.send({ type: 'error', error: `Failed to load pdf2json: ${err.message}` });
  }
  process.exit(1);
}

// Receive message from parent via IPC
process.on('message', async (message) => {
  log(`Received message type: ${message.type}`);

  if (message.type === 'extract_file') {
    // New mode: read from temp file (avoids IPC size limits)
    try {
      const filePath = message.filePath;
      log(`Reading PDF from temp file: ${filePath}`);

      const buffer = fs.readFileSync(filePath);
      log(`Read ${buffer.length} bytes from file`);

      const text = await extractPdf(buffer);

      log(`Extraction complete: ${text.length} characters. Sending to parent...`);

      // CRITICAL: Wait for message to be delivered before exiting!
      // process.send() is async - exiting immediately loses the message
      process.send({ type: 'success', text }, (err) => {
        if (err) {
          log(`Failed to send success message: ${err.message}`);
        } else {
          log(`Success message delivered to parent`);
        }
        process.exit(0);
      });
      return; // Don't exit yet, wait for callback
    } catch (error) {
      log(`ERROR: ${error.message}`);
      process.send({ type: 'error', error: error.message || 'Unknown error' }, () => {
        process.exit(1);
      });
      return;
    }
  }

  if (message.type === 'extract') {
    // Legacy mode: receive buffer via IPC (for small files)
    try {
      log(`Converting base64 to buffer (${message.buffer.length} chars)...`);
      const buffer = Buffer.from(message.buffer, 'base64');
      log(`Buffer size: ${buffer.length} bytes`);

      const text = await extractPdf(buffer);

      log(`Extraction complete: ${text.length} characters. Sending to parent...`);

      // CRITICAL: Wait for message to be delivered before exiting!
      process.send({ type: 'success', text }, (err) => {
        if (err) {
          log(`Failed to send success message: ${err.message}`);
        } else {
          log(`Success message delivered to parent`);
        }
        process.exit(0);
      });
      return;
    } catch (error) {
      log(`ERROR: ${error.message}`);
      process.send({ type: 'error', error: error.message || 'Unknown error' }, () => {
        process.exit(1);
      });
      return;
    }
  }
});

function extractPdf(buffer) {
  return new Promise((resolve, reject) => {
    log('Creating PDFParser instance...');
    const pdfParser = new PDFParser(null, 1); // 1 enables raw text mode

    const timeout = setTimeout(() => {
      log('PDF parsing timed out after 60 seconds');
      reject(new Error('PDF extraction timed out after 60 seconds'));
    }, 60000);

    pdfParser.on('pdfParser_dataReady', () => {
      log('pdfParser_dataReady event received');
      clearTimeout(timeout);
      try {
        const rawText = pdfParser.getRawTextContent() || '';
        log(`Got raw text: ${rawText.length} chars`);
        resolve(rawText);
      } catch (error) {
        log(`Error getting raw text: ${error.message}`);
        reject(error);
      }
    });

    pdfParser.on('pdfParser_dataError', (errData) => {
      log(`pdfParser_dataError: ${errData?.parserError?.message || 'Unknown error'}`);
      clearTimeout(timeout);
      reject(errData.parserError || new Error('PDF parsing failed'));
    });

    log('Calling parseBuffer...');
    pdfParser.parseBuffer(buffer);
    log('parseBuffer called, waiting for events...');
  });
}

// Signal ready
log('Worker starting, sending ready signal...');
if (process.send) {
  process.send({ type: 'ready' });
}
log('Ready signal sent, waiting for work...');
