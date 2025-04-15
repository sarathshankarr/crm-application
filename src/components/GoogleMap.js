import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const GoogleMap = ({navigation, route}) => {
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setMarker({latitude, longitude});
        reverseGeocode(latitude, longitude);
      },
      error => {
        console.log('Location error:', error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q`,
      );
      const json = await response.json();
      if (json.results.length > 0) {
        const addr = json.results[0].formatted_address;
        setAddress(addr);
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
    }
  };

  const handleMapPress = e => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setMarker({latitude, longitude});
    setRegion({
      ...region,
      latitude,
      longitude,
    });
    reverseGeocode(latitude, longitude);
  };

  const handleConfirm = async () => {
    if (!marker) return;

    const location = {
      latitude: marker.latitude,
      longitude: marker.longitude,
      address,
      city: '',
      country: '',
      pincode: '',
    };

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.latitude},${marker.longitude}&key=AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q`,
      );
      const json = await response.json();
      const components = json.results[0].address_components;

    //   components.forEach(component => {
    //     if (component.types.includes('locality')) {
    //       location.city = component.long_name;
    //     }
    //     if (component.types.includes('country')) {
    //       location.country = component.long_name;
    //     }
    //     if (component.types.includes('postal_code')) {
    //       location.pincode = component.long_name;
    //     }
    //   });

      location.address = json.results[0].formatted_address;

      route.params?.onLocationSelected?.(location);
      navigation.goBack();
    } catch (error) {
      console.log('Reverse geocode error:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      {/* Header */}
      <View
        style={{
          position: 'relative',
          alignItems: 'center',
          paddingVertical: 10,
          backgroundColor: '#fff',
          elevation: 5,
          zIndex: 2,
        }}>
        <Text
          style={{
            color: '#000',
            fontWeight: 'bold',
            fontSize: 17,
            textAlign: 'center',
            marginTop: 5,
          }}>
          Pick Location
        </Text>
      </View>

      {/* Search Bar */}
     

      {/* Map */}
      {region && (
        <MapView
          style={{flex: 1}}
          region={region}
          onPress={handleMapPress}>
          {marker && <Marker coordinate={marker} />}
        </MapView>
      )}
    <GooglePlacesAutocomplete
  placeholder="Search for a location"
  fetchDetails={true}
  onPress={(data, details = null) => {
    if (details) {
      const {lat, lng} = details.geometry.location;
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });
      setMarker({latitude: lat, longitude: lng});
      setAddress(details.formatted_address);
    }
  }}
  query={{
    key: 'AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q',
    language: 'en',
  }}
  styles={{
    container: {flex: 0, zIndex: 1},
    textInput: {
      height: 40,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor: '#fff',
      color: '#000',
    },
    listView: {
      backgroundColor: '#fff',
    },
    row: {
      padding: 13,
      height: 44,
      flexDirection: 'row',
    },
    description: {
      color: 'black', // 👈 This changes the suggestion text color
    },
    predefinedPlacesDescription: {
      color: 'black',
    },
  }}
  textInputProps={{
    placeholderTextColor: 'black',
  }}
/>
      {/* Confirm Button */}
      <TouchableOpacity
            onPress={handleConfirm}
            style={{padding: 15, backgroundColor: 'blue',marginBottom:15,marginHorizontal:25,borderRadius:10}}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Confirm Location
            </Text>
          </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  confirmBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    zIndex: 3,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GoogleMap;
