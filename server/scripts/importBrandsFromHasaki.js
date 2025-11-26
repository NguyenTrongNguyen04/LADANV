import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import Brand from '../models/brandModel.js';

const HASAKI_BRANDS_API = 'https://hasaki.vn/mobile/v2/main/brands?form_key=20a4527d726988f6a439f36be911eab3';
const HASAKI_PRODUCTS_API = 'https://hasaki.vn/mobile/v3/main/products';
const FORM_KEY = '20a4527d726988f6a439f36be911eab3';

// Extract brand_path from URL
// Example: "https://hasaki.vn/thuong-hieu/16plain.html" -> "16plain"
function extractBrandPath(url) {
    if (!url) return null;
    try {
        const match = url.match(/\/thuong-hieu\/([^\/]+)\.html/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting brand path:', error);
        return null;
    }
}

// Fetch brand description from Hasaki API
async function fetchBrandDescription(brandPath) {
    try {
        const url = `${HASAKI_PRODUCTS_API}?brand_path=${brandPath}&page=1&size=40&has_meta_data=1&is_desktop=1&form_key=${FORM_KEY}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch brand description for ${brandPath}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        
        if (data.status?.error_code === 0 && data.data?.meta_data?.brand_info?.brand_description) {
            return data.data.meta_data.brand_info.brand_description;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching brand description for ${brandPath}:`, error.message);
        return null;
    }
}

// Main import function
async function importBrands() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to MongoDB');

        // Fetch brands list from Hasaki
        console.log('Fetching brands from Hasaki API...');
        const response = await fetch(HASAKI_BRANDS_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch brands: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status?.error_code !== 0 || !data.data?.brands) {
            throw new Error('Invalid response from Hasaki API');
        }

        const brandsData = data.data.brands;
        const allBrands = [];

        // Flatten brands array (grouped by first_letter)
        for (const group of brandsData) {
            if (group.list && Array.isArray(group.list)) {
                allBrands.push(...group.list);
            }
        }

        console.log(`Found ${allBrands.length} brands to import`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Process each brand
        for (let i = 0; i < allBrands.length; i++) {
            const brand = allBrands[i];
            const brandName = brand.name;
            const brandLogo = brand.image || '';
            const brandUrl = brand.url || '';

            console.log(`\n[${i + 1}/${allBrands.length}] Processing: ${brandName}`);

            // Check if brand already exists
            const existingBrand = await Brand.findOne({ name: brandName });
            if (existingBrand) {
                console.log(`  ⏭️  Brand "${brandName}" already exists, skipping...`);
                skipCount++;
                continue;
            }

            // Extract brand_path from URL
            const brandPath = extractBrandPath(brandUrl);
            if (!brandPath) {
                console.log(`  ⚠️  Could not extract brand_path from URL: ${brandUrl}`);
                // Still create brand without description
                try {
                    await Brand.create({
                        name: brandName,
                        description: '',
                        logo: brandLogo
                    });
                    console.log(`  ✅ Created brand "${brandName}" without description`);
                    successCount++;
                } catch (error) {
                    console.error(`  ❌ Error creating brand "${brandName}":`, error.message);
                    errorCount++;
                }
                continue;
            }

            // Fetch brand description
            console.log(`  📡 Fetching description for brand_path: ${brandPath}`);
            let description = null;
            try {
                description = await fetchBrandDescription(brandPath);
            } catch (error) {
                console.log(`  ⚠️  Could not fetch description: ${error.message}`);
            }
            
            // Create brand in database
            try {
                const newBrand = await Brand.create({
                    name: brandName,
                    description: description || '',
                    logo: brandLogo || ''
                });
                
                if (description) {
                    console.log(`  ✅ Created brand "${brandName}" with description (${description.length} chars)`);
                } else {
                    console.log(`  ✅ Created brand "${brandName}" without description`);
                }
                successCount++;
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`  ⏭️  Brand "${brandName}" already exists (duplicate key)`);
                    skipCount++;
                } else {
                    console.error(`  ❌ Error creating brand "${brandName}":`, error.message);
                    errorCount++;
                }
            }

            // Add delay to avoid rate limiting (500ms between requests)
            if (i < allBrands.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('IMPORT SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total brands processed: ${allBrands.length}`);
        console.log(`✅ Successfully imported: ${successCount}`);
        console.log(`⏭️  Skipped (already exists): ${skipCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(50));

    } catch (error) {
        console.error('Error importing brands:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

// Run the import
importBrands();

