# Svelte Icon Library - Svelicon 🎨

Create Svelte components from Iconify SVG icons with type-safe support. A simple CLI tool for generating Svelte icons.

## Features ✨

- 🎯 **Iconify Integration**: Access and download icons from the Iconify collection.
- ⚡ **Fast Conversion**: Quickly convert SVG icons to Svelte components.
- 📦 **TypeScript Support**: Generate fully typed components with interfaces for Svelte TypeScript projects.
- 🎨 **Customizable Icons**: Control icon size, display behavior, and spacing.
- 🛠️ **CLI Tool**: Easy-to-use command-line interface for Svelte icon generation.
- 🔄 **Flexible Output**: Generate JavaScript or TypeScript Svelte components.

> Svelicon streamlines the process of using Iconify icons in your Svelte projects, offering TypeScript support and flexible customization.

## Requirements 🗒️

- Svelte 5
- Awesomeness

## Usage 🚀

### Basic Usage

```bash
npx svelicon fluent/person-passkey-28-filled
```

This command downloads the `person-passkey-28-filled` icon from the `fluent` collection and creates a TypeScript Svelte component at 
```
src/icons/FluentPersonPasskey28Filled.svelte
```

### CLI Options

```bash
npx svelicon [options] [collection]/[icon]

Options:
  -o, --output <dir>  Output directory (default: "src/icons")
  --withts            Generate TypeScript version (default: true)
  --withjs            Generate JavaScript version
  -h, --help         Display help for command
```

**Example**:
```bash
npx svelicon --withjs fluent/person-passkey-28-filled
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

### JavaScript Usage

```svelte
<script>
  import FluentPersonPasskey28Filled from './icons/FluentPersonPasskey28Filled.svelte';
</script>

<FluentPersonPasskey28Filled size={1.2} />
```

### TypeScript Usage

```svelte
<script lang="ts">
  import FluentPersonPasskey28Filled, { type FluentPersonPasskey28FilledProps } from './icons/FluentPersonPasskey28Filled.svelte';
  
  let iconProps: FluentPersonPasskey28FilledProps = {
    size: 1.2,
    class: 'my-custom-icon'
  };
</script>

<FluentPersonPasskey28Filled {...iconProps} />
```

## Component Output Structure 🏗️

Generated components include:

```svelte
<script lang="ts" module>
  export interface FluentPersonPasskey28FilledProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: FluentPersonPasskey28FilledProps = $props();
</script>

<svg class={className}><!-- icon content --></svg>
```

## Benefits 🌟

- **Zero Runtime Dependencies**: Svelte icon components are standalone.
- **Tree-Shakeable**: Only import the Svelte icons you use.
- **Type-Safe Svelte**: Full TypeScript support for Svelte projects.
- **Small Bundle Size**: Minimal impact on your Svelte app's size.
- **Flexible Svelte Icons**: Use any Iconify icon in your Svelte project.

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
