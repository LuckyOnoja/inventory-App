import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
    size?: 'small' | 'medium' | 'large';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

/**
 * GlassButton — redesigned as a clean button with a subtle gradient matching the icon.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { theme } = useTheme();

    const getColors = () => {
        if (disabled) return [theme.colors.gray[300], theme.colors.gray[300]];
        switch (variant) {
            case 'primary':   return theme.gradients.primary;
            case 'secondary': return theme.gradients.secondary;
            case 'success':   return theme.gradients.success;
            case 'warning':   return theme.gradients.warning;
            case 'danger':    return theme.gradients.error;
            case 'ghost':     return ['transparent', 'transparent'];
            default:          return theme.gradients.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.gray[500];
        if (variant === 'ghost') return theme.colors.primary;
        return '#FFFFFF';
    };

    const getHeight = () => {
        switch (size) {
            case 'small':  return 36;
            case 'large':  return 52;
            default:       return 44;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small': return 14;
            default:      return 16;
        }
    };

    const isGhost = variant === 'ghost';

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator color={isGhost ? theme.colors.primary : '#FFF'} />
            ) : (
                <View style={styles.row}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={size === 'small' ? 16 : 20}
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            {
                                fontSize: getFontSize(),
                                color: getTextColor(),
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </View>
            )}
        </>
    );

    if (isGhost) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.75}
                style={[
                    styles.container,
                    {
                        height: getHeight(),
                        backgroundColor: 'transparent',
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1.5,
                        borderColor: theme.colors.primary,
                    },
                    style,
                ]}
            >
                {renderContent()}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.88}
            style={[
                styles.container,
                {
                    height: getHeight(),
                    borderRadius: theme.borderRadius.md,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <LinearGradient
                colors={getColors() as unknown as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
    },
});
