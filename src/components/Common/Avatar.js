/**
 * Avatar
 *
 * A profile picture with a person-icon placeholder for anyone who has not set
 * one. Single source of truth so every empty avatar in the app looks the same —
 * previously each call site invented its own fallback (random pravatar.cc
 * photos, initial-letter circles, a building emoji).
 *
 * Props:
 *   uri       string|null  remote image; the placeholder shows when absent
 *   size      number       width/height in px — the circle and icon scale off it
 *   style     object       extra styles (border, margin, …) merged last
 *   iconColor string       placeholder glyph colour
 *   bgColor   string       circle fill, behind both the image and the glyph
 */
import { View, Image, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';

const Avatar = ({
  uri,
  size = 40,
  style,
  iconColor = '#94A3B8',
  bgColor = '#F1F5F9',
}) => {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[shape, { backgroundColor: bgColor }, style]}
      />
    );
  }

  return (
    <View style={[shape, styles.placeholder, { backgroundColor: bgColor }, style]}>
      <User size={size * 0.55} color={iconColor} strokeWidth={1.8} />
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
