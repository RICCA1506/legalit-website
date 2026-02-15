import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BASE = 'attached_assets';
const WEBP_DIR = path.join(BASE, 'optimized');

if (!fs.existsSync(WEBP_DIR)) fs.mkdirSync(WEBP_DIR, { recursive: true });
if (!fs.existsSync(path.join(WEBP_DIR, 'generated_images'))) fs.mkdirSync(path.join(WEBP_DIR, 'generated_images'), { recursive: true });
if (!fs.existsSync(path.join(WEBP_DIR, 'stock_images'))) fs.mkdirSync(path.join(WEBP_DIR, 'stock_images'), { recursive: true });

async function convertToWebP(inputPath, outputPath, maxWidth, quality = 92) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const originalSize = fs.statSync(inputPath).size;
    
    let pipeline = sharp(inputPath).rotate();
    
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside',
        kernel: 'lanczos3'
      });
    }
    
    await pipeline
      .webp({ 
        quality, 
        effort: 6,
        smartSubsample: false,
        nearLossless: quality >= 95,
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    console.log(`  ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${reduction}% smaller) [q${quality}]`);
    return { originalSize, newSize };
  } catch (err) {
    console.error(`  ERROR: ${path.basename(inputPath)}: ${err.message}`);
    return { originalSize: 0, newSize: 0 };
  }
}

async function convertToAVIF(inputPath, outputPath, maxWidth, quality = 80) {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    let pipeline = sharp(inputPath).rotate();
    
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside',
        kernel: 'lanczos3'
      });
    }
    
    await pipeline
      .avif({ 
        quality,
        effort: 4,
        chromaSubsampling: '4:4:4',
        bitdepth: 8,
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    console.log(`    → AVIF: ${(newSize/1024).toFixed(0)}KB [q${quality}]`);
    return newSize;
  } catch (err) {
    console.error(`    AVIF ERROR: ${path.basename(inputPath)}: ${err.message}`);
    return 0;
  }
}

async function convertBoth(inputPath, outputBasePath, maxWidth, webpQuality, avifQuality) {
  const webpPath = outputBasePath + '.webp';
  const avifPath = outputBasePath + '.avif';
  const r = await convertToWebP(inputPath, webpPath, maxWidth, webpQuality);
  await convertToAVIF(inputPath, avifPath, maxWidth, avifQuality);
  return r;
}

async function generateResponsive(inputPath, baseName, outputDir, sizes) {
  try {
    for (const { suffix, width, webpQ, avifQ } of sizes) {
      const webpPath = path.join(outputDir, `${baseName}${suffix}.webp`);
      const avifPath = path.join(outputDir, `${baseName}${suffix}.avif`);
      
      await sharp(inputPath)
        .rotate()
        .resize(width, null, { withoutEnlargement: true, fit: 'inside', kernel: 'lanczos3' })
        .webp({ quality: webpQ, effort: 6, smartSubsample: false })
        .toFile(webpPath);
      const webpSize = fs.statSync(webpPath).size;
      
      await sharp(inputPath)
        .rotate()
        .resize(width, null, { withoutEnlargement: true, fit: 'inside', kernel: 'lanczos3' })
        .avif({ quality: avifQ, effort: 4, chromaSubsampling: '4:4:4', bitdepth: 8 })
        .toFile(avifPath);
      const avifSize = fs.statSync(avifPath).size;
      
      console.log(`    ${baseName}${suffix}: WebP ${(webpSize/1024).toFixed(0)}KB / AVIF ${(avifSize/1024).toFixed(0)}KB (${width}px)`);
    }
  } catch (err) {
    console.error(`  ERROR responsive ${baseName}: ${err.message}`);
  }
}

