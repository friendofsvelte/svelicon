#!/usr/bin/env node
import {program} from 'commander';
import {downloadIcon, downloadIcons, searchIcons} from './index.js';
import readline from 'readline';

// Helper function for interactive selection
async function interactiveSelect(icons, maxDisplay = 20) {
    if (icons.length === 0) return [];
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const displayIcons = icons.slice(0, maxDisplay);
    console.log('\n📋 Available icons:');
    displayIcons.forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon}`);
    });
    
    if (icons.length > maxDisplay) {
        console.log(`  ... and ${icons.length - maxDisplay} more`);
    }

    return new Promise((resolve) => {
        rl.question('\nSelect icons (comma-separated numbers, ranges like 1-5, or "all"): ', (answer) => {
            rl.close();
            
            if (answer.toLowerCase().trim() === 'all') {
                resolve(icons);
                return;
            }
            
            const selected = [];
            const parts = answer.split(',').map(s => s.trim());
            
            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                    for (let i = start; i <= Math.min(end, displayIcons.length); i++) {
                        if (i >= 1) selected.push(displayIcons[i - 1]);
                    }
                } else {
                    const index = parseInt(part);
                    if (index >= 1 && index <= displayIcons.length) {
                        selected.push(displayIcons[index - 1]);
                    }
                }
            }
            
            resolve([...new Set(selected)]); // Remove duplicates
        });
    });
}

// Single icon download command
program
    .command('download')
    .description('Download a single icon or multiple icons')
    .argument('<icons>', 'icon name (e.g., mdi:home) or comma-separated list')
    .option('-o, --output <dir>', 'output directory', 'src/icons')
    .option('--withts', 'generate TypeScript version', true)
    .option('--withjs', 'generate JavaScript version', false)
    .option('-c, --concurrent <number>', 'concurrent downloads for batch', '10')
    .option('--skip-tsconfig', 'skip tsconfig.json validation')
    .action(async (icons, options) => {
        try {
            const iconList = icons.split(',').map(icon => icon.trim()).filter(Boolean);
            const concurrency = parseInt(options.concurrent);
            
            if (iconList.length === 1) {
                // Single icon download
                const results = await downloadIcon(iconList[0], {
                    outputDir: options.output,
                    withTs: options.withts,
                    withJs: options.withjs,
                    skipTsConfigCheck: options.skipTsconfig
                });

                if (results.length) {
                    console.log('https://github.com/friendofsvelte/svelicon ✨ \n');
                    results.forEach(file => {
                        console.log(`🚀 Successfully created: ${file}`);
                    });
                }
            } else {
                // Batch download
                const results = await downloadIcons(iconList, {
                    outputDir: options.output,
                    withTs: options.withts,
                    withJs: options.withjs,
                    concurrency,
                    skipTsConfigCheck: options.skipTsconfig
                });

                if (results.length) {
                    console.log('\nhttps://github.com/friendofsvelte/svelicon ✨');
                    console.log(`🚀 Successfully created ${results.length} files`);
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

// Search command
program
    .command('search')
    .description('Search for icons and optionally download them')
    .argument('<query>', 'search term (e.g., "arrow", "user")')
    .option('-c, --collection <name>', 'filter by icon collection (e.g., mdi, lucide)')
    .option('--category <name>', 'filter by category')
    .option('-l, --limit <number>', 'number of results to show', '20')
    .option('-o, --output <dir>', 'output directory', 'src/icons')
    .option('--withts', 'generate TypeScript version', true)
    .option('--withjs', 'generate JavaScript version', false)
    .option('--concurrent <number>', 'concurrent downloads', '10')
    .option('--skip-tsconfig', 'skip tsconfig.json validation')
    .option('--no-download', 'only search, don\'t download')
    .action(async (query, options) => {
        try {
            console.log(`🔍 Searching for "${query}"...`);
            
            const searchResults = await searchIcons(query, {
                collection: options.collection,
                category: options.category,
                limit: parseInt(options.limit)
            });

            if (searchResults.icons.length === 0) {
                console.log('❌ No icons found matching your search');
                return;
            }

            console.log(`\n✅ Found ${searchResults.icons.length} icons (${searchResults.total} total available)`);

            if (options.noDownload) {
                searchResults.icons.forEach((icon, index) => {
                    console.log(`  ${index + 1}. ${icon}`);
                });
                return;
            }

            const selectedIcons = await interactiveSelect(searchResults.icons, parseInt(options.limit));

            if (selectedIcons.length === 0) {
                console.log('No icons selected for download');
                return;
            }

            console.log(`\n📦 Downloading ${selectedIcons.length} selected icons...`);

            const results = await downloadIcons(selectedIcons, {
                outputDir: options.output,
                withTs: options.withts,
                withJs: options.withjs,
                concurrency: parseInt(options.concurrent),
                skipTsConfigCheck: options.skipTsconfig
            });

            if (results.length) {
                console.log('\nhttps://github.com/friendofsvelte/svelicon ✨');
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

// Legacy support - keep the old single argument format
program
    .argument('[icon]', 'icon name (legacy format, use "download" command instead)')
    .option('-o, --output <dir>', 'output directory', 'src/icons')
    .option('--withts', 'generate TypeScript version', true)
    .option('--withjs', 'generate JavaScript version', false)
    .action(async (icon, options, command) => {
        // Only run this if no subcommand was used
        if (command.args.length > 0 && !['download', 'search'].includes(process.argv[2])) {
            console.log('⚠️  Legacy format detected. Consider using: svelicon download <icon>');
            
            try {
                const results = await downloadIcon(icon, {
                    outputDir: options.output,
                    withTs: options.withts,
                    withJs: options.withjs
                });

                if (results.length) {
                    console.log('https://github.com/friendofsvelte/svelicon ✨ \n');
                    results.forEach(file => {
                        console.log(`🚀 Successfully created: ${file}`);
                    });
                }
            } catch (error) {
                console.error('Error:', error.message);
                process.exit(1);
            }
        }
    });

program.parse();