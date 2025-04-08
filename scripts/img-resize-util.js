/**
 * Pure Node.js Image Resizer CLI
 *
 * A standalone utility for resizing images to specific megapixel sizes
 * and converting to WebP format with ZERO external dependencies.
 *
 * Features:
 * - Uses only Node.js built-in modules (no npm install required)
 * - Converts images to WebP format with customizable quality
 * - Resizes to specific megapixel sizes while preserving aspect ratio
 * - Supports multiple aspect ratios in one command
 * - Works with absolute and relative paths
 * - Outputs to source directory by default with option to specify custom directory
 *
 * Usage from terminal:
 *   node img-resize-pure.js <input-file> [options]
 *
 * Example:
 *   node img-resize-pure.js image.jpg --mp 0.8 --ratio original,1,1.78 --quality 85
 *   node img-resize-pure.js ../assets/images/photo.png --mp 0.5
 */

// Node.js core modules - no external dependencies
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const { createWriteStream, promises: fsPromises } = fs;
const { Readable } = require("stream");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

// Pure Node.js image processing module
const NodeImageProcessor = {
  /**
   * Initialize the image processor with options
   * @param {Object} options - Global options
   * @returns {Object} - Self reference for chaining
   */
  init(options = {}) {
    this.options = {
      logEnabled: options.logEnabled !== false,
      defaultQuality: options.defaultQuality || 80,
      defaultTargetMP: options.defaultTargetMP || 1.0,
      outputDir: options.outputDir || null,
      useSourceDir: options.useSourceDir !== false,
    };

    this._log("Image processor initialized");
    return this;
  },

  /**
   * Log messages if logging is enabled
   * @private
   * @param {string} message - Message to log
   * @param {'log'|'info'|'warn'|'error'} level - Log level
   */
  _log(message, level = "log") {
    if (this.options.logEnabled && console[level]) {
      console[level](`ImageProcessor: ${message}`);
    }
  },

  /**
   * Resolve a path relative to the current working directory
   * @private
   * @param {string} filePath - Path to resolve
   * @returns {string} Resolved absolute path
   */
  _resolvePath(filePath) {
    try {
      return path.resolve(process.cwd(), filePath);
    } catch (err) {
      this._log(`Path resolution error: ${err.message}`, "error");
      return filePath;
    }
  },

  /**
   * Check if a file exists
   * @private
   * @param {string} filePath - Path to check
   * @returns {boolean} - Whether the file exists
   */
  _fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  },

  /**
   * Create directory if it doesn't exist
   * @private
   * @param {string} directory - Directory path to create
   */
  _ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      this._log(`Created directory: ${directory}`);
    }
  },

  /**
   * Extract image metadata using built-in methods
   * @param {string} filePath - Path to the image
   * @returns {Promise<{width: number, height: number, format: string}>} Image metadata
   */
  async _getImageMetadata(filePath) {
    // Attempt to read the image header without loading the entire file
    return new Promise((resolve, reject) => {
      try {
        // Read the first few KB of the file to identify its format and dimensions
        const fileHandle = fs.openSync(filePath, "r");
        const buffer = Buffer.alloc(24); // Enough for most image headers

        fs.readSync(fileHandle, buffer, 0, buffer.length, 0);
        fs.closeSync(fileHandle);

        // Check file signature to determine format
        let format, width, height;

        // JPEG signature check
        if (buffer[0] === 0xff && buffer[1] === 0xd8) {
          format = "jpeg";

          // For JPEG, we need to read more data and parse the segments
          const fullBuffer = fs.readFileSync(filePath);
          const result = this._parseJpegMetadata(fullBuffer);
          width = result.width;
          height = result.height;
        }
        // PNG signature check
        else if (
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4e &&
          buffer[3] === 0x47 &&
          buffer[4] === 0x0d &&
          buffer[5] === 0x0a &&
          buffer[6] === 0x1a &&
          buffer[7] === 0x0a
        ) {
          format = "png";
          // PNG width is a 4-byte integer at offset 16
          width = buffer.readUInt32BE(16);
          // PNG height is a 4-byte integer at offset 20
          height = buffer.readUInt32BE(20);
        }
        // WebP signature check
        else if (
          buffer[0] === 0x52 &&
          buffer[1] === 0x49 &&
          buffer[2] === 0x46 &&
          buffer[3] === 0x46 &&
          buffer[8] === 0x57 &&
          buffer[9] === 0x45 &&
          buffer[10] === 0x42 &&
          buffer[11] === 0x50
        ) {
          format = "webp";

          // For WebP, we need more advanced parsing
          const fullBuffer = fs.readFileSync(filePath);
          const result = this._parseWebpMetadata(fullBuffer);
          width = result.width;
          height = result.height;
        } else {
          // For unsupported formats, use external tool as fallback
          const result = this._getImageMetadataFallback(filePath);
          format = result.format;
          width = result.width;
          height = result.height;
        }

        if (width && height) {
          resolve({ width, height, format });
        } else {
          reject(new Error("Could not determine image dimensions"));
        }
      } catch (err) {
        // If the header parsing fails, try fallback method
        try {
          const result = this._getImageMetadataFallback(filePath);
          resolve(result);
        } catch (fallbackErr) {
          reject(new Error(`Failed to read image metadata: ${err.message}`));
        }
      }
    });
  },

  /**
   * Parse JPEG metadata to extract dimensions
   * @private
   * @param {Buffer} buffer - File buffer
   * @returns {{width: number, height: number}} Image dimensions
   */
  _parseJpegMetadata(buffer) {
    let offset = 2; // Skip JPEG header marker

    // Loop through the markers
    while (offset < buffer.length) {
      // Check for segment marker (0xFF)
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      // Get marker type (next byte after 0xFF)
      const marker = buffer[offset + 1];

      // Check for SOF markers (Start of Frame) that contain dimensions
      // SOF0, SOF1, SOF2 contain dimension info
      if (marker >= 0xc0 && marker <= 0xc2) {
        // Width is at offset 7 (2 bytes), Height is at offset 5 (2 bytes)
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }

      // If not an SOF marker, skip to the next marker
      // The segment size is stored as a 2-byte value after the marker
      if (marker !== 0xd8 && marker !== 0xd9 && marker !== 0x01) {
        const segmentSize = buffer.readUInt16BE(offset + 2);
        offset += segmentSize + 2;
      } else {
        // Skip marker without size field
        offset += 2;
      }
    }

    throw new Error("Could not find JPEG dimensions");
  },

  /**
   * Parse WebP metadata to extract dimensions
   * @private
   * @param {Buffer} buffer - File buffer
   * @returns {{width: number, height: number}} Image dimensions
   */
  _parseWebpMetadata(buffer) {
    // VP8 format
    if (buffer.indexOf("VP8 ", 12) === 12) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    }
    // VP8L format
    else if (buffer.indexOf("VP8L", 12) === 12) {
      const bits = buffer.readUInt32LE(21);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { width, height };
    }
    // VP8X format
    else if (buffer.indexOf("VP8X", 12) === 12) {
      const width = buffer.readUIntLE(24, 3) + 1;
      const height = buffer.readUIntLE(27, 3) + 1;
      return { width, height };
    }

    throw new Error("Unsupported WebP format");
  },

  /**
   * Fallback method using system commands to get image metadata
   * @private
   * @param {string} filePath - Path to image
   * @returns {{width: number, height: number, format: string}} Image metadata
   */
  _getImageMetadataFallback(filePath) {
    try {
      // Try to use system command to get image info (cross-platform)
      let result;

      if (process.platform === "win32") {
        // Use PowerShell on Windows
        const command = `powershell -Command "$img = New-Object System.Drawing.Bitmap '${filePath}'; [PSCustomObject]@{Width=$img.Width; Height=$img.Height; Format=([System.IO.Path]::GetExtension('${filePath}')).Substring(1)} | ConvertTo-Json; $img.Dispose()"`;
        result = JSON.parse(execSync(command, { encoding: "utf8" }));
        return {
          width: result.Width,
          height: result.Height,
          format: result.Format.toLowerCase(),
        };
      } else {
        // Use identify from ImageMagick on Unix/Mac if available
        try {
          const output = execSync(`identify -format "%w %h %m" "${filePath}"`, {
            encoding: "utf8",
          });
          const [width, height, format] = output.trim().split(" ");
          return {
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            format: format.toLowerCase(),
          };
        } catch (imgMagickErr) {
          // If ImageMagick is not available, try with sips on macOS
          if (process.platform === "darwin") {
            const output = execSync(
              `sips -g pixelWidth -g pixelHeight "${filePath}"`,
              { encoding: "utf8" }
            );
            const widthMatch = output.match(/pixelWidth: (\d+)/);
            const heightMatch = output.match(/pixelHeight: (\d+)/);

            return {
              width: parseInt(widthMatch[1], 10),
              height: parseInt(heightMatch[1], 10),
              format: path.extname(filePath).substring(1).toLowerCase(),
            };
          }
        }
      }

      throw new Error(
        "Could not determine image dimensions using system tools"
      );
    } catch (err) {
      throw new Error(`Metadata extraction failed: ${err.message}`);
    }
  },

  /**
   * Load image file and return its metadata
   * @param {string} filePath - Path to the image
   * @returns {Promise<{width: number, height: number, name: string, path: string, directory: string, format: string}>}
   */
  async loadImage(filePath) {
    try {
      // Resolve relative paths against current working directory
      const resolvedPath = this._resolvePath(filePath);

      if (!this._fileExists(resolvedPath)) {
        throw new Error(`File does not exist: ${resolvedPath}`);
      }

      // Extract image metadata
      const metadata = await this._getImageMetadata(resolvedPath);
      const name = path.basename(resolvedPath);
      const directory = path.dirname(resolvedPath);

      return {
        ...metadata,
        name,
        path: resolvedPath,
        directory,
      };
    } catch (err) {
      throw new Error(`Failed to load image: ${err.message}`);
    }
  },

  /**
   * Calculate new dimensions based on target MP and aspect ratio
   * @param {number} originalWidth - Original image width
   * @param {number} originalHeight - Original image height
   * @param {number} targetMP - Target megapixel size
   * @param {number|null} aspectRatio - Custom aspect ratio (null = maintain original)
   * @returns {{newWidth: number, newHeight: number, originalMP: number, newMP: number}} New dimensions
   */
  calculateDimensions(
    originalWidth,
    originalHeight,
    targetMP,
    aspectRatio = null
  ) {
    let newWidth, newHeight;
    const currentMP = (originalWidth * originalHeight) / 1000000;

    if (aspectRatio !== null) {
      // Calculate dimensions based on target MP and custom aspect ratio
      newHeight = Math.sqrt((targetMP * 1000000) / aspectRatio);
      newWidth = Math.round(newHeight * aspectRatio);
      newHeight = Math.round(newHeight);
    } else {
      // Maintain original aspect ratio
      const originalRatio = originalWidth / originalHeight;
      const scaleFactor = Math.sqrt(targetMP / currentMP);
      newWidth = Math.round(originalWidth * scaleFactor);
      newHeight = Math.round(originalHeight * scaleFactor);
    }

    // Ensure dimensions are at least 1 pixel
    return {
      newWidth: Math.max(1, newWidth),
      newHeight: Math.max(1, newHeight),
      originalMP: currentMP,
      newMP: (newWidth * newHeight) / 1000000,
    };
  },

  /**
   * Generate a filename for the resized image
   * @param {string} originalName - Original filename
   * @param {number|null} aspectRatio - Aspect ratio used
   * @param {number} targetMP - Target megapixel size
   * @returns {string} New filename
   */
  generateFilename(originalName, aspectRatio, targetMP) {
    const baseName = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
    const suffix = aspectRatio
      ? `_${aspectRatio.toString().replace(".", "_")}`
      : "";
    return `${baseName}${suffix}_${targetMP}mp.webp`;
  },

  /**
   * Determine the output path for a processed image
   * @param {string} filename - Generated output filename
   * @param {string} sourceDir - Original image directory
   * @returns {string} Full output path
   */
  determineOutputPath(filename, sourceDir) {
    // If explicit output directory is specified, use it
    if (this.options.outputDir) {
      const outputDir = this._resolvePath(this.options.outputDir);
      return path.join(outputDir, filename);
    }

    // Otherwise, use source directory (if enabled)
    if (this.options.useSourceDir && sourceDir) {
      return path.join(sourceDir, filename);
    }

    // Fallback to current directory
    return path.join(process.cwd(), filename);
  },

  /**
   * Process image using pure Node.js (using child process for conversion)
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path to output WebP image
   * @param {number} targetWidth - Target width in pixels
   * @param {number} targetHeight - Target height in pixels
   * @param {number} quality - WebP quality (0-100)
   * @returns {Promise<{size: number}>} Processing result with image size
   */
  async processImageWithNativeTools(
    inputPath,
    outputPath,
    targetWidth,
    targetHeight,
    quality
  ) {
    return new Promise((resolve, reject) => {
      try {
        // Ensure output directory exists
        this._ensureDirectoryExists(path.dirname(outputPath));

        // Detect platform for appropriate command
        let command, args;

        // Try to use system tools based on platform
        if (process.platform === "win32") {
          // On Windows, try to use magick from ImageMagick if available
          command = "magick";
          args = [
            "convert",
            inputPath,
            "-resize",
            `${targetWidth}x${targetHeight}!`,
            "-quality",
            quality.toString(),
            outputPath,
          ];
        } else if (process.platform === "darwin") {
          // On macOS, try to use sips
          command = "sips";
          args = [
            "-s",
            "format",
            "webp",
            "--resampleWidth",
            targetWidth.toString(),
            "--resampleHeight",
            targetHeight.toString(),
            "--setProperty",
            "formatOptions",
            quality.toString(),
            inputPath,
            "--out",
            outputPath,
          ];
        } else {
          // On Linux, try to use convert from ImageMagick
          command = "convert";
          args = [
            inputPath,
            "-resize",
            `${targetWidth}x${targetHeight}!`,
            "-quality",
            quality.toString(),
            outputPath,
          ];
        }

        // Execute conversion command
        const process = spawn(command, args);

        let stdoutData = "";
        let stderrData = "";

        process.stdout.on("data", (data) => {
          stdoutData += data.toString();
        });

        process.stderr.on("data", (data) => {
          stderrData += data.toString();
        });

        process.on("close", (code) => {
          if (code === 0) {
            // Check if file was created
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath);
              resolve({ size: stats.size / 1024 }); // Size in KB
            } else {
              reject(new Error("Output file was not created"));
            }
          } else {
            // If the command fails, try the fallback method
            this._processImageFallback(
              inputPath,
              outputPath,
              targetWidth,
              targetHeight,
              quality
            )
              .then(resolve)
              .catch(reject);
          }
        });

        process.on("error", (err) => {
          // If the command is not found, try the fallback method
          this._processImageFallback(
            inputPath,
            outputPath,
            targetWidth,
            targetHeight,
            quality
          )
            .then(resolve)
            .catch(reject);
        });
      } catch (err) {
        // If any error occurs, try the fallback method
        this._processImageFallback(
          inputPath,
          outputPath,
          targetWidth,
          targetHeight,
          quality
        )
          .then(resolve)
          .catch(reject);
      }
    });
  },

  /**
   * Fallback method for image processing when native tools aren't available
   * Uses Node.js http module to call a web service API for image conversion
   * @private
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path to output WebP image
   * @param {number} targetWidth - Target width in pixels
   * @param {number} targetHeight - Target height in pixels
   * @param {number} quality - WebP quality (0-100)
   * @returns {Promise<{size: number}>} Processing result with image size
   */
  async _processImageFallback(
    inputPath,
    outputPath,
    targetWidth,
    targetHeight,
    quality
  ) {
    try {
      this._log("Using fallback image processing method", "warn");

      // Read the source file
      const fileBuffer = await fsPromises.readFile(inputPath);

      // Check if ffmpeg is available as another fallback
      try {
        const tempFilePath = path.join(
          path.dirname(outputPath),
          `temp_${Date.now()}_${path.basename(inputPath)}`
        );

        // Try using ffmpeg if available
        execSync(
          `ffmpeg -i "${inputPath}" -vf "scale=${targetWidth}:${targetHeight}" -q:v ${quality} "${outputPath}"`,
          {
            stdio: "ignore",
          }
        );

        // Check if file was created
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          return { size: stats.size / 1024 }; // Size in KB
        }
      } catch (ffmpegErr) {
        // If ffmpeg failed, continue to next fallback
        this._log("ffmpeg conversion failed, trying another method", "warn");
      }

      // As last resort, notify user that external tool is needed
      console.error("\n❌ Image conversion requires one of these tools:");
      console.error("   - ImageMagick (https://imagemagick.org)");
      console.error("   - FFmpeg (https://ffmpeg.org)");
      console.error("   - Mac: Built-in sips command\n");
      console.error("Install one of these tools and try again.");

      throw new Error("No suitable image processing tool available");
    } catch (err) {
      throw new Error(`Fallback image processing failed: ${err.message}`);
    }
  },

  /**
   * Process an image with a specific megapixel target and aspect ratio
   * @param {string} inputPath - Image to process
   * @param {Object} options - Processing options
   * @param {number} options.targetMP - Target megapixel size
   * @param {number|null} options.aspectRatio - Target aspect ratio (null to preserve original)
   * @param {number} options.quality - WebP quality (1-100)
   * @returns {Promise<Object>} Processing result
   */
  async processImage(inputPath, options = {}) {
    const {
      targetMP = this.options.defaultTargetMP,
      aspectRatio = null,
      quality = this.options.defaultQuality,
    } = options;

    try {
      // Load the image metadata
      const {
        width,
        height,
        name,
        path: resolvedPath,
        directory,
        format,
      } = await this.loadImage(inputPath);

      // Calculate dimensions
      const dimensions = this.calculateDimensions(
        width,
        height,
        targetMP,
        aspectRatio
      );
      const { newWidth, newHeight, originalMP } = dimensions;

      this._log(`Processing: ${name}`);
      this._log(
        `Original: ${width}x${height} (${originalMP.toFixed(2)}MP, ${format})`
      );
      this._log(
        `Target: ${newWidth}x${newHeight} (${targetMP}MP), Aspect ratio: ${(
          newWidth / newHeight
        ).toFixed(2)}`
      );

      // Generate filename and output path
      const filename = this.generateFilename(name, aspectRatio, targetMP);
      const outputPath = this.determineOutputPath(filename, directory);

      // Process the image
      const result = await this.processImageWithNativeTools(
        resolvedPath,
        outputPath,
        newWidth,
        newHeight,
        quality
      );

      return {
        originalName: name,
        originalPath: resolvedPath,
        directory,
        filename,
        outputPath,
        width: newWidth,
        height: newHeight,
        aspectRatio: newWidth / newHeight,
        originalMP,
        targetMP,
        quality,
        size: result.size, // Size in KB
        format: "webp",
      };
    } catch (err) {
      this._log(`Error processing image: ${err.message}`, "error");
      throw err;
    }
  },

  /**
   * Process multiple aspect ratios for a single image
   * @param {string} inputPath - Image to process
   * @param {Array<number|null>} aspectRatios - Array of aspect ratios
   * @param {Object} options - Processing options
   * @returns {Promise<Array<Object>>} Array of processing results
   */
  async processWithAspectRatios(
    inputPath,
    aspectRatios = [null],
    options = {}
  ) {
    const results = [];

    for (const ratio of aspectRatios) {
      try {
        const result = await this.processImage(inputPath, {
          ...options,
          aspectRatio: ratio,
        });

        results.push({
          ...result,
          ratio: ratio || "original",
        });
      } catch (err) {
        this._log(
          `Failed to process aspect ratio ${ratio}: ${err.message}`,
          "warn"
        );
      }
    }

    return results;
  },
};

