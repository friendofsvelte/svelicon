#!/usr/bin/env node
import {program} from 'commander';
import {downloadIcon} from './index.js';

program
    .name('iconify-svelte')
    .description('Download Iconify icons as Svelte components')
    .argument('<icon>', 'icon collection (e.g., mdi)')
    .option('-o, --output <dir>', 'output directory', 'src/icons')
    .option('--withts', 'generate TypeScript version', true)
    .option('--withjs', 'generate JavaScript version', false)
    .action(async (icon, options) => {
        try {
            const results = await downloadIcon(icon, {
                outputDir: options.output, withTs: options.withts, withJs: options.withjs
            });

            if (results.length) {
                console.log('https://github.com/friendofsvelte/svelicon ✨ \n');
            }
            results.forEach(file => {
                console.log(`🚀 Successfully created: ${file}`);
            });
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse();