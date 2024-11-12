# Svelte Icon - svelicon 🎨

Convert Iconify SVG icons to type-safe Svelte components with one command.

## Features ✨

- 🎯 **Direct Iconify Integration**: Download any icon from Iconify's massive collection
- ⚡ **Lightning Fast**: Instant conversion from SVG to Svelte component
- 📦 **TypeScript Support**: Generate fully typed components with interfaces
- 🎨 **Customizable**: Control icon size, display, and space occupation
- 🛠️ **CLI Tool**: Simple command-line interface for easy integration
- 🔄 **Flexible Output**: Generate JavaScript or TypeScript components

> Instantly downloads Iconify SVG icons, and converts to Svelte components with full TypeScript support.

## Usage 🚀

### Basic Usage

```bash
npx svelicon mdi account
```

This creates a Svelte component at `src/icons/MdiAccount.svelte`.

### TypeScript Component

```bash
npx svelicon mdi account --withts
```

Generates a TypeScript-enabled component with proper type definitions.

### CLI Options

```bash
npx svelicon [collection] [icon] [options]

Options:
  -o, --output <dir>  Output directory (default: "src/icons")
  --withts            Generate TypeScript version
  --withjs            Generate JavaScript version (default: true)
  -h, --help         Display help for command
```

## Component Props 🎛️

All generated components accept these props:

```typescript
interface IconProps {
  display?: boolean;  // Whether to display the icon
  occupy?: boolean;   // Whether to occupy space when hidden
  size?: number;      // Icon size in em units
}
```

## Examples 📝

### JavaScript Usage

```svelte
<script>
  import MdiAccount from './icons/MdiAccount.svelte';
</script>

<MdiAccount display={true} size={1.2} />
```

### TypeScript Usage

```svelte
<script lang="ts">
  import MdiAccount, { type MdiAccountProps } from './icons/MdiAccount.svelte';
  
  let iconProps: MdiAccountProps = {
    display: true,
    size: 1.2
  };
</script>

<MdiAccount {...iconProps} />
```

## Component Output Structure 🏗️

Generated components include:

```svelte
<script lang="ts" module>
  export interface MdiAccountProps {
    display?: boolean;
    occupy?: boolean;
    size?: number;
  }
</script>

<script lang="ts">
  const { display = false, occupy = true, size = 0.7 }: MdiAccountProps = $props();
</script>

{#if display}
  <svg><!-- icon content --></svg>
{:else if occupy}
  <div style="height: {size}em; width: {size}em;" />
{/if}
```

## Benefits 🌟

- **Zero Runtime Dependencies**: Components are standalone
- **Tree-Shakeable**: Only import what you need
- **Type-Safe**: Full TypeScript support
- **Small Bundle Size**: Minimal impact on your app's size
- **Flexible**: Use any Iconify icon in your Svelte project

## Contributing 🤝

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License 📄

MIT © [Friend of Svelte](https://github.com/friendofsvelte)

## Support 💖

If you find this package helpful, please consider:

- ⭐ Starring the GitHub repo
- 🐛 Creating issues for bugs and feature requests
- 🔀 Contributing to the code base

## Related Projects 🔗

- [Iconify](https://iconify.design/)
- [SvelteKit](https://kit.svelte.dev/)
- [Friend of Svelte](https://github.com/friendofsvelte)

---

Made with ❤️ by [Friend of Svelte](https://github.com/friendofsvelte)
