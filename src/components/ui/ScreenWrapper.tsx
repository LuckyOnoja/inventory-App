import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    withScrollView?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            {/* Background radial/gradient blobs for "Web3" look */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={theme.mode === 'dark' ? theme.gradients.dark : theme.gradients.light}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Top left accent blob */}
                <View style={[styles.blob, styles.blobTopLeft, { backgroundColor: theme.colors.primary, opacity: 0.15 }]} />

                {/* Bottom right accent blob */}
                <View style={[styles.blob, styles.blobBottomRight, { backgroundColor: theme.colors.secondary, opacity: 0.1 }]} />

                {/* Mid right accent blob (smaller) */}
                <View style={[styles.blob, styles.blobMidRight, { backgroundColor: theme.colors.accent, opacity: 0.1 }]} />
            </View>

            <SafeAreaView style={[styles.content, style]} edges={['top', 'left', 'right']}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        filter: Platform.OS === 'web' ? 'blur(80px)' : undefined, // Native blur would need different handling or image
        // For native, we rely on opacity since blurring views is expensive or requires valid libraries.
        // However, on modern Expo/RN, simple opacity blobs over a gradient look "glowy".
    },
    blobTopLeft: {
        top: -100,
        left: -100,
    },
    blobBottomRight: {
        bottom: -100,
        right: -50,
        width: 350,
        height: 350,
        borderRadius: 175,
    },
    blobMidRight: {
        top: '30%',
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
    }
});
