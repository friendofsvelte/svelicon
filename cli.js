#!/usr/bin/env node
import {program} from 'commander';
import {downloadIcon} from './index.js';

program
    .name('iconify-svelte')
    .description('Download Iconify icons as Svelte components')
    .argument('<collection>', 'icon collection (e.g., mdi)')
    .option('-o, --output <dir>', 'output directory', 'src/icons')
    .option('--withts', 'generate TypeScript version', false)
    .option('--withjs', 'generate JavaScript version', true)
    .action(async (collection, icon, options) => {
        try {
            const results = await downloadIcon(collection, icon, {
                outputDir: options.output, withTs: options.withts, withJs: options.withjs
            });

            results.forEach(file => {
                console.log(`Successfully created: ${file}`);
            });
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse();