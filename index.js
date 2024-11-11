import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import {mkdirp} from 'mkdirp';
import {parseSVGContent, convertParsedSVG, iconToSVG} from '@iconify/utils';

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

// Common template parts
const generateSvgTemplate = (pathData, width, height, size) => `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="{${size}}em"
    height="{${size}}em"
    viewBox="0 0 ${width} ${height}">
    ${pathData}
  </svg>`;

const generateComponentTemplate = ({
                                       scriptContent, size = 'size', pathData, width, height
                                   }) => `${scriptContent}

{#if display}
  ${generateSvgTemplate(pathData, width, height, size)}
{:else if occupy}
  <div style="height: {${size}}em; width: {${size}}em;" />
{/if}`;

function generateComponent(pathData, height, width, componentName, isTypescript) {
    const scriptContent = isTypescript ? `<script lang="ts" context="module">
  export interface ${componentName}Props {
    display?: boolean;
    occupy?: boolean;
    size?: number;
  }
</script>

<script lang="ts">
  const { display = false, occupy = true, size = 0.7 }: ${componentName}Props = $props();
</script>` : `<script>
  const { display = false, occupy = true, size = 0.7 } = $props();
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

export async function downloadIcon(collection, name, options = {}) {
    const {
        outputDir = 'src/icons', withTs = false, withJs = true
    } = options;

    try {
        // Fetch and validate icon
        const response = await axios.get(`https://api.iconify.design/${collection}/${name}.svg`);
        if (response.status !== 200) {
            throw new Error(`Failed to download icon ${collection}:${name}`);
        }

        // Process icon data
        const iconData = await processIconData(response.data);
        const renderData = iconToSVG(iconData, {
            height: 'auto', width: 'auto'
        });

        // Prepare output
        await mkdirp(outputDir);
        const componentName = `${capitalizeFirstLetter(collection)}${capitalizeFirstLetter(name)}`;

        // Generate component content based on type
        const content = generateComponent(renderData.body, iconData.height, iconData.width, componentName, withTs);

        // Write file
        const outputPath = path.join(outputDir, `${componentName}.svelte`);
        await fs.writeFile(outputPath, content, 'utf8');

        return [outputPath];
    } catch (error) {
        throw new Error(`Error processing icon: ${error.message}`);
    }
}