import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export const GlassTabBarBackground = () => {
    const { theme } = useTheme();

    const gradient = theme.mode === 'dark'
        ? ['#0F172A', '#020617'] as const // Solid Navy
        : ['#FFFFFF', '#F8FAFC'] as const;

    const borderColor = theme.mode === 'dark'
        ? 'rgba(0, 51, 255, 0.2)'
        : 'rgba(0, 51, 255, 0.1)';

    return (
        <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}>
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        borderRadius: 24,
                        borderWidth: 1.5,
                        borderColor: borderColor,
                    }
                ]}
            />
        </View>
    );
};

export const GlassHeaderBackground = () => {
    const { theme } = useTheme();

    const gradient = theme.mode === 'dark'
        ? ['#020617', 'rgba(2, 6, 23, 0.9)'] as const
        : ['#FFFFFF', 'rgba(255, 255, 255, 0.95)'] as const;

    return (
        <View style={StyleSheet.absoluteFill}>
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
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
