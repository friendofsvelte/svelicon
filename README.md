# Svelte Icon Library - Svelicon 🎨

Create Svelte components from Iconify SVG icons with type-safe support. A simple CLI tool for generating Svelte icons.

## Features ✨

- 🎯 **Iconify Integration**: Access and download icons from the Iconify collection.
- 🔍 **Smart Search**: Search through thousands of icons with interactive selection.
- 🚀 **Batch Downloads**: Download multiple icons at lightning speed with parallel processing.
- ⚡ **Fast Conversion**: Quickly convert SVG icons to Svelte components.
- 📦 **TypeScript Support**: Generate fully typed components with interfaces for Svelte TypeScript projects.
- ⚙️ **Auto-Config Validation**: Automatically checks and validates tsconfig.json path mappings.
- 🎨 **Customizable Icons**: Control icon size, display behavior, and spacing.
- 🛠️ **Advanced CLI**: Powerful command-line interface with progress tracking and error handling.
- 🔄 **Flexible Output**: Generate JavaScript or TypeScript Svelte components.

> Svelicon streamlines the process of using Iconify icons in your Svelte projects, offering TypeScript support and flexible customization.

## Requirements 🗒️

- Svelte 5
- Awesomeness

## Quick Start 🚀

### 1. Search & Discover
```bash
npx svelicon search "home" --collection mdi
```

### 2. Interactive Selection
Choose from the search results using numbers, ranges, or "all"

### 3. Automatic Download
Icons are downloaded with tsconfig validation and progress tracking

### 4. Use in Your Project
```svelte
<script>
  import HomeIcon from '$icons/MdiHome.svelte';
</script>

<HomeIcon size={1.5} class="text-blue-500" />
```

## Usage 🚀

### 🔍 Search Icons

Search through thousands of icons interactively:

```bash
# Search for icons
npx svelicon search "arrow"

# Search within a specific collection
npx svelicon search "home" --collection mdi

# Search and browse without downloading
npx svelicon search "user" --no-download

# Advanced search with filters
npx svelicon search "database" --collection lucide --limit 30
```

### 📦 Download Icons

#### Single Icon Download
```bash
npx svelicon download "mdi:home"
```

#### Batch Download (Super Fast!)
```bash
# Download multiple icons at once
npx svelicon download "mdi:home,lucide:star,heroicons:user"

# Batch download with custom concurrency
npx svelicon download "mdi:home,mdi:user,lucide:star" --concurrent 20
```

### Legacy Format (Still Supported)
```bash
npx svelicon fluent/person-passkey-28-filled
```

### 🛠️ CLI Commands & Options

#### Search Command
```bash
npx svelicon search <query> [options]

Options:
  -c, --collection <name>     Filter by icon collection (e.g., mdi, lucide)
  --category <name>           Filter by category
  -l, --limit <number>        Number of results to show (default: 20)
  -o, --output <dir>          Output directory (default: "src/icons")
  --withts                    Generate TypeScript version (default: true)
  --withjs                    Generate JavaScript version
  --concurrent <number>       Concurrent downloads (default: 10)
  --skip-tsconfig            Skip tsconfig.json validation
  --no-download               Only search, don't download
```

#### Download Command
```bash
npx svelicon download <icons> [options]

Arguments:
  <icons>                     Icon name or comma-separated list

Options:
  -o, --output <dir>          Output directory (default: "src/icons")
  --withts                    Generate TypeScript version (default: true)
  --withjs                    Generate JavaScript version
  -c, --concurrent <number>   Concurrent downloads for batch (default: 10)
  --skip-tsconfig            Skip tsconfig.json validation
```

### ⚙️ TypeScript Configuration

Svelicon automatically validates your `tsconfig.json` and suggests the optimal configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "$icons": ["src/icons"],
      "$icons/*": ["src/icons/*"]
    }
  }
}
```

This enables clean imports:
```typescript
import HomeIcon from '$icons/MdiHome.svelte';
```

## Component Props 🎛️

All generated components accept these props:

```typescript
interface IconProps {
  size?: number;      // Icon size in em units
  class?: string;     // Add custom CSS classes to the SVG element
}
```

## Examples 📝

### 🎯 With Path Mapping (Recommended)

```svelte
<script>
  import HomeIcon from '$icons/MdiHome.svelte';
  import StarIcon from '$icons/LucideStar.svelte';
</script>

<HomeIcon size={1.2} />
<StarIcon class="text-yellow-500" />
```

### TypeScript Usage

```svelte
<script lang="ts">
  import HomeIcon, { type MdiHomeProps } from '$icons/MdiHome.svelte';
  
  let iconProps: MdiHomeProps = {
    size: 1.2,
    class: 'my-custom-icon'
  };
</script>

<HomeIcon {...iconProps} />
```

### Without Path Mapping

```svelte
<script>
  import HomeIcon from './icons/MdiHome.svelte';
</script>

<HomeIcon size={1.2} />
```

## Component Output Structure

Generated components include:

```svelte
<script lang="ts" module>
  export interface MdiHomeProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: MdiHomeProps = $props();
</script>

<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 24 24"
   class="{className}">
  <!-- optimized SVG path data -->
</svg>
```

## Benefits 🌟

- **🔍 Smart Discovery**: Search through 200,000+ icons with intelligent filtering
- **⚡ Lightning Fast**: Parallel batch downloads with configurable concurrency
- **🎯 Zero Runtime Dependencies**: Svelte icon components are standalone
- **🌲 Tree-Shakeable**: Only import the Svelte icons you use
- **🔧 Auto-Configuration**: Intelligent tsconfig.json validation and suggestions
- **📦 Type-Safe**: Full TypeScript support with generated interfaces
- **📏 Small Bundle Size**: Minimal impact on your Svelte app's size
- **🎨 Flexible**: Use any Iconify icon in your Svelte project
- **📊 Progress Tracking**: Real-time feedback during batch operations
- **🛡️ Error Resilient**: Comprehensive error handling and retry logic

https://youtu.be/6cpXq1MHg-A

## Contributing 🤝

Contributions are welcome! Please read our Contributing Guide for details.

## License 📄

MIT © [Friend of Svelte](https://github.com/friendofsvelte)

## Support 💖

If you find this Svelte icon library helpful, please consider:

- ⭐ Starring the GitHub repo
- 🐛 Creating issues for bugs and feature requests
- 🔀 Contributing to the code base

## Related Projects 🔗

- [Iconify](https://iconify.design/)
- [SvelteKit](https://kit.svelte.dev/)
- [Friend of Svelte](https://github.com/friendofsvelte)

---

Made with ❤️ by [Friend of Svelte](https://github.com/friendofsvelte)
