import type { SceneKey } from "./scenes";

/** The making scene that best tells each category's story. */
export const SCENE_FOR: Record<string, SceneKey> = {
  ghee: "cooking",
  milk: "milking",
  dahi: "pouring",
  lassi: "bilona",
  kheer: "boiling",
  "makhan-paneer": "churn",
  honey: "bees",
  oils: "kolhu",
};

export const STORY_SCENE: Record<string, SceneKey> = { ghee: "bilona", milk: "milking", dahi: "pouring", honey: "bees", oils: "kolhu" };
