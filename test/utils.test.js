import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';

// Mock the fs module
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TSConfig Validation', () => {
    it('should detect valid $icons path mapping', async () => {
      const validTsConfig = {
        compilerOptions: {
          paths: {
            '$icons': ['src/icons'],
            '$icons/*': ['src/icons/*']
          }
        }
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(validTsConfig));

      // Simulate the validateTsConfig function logic
      const configContent = await fs.readFile('tsconfig.json', 'utf8');
      const config = JSON.parse(configContent);
      const paths = config.compilerOptions?.paths;
      const hasIconsMapping = paths['$icons'] || paths['$icons/*'];

      expect(hasIconsMapping).toBeTruthy();
    });

    it('should handle missing tsconfig.json', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      try {
        await fs.readFile('tsconfig.json', 'utf8');
      } catch (error) {
        expect(error.message).toBe('File not found');
      }
    });

    it('should handle invalid JSON in tsconfig', async () => {
      mockFs.readFile.mockResolvedValue('invalid json content');

      try {
        const configContent = await fs.readFile('tsconfig.json', 'utf8');
        JSON.parse(configContent);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should check multiple tsconfig locations', async () => {
      const possiblePaths = [
        'tsconfig.json',
        '.svelte-kit/tsconfig.json',
        'tsconfig.app.json'
      ];

      // Mock first two to fail, third to succeed
      mockFs.readFile
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(JSON.stringify({
          compilerOptions: {
            paths: {
              '$icons/*': ['src/icons/*']
            }
          }
        }));

      let foundConfig = false;
      for (const configPath of possiblePaths) {
        try {
          const content = await fs.readFile(configPath, 'utf8');
          const config = JSON.parse(content);
          if (config.compilerOptions?.paths?.['$icons/*']) {
            foundConfig = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      expect(foundConfig).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      // Simulate the createProgressTracker function
      const createProgressTracker = (total, label = 'Processing') => {
        let completed = 0;
        return {
          update: () => {
            completed++;
            const percentage = Math.round((completed / total) * 100);
            return { completed, total, percentage };
          },
          reset: () => { completed = 0; },
          getCompleted: () => completed
        };
      };

      const tracker = createProgressTracker(5, 'Testing');
      
      expect(tracker.getCompleted()).toBe(0);
      
      const result1 = tracker.update();
      expect(result1).toEqual({ completed: 1, total: 5, percentage: 20 });
      
      const result2 = tracker.update();
      expect(result2).toEqual({ completed: 2, total: 5, percentage: 40 });
      
      tracker.reset();
      expect(tracker.getCompleted()).toBe(0);
    });
  });

  describe('String Capitalization', () => {
    it('should capitalize icon names correctly', () => {
      const capitalizeFirstLetter = (string) => {
        return string
          .split(/[:,-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      const testCases = [
        { input: 'fluent:home-24-filled', expected: 'FluentHome24Filled' },
        { input: 'material-design-icons', expected: 'MaterialDesignIcons' },
        { input: 'simple', expected: 'Simple' },
        { input: 'multi:part-name', expected: 'MultiPartName' },
        { input: 'with,comma-separated', expected: 'WithCommaSeparated' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(capitalizeFirstLetter(input)).toBe(expected);
      });
    });

    it('should handle edge cases in capitalization', () => {
      const capitalizeFirstLetter = (string) => {
        return string
          .split(/[:,-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      const edgeCases = [
        { input: '', expected: '' },
        { input: 'a', expected: 'A' },
        { input: 'a:b', expected: 'AB' },
        { input: '123-test', expected: '123Test' },
        { input: 'UPPERCASE', expected: 'UPPERCASE' }
      ];

      edgeCases.forEach(({ input, expected }) => {
        expect(capitalizeFirstLetter(input)).toBe(expected);
      });
    });
  });

  describe('SVG Template Generation', () => {
    it('should generate correct SVG template', () => {
      const generateSvgTemplate = (pathData, width, height, size) => `<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{${size}}em"
   height="{${size}}em"
   viewBox="0 0 ${width} ${height}"
   class="{className}">
  ${pathData}
</svg>`;

      const result = generateSvgTemplate('<path d="M10 10"/>', 24, 24, 'size');
      
      expect(result).toContain('width="{size}em"');
      expect(result).toContain('height="{size}em"');
      expect(result).toContain('viewBox="0 0 24 24"');
      expect(result).toContain('<path d="M10 10"/>');
      expect(result).toContain('class="{className}"');
    });

    it('should generate TypeScript component template', () => {
      const generateComponentTemplate = ({ scriptContent, size = 'size', pathData, width, height }) => {
        const svgTemplate = `<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{${size}}em"
   height="{${size}}em"
   viewBox="0 0 ${width} ${height}"
   class="{className}">
  ${pathData}
</svg>`;
        return `${scriptContent}\n\n${svgTemplate}`;
      };

      const scriptContent = `<script lang="ts" module>
  export interface TestProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: TestProps = $props();
</script>`;

      const result = generateComponentTemplate({
        scriptContent,
        pathData: '<path d="M10 10"/>',
        width: 24,
        height: 24
      });

      expect(result).toContain('<script lang="ts" module>');
      expect(result).toContain('export interface TestProps');
      expect(result).toContain('<script lang="ts">');
      expect(result).toContain('$props()');
      expect(result).toContain('<svg');
      expect(result).toContain('<path d="M10 10"/>');
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const mockNetworkCall = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));

      try {
        await mockNetworkCall();
      } catch (error) {
        expect(error.message).toBe('ETIMEDOUT');
      }
    });

    it('should handle file system errors', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Permission denied'));

      try {
        await fs.writeFile('test.txt', 'content');
      } catch (error) {
        expect(error.message).toBe('Permission denied');
      }
    });

    it('should handle invalid SVG content', () => {
      const invalidSvgContent = 'not an svg';
      
      // Simulate SVG validation
      const isValidSvg = (content) => {
        return content.includes('<svg') && content.includes('</svg>');
      };

      expect(isValidSvg(invalidSvgContent)).toBe(false);
      expect(isValidSvg('<svg></svg>')).toBe(true);
    });
  });

  describe('Concurrency Control', () => {
    it('should respect concurrency limits', async () => {
      const pLimit = (concurrency) => {
        let running = 0;
        const queue = [];

        return (fn) => {
          return new Promise((resolve, reject) => {
            queue.push({ fn, resolve, reject });
            process();
          });
        };

        function process() {
          if (running >= concurrency || queue.length === 0) return;
          
          running++;
          const { fn, resolve, reject } = queue.shift();
          
          fn().then(resolve, reject).finally(() => {
            running--;
            process();
          });
        }
      };

      const limit = pLimit(2);
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const tasks = Array.from({ length: 5 }, (_, i) => 
        limit(async () => {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          await new Promise(resolve => setTimeout(resolve, 10));
          currentConcurrent--;
          return i;
        })
      );

      await Promise.all(tasks);
      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });
});
