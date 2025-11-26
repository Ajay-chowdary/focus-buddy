import { DuckMood } from '../types';

// 3D Angry Face Emoji - "Enraged Face" for maximum impact
const ANGRY_EMOJI_URL = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Enraged%20Face.png';

export interface DuckReaction {
  mood: DuckMood;
  gifUrl: string;
}

/**
 * Returns the specific notification image requested.
 */
export const getRandomDuckReaction = (preferredMood?: DuckMood): DuckReaction => {
  return {
    mood: preferredMood || 'angry',
    gifUrl: ANGRY_EMOJI_URL
  };
};