/**
 * SortBy — compact "Sort By:" chip that opens a sheet of sorting options.
 *
 * Sorting is purely client-side: `applySort` reorders whatever list is already
 * in state. Nothing here is sent to the API.
 *
 * Props:
 *   options  – array of sort options, see the shape below
 *   value    – currently selected option's `value`
 *   onChange – callback(option) fired when an option is picked
 *   title    – sheet heading
 *
 * Option shape:
 *   {
 *     label: 'Highest hourly rate',  // shown in the sheet + chip
 *     value: 'rate-desc',            // unique key
 *     field: 'hourlyRate',           // item key to sort on — a dotted path, or an
 *                                    // array of paths where the first present wins
 *     order: 'desc',                 // 'asc' | 'desc' (default)
 *     type:  'number',               // 'number' | 'date' | 'string' (default)
 *   }
 *
 * An option with no `field` (e.g. "Recommended") leaves the list order untouched.
 */
import {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {ArrowDownUp, Check} from 'lucide-react-native';
import Text from './Text';
import {FontFamily} from '~theme/fonts';

// ── Local sorting ─────────────────────────────────────────────────────────────

const readPath = (item, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), item);

// `field` may be a list of candidate paths — the first one present wins, which
// lets a screen cope with an API that names the same value differently.
const readValue = (item, field) => {
  const paths = Array.isArray(field) ? field : [field];
  for (const path of paths) {
    const found = readPath(item, path);
    if (found !== undefined && found !== null && found !== '') return found;
  }
  return null;
};

const toComparable = (raw, type) => {
  if (raw === undefined || raw === null || raw === '') return null;
  if (type === 'number') {
    const num = Number(String(raw).replace(/[^0-9.-]/g, ''));
    return Number.isNaN(num) ? null : num;
  }
  if (type === 'date') {
    const time = new Date(raw).getTime();
    return Number.isNaN(time) ? null : time;
  }
  return String(raw).toLowerCase();
};

/**
 * Sorts a copy of `items` by the given option. Items with a missing value always
 * sink to the bottom, whichever direction is picked. Returns `items` untouched
 * when the option has no `field` (server order wins).
 */
export const applySort = (items = [], option) => {
  if (!option?.field) return items;

  const {field} = option;
  const type = option.type ?? 'string';
  const direction = option.order === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    const left = toComparable(readValue(a, field), type);
    const right = toComparable(readValue(b, field), type);

    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;

    if (type === 'string') return left.localeCompare(right) * direction;
    return (left - right) * direction;
  });
};

// ── Component ─────────────────────────────────────────────────────────────────

const SortBy = ({options = [], value, onChange, title = 'Sort By'}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  const handleSelect = option => {
    setOpen(false);
    onChange?.(option);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.chip}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}>
        <Text style={styles.chipLabel}>Sort By:</Text>
        {selected ? (
          <Text style={styles.chipValue} numberOfLines={1}>
            {selected.label}
          </Text>
        ) : null}
        <View style={styles.arrowContainer}>
          <ArrowDownUp size={RFValue(11)} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <SafeAreaView style={styles.sheet}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({item}) => {
                const isActive = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isActive && styles.optionActive]}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item)}>
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}>
                      {item.label}
                    </Text>
                    {isActive && (
                      <Check size={RFValue(13)} color="#F2A154" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  chipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  chipValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#10375C',
    flexShrink: 1,
  },
  arrowContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 12,
    maxHeight: 400,
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionActive: {backgroundColor: '#F8FAFC'},
  optionText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    flex: 1,
  },
  optionTextActive: {fontFamily: FontFamily.semiBold},
});

export default SortBy;