async function main() {
  let totalOriginal = 0;
  let totalNew = 0;
  
  console.log('\n=============================================');
  console.log('  HIGH QUALITY IMAGE OPTIMIZATION');
  console.log('  WebP + AVIF (YUV 4:4:4, 8-bit)');
  console.log('=============================================\n');

  console.log('--- HERO IMAGE (desktop: 1920px) ---');
  const heroInput = path.join(BASE, 'designarena_image_suh4gwia_upscayl_2x_high-fidelity-4x_1769549731439.jpg');
  const heroBase = path.join(WEBP_DIR, 'hero-cassazione');
  let r = await convertBoth(heroInput, heroBase, 1920, 92, 82);
  totalOriginal += r.originalSize; totalNew += r.newSize;
  
  await generateResponsive(heroInput, 'hero-cassazione', WEBP_DIR, [
    { suffix: '-mobile', width: 800, webpQ: 88, avifQ: 78 },
    { suffix: '-tablet', width: 1200, webpQ: 90, avifQ: 80 },
  ]);

  console.log('\n--- STOCK IMAGES (max 1000px, quality 92/82) ---');
  const stockDir = path.join(BASE, 'stock_images');
  if (fs.existsSync(stockDir)) {
    const stockFiles = fs.readdirSync(stockDir).filter(f => f.endsWith('.jpg'));
    for (const file of stockFiles) {
      const input = path.join(stockDir, file);
      const baseName = file.replace('.jpg', '');
      const outputBase = path.join(WEBP_DIR, 'stock_images', baseName);
      r = await convertBoth(input, outputBase, 1000, 92, 82);
      totalOriginal += r.originalSize; totalNew += r.newSize;
    }
  }

  console.log('\n--- GENERATED IMAGES (max 800px, quality 90/80) ---');
  const genDir = path.join(BASE, 'generated_images');
  if (fs.existsSync(genDir)) {
    const genFiles = fs.readdirSync(genDir).filter(f => f.endsWith('.jpg'));
    for (const file of genFiles) {
      const input = path.join(genDir, file);
      const baseName = file.replace('.jpg', '');
      const outputBase = path.join(WEBP_DIR, 'generated_images', baseName);
      r = await convertBoth(input, outputBase, 800, 90, 80);
      totalOriginal += r.originalSize; totalNew += r.newSize;
    }
  }

  console.log('\n--- CITY/OFFICE IMAGES (max 800px, quality 92/82) ---');
  const cityFiles = [
    'WhatsApp_Image_2026-01-26_at_11.49.07_1769431461365.jpeg',
    'WhatsApp_Image_2026-01-26_at_11.49.08_1769431461366.jpeg',
    'WhatsApp_Image_2026-01-26_at_11.49.09_1769431461366.jpeg',
    'WhatsApp_Image_2026-01-26_at_11.49.10_1769431461365.jpeg',
    'piazza-del-popolo_1769377725579.jpg',
  ];
  for (const file of cityFiles) {
    const input = path.join(BASE, file);
    if (!fs.existsSync(input)) { console.log(`  SKIP (missing): ${file}`); continue; }
    const baseName = file.replace(/\.(jpg|jpeg)$/, '');
    const outputBase = path.join(WEBP_DIR, baseName);
    r = await convertBoth(input, outputBase, 800, 92, 82);
    totalOriginal += r.originalSize; totalNew += r.newSize;
  }

  console.log('\n--- OTHER SCENE IMAGES (max 1000px, quality 92/82) ---');
  const otherFiles = [
    { file: 'insurance-professionals.jpg', maxW: 1000 },
    { file: 'Camice-medico_1769425867517.jpg', maxW: 1000 },
    { file: 'parlamento_1769425734883.jpg', maxW: 1000 },
    { file: 'solidarieta-1_1769426085688.jpg', maxW: 1000 },
    { file: 'arredamento-studio-legale-1800x1295_1764696078485.jpg', maxW: 1000 },
    { file: 'giurisprudenza_1764696049740.jpg', maxW: 1000 },
    { file: 'l-0x50wh-1200x700z-0.655_1764695926909.jpg', maxW: 1000 },
    { file: 'vecteezy_ai-generated-two-people-sign-a-document-lawyers-lawye_1764696306412.jpg', maxW: 1000 },
    { file: 'vecteezy_handshake-after-good-cooperation-businesswoman-shakin_1764696288738.jpg', maxW: 1000 },
    { file: 'parliament-building.jpg', maxW: 1400 },
  ];
  for (const { file, maxW } of otherFiles) {
    const input = path.join(BASE, file);
    if (!fs.existsSync(input)) { console.log(`  SKIP (missing): ${file}`); continue; }
    const baseName = file.replace(/\.(jpg|jpeg)$/, '');
    const outputBase = path.join(WEBP_DIR, baseName);
    r = await convertBoth(input, outputBase, maxW, 92, 82);
    totalOriginal += r.originalSize; totalNew += r.newSize;
  }

  console.log('\n=============================================');
  console.log(`  TOTAL: ${(totalOriginal/1024/1024).toFixed(2)}MB → ${(totalNew/1024/1024).toFixed(2)}MB`);
  console.log(`  SAVED: ${((totalOriginal-totalNew)/1024/1024).toFixed(2)}MB (${((1-totalNew/totalOriginal)*100).toFixed(1)}%)`);
  console.log('=============================================\n');
}

main().catch(console.error);
