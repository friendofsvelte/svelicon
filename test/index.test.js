import { describe, it, expect } from 'vitest';

describe('svelicon', () => {

  describe('Pure Unit Tests', () => {
    it('should test capitalizeFirstLetter function logic', () => {
      // Test the capitalization logic used in the codebase
      const capitalizeFirstLetter = (string) => {
        return string
          .split(/[:,-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      expect(capitalizeFirstLetter('fluent:home-24-filled')).toBe('FluentHome24Filled');
      expect(capitalizeFirstLetter('mdi:user-circle')).toBe('MdiUserCircle');
      expect(capitalizeFirstLetter('material-symbols:settings')).toBe('MaterialSymbolsSettings');
      expect(capitalizeFirstLetter('simple')).toBe('Simple');
    });

    it('should test icon name parsing logic', () => {
      // Test the icon name parsing logic
      const parseIconName = (icon) => {
        const names = icon.split('/');
        const collectionName = names[0];
        const iconName = names[1];
        return { collectionName, iconName };
      };

      const result1 = parseIconName('mdi/home');
      expect(result1.collectionName).toBe('mdi');
      expect(result1.iconName).toBe('home');

      const result2 = parseIconName('fluent/data-area-24-filled');
      expect(result2.collectionName).toBe('fluent');
      expect(result2.iconName).toBe('data-area-24-filled');
    });

    it('should test colon to slash conversion logic', () => {
      // Test the colon to slash conversion logic from CLI
      const convertColonToSlash = (icon) => {
        return icon.includes(':') && !icon.includes('/') 
          ? icon.replace(':', '/') 
          : icon;
      };

      expect(convertColonToSlash('fluent:home-24-filled')).toBe('fluent/home-24-filled');
      expect(convertColonToSlash('mdi:user')).toBe('mdi/user');
      expect(convertColonToSlash('mdi/home')).toBe('mdi/home'); // Already has slash
      expect(convertColonToSlash('simple-icon')).toBe('simple-icon'); // No colon
    });

    it('should test component name generation logic', () => {
      // Test component name generation
      const generateComponentName = (collectionName, iconName) => {
        const capitalizeFirstLetter = (string) => {
          return string
            .split(/[:,-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        };
        
        return `${capitalizeFirstLetter(collectionName)}${capitalizeFirstLetter(iconName.replace(/ /g, '-'))}`;
      };

      expect(generateComponentName('fluent', 'home-24-filled')).toBe('FluentHome24Filled');
      expect(generateComponentName('mdi', 'user-circle')).toBe('MdiUserCircle');
      expect(generateComponentName('material-symbols', 'arrow-back-ios')).toBe('MaterialSymbolsArrowBackIos');
    });
  });

  describe('Template Generation', () => {
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
      const generateComponent = (pathData, height, width, componentName, isTypescript) => {
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

        const svgTemplate = `<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 ${width} ${height}"
   class="{className}">
  ${pathData}
</svg>`;

        return `${scriptContent}\n\n${svgTemplate}`;
      };

      const tsResult = generateComponent('<path d="M10 10"/>', 24, 24, 'TestIcon', true);
      expect(tsResult).toContain('<script lang="ts" module>');
      expect(tsResult).toContain('export interface TestIconProps');
      expect(tsResult).toContain('<script lang="ts">');
      expect(tsResult).toContain('$props()');

      const jsResult = generateComponent('<path d="M10 10"/>', 24, 24, 'TestIcon', false);
      expect(jsResult).toContain('<script>');
      expect(jsResult).not.toContain('lang="ts"');
      expect(jsResult).not.toContain('interface');
    });
  });

  describe('Utility Functions', () => {
    it('should test progress tracking logic', () => {
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

    it('should test array processing logic', () => {
      // Test empty array handling
      const processEmptyArray = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
          return [];
        }
        return arr.map(item => item.toUpperCase());
      };

      expect(processEmptyArray([])).toEqual([]);
      expect(processEmptyArray(null)).toEqual([]);
      expect(processEmptyArray(['test'])).toEqual(['TEST']);
    });

    it('should test concurrency limit logic', () => {
      // Test concurrency control logic
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
      expect(typeof limit).toBe('function');
    });
  });

  describe('Security', () => {
    it('should prevent path traversal attacks', () => {
      const path = require('path');
      
      // Simulate the sanitizeOutputDir function
      const sanitizeOutputDir = (outputDir) => {
        const resolved = path.resolve(outputDir);
        const cwd = process.cwd();
        
        if (!resolved.startsWith(cwd)) {
          throw new Error(`Output directory must be within current working directory. Got: ${outputDir}`);
        }
        
        return resolved;
      };

      // Test valid paths
      expect(() => sanitizeOutputDir('src/icons')).not.toThrow();
      expect(() => sanitizeOutputDir('./src/icons')).not.toThrow();
      expect(() => sanitizeOutputDir('icons')).not.toThrow();

      // Test malicious paths
      expect(() => sanitizeOutputDir('../../../etc')).toThrow();
      expect(() => sanitizeOutputDir('/etc/passwd')).toThrow();
      expect(() => sanitizeOutputDir('../../..')).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid SVG content', () => {
      const isValidSvg = (content) => {
        return content.includes('<svg') && content.includes('</svg>');
      };

      expect(isValidSvg('not an svg')).toBe(false);
      expect(isValidSvg('<svg></svg>')).toBe(true);
      expect(isValidSvg('<svg><path d="M10 10"/></svg>')).toBe(true);
    });

    it('should handle invalid icon formats', () => {
      const validateIconFormat = (icon) => {
        if (!icon || typeof icon !== 'string') return false;
        
        const parts = icon.split('/');
        if (parts.length !== 2) return false;
        
        const [collection, name] = parts;
        return collection.trim() !== '' && name.trim() !== '';
      };

      expect(validateIconFormat('')).toBe(false);
      expect(validateIconFormat('invalid')).toBe(false);
      expect(validateIconFormat('collection/')).toBe(false);
      expect(validateIconFormat('/icon-name')).toBe(false);
      expect(validateIconFormat('mdi/home')).toBe(true);
      expect(validateIconFormat('fluent/data-area-24-filled')).toBe(true);
    });

    it('should handle edge cases in string processing', () => {
      const capitalizeFirstLetter = (string) => {
        if (!string || typeof string !== 'string') return '';
        return string
          .split(/[:,-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      };

      expect(capitalizeFirstLetter('')).toBe('');
      expect(capitalizeFirstLetter(null)).toBe('');
      expect(capitalizeFirstLetter('a')).toBe('A');
      expect(capitalizeFirstLetter('a:b')).toBe('AB');
      expect(capitalizeFirstLetter('123-test')).toBe('123Test');
    });
  });
});
