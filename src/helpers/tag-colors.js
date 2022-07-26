import { TAG_COLORS, FALLBACK_TAG_COLOR } from '@/constants';
import { getCurrentTheme } from '@/helpers/general';

export const getTagColorByName = name => {
  const theme = getCurrentTheme()

  if (!TAG_COLORS[name]) return FALLBACK_TAG_COLOR[theme];

  if (!TAG_COLORS[name][theme]) return FALLBACK_TAG_COLOR[theme];

  const color = {
    background: TAG_COLORS[name][theme].background,
    text: TAG_COLORS[name][theme].text
  };

  if (!color.background) color.background = FALLBACK_TAG_COLOR[theme].background;
  if (!color.text) color.text = FALLBACK_TAG_COLOR[theme].text;

  return color;
};

export const getRandomTagColorName = () => {
    const availableColorNames = Object.keys(TAG_COLORS)
    const randomIndex = Math.floor(Math.random() * availableColorNames.length);
    const randomColorName = availableColorNames[randomIndex]

    return randomColorName
};