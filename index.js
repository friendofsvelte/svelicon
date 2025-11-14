import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import {mkdirp} from 'mkdirp';
import {parseSVGContent, convertParsedSVG, iconToSVG} from '@iconify/utils';
import pLimit from 'p-limit';

// Security: Prevent path traversal attacks
function sanitizeOutputDir(outputDir) {
    const resolved = path.resolve(outputDir);
    const cwd = process.cwd();
    
    // Ensure output directory is within current working directory
    if (!resolved.startsWith(cwd)) {
        throw new Error(`Output directory must be within current working directory. Got: ${outputDir}`);
    }
    
    return resolved;
}

const capitalizeFirstLetter = (string) => {
    // Split the string by ':' and '-' to handle both separator types
    return string
        .split(/[:,-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

// Validate tsconfig.json for $icons path mapping
async function validateTsConfig(outputDir) {
    // Sanitize the output directory for security
    const safeOutputDir = sanitizeOutputDir(outputDir);
    const possibleTsConfigPaths = [
        'tsconfig.json',
        '.svelte-kit/tsconfig.json',
        'tsconfig.app.json'
    ];

    for (const configPath of possibleTsConfigPaths) {
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);
            
            const paths = config.compilerOptions?.paths;
            if (paths) {
                const hasIconsMapping = paths['$icons'] || paths['$icons/*'];
                const iconsMappingPath = paths['$icons']?.[0] || paths['$icons/*']?.[0];
                
                if (hasIconsMapping) {
                    console.log(`✅ Found $icons path mapping in ${configPath}`);
                    
                    // Check if the mapping points to our output directory
                    if (iconsMappingPath) {
                        const normalizedMappingPath = iconsMappingPath.replace(/\/\*$/, '').replace(/^\.\.\//, '');
                        const normalizedOutputDir = outputDir.replace(/^\.\//, '');
                        
                        if (normalizedMappingPath !== normalizedOutputDir) {
                            console.log(`⚠️  Warning: $icons mapping points to "${iconsMappingPath}" but downloading to "${safeOutputDir}"`);
                            console.log(`   Consider using --output "${normalizedMappingPath}" or updating your tsconfig.json`);
                        }
                    }
                    return true;
                }
            }
        } catch (error) {
            // Continue to next config file
            continue;
        }
    }

    // No valid tsconfig with $icons mapping found
    console.log('⚠️  Warning: No $icons path mapping found in tsconfig.json');
    console.log('   To use path imports like "import Icon from \'$icons/MyIcon.svelte\'", add this to your tsconfig.json:');
    console.log('   {');
    console.log('     "compilerOptions": {');
    console.log('       "paths": {');
    console.log(`         "$icons": ["${safeOutputDir}"],`);
    console.log(`         "$icons/*": ["${safeOutputDir}/*"]`);
    console.log('       }');
    console.log('     }');
    console.log('   }');
    console.log('');
    
    return false;
}

// Common template parts
const generateSvgTemplate = (pathData, width, height, size) => `<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{${size}}em"
   height="{${size}}em"
   viewBox="0 0 ${width} ${height}"
   class="{className}">
  ${pathData}
</svg>`;

const generateComponentTemplate = ({
                                       scriptContent, size = 'size', pathData, width, height
                                   }) => `${scriptContent}

${generateSvgTemplate(pathData, width, height, size)}`;

function generateComponent(pathData, height, width, componentName, isTypescript) {
    const scriptContent = isTypescript ? `<script lang="ts" module>
  export interface ${componentName}Props {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: ${componentName}Props = $props();
</script>` : `<script>
  const { size = 0.7, class: className = '' } = $props();
</script>`;

    return generateComponentTemplate({
        scriptContent, pathData, width, height
    });
}

async function processIconData(svgContent) {
    const parsedSVG = parseSVGContent(svgContent);
    if (!parsedSVG) {
        throw new Error('Could not parse SVG content');
    }

    const iconData = convertParsedSVG(parsedSVG);
    if (!iconData) {
        throw new Error('Could not convert SVG to icon data');
    }

    return iconData;
}

// Pattern matching for collection downloads
function matchesPattern(iconName, pattern) {
    // Convert wildcard pattern to regex
    if (pattern === '*') {
        return true; // Match all
    }
    
    if (pattern.startsWith('*') && pattern.endsWith('*')) {
        // *text* - contains
        const text = pattern.slice(1, -1);
        return iconName.includes(text);
    }
    
    if (pattern.startsWith('*')) {
        // *suffix - ends with
        const suffix = pattern.slice(1);
        return iconName.endsWith(suffix);
    }
    
    if (pattern.endsWith('*')) {
        // prefix* - starts with
        const prefix = pattern.slice(0, -1);
        return iconName.startsWith(prefix);
    }
    
    // Try as regex pattern
    try {
        const regex = new RegExp(pattern, 'i');
        return regex.test(iconName);
    } catch (error) {
        // If regex fails, do exact match
        return iconName === pattern;
    }
}

// Download icons matching a pattern from a collection
export async function downloadCollection(pattern, options = {}) {
    const {
        collection = '',
        outputDir = 'src/icons',
        withTs = false,
        withJs = true,
        concurrency = 10,
        limit = 100,
        skipTsConfigCheck = false
    } = options;

    if (!collection) {
        throw new Error('Collection name is required for pattern downloads');
    }

    console.log(`🔍 Searching for icons matching "${pattern}" in collection "${collection}"...`);

    try {
        // Search for icons in the specified collection
        const searchResults = await searchIcons('', {
            collection,
            limit: Math.max(limit, 500) // Get more results for pattern matching
        });

        if (searchResults.icons.length === 0) {
            console.log(`❌ No icons found in collection "${collection}"`);
            return [];
        }

        // Filter icons by pattern
        const matchingIcons = searchResults.icons.filter(iconFullName => {
            // Extract just the icon name (after collection prefix)
            const iconName = iconFullName.includes(':') 
                ? iconFullName.split(':')[1] 
                : iconFullName.split('/')[1];
            
            return iconName && matchesPattern(iconName, pattern);
        });

        if (matchingIcons.length === 0) {
            console.log(`❌ No icons matching pattern "${pattern}" found in collection "${collection}"`);
            console.log(`💡 Available icons: ${searchResults.icons.slice(0, 5).join(', ')}${searchResults.icons.length > 5 ? '...' : ''}`);
            return [];
        }

        console.log(`✅ Found ${matchingIcons.length} icons matching pattern "${pattern}"`);
        console.log(`📦 Icons to download: ${matchingIcons.slice(0, 5).join(', ')}${matchingIcons.length > 5 ? ` and ${matchingIcons.length - 5} more...` : ''}`);

        // Convert to proper format and download
        const iconsToDownload = matchingIcons.map(icon => {
            // Convert colon format to slash format if needed
            return icon.includes(':') && !icon.includes('/') 
                ? icon.replace(':', '/') 
                : icon;
        });

        return await downloadIcons(iconsToDownload, {
            outputDir,
            withTs,
            withJs,
            concurrency,
            skipTsConfigCheck
        });

    } catch (error) {
        console.error(`Failed to download collection: ${error.message}`);
        return [];
    }
}

// Search icons using Iconify API
export async function searchIcons(query, options = {}) {
    const {
        collection = '',
        category = '',
        limit = 50,
        start = 0
    } = options;

    try {
        const params = new URLSearchParams({
            query,
            limit: limit.toString(),
            start: start.toString()
        });

        if (collection) params.append('prefix', collection);
        if (category) params.append('category', category);

        const response = await axios.get(`https://api.iconify.design/search?${params}`);
        
        if (response.status !== 200) {
            throw new Error(`Search failed with status ${response.status}`);
        }

        return {
            icons: response.data.icons || [],
            total: response.data.total || 0,
            start: response.data.start || 0,
            limit: response.data.limit || limit
        };
    } catch (error) {
        console.error(`Search failed: ${error.message}`);
        return { icons: [], total: 0, start: 0, limit };
    }
}

// Progress callback for batch operations
const createProgressTracker = (total, label = 'Processing') => {
    let completed = 0;
    return {
        update: () => {
            completed++;
            const percentage = Math.round((completed / total) * 100);
            process.stdout.write(`\r${label}: ${completed}/${total} (${percentage}%)`);
            if (completed === total) {
                console.log('\n');
            }
        },
        reset: () => { completed = 0; },
        getCompleted: () => completed
    };
};

// Batch download with concurrency control and progress tracking
export async function downloadIcons(icons, options = {}) {
    const {
        outputDir = 'src/icons',
        withTs = false,
        withJs = true,
        concurrency = 10,
        delayMs = 100,
        skipTsConfigCheck = false
    } = options;

    if (!Array.isArray(icons) || icons.length === 0) {
        console.log('No icons to download');
        return [];
    }

    // Validate tsconfig.json before starting download
    if (!skipTsConfigCheck) {
        await validateTsConfig(outputDir);
    }

    console.log(`Starting batch download of ${icons.length} icons with ${concurrency} concurrent workers...`);
    
    const limit = pLimit(concurrency);
    const progress = createProgressTracker(icons.length, 'Downloading');
    const results = [];
    const errors = [];

    // Add delay between requests to be respectful to the API
    const downloadWithDelay = async (icon, index) => {
        if (index > 0 && delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        try {
            const result = await downloadIcon(icon, { outputDir, withTs, withJs, _batchMode: true });
            progress.update();
            return { icon, success: true, files: result };
        } catch (error) {
            progress.update();
            errors.push({ icon, error: error.message });
            return { icon, success: false, error: error.message };
        }
    };

    // Process all icons with concurrency limit
    const promises = icons.map((icon, index) => 
        limit(() => downloadWithDelay(icon, index))
    );

    try {
        const downloadResults = await Promise.allSettled(promises);
        
        downloadResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                errors.push({ icon: icons[index], error: result.reason?.message || 'Unknown error' });
            }
        });

        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = errors.length;
        
        console.log(`\n📊 Batch download completed:`);
        console.log(`  ✅ Successful: ${successful}`);
        if (failed > 0) {
            console.log(`  ❌ Failed: ${failed}`);
            console.log(`\nFailed downloads:`);
            errors.forEach(({ icon, error }) => {
                console.log(`  - ${icon}: ${error}`);
            });
        }

        return results.filter(r => r.success).flatMap(r => r.files);
    } catch (error) {
        console.error(`Batch download failed: ${error.message}`);
        return [];
    }
}

export async function downloadIcon(icon, options = {}) {
    const {
        outputDir = 'src/icons', withTs = false, withJs = true, skipTsConfigCheck = false
    } = options;

    try {
        // Validate tsconfig.json before downloading (only for single downloads)
        if (!skipTsConfigCheck && !options._batchMode) {
            await validateTsConfig(outputDir);
        }

        // Replace spaces with slashes in the name
        // Fetch and validate icon
        const response = await axios.get(`https://api.iconify.design/${icon}.svg`);
        if (response.status !== 200) {
            console.log(`Failed to download icon ${icon}`);
            return [];
        }

        // Process icon data
        const iconData = await processIconData(response.data);
        const renderData = iconToSVG(iconData, {
            height: 'auto', width: 'auto'
        });

        // Prepare output with security validation
        const safeOutputDir = sanitizeOutputDir(outputDir);
        await mkdirp(safeOutputDir);
        const names = icon.split('/');
        const collectionName = names[0];
        const iconName = names[1];
        if (!iconName) {
            throw new Error('Invalid icon name');
        }
        const componentName = `${capitalizeFirstLetter(collectionName)}${capitalizeFirstLetter(iconName.replace(/ /g, '-'))}`;

        // Generate component content based on type
        const content = generateComponent(renderData.body, iconData.height, iconData.width, componentName, withTs);

        // Write file to sanitized path
        const outputPath = path.join(safeOutputDir, `${componentName}.svelte`);
        await fs.writeFile(outputPath, content, 'utf8');

        return [outputPath];
    } catch (error) {
        console.error(`Failed to download icon ${icon}:\n ${error.message}`);
        return [];
    }
}