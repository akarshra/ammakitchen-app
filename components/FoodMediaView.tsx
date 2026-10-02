import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { Play, Pause, Video as VideoIcon } from 'lucide-react-native';
import { Colors } from '../constants/theme';

interface FoodMediaViewProps {
  imageUri: string;
  videoUri?: string;
  style?: any;
  contentFit?: 'cover' | 'contain';
  priority?: 'high' | 'normal' | 'low';
  showControls?: boolean;
}

export const FoodMediaView: React.FC<FoodMediaViewProps> = ({
  imageUri,
  videoUri,
  style,
  contentFit = 'cover',
  priority = 'normal',
  showControls = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isWeb && videoRef.current && videoUri) {
      const vid = videoRef.current;
      vid.muted = true;
      vid.defaultMuted = true;
      // @ts-ignore
      vid.playsInline = true;
      // @ts-ignore
      vid.webkitPlaysInline = true;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setVideoLoaded(true);
          })
          .catch((err) => {
            console.log('Autoplay handled:', err);
          });
      }
    }
  }, [videoUri, isWeb]);

  const togglePlayPause = () => {
    if (isWeb && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // If video is specified and running on web
  if (videoUri && !videoFailed && isWeb) {
    return (
      <View style={[styles.container, style]}>
        {/* Poster image underneath while video loads */}
        <Image
          source={{ uri: imageUri }}
          style={[styles.absoluteFill, { zIndex: 0 }]}
          contentFit={contentFit}
          priority={priority}
          cachePolicy="memory-disk"
        />

        {/* HTML5 Video element */}
        {/* @ts-ignore */}
        <video
          ref={videoRef}
          src={videoUri}
          poster={imageUri}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          onPlaying={() => setVideoLoaded(true)}
          onError={() => setVideoFailed(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: contentFit,
            display: 'block',
            zIndex: 1,
          }}
        />

        {/* Optional Play/Pause interactive touch control */}
        {showControls && videoLoaded && (
          <TouchableOpacity
            onPress={togglePlayPause}
            activeOpacity={0.8}
            style={styles.playControlBtn}
          >
            {isPlaying ? (
              <Pause size={14} color="#FFFFFF" />
            ) : (
              <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Fallback to high-performance cached image
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit={contentFit}
        priority={priority}
        cachePolicy="memory-disk"
        transition={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playControlBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 15, 21, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
