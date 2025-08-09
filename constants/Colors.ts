
// Enhanced color palette
const darkTeal = "#5C4B51"; // Warm plum-gray
const lightTeal = "#5C4B51"; // Soft dusty rose
const cream = "#FAF3E3"; // Warm beige background
const white = "#FFFFFF";
const lightGray = "#F7F6F3";
const mediumGray = "#E1DDD7";
const darkGray = "#4A403A";
const success = "#8CB369"; // Warm green
const warning = "#E9A368"; // Soft orange
const error = "#D97D7D"; // Warm muted red
const info = "#A6B1E1"; // Soft lavender-blue

export const Colors = {
  light: {
    text: darkTeal,
    textSecondary: darkGray,
    background: cream,
    backgroundSecondary: lightGray,
    tint: lightTeal,
    icon: darkTeal,
    tabIconDefault: darkTeal,
    tabIconSelected: lightTeal,
    primary: darkTeal,
    secondary: lightTeal,
    accent: lightTeal,
    surface: white,
    surfaceSecondary: lightGray,
    border: mediumGray,
    borderPrimary: lightTeal,
    card: white,
    cardSecondary: lightGray,
    success: success,
    warning: warning,
    error: error,
    info: info,
    shadow: "rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    text: white,
    textSecondary: lightGray,
    background: darkTeal,
    backgroundSecondary: "#005A66",
    tint: lightTeal,
    icon: white,
    tabIconDefault: lightGray,
    tabIconSelected: lightTeal,
    primary: lightTeal,
    secondary: white,
    accent: lightTeal,
    surface: "#004D57",
    surfaceSecondary: "#003A42",
    border: lightTeal,
    borderPrimary: lightTeal,
    card: "#004D57",
    cardSecondary: "#003A42",
    success: success,
    warning: warning,
    error: error,
    info: info,
    shadow: "rgba(0, 0, 0, 0.3)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius system
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadow system
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
