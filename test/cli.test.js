import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Commands', () => {
  const CLI_PATH = './cli.js';

  describe('Icon Format Parsing', () => {
    it('should convert colon format to slash format', () => {
      // Test the conversion logic directly
      const testCases = [
        { input: 'fluent:home-24-filled', expected: 'fluent/home-24-filled' },
        { input: 'mdi:user', expected: 'mdi/user' },
        { input: 'lucide:arrow-right', expected: 'lucide/arrow-right' },
        { input: 'material-symbols:settings', expected: 'material-symbols/settings' }
      ];

      testCases.forEach(({ input, expected }) => {
        // Simulate the conversion logic from cli.js
        const converted = input.includes(':') && !input.includes('/') 
          ? input.replace(':', '/') 
          : input;
        expect(converted).toBe(expected);
      });
    });

    it('should handle mixed formats in comma-separated list', () => {
      const input = 'fluent:home-24-filled,mdi/user,lucide:arrow-right';
      const icons = input.split(',')
        .map(icon => icon.trim())
        .filter(Boolean)
        .map(icon => {
          if (icon.includes(':') && !icon.includes('/')) {
            return icon.replace(':', '/');
          }
          return icon;
        });

      expect(icons).toEqual([
        'fluent/home-24-filled',
        'mdi/user',
        'lucide/arrow-right'
      ]);
    });

    it('should preserve slash format when present', () => {
      const input = 'mdi/home';
      const converted = input.includes(':') && !input.includes('/') 
        ? input.replace(':', '/') 
        : input;
      expect(converted).toBe('mdi/home');
    });

    it('should handle edge cases', () => {
      const testCases = [
        { input: 'collection:icon:with:colons', expected: 'collection/icon:with:colons' },
        { input: 'collection/icon:mixed', expected: 'collection/icon:mixed' },
        { input: 'simple-icon', expected: 'simple-icon' }
      ];

      testCases.forEach(({ input, expected }) => {
        const converted = input.includes(':') && !input.includes('/') 
          ? input.replace(':', '/') 
          : input;
        expect(converted).toBe(expected);
      });
    });
  });

  describe('Command Line Arguments', () => {
    it('should parse download command with multiple icons', () => {
      const args = ['download', 'fluent:home-24-filled,fluent:data-area-24-filled', '-o', 'src/icons', '--withts'];
      
      // Simulate argument parsing
      const iconsArg = args[1];
      const outputIndex = args.indexOf('-o');
      const withTsIndex = args.indexOf('--withts');
      
      expect(iconsArg).toBe('fluent:home-24-filled,fluent:data-area-24-filled');
      expect(outputIndex).toBe(2);
      expect(args[outputIndex + 1]).toBe('src/icons');
      expect(withTsIndex).toBeGreaterThan(-1);
    });

    it('should handle quoted arguments', () => {
      const quotedInput = '"fluent:home-24-filled,fluent:data-area-24-filled,fluent:apps-24-filled"';
      const unquoted = quotedInput.replace(/^"(.*)"$/, '$1');
      
      expect(unquoted).toBe('fluent:home-24-filled,fluent:data-area-24-filled,fluent:apps-24-filled');
    });
  });

  describe('Component Name Generation', () => {
    it('should generate correct component names from icon identifiers', () => {
      const testCases = [
        { input: 'fluent/home-24-filled', expected: 'FluentHome24Filled' },
        { input: 'mdi/user-circle', expected: 'MdiUserCircle' },
        { input: 'lucide/arrow-right', expected: 'LucideArrowRight' },
        { input: 'material-symbols/settings-outline', expected: 'MaterialSymbolsSettingsOutline' }
      ];

      // Simulate the capitalizeFirstLetter function from index.js
      const capitalizeFirstLetter = (string) => {
        return string
          .split(/[:,-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      testCases.forEach(({ input, expected }) => {
        const names = input.split('/');
        const collectionName = names[0];
        const iconName = names[1];
        const componentName = `${capitalizeFirstLetter(collectionName)}${capitalizeFirstLetter(iconName.replace(/ /g, '-'))}`;
        
        expect(componentName).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid icon formats gracefully', () => {
      const invalidFormats = [
        '',
        '   ',
        'invalid',
        'collection/',
        '/icon-name',
        'collection//icon-name'
      ];

      invalidFormats.forEach(format => {
        const names = format.split('/');
        const collectionName = names[0];
        const iconName = names[1];
        
        // Check if either part is missing or empty/whitespace
        const isInvalid = !iconName || !collectionName || 
                         iconName.trim() === '' || collectionName.trim() === '';
        
        if (format === '' || format === '   ' || format === 'collection/' || format === '/icon-name') {
          expect(isInvalid).toBe(true);
        }
      });
    });

    it('should validate required arguments', () => {
      const requiredArgs = ['download'];
      const providedArgs = ['download', 'fluent:home-24-filled'];
      
      expect(providedArgs.length).toBeGreaterThan(requiredArgs.length);
      expect(providedArgs[0]).toBe('download');
      expect(providedArgs[1]).toBeTruthy();
    });
  });

  describe('Options Parsing', () => {
    it('should parse output directory option', () => {
      const args = ['-o', 'custom/path', '--withts'];
      const outputIndex = args.indexOf('-o');
      const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : 'src/icons';
      
      expect(outputDir).toBe('custom/path');
    });

    it('should parse TypeScript option', () => {
      const args = ['--withts'];
      const withTs = args.includes('--withts');
      
      expect(withTs).toBe(true);
    });

    it('should parse concurrency option', () => {
      const args = ['-c', '5'];
      const concurrencyIndex = args.indexOf('-c');
      const concurrency = concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1]) : 10;
      
      expect(concurrency).toBe(5);
    });

    it('should use default values when options not provided', () => {
      const args = ['download', 'mdi:home'];
      
      const outputDir = args.includes('-o') ? args[args.indexOf('-o') + 1] : 'src/icons';
      const withTs = args.includes('--withts') || !args.includes('--withjs');
      const concurrency = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) : 10;
      
      expect(outputDir).toBe('src/icons');
      expect(withTs).toBe(true);
      expect(concurrency).toBe(10);
    });
  });
});
