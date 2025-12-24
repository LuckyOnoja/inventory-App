import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();
  const isPositive = change?.startsWith('+');

  const CardContent = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {value}
          </Text>
          {change && (
            <View style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? theme.colors.success + '20' : theme.colors.error + '20' }
            ]}>
              <Ionicons 
                name={isPositive ? 'trending-up' : 'trending-down'} 
                size={12} 
                color={isPositive ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[
                styles.changeText,
                { color: isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                {change}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      {onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.textTertiary} 
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: '48%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
});

export default StatCard;