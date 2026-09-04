/**
 * PortfolioWorkCard — one showcased project on the profile screen.
 *
 * A collage of up to four project photos, dimmed behind a centred title and
 * summary. The whole tile opens the project; the ⋮ button is a separate hit
 * target for removing it.
 *
 * Props:
 *   title        string
 *   description  string
 *   photos       string[]  image URLs; the first four are laid out 2×2
 *   deleting     boolean   swaps the ⋮ for a spinner
 *   onPress      function
 *   onDelete     function  omitting it hides the ⋮ button
 */
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MoreVertical, ImageOff } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const CARD_HEIGHT = RFValue(140);

/**
 * The grid always draws four cells so a project with one photo does not render
 * as a lone quarter-tile against empty space — the photos repeat to fill it,
 * which is how the design's collage reads.
 */
const fillCells = (photos) => {
  const source = photos.filter(Boolean);
  if (source.length === 0) return [];
  return Array.from({ length: 4 }, (_, i) => source[i % source.length]);
};

const PortfolioWorkCard = ({
  title,
  description,
  photos = [],
  deleting = false,
  onPress,
  onDelete,
}) => {
  const cells = fillCells(photos);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {cells.length > 0 ? (
        <View style={styles.grid}>
          {cells.map((uri, i) => (
            <Image key={`${uri}-${i}`} source={{ uri }} style={styles.cell} />
          ))}
        </View>
      ) : (
        <View style={[styles.grid, styles.gridEmpty]}>
          <ImageOff size={RFValue(22)} color="#CBD5E1" strokeWidth={1.6} />
        </View>
      )}

      <View style={styles.overlay} />

      <View style={styles.overlayText}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {!!description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
      </View>

      {!!onDelete && (
        <TouchableOpacity
          style={styles.menuBtn}
          activeOpacity={0.7}
          hitSlop={10}
          disabled={deleting}
          onPress={onDelete}>
          {deleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MoreVertical size={RFValue(16)} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridEmpty: {
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cell: {
    width: '50%',
    height: '50%',
    backgroundColor: '#E2E8F0',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.74)',
  },
  overlayText: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: RFValue(12),
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: RFValue(14),
  },
  menuBtn: {
    position: 'absolute',
    top: RFValue(8),
    right: RFValue(8),
    width: RFValue(22),
    height: RFValue(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PortfolioWorkCard;
