const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = path.join(
  __dirname,
  'src',
  'assets',
  'images',
  'auron-logo.png',
);

// Android icon sizes
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

// iOS icon sizes (for AppIcon.appiconset)
const iosSizes = [
  { size: 20, scale: 1, idiom: 'iphone', filename: 'Icon-20.png' },
  { size: 20, scale: 2, idiom: 'iphone', filename: 'Icon-20@2x.png' },
  { size: 20, scale: 3, idiom: 'iphone', filename: 'Icon-20@3x.png' },
  { size: 29, scale: 1, idiom: 'iphone', filename: 'Icon-29.png' },
  { size: 29, scale: 2, idiom: 'iphone', filename: 'Icon-29@2x.png' },
  { size: 29, scale: 3, idiom: 'iphone', filename: 'Icon-29@3x.png' },
  { size: 40, scale: 2, idiom: 'iphone', filename: 'Icon-40@2x.png' },
  { size: 40, scale: 3, idiom: 'iphone', filename: 'Icon-40@3x.png' },
  { size: 60, scale: 2, idiom: 'iphone', filename: 'Icon-60@2x.png' },
  { size: 60, scale: 3, idiom: 'iphone', filename: 'Icon-60@3x.png' },
  { size: 1024, scale: 1, idiom: 'ios-marketing', filename: 'Icon-1024.png' },
];

async function generateAndroidIcons() {
  console.log('🤖 Generating Android icons...');

  for (const { size, folder } of androidSizes) {
    const outputDir = path.join(
      __dirname,
      'android',
      'app',
      'src',
      'main',
      'res',
      folder,
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate ic_launcher.png
    await sharp(inputImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(outputDir, 'ic_launcher.png'));

    // Generate ic_launcher_round.png
    await sharp(inputImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(outputDir, 'ic_launcher_round.png'));

    console.log(`✓ Generated ${folder} icons (${size}x${size})`);
  }

  console.log('✅ Android icons generated successfully!');
}

async function generateIOSIcons() {
  console.log('🍎 Generating iOS icons...');

  const outputDir = path.join(
    __dirname,
    'ios',
    'auron',
    'Images.xcassets',
    'AppIcon.appiconset',
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const contentsJson = {
    images: [],
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  for (const { size, scale, idiom, filename } of iosSizes) {
    const actualSize = size * scale;

    await sharp(inputImage)
      .resize(actualSize, actualSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(outputDir, filename));

    contentsJson.images.push({
      filename: filename,
      idiom: idiom,
      scale: `${scale}x`,
      size: `${size}x${size}`,
    });

    console.log(`✓ Generated ${filename} (${actualSize}x${actualSize})`);
  }

  // Write Contents.json
  fs.writeFileSync(
    path.join(outputDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2),
  );

  console.log('✅ iOS icons generated successfully!');
}

async function main() {
  try {
    console.log('🎨 Starting app icon generation...\n');
    console.log(`📁 Source image: ${inputImage}\n`);

    await generateAndroidIcons();
    console.log('');
    await generateIOSIcons();

    console.log('\n🎉 All app icons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. For Android: Icons are ready to use');
    console.log(
      '   2. For iOS: Open Xcode and verify the icons in Images.xcassets',
    );
    console.log('   3. Rebuild your app to see the new icon');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();
