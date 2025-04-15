import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Modal, Image} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const Notification = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [confirmedLocation, setConfirmedLocation] = useState(null);
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  useEffect(() => {
    Geocoder.init('AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q');
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setRegion(prevRegion => ({
          ...prevRegion,
          latitude,
          longitude,
        }));
        setMarker({latitude, longitude});

        Geocoder.from(latitude, longitude)
          .then(res => {
            const address = res.results[0].formatted_address;
            setAddress(address);
          })
          .catch(error => console.log('Geocoding error: ', error));
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const onMapPress = async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    setMarker({latitude, longitude});

    try {
      const res = await Geocoder.from(latitude, longitude);
      const address = res.results[0].formatted_address;
      setAddress(address);
    } catch (error) {
      console.log('Geocoding error: ', error);
    }
  };

  const handleConfirmLocation = () => {
    if (marker) {
      setConfirmedLocation({
        latitude: marker.latitude,
        longitude: marker.longitude,
        address: address,
      });
    }
    setIsLocationPickerVisible(false);
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <TouchableOpacity
        onPress={() => {
          getCurrentLocation(); // Fetch user's location before opening the map
          setIsLocationPickerVisible(true);
        }}
        style={{
          padding: 15,
          backgroundColor: 'blue',
          borderRadius: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: 'white'}}>Pick Location</Text>
        <Image
          style={{height: 25, width: 25}}
          source={require('../../../assets/location-pin.png')}
        />
      </TouchableOpacity>

      {confirmedLocation && (
        <View style={{marginTop: 20}}>
          <Text>Selected Address: {confirmedLocation.address}</Text>
          <Text>Latitude: {confirmedLocation.latitude}</Text>
          <Text>Longitude: {confirmedLocation.longitude}</Text>
        </View>
      )}

      <Modal visible={isLocationPickerVisible} animationType="slide">
        <View style={{flex: 1}}>
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            {/* Back Button (Left Side) */}
            <TouchableOpacity
              onPress={() => setIsLocationPickerVisible(false)}
              style={{
                position: 'absolute',
                left: 10, // Ensures it's on the left
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                style={{height: 25, width: 25, marginTop: 10}}
                source={require('../../../assets/back_arrow.png')}
              />
            </TouchableOpacity>

            {/* Centered Title */}
            <Text
              style={{
                color: '#000',
                fontWeight: 'bold',
                fontSize: 17,
                textAlign: 'center',
              }}>
              Pick Location
            </Text>
          </View>

          <MapView style={{flex: 1}} region={region} onPress={onMapPress}>
            {marker && <Marker coordinate={marker} />}
          </MapView>
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
              // key: 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M',

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
              },
            }}
          />
          <TouchableOpacity
            onPress={handleConfirmLocation}
            style={{padding: 15, backgroundColor: 'blue', margin: 10}}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Notification;
