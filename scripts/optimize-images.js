const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration for image optimization
const config = {
    inputDir: path.join(__dirname, '../images/original'),
    outputDir: path.join(__dirname, '../images/optimized'),
    sizes: {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 200 },
        medium: { width: 600, height: 400 },
        large: { width: 1200, height: 800 },
        hero: { width: 1920, height: 1080 }
    },
    formats: ['webp', 'jpg'],
    quality: {
        webp: 85,
        jpg: 80
    }
};

// Ensure directories exist
async function ensureDirectories() {
    await fs.mkdir(config.inputDir, { recursive: true });
    await fs.mkdir(config.outputDir, { recursive: true });
    
    // Create subdirectories for each size
    for (const size of Object.keys(config.sizes)) {
        await fs.mkdir(path.join(config.outputDir, size), { recursive: true });
    }
}

// Process a single image
async function processImage(filename) {
    const inputPath = path.join(config.inputDir, filename);
    const basename = path.basename(filename, path.extname(filename));
    
    console.log(`Processing ${filename}...`);
    
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Process each size
        for (const [sizeName, dimensions] of Object.entries(config.sizes)) {
            // Skip if the original is smaller than the target size
            if (metadata.width < dimensions.width && metadata.height < dimensions.height) {
                console.log(`  Skipping ${sizeName} (original is smaller)`);
                continue;
            }
            
            // Process each format
            for (const format of config.formats) {
                const outputFilename = `${basename}-${sizeName}.${format}`;
                const outputPath = path.join(config.outputDir, sizeName, outputFilename);
                
                let pipeline = image.clone()
                    .resize(dimensions.width, dimensions.height, {
                        fit: 'cover',
                        position: 'center'
                    });
                
                if (format === 'webp') {
                    pipeline = pipeline.webp({ quality: config.quality.webp });
                } else if (format === 'jpg') {
                    pipeline = pipeline.jpeg({ quality: config.quality.jpg, progressive: true });
                }
                
                await pipeline.toFile(outputPath);
                console.log(`  Created ${sizeName}/${outputFilename}`);
            }
        }
        
        // Also create a full-size optimized version
        for (const format of config.formats) {
            const outputFilename = `${basename}-full.${format}`;
            const outputPath = path.join(config.outputDir, outputFilename);
            
            let pipeline = image.clone();
            
            if (format === 'webp') {
                pipeline = pipeline.webp({ quality: config.quality.webp });
            } else if (format === 'jpg') {
                pipeline = pipeline.jpeg({ quality: config.quality.jpg, progressive: true });
            }
            
            await pipeline.toFile(outputPath);
            console.log(`  Created full-size ${outputFilename}`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
    }
}

// Main function
async function optimizeImages() {
    try {
        await ensureDirectories();
        
        // Check if there are any images to process
        let files;
        try {
            files = await fs.readdir(config.inputDir);
        } catch (error) {
            console.log('No images found in', config.inputDir);
            console.log('Please add original images to:', config.inputDir);
            return;
        }
        
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );
        
        if (imageFiles.length === 0) {
            console.log('No image files found to process');
            console.log('Supported formats: .jpg, .jpeg, .png, .webp');
            return;
        }
        
        console.log(`Found ${imageFiles.length} images to process`);
        
        // Process all images
        for (const file of imageFiles) {
            await processImage(file);
        }
        
        console.log('\nOptimization complete!');
        console.log('Optimized images saved to:', config.outputDir);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run if called directly
if (require.main === module) {
    optimizeImages();
}

module.exports = { optimizeImages, processImage };