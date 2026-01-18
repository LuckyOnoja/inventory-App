import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { GlassView } from './GlassView';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'highlight' | 'warning' | 'error';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    variant = 'default',
}) => {
    const { theme } = useTheme();

    const getGradient = () => {
        switch (variant) {
            case 'highlight':
                // Subtle accent gradient
                return ['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.15)'] as const;
            case 'warning':
                return ['rgba(245, 158, 11, 0.1)', 'rgba(251, 191, 36, 0.1)'] as const;
            case 'error':
                return ['rgba(239, 68, 68, 0.1)', 'rgba(248, 113, 113, 0.1)'] as const;
            default:
                // Default glass
                return undefined; // uses GlassView default
        }
    };

    return (
        <GlassView
            style={[styles.card, { padding: theme.spacing.md }, style]}
            gradient={getGradient()}
            intensity={25}
        >
            {children}
        </GlassView>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        width: '100%',
    },
});