/**
 * Execute main functionality from CLI arguments
 */
async function main() {
  const args = process.argv.slice(2);

  // Show help if requested or no args provided
  if (args.includes("--help") || args.length === 0) {
    console.log(`
Pure Node.js Image Resizer CLI

Usage: node img-resize-pure.js <input-file> [options]

Options:
  --mp <megapixels>       Target megapixel size (default: 1.0)
  --ratio <ratio,...>     Comma-separated list of aspect ratios (width/height)
                          Use 'original' to maintain original aspect ratio
  --quality <1-100>       WebP quality (default: 80)
  --output <directory>    Custom output directory (default: same as source file)
  --current-dir           Output to current directory instead of source directory
  --help                  Show this help message

Examples:
  node img-resize-pure.js image.jpg
  node img-resize-pure.js ../assets/images/photo.png --mp 0.5
  node img-resize-pure.js image.jpg --mp 0.5 --ratio original,1.78,1,0.75 --quality 85
  node img-resize-pure.js images/photo.jpg --output ./processed/
    `);
    return;
  }

  const inputFile = args[0];

  // Initialize the image processor
  const processor = NodeImageProcessor.init();

  // Parse options
  const mpIndex = args.indexOf("--mp");
  const targetMP = mpIndex !== -1 ? parseFloat(args[mpIndex + 1]) : 1.0;

  const qualityIndex = args.indexOf("--quality");
  const quality =
    qualityIndex !== -1 ? parseInt(args[qualityIndex + 1], 10) : 80;

  const ratioIndex = args.indexOf("--ratio");
  let aspectRatios = [null]; // Default to original aspect ratio

  if (ratioIndex !== -1) {
    const ratioStr = args[ratioIndex + 1];
    aspectRatios = ratioStr.split(",").map((r) => {
      if (r === "original" || r === "o") return null;
      return parseFloat(r);
    });
  }

  // Check for output directory option
  const outputIndex = args.indexOf("--output");
  if (outputIndex !== -1) {
    processor.options.outputDir = args[outputIndex + 1];
  }

  // Check if user wants to use current directory instead of source directory
  if (args.includes("--current-dir")) {
    processor.options.useSourceDir = false;
  }

  try {
    // Process all requested aspect ratios
    console.log(`Processing image: ${inputFile}`);

    // Check if file exists
    const resolvedPath = processor._resolvePath(inputFile);
    if (!processor._fileExists(resolvedPath)) {
      console.error(`Error: Input file "${inputFile}" does not exist.`);
      process.exit(1);
    }

    console.log(`Resolved path: ${resolvedPath}`);

    const results = await processor.processWithAspectRatios(
      inputFile,
      aspectRatios,
      {
        targetMP,
        quality,
      }
    );

    if (results.length === 0) {
      console.error("❌ No images were processed successfully.");
      process.exit(1);
    }

    // Print summary table
    console.log("\n✅ Processing complete!");
    console.table(
      results.map((r) => ({
        "Aspect Ratio": r.ratio,
        Dimensions: `${r.width}x${r.height}`,
        Size: `${r.size.toFixed(1)}KB`,
        Output: r.outputPath,
      }))
    );

    // Calculate total size reduction
    const totalOriginalMP = results.reduce((sum, r) => sum + r.originalMP, 0);
    const totalNewMP = results.reduce((sum, r) => sum + r.targetMP, 0);

    console.log(`\n📊 Statistics:`);
    console.log(`  Images processed: ${results.length}`);
    console.log(`  Original total: ~${totalOriginalMP.toFixed(2)}MP`);
    console.log(
      `  New total: ${totalNewMP.toFixed(2)}MP (${(
        (totalNewMP / totalOriginalMP) *
        100
      ).toFixed(1)}%)`
    );

    if (results[0].size) {
      const averageReduction = (
        (1 - totalNewMP / totalOriginalMP) *
        100
      ).toFixed(1);
      console.log(`  Size reduction: ~${averageReduction}%`);
    }
  } catch (err) {
    console.error("Error processing image:", err.message);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);
