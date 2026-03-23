import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    // Legacy props kept for backward compat — ignored in new design
    intensity?: number;
    gradient?: readonly [string, string, ...string[]];
    tint?: 'light' | 'dark' | 'default';
    borderWidth?: number;
}

/**
 * GlassView — redesigned as a simple card with a border and white/surface background.
 * All blur/glass effects removed for a clean, standard look.
 */
export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.lg,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        overflow: 'hidden',
    },
});
