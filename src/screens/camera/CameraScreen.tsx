// screens/camera/CameraScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';

const API_URL = config.API_URL;

interface SecurityCamera {
  id: string;
  cameraId: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'tampered' | 'low_battery';
  lastHeartbeat: string;
  batteryLevel: number;
  isSolarPowered: boolean;
  videoFeedUrl?: string;
  alertsEnabled: boolean;
  lastAlert?: string;
}

export default function CameraScreen({ navigation }: any) {
  const [cameras, setCameras] = useState<SecurityCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockCameras: SecurityCamera[] = [
        {
          id: '1',
          cameraId: 'CAM-001',
          name: 'Main Entrance',
          location: 'Front door, facing cashier',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          batteryLevel: 85,
          isSolarPowered: true,
          alertsEnabled: true,
        },
        {
          id: '2',
          cameraId: 'CAM-002',
          name: 'Storage Room',
          location: 'Back storage area',
          status: 'offline',
          lastHeartbeat: new Date(Date.now() - 30 * 60000).toISOString(),
          batteryLevel: 25,
          isSolarPowered: true,
          alertsEnabled: true,
          lastAlert: 'Camera disconnected 30 minutes ago',
        },
        {
          id: '3',
          cameraId: 'CAM-003',
          name: 'Sales Counter',
          location: 'Main sales counter',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          batteryLevel: 92,
          isSolarPowered: false,
          alertsEnabled: true,
        },
        {
          id: '4',
          cameraId: 'CAM-004',
          name: 'Back Entrance',
          location: 'Employee entrance',
          status: 'tampered',
          lastHeartbeat: new Date(Date.now() - 15 * 60000).toISOString(),
          batteryLevel: 45,
          isSolarPowered: true,
          alertsEnabled: true,
          lastAlert: 'Camera angle changed unexpectedly',
        },
        {
          id: '5',
          cameraId: 'CAM-005',
          name: 'Parking Area',
          location: 'Store parking lot',
          status: 'low_battery',
          lastHeartbeat: new Date().toISOString(),
          batteryLevel: 15,
          isSolarPowered: true,
          alertsEnabled: true,
          lastAlert: 'Battery critically low',
        },
        {
          id: '6',
          cameraId: 'CAM-006',
          name: 'Storage Aisle 2',
          location: 'Second storage aisle',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          batteryLevel: 78,
          isSolarPowered: false,
          alertsEnabled: false,
        },
      ];
      setCameras(mockCameras);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      Alert.alert('Error', 'Failed to load camera data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCameras();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.colors.success;
      case 'offline':
        return theme.colors.error;
      case 'tampered':
        return theme.colors.warning;
      case 'low_battery':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'tampered':
        return 'Tampered';
      case 'low_battery':
        return 'Low Battery';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return 'checkmark-circle';
      case 'offline':
        return 'close-circle';
      case 'tampered':
        return 'warning';
      case 'low_battery':
        return 'battery-half';
      default:
        return 'help-circle';
    }
  };

  const toggleCameraAlerts = (cameraId: string, currentValue: boolean) => {
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId ? { ...cam, alertsEnabled: !currentValue } : cam
    ));
    // API call would go here
  };

  const handleViewFeed = (camera: SecurityCamera) => {
    if (camera.status !== 'online') {
      Alert.alert('Camera Offline', 'This camera is currently offline. Cannot view feed.');
      return;
    }
    Alert.alert('View Feed', `Live feed from ${camera.name} would open here.`);
  };

  const handleRebootCamera = (cameraId: string) => {
    Alert.alert(
      'Reboot Camera',
      'Are you sure you want to reboot this camera?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reboot',
          onPress: () => {
            // API call to reboot camera
            Alert.alert('Success', 'Camera reboot command sent');
          },
        },
      ]
    );
  };

  const getFilteredCameras = () => {
    if (showOfflineOnly) {
      return cameras.filter(cam => cam.status !== 'online');
    }
    return cameras;
  };

  const filteredCameras = getFilteredCameras();

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Security Cameras
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {cameras.filter(c => c.status === 'online').length} online • {
            cameras.filter(c => c.status !== 'online').length
          } issues
        </Text>
      </View>
      <GlassButton
        size="small"
        variant="primary"
        onPress={() => navigation.navigate('AddCamera')}
        icon="add"
        title="Add"
        style={{ width: "auto" }}
      />
    </View>
  );

  const renderFilterToggle = () => (
    <GlassView style={styles.filterCard} intensity={20}>
      <View style={styles.filterContent}>
        <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
        <View style={styles.filterText}>
          <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
            Show Only Issues
          </Text>
          <Text style={[styles.filterSubtitle, { color: theme.colors.textSecondary }]}>
            {cameras.filter(c => c.status !== 'online').length} cameras need attention
          </Text>
        </View>
      </View>
      <Switch
        value={showOfflineOnly}
        onValueChange={setShowOfflineOnly}
        trackColor={{ false: theme.colors.border, true: theme.colors.warning + '80' }}
        thumbColor={showOfflineOnly ? theme.colors.warning : '#f4f3f4'}
      />
    </GlassView>
  );

  const renderCameraCard = (camera: SecurityCamera) => {
    const statusColor = getStatusColor(camera.status);

    return (
      <GlassView key={camera.id} style={styles.cameraCard} intensity={25}>
        <View style={styles.cameraHeader}>
          <View style={styles.cameraInfo}>
            <View style={styles.cameraTitleRow}>
              <Text style={[styles.cameraName, { color: theme.colors.text }]}>
                {camera.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Ionicons
                  name={getStatusIcon(camera.status) as any}
                  size={12}
                  color={statusColor}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusText(camera.status)}
                </Text>
              </View>
            </View>

            <Text style={[styles.cameraId, { color: theme.colors.textTertiary }]}>
              {camera.cameraId}
            </Text>
            <Text style={[styles.cameraLocation, { color: theme.colors.textSecondary }]}>
              {camera.location}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Camera Actions',
                `Select action for ${camera.name}:`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'View Live Feed', onPress: () => handleViewFeed(camera) },
                  { text: 'View Recordings', onPress: () => navigation.navigate('Recordings', { cameraId: camera.id }) },
                  { text: 'Reboot Camera', onPress: () => handleRebootCamera(camera.id) },
                  { text: 'Edit Settings', onPress: () => navigation.navigate('EditCamera', { cameraId: camera.id }) },
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Camera Feed Placeholder */}
        <View style={styles.feedPlaceholder}>
          {camera.status === 'online' ? (
            <View style={styles.liveFeed}>
              <View style={styles.liveBadge}>
                <View style={[styles.liveDot, { backgroundColor: theme.colors.error }]} />
                <Text style={[styles.liveText, { color: theme.colors.error }]}>
                  LIVE
                </Text>
              </View>
              <Image
                source={{ uri: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Live+Feed' }}
                style={styles.feedImage}
              />
              <TouchableOpacity
                style={[styles.viewFeedButton, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
                onPress={() => handleViewFeed(camera)}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.viewFeedText}>View Feed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.offlineFeed, { backgroundColor: theme.colors.background }]}>
              <Ionicons size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.offlineText, { color: theme.colors.textSecondary }]}>
                Camera Offline
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cameraDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="battery-charging-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Battery
              </Text>
              <Text style={[
                styles.detailValue,
                {
                  color: camera.batteryLevel < 20 ? theme.colors.error :
                    camera.batteryLevel < 50 ? theme.colors.warning : theme.colors.success
                }
              ]}>
                {camera.batteryLevel}%
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name={camera.isSolarPowered ? 'sunny-outline' : 'flash-outline'}
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Power
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {camera.isSolarPowered ? 'Solar' : 'Grid'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Last Seen
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {moment(camera.lastHeartbeat).fromNow()}
              </Text>
            </View>
          </View>

          {camera.lastAlert && (
            <View style={[styles.alertRow, { backgroundColor: theme.colors.error + '10' }]}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
              <Text style={[styles.alertText, { color: theme.colors.error }]}>
                {camera.lastAlert}
              </Text>
            </View>
          )}

          <View style={styles.cameraActions}>
            <GlassButton
              size="small"
              variant="secondary"
              onPress={() => toggleCameraAlerts(camera.id, camera.alertsEnabled)}
              icon={camera.alertsEnabled ? 'notifications' : 'notifications-off'}
              title={camera.alertsEnabled ? 'Alerts On' : 'Alerts Off'}
              style={{ flex: 1, marginRight: 8 }}
            />

            <GlassButton
              size="small"
              variant="primary"
              onPress={() => navigation.navigate('CameraHistory', { cameraId: camera.id })}
              icon="time-outline"
              title="History"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </GlassView>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Cameras
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {showOfflineOnly
          ? 'No cameras with issues found'
          : 'Add your first security camera to get started'
        }
      </Text>
      {!showOfflineOnly && (
        <GlassButton
          size="medium"
          variant="primary"
          onPress={() => navigation.navigate('AddCamera')}
          icon="add"
          title="Add Camera"
        />
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {renderHeader()}
          {renderFilterToggle()}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Cameras ({filteredCameras.length})
          </Text>

          {filteredCameras.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredCameras.map(camera => renderCameraCard(camera))
          )}

          {/* Quick Stats */}
          <GlassView style={styles.statsCard} intensity={20}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
              Camera Status Overview
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {cameras.filter(c => c.status === 'online').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Online
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.error }]}>
                  {cameras.filter(c => c.status === 'offline').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Offline
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                  {cameras.filter(c => c.status === 'tampered' || c.status === 'low_battery').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Issues
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {cameras.filter(c => c.alertsEnabled).length}/{cameras.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Alerts
                </Text>
              </View>
            </View>
          </GlassView>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterText: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  filterSubtitle: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cameraCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cameraName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cameraId: {
    fontSize: 12,
    marginBottom: 2,
  },
  cameraLocation: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  feedPlaceholder: {
    height: 200,
  },
  liveFeed: {
    flex: 1,
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  viewFeedButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewFeedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  offlineFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 14,
    marginTop: 8,
  },
  cameraDetails: {
    padding: 16,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cameraActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});