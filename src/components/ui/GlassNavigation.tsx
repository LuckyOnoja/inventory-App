import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Clean tab bar and header backgrounds — no glassmorphism, no gradients.
 */
export const GlassTabBarBackground = () => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                }
            ]}
        />
    );
};

export const GlassHeaderBackground = () => {
    const { theme } = useTheme();

    return (
        <View style={StyleSheet.absoluteFill}>
            <View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: theme.colors.surface },
                ]}
            />
            <View style={[styles.borderBottom, { backgroundColor: theme.colors.border }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    borderBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
    },
});
