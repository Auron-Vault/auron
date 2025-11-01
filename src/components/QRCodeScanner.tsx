import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { fonts } from '../constants/fonts';
import { colors } from '../constants/colors';

interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  React.useEffect(() => {
    if (visible) {
      requestCameraPermission();
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan QR codes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access to scan QR codes.',
          );
        }
      } else {
        // For iOS, the permission will be requested automatically by the Camera component
        // based on the Info.plist NSCameraUsageDescription
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeRead = (event: any) => {
    if (!isScanning) return;

    setIsScanning(false);

    // Extract the QR code data
    const scannedData = event.nativeEvent.codeStringValue;

    if (scannedData) {
      onScan(scannedData);
      onClose();
    }

    // Reset scanning after 2 seconds
    setTimeout(() => {
      setIsScanning(true);
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[fonts.pnbBold, styles.headerTitle]}>Scan QR Code</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera View */}
        {hasPermission === true ? (
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              cameraType={CameraType.Back}
              scanBarcode={true}
              onReadCode={handleBarCodeRead}
              showFrame={false}
            />

            {/* Scanning Frame */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={[fonts.pnbSemiBold, styles.instructions]}>
                Position the QR code within the frame
              </Text>
              <Text style={[fonts.pnbRegular, styles.subInstructions]}>
                The scanner will automatically detect the code
              </Text>
            </View>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.permissionDenied}>
            <Icon name="camera-off" size={64} color={colors.text.secondary} />
            <Text style={[fonts.pnbSemiBold, styles.permissionText]}>
              Camera Permission Required
            </Text>
            <Text style={[fonts.pnbRegular, styles.permissionSubText]}>
              Please enable camera access to scan QR codes
            </Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={[fonts.pnbSemiBold, styles.settingsButtonText]}>
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loading}>
            <Text style={[fonts.pnbRegular, styles.loadingText]}>
              Requesting camera permission...
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary.light,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructions: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructions: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  permissionDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    color: colors.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: colors.primary.bg80,
    borderRadius: 12,
  },
  settingsButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default QRCodeScanner;
