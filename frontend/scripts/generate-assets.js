const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { createCanvas } = require('canvas');

// Configuration
const config = {
  appName: 'Painai',
  backgroundColor: '#2563eb',
  textColor: '#ffffff',
  outputDir: path.resolve(__dirname, '../public'),
  iconSizes: [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512],
  appleIconSizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
  faviconSizes: [16, 32, 96],
  msTileSizes: [70, 144, 150, 310],
  splashScreens: [
    // iPhone 5/SE
    { width: 640, height: 1136, ratio: 2, orientation: 'portrait' },
    // iPhone 6/7/8
    { width: 750, height: 1334, ratio: 2, orientation: 'portrait' },
    // iPhone 6/7/8 Plus
    { width: 1242, height: 2208, ratio: 3, orientation: 'portrait' },
    // iPhone X/XS/11 Pro
    { width: 1125, height: 2436, ratio: 3, orientation: 'portrait' },
    // iPhone XR/11
    { width: 828, height: 1792, ratio: 2, orientation: 'portrait' },
    // iPhone XS Max/11 Pro Max
    { width: 1242, height: 2688, ratio: 3, orientation: 'portrait' },
    // iPad
    { width: 768, height: 1024, ratio: 2, orientation: 'portrait' },
    // iPad Pro 10.5"
    { width: 834, height: 1112, ratio: 2, orientation: 'portrait' },
    // iPad Pro 11"
    { width: 834, height: 1194, ratio: 2, orientation: 'portrait' },
    // iPad Pro 12.9"
    { width: 1024, height: 1366, ratio: 2, orientation: 'portrait' },
    // Landscape variations
    { width: 1136, height: 640, ratio: 2, orientation: 'landscape' },
    { width: 1334, height: 750, ratio: 2, orientation: 'landscape' },
    { width: 2208, height: 1242, ratio: 3, orientation: 'landscape' },
    { width: 2436, height: 1125, ratio: 3, orientation: 'landscape' },
    { width: 1792, height: 828, ratio: 2, orientation: 'landscape' },
    { width: 2688, height: 1242, ratio: 3, orientation: 'landscape' },
    { width: 1024, height: 768, ratio: 2, orientation: 'landscape' },
    { width: 1112, height: 834, ratio: 2, orientation: 'landscape' },
    { width: 1194, height: 834, ratio: 2, orientation: 'landscape' },
    { width: 1366, height: 1024, ratio: 2, orientation: 'landscape' }
  ]
};

// Create output directories
async function ensureDirectories() {
  const dirs = [
    path.join(config.outputDir, 'icons'),
    path.join(config.outputDir, 'favicons'),
    path.join(config.outputDir, 'mstile'),
    path.join(config.outputDir, 'splash')
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Generate a simple app icon with text
async function generateAppIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, size, size);
  
  // Draw text
  ctx.fillStyle = config.textColor;
  const fontSize = Math.round(size * 0.4);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Split text if needed
  const text = config.appName;
  const y = size / 2 - (text.length > 4 ? fontSize * 0.6 : 0);
  
  ctx.fillText(text, size / 2, y);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
}

// Generate splash screens
async function generateSplashScreen({ width, height, ratio, orientation }, outputPath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Calculate text size based on screen size
  const baseSize = Math.min(width, height);
  const fontSize = Math.round(baseSize * 0.1);
  const iconSize = Math.round(baseSize * 0.3);
  
  // Draw app name
  ctx.fillStyle = config.textColor;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Position text
  const textX = width / 2;
  const textY = height / 2 + iconSize / 2 + fontSize / 2;
  
  // Draw icon (simple circle with first letter)
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - fontSize, iconSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = config.textColor;
  ctx.fill();
  
  // Draw first letter in the circle
  ctx.fillStyle = config.backgroundColor;
  ctx.font = `bold ${Math.round(iconSize * 0.6)}px Arial`;
  ctx.fillText(config.appName[0], width / 2, height / 2 - fontSize);
  
  // Draw app name below the icon
  ctx.fillStyle = config.textColor;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(config.appName, textX, textY);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
}

// Generate all assets
async function generateAssets() {
  try {
    console.log('Generating PWA assets...');
    await ensureDirectories();
    
    // Generate app icons
    console.log('Generating app icons...');
    for (const size of [...new Set([...config.iconSizes, ...config.appleIconSizes])]) {
      const outputPath = path.join(
        config.outputDir, 
        size <= 32 ? 'favicons' : 'icons', 
        `icon-${size}x${size}.png`
      );
      await generateAppIcon(size, outputPath);
      console.log(`Generated icon: ${size}x${size}`);
    }
    
    // Generate favicon.ico with multiple sizes
    console.log('Generating favicon.ico...');
    const faviconSizes = config.faviconSizes.map(size => ({
      input: path.join(config.outputDir, 'favicons', `icon-${size}x${size}.png`),
      size: { width: size, height: size }
    }));
    
    await sharp({
      create: {
        width: 16,
        height: 16,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite(faviconSizes)
    .toFile(path.join(config.outputDir, 'favicon.ico'));
    
    // Generate Microsoft tiles
    console.log('Generating Microsoft tiles...');
    for (const size of config.msTileSizes) {
      const inputPath = path.join(config.outputDir, 'icons', `icon-${size}x${size}.png`);
      const outputPath = path.join(config.outputDir, 'mstile', `mstile-${size}x${size}.png`);
      
      // If we don't have an icon of this size, create one
      try {
        await fs.access(inputPath);
        await fs.copyFile(inputPath, outputPath);
      } catch (e) {
        await generateAppIcon(size, outputPath);
      }
      
      console.log(`Generated mstile: ${size}x${size}`);
    }
    
    // Generate splash screens
    console.log('Generating splash screens...');
    for (const screen of config.splashScreens) {
      const { width, height, orientation } = screen;
      const outputPath = path.join(
        config.outputDir,
        'splash',
        `splash-${width}x${height}@${screen.ratio}x-${orientation}.png`
      );
      
      await generateSplashScreen(screen, outputPath);
      console.log(`Generated splash screen: ${width}x${height} (${orientation})`);
    }
    
    console.log('\n✅ All PWA assets generated successfully!');
    console.log(`Output directory: ${config.outputDir}`);
    
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

// Run the generator
generateAssets();
