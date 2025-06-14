import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';

interface Props {
  listings: any;
  listingNews: any;
}

const INITIAL_REGION: Region = {
  latitude: 2.9092,
  longitude: 11.15,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const ListingsMap = memo(({ listings, listingNews }: Props) => {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  useEffect(() => {
    onLocateMe();
    console.log('listingNews12')
    console.log(listingNews.features)
  }, []);

  const onLocateMe = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    mapRef.current?.animateToRegion(region, 1000);
  };

  const onMarkerPress = (item: any) => {
    router.push(`/listing/${item.properties.id}`);
  };

  return (
    <View style={defaultStyles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {listingNews.features.map((item: any) => (
          <Marker
            key={item.properties.id}
            coordinate={{
              latitude: item.properties.latitude,
              longitude: item.properties.longitude,
            }}
            onPress={() => onMarkerPress(item)}
          >
            <View
  style={[
    styles.markerContainer,
    {
      backgroundColor:
        item.properties.statut === 'Occupé' ? '#FF6B6B' : '#4CD964',
    },
  ]}
>
  <Text style={styles.markerTitle} numberOfLines={1}>
    {item.properties.name}
  </Text>
  <Text style={styles.markerPrice}>{item.properties.price.toLocaleString()} FCFA</Text>
</View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.locateBtn} onPress={onLocateMe}>
        <Ionicons name="navigate" size={24} color={Colors.dark} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  marker: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 2 },
    alignItems: 'center',
  },
  markerText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#000',
  },
  locateBtn: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 10 },
  },

  markerContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#4CD964',
    maxWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  
  markerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  
  markerPrice: {
    fontSize: 11,
    color: '#fff',
  },
  
});

export default ListingsMap;
