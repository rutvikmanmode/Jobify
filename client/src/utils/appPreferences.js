const STORAGE_KEY = "appPreferences";

export const DEFAULT_PREFERENCES = {
  darkMode: false,
  compactView: false,
  reduceMotion: false,
  fontSize: "medium"
};

export const loadPreferences = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
};

export const savePreferences = (preferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

export const applyPreferences = (preferences) => {
  const root = document.documentElement;
  const body = document.body;

  if (preferences.darkMode) {
    root.setAttribute("data-theme", "dark");
    root.classList.add("dark");
  } else {
    root.removeAttribute("data-theme");
    root.classList.remove("dark");
  }

  body.classList.toggle("compact-view", Boolean(preferences.compactView));
  body.classList.toggle("reduce-motion", Boolean(preferences.reduceMotion));
  body.classList.toggle("font-small", preferences.fontSize === "small");
  body.classList.toggle("font-large", preferences.fontSize === "large");
};

export const updatePreferences = (next) => {
  const merged = { ...loadPreferences(), ...next };
  savePreferences(merged);
  applyPreferences(merged);
  return merged;
};
