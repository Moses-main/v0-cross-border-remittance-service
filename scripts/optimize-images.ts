import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');

// Supported image formats
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

// Create optimized directory if it doesn't exist
async function ensureOptimizedDir() {
  try {
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
  }
}

// Check if file is an image
function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// Optimize a single image
async function optimizeImage(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  const outputPath = path.join(OPTIMIZED_DIR, `${filename}.webp`);
  
  // Skip if already optimized
  try {
    await fs.access(outputPath);
    console.log(`Skipping ${filePath} (already optimized)`);
    return;
  } catch {
    // File doesn't exist, continue with optimization
  }

  try {
    console.log(`Optimizing ${filePath}...`);
    
    if (ext === '.svg') {
      // For SVGs, just copy them as is
      await fs.copyFile(filePath, outputPath);
    } else {
      // For other images, convert to WebP with optimization
      await sharp(filePath)
        .webp({
          quality: 80,
          effort: 6,
        })
        .toFile(outputPath);
    }
    
    console.log(`Optimized ${filePath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
  }
}

// Recursively process directory for images
async function processDirectory(directory: string) {
  const files = await fs.readdir(directory);
  
  for (const file of files) {
    if (file === 'optimized') continue; // Skip the optimized directory
    
    const filePath = path.join(directory, file);
    const fileStat = await fs.stat(filePath);
    
    if (fileStat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file === 'node_modules' || file === '.next') {
        continue;
      }
      await processDirectory(filePath);
    } else if (isImageFile(file)) {
      await optimizeImage(filePath);
    }
  }
}

// Run the optimization
async function run() {
  try {
    console.log('Starting image optimization...');
    await ensureOptimizedDir();
    await processDirectory(PUBLIC_DIR);
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
}

run().catch(console.error);
