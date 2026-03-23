import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ViewStyle,
    Platform,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'gradient';
}

/**
 * ScreenWrapper provides a consistent layout with safe area,
 * proper status bar handling, and optional rich gradient backgrounds.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
    children, 
    style, 
    variant = 'default' 
}) => {
    const { theme } = useTheme();

    const isGradient = variant === 'gradient';
    const isDark = theme.mode === 'dark';

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isGradient || isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            
            {isGradient ? (
                <>
                    <LinearGradient
                        colors={theme.gradients.primary as unknown as [string, string, ...string[]]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />
                    {/* Subtle decorative "blobs" for background depth — keeping it clean */}
                    <View style={[
                        styles.blob, 
                        { 
                            width: width * 0.8, 
                            height: width * 0.8, 
                            borderRadius: width * 0.4,
                            top: -height * 0.1,
                            right: -width * 0.2,
                            backgroundColor: 'white',
                            opacity: 0.05,
                        }
                    ]} />
                </>
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} />
            )}

            <SafeAreaView style={[styles.safeArea, style]}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    blob: {
        position: 'absolute',
    },
});
