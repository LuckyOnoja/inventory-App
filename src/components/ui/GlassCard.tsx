import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'highlight' | 'warning' | 'error';
}

/**
 * GlassCard — redesigned as a simple white card with a subtle shadow.
 * No glassmorphism, no gradients.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    variant = 'default',
}) => {
    const { theme } = useTheme();

    const getVariantStyle = () => {
        switch (variant) {
            case 'warning':
                return { borderColor: theme.colors.warning, borderWidth: 1.5 };
            case 'error':
                return { borderColor: theme.colors.error, borderWidth: 1.5 };
            case 'highlight':
                return { borderColor: theme.colors.primary, borderWidth: 1.5 };
            default:
                return { borderColor: theme.colors.border, borderWidth: 1 };
        }
    };

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    ...theme.shadows.sm,
                },
                getVariantStyle(),
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        width: '100%',
    },
});
