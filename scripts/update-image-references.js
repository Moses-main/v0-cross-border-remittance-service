const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const COMPONENTS_DIR = path.join(__dirname, '../components');
const PAGES_DIR = path.join(__dirname, '../app');

// Files to update with their relative paths from the project root
const FILES_TO_UPDATE = [
  'components/hero-section.tsx',
  'components/page-loader.tsx',
  // Add more files as needed
];

async function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = await readFile(fullPath, 'utf8');
    
    // Replace Next.js Image import with our OptimizedImage
    if (content.includes("from 'next/image'")) {
      content = content.replace(
        "from 'next/image'",
        "from '@/components/ui/optimized-image'"
      );
    } else if (content.includes('next/image')) {
      content = content.replace(
        'next/image',
        "@/components/ui/optimized-image"
      );
    }
    
    // Replace Image component with OptimizedImage
    content = content.replace(/<Image/g, '<OptimizedImage');
    
    // Save the updated file
    await writeFile(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

async function run() {
  try {
    console.log('Updating image references...');
    
    // Update specific files
    for (const file of FILES_TO_UPDATE) {
      await updateFile(file);
    }
    
    console.log('Image references updated successfully!');
  } catch (error) {
    console.error('Error updating image references:', error);
    process.exit(1);
  }
}

run();
