import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GlassViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    gradient?: readonly [string, string, ...string[]];
    tint?: 'light' | 'dark' | 'default';
    borderWidth?: number;
}

export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 20,
    gradient,
    tint,
    borderWidth = 1,
}) => {
    const { theme } = useTheme();

    // Default to theme specific tint if not provided
    const blurTint = tint || (theme.mode === 'dark' ? 'dark' : 'light');

    // Default gradient based on theme
    const backgroundGradient = gradient ||
        (theme.mode === 'dark' ? theme.gradients.glassDark : theme.gradients.glass);

    return (
        <View style={[styles.container, { borderRadius: theme.borderRadius.xl }, style]}>
            <BlurView
                intensity={intensity}
                tint={blurTint}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={backgroundGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        opacity: 0.5,
                        borderRadius: theme.borderRadius.xl,
                        borderWidth: borderWidth,
                        borderColor: theme.colors.white + '20', // Subtle frost border
                    }
                ]}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        // Ensure content sits above the absolute positioned backgrounds
        zIndex: 1,
        flex: 1,
    },
});
