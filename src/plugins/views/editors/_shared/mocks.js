// Mock useTranslation hook
export function useTranslation() {
  return { t: s => s };
}

// Export a non implmeneted empty function
export const DEFAULT_FUNCTION = name => console.log(`${name} not implemented`);
