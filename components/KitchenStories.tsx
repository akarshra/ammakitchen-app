import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { Sparkles, Flame, Heart, ShieldCheck, Coffee } from 'lucide-react-native';

interface KitchenStory {
  id: string;
  dishId: string;
  title: string;
  tag: string;
  image: string;
  isLive?: boolean;
}

const STORIES: KitchenStory[] = [
  {
    id: 'story-1',
    dishId: 'ak-south-indian-meals',
    title: 'Grand Thali',
    tag: 'LIVE',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=300&q=80',
    isLive: true,
  },
  {
    id: 'story-2',
    dishId: 'ak-idli-vada-combo',
    title: 'Tiffin Feast',
    tag: 'FRESH',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'story-3',
    dishId: 'ak-mini-meals',
    title: 'Mini Meals',
    tag: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
    isLive: true,
  },
  {
    id: 'story-4',
    dishId: 'ak-senior-citizen-meal',
    title: 'Senior Care',
    tag: 'GENTLE',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'story-5',
    dishId: 'ak-salem-thattu-vadai-set',
    title: 'Street Set',
    tag: 'CRISPY',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=300&q=80',
    isLive: true,
  },
  {
    id: 'story-6',
    dishId: 'ak-curd-rice',
    title: 'Curd Rice',
    tag: 'COOLING',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80',
  },
];

export const KitchenStories: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORIES.map((story) => (
          <TouchableOpacity
            key={story.id}
            onPress={() => router.push(`/dish/${story.dishId}` as any)}
            activeOpacity={0.82}
            style={styles.storyItem}
          >
            <View
              style={[
                styles.avatarRing,
                story.isLive && styles.avatarRingLive,
              ]}
            >
              <Image
                source={{ uri: story.image }}
                style={styles.avatarImage}
                contentFit="cover"
                priority="high"
              />
              {story.isLive ? (
                <View style={styles.liveTag}>
                  <Text style={styles.liveTagText}>LIVE</Text>
                </View>
              ) : (
                <View style={styles.badgeTag}>
                  <Text style={styles.badgeTagText}>{story.tag}</Text>
                </View>
              )}
            </View>
            <Text style={styles.storyTitle} numberOfLines={1}>
              {story.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 66,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    backgroundColor: '#161D2B',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarRingLive: {
    borderColor: Colors.terracotta,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  liveTag: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  liveTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  badgeTag: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#111620',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: Colors.goldMetallic,
  },
  badgeTagText: {
    color: Colors.goldMetallic,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  storyTitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
