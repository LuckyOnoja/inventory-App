import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export const GlassTabBarBackground = () => {
    const { theme } = useTheme();

    // Crystal clear glass - barely there tint
    const gradient = theme.mode === 'dark'
        ? ['rgba(30, 41, 59, 0.1)', 'rgba(15, 23, 42, 0.15)'] as const
        : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)'] as const;

    const borderColor = theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.2)';

    return (
        <View style={[StyleSheet.absoluteFill, { borderRadius: 35, overflow: 'hidden' }]}>
            <BlurView
                style={StyleSheet.absoluteFill}
                tint={theme.mode === 'dark' ? 'dark' : 'light'}
                intensity={30}
            />
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Delicate Inner Border */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        borderRadius: 35,
                        borderWidth: 1,
                        borderColor: borderColor,
                        opacity: 0.4
                    }
                ]}
            />
        </View>
    );
};

export const GlassHeaderBackground = () => {
    const { theme } = useTheme();

    const gradient = theme.mode === 'dark'
        ? ['rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.8)'] as const
        : ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.95)'] as const;

    return (
        <View style={StyleSheet.absoluteFill}>
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
            />
            <BlurView
                style={StyleSheet.absoluteFill}
                tint={theme.mode === 'dark' ? 'dark' : 'light'}
                intensity={50}
            />
            <View style={[styles.borderBottom, { backgroundColor: theme.colors.white + '10' }]} />
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
