import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

    const getGradient = () => {
        if (disabled) return [theme.colors.gray[700], theme.colors.gray[800]];

        switch (variant) {
            case 'primary':
                return theme.gradients.primary;
            case 'secondary':
                return theme.gradients.secondary;
            case 'success':
                return theme.gradients.success;
            case 'warning':
                return theme.gradients.warning;
            case 'danger':
                return theme.gradients.error;
            case 'ghost':
                return ['transparent', 'transparent'];
            default:
                return theme.gradients.primary;
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'small': return 36;
            case 'large': return 56;
            default: return 48;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small': return theme.typography.buttonSmall.fontSize;
            default: return theme.typography.button.fontSize;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.container,
                {
                    height: getHeight(),
                    borderRadius: theme.borderRadius.lg,
                    shadowColor: variant === 'ghost' ? 'transparent' : theme.gradients.primary[0],
                    shadowOpacity: disabled || variant === 'ghost' ? 0 : 0.3,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                },
                style,
            ]}
        >
            <LinearGradient
                colors={getGradient() as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.gradient,
                    {
                        borderRadius: theme.borderRadius.lg,
                        borderWidth: variant === 'ghost' ? 1 : 0,
                        borderColor: variant === 'ghost' ? theme.colors.border : 'transparent',
                    }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        {icon && (
                            <Ionicons
                                name={icon}
                                size={20}
                                color={variant === 'ghost' ? theme.colors.text : '#FFF'}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text
                            style={[
                                styles.text,
                                {
                                    fontSize: getFontSize(),
                                    color: variant === 'ghost' ? theme.colors.text : '#FFF',
                                },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    text: {
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
