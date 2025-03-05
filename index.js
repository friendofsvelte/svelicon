import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import {mkdirp} from 'mkdirp';
import {parseSVGContent, convertParsedSVG, iconToSVG} from '@iconify/utils';

const capitalizeFirstLetter = (string) => {
    // Split the string by ':' and '-' to handle both separator types
    return string
        .split(/[:,-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

// Common template parts
const generateSvgTemplate = (pathData, width, height, size) => `<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{${size}}em"
   height="{${size}}em"
   viewBox="0 0 ${width} ${height}"
   class="{className}">
  ${pathData}
</svg>`;

const generateComponentTemplate = ({
                                       scriptContent, size = 'size', pathData, width, height
                                   }) => `${scriptContent}

${generateSvgTemplate(pathData, width, height, size)}`;

function generateComponent(pathData, height, width, componentName, isTypescript) {
    const scriptContent = isTypescript ? `<script lang="ts" module>
  export type ${componentName}Props = {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: ${componentName}Props = $props();
</script>` : `<script>
  const { size = 0.7, class: className = '' } = $props();
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

export async function downloadIcon(icon, options = {}) {
    const {
        outputDir = 'src/icons', withTs = false, withJs = true
    } = options;

    try {
        // Replace spaces with slashes in the name
        // Fetch and validate icon
        const response = await axios.get(`https://api.iconify.design/${icon}.svg`);
        if (response.status !== 200) {
            console.log(`Failed to download icon ${icon}`);
            return [];
        }

        // Process icon data
        const iconData = await processIconData(response.data);
        const renderData = iconToSVG(iconData, {
            height: 'auto', width: 'auto'
        });

        // Prepare output
        await mkdirp(outputDir);
        const names = icon.split('/');
        const collectionName = names[0];
        const iconName = names[1];
        if (!iconName) {
            throw new Error('Invalid icon name');
        }
        const componentName = `${capitalizeFirstLetter(collectionName)}${capitalizeFirstLetter(iconName.replace(/ /g, '-'))}`;

        // Generate component content based on type
        const content = generateComponent(renderData.body, iconData.height, iconData.width, componentName, withTs);

        // Write file
        const outputPath = path.join(outputDir, `${componentName}.svelte`);
        await fs.writeFile(outputPath, content, 'utf8');

        return [outputPath];
    } catch (error) {
        console.error(`Failed to download icon ${icon}:\n ${error.message}`);
        return [];
    }
}