import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

const OrganizationInfo = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectState, setSelectState] = useState('');
  const [selectCity, setSelectCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [udyamType, setUdyamType] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [selectedApparels, setSelectedApparels] = useState([]);

  const apparelOptions = [
    'Dress',
    'Kurti',
    'Garment',
    'Fabric',
    'Saree',
    'Other',
  ];

  const handleOrganizationNameChange = text => {
    setOrganizationName(text);
  };

  const handleContactNumberChange = text => {
    setContactNumber(text);
  };

  const handleAddressChange = text => {
    setAddress(text);
  };

  const handleSelectState = text => {
    setSelectState(text);
  };

  const handleSelectCity = text => {
    setSelectCity(text);
  };

  const handlePincodeChange = text => {
    setPincode(text);
  };

  const handlePanNumberChange = text => {
    setPanNumber(text);
  };

  const handleGstNumberChange = text => {
    setGstNumber(text);
  };

  const handleUdyamTypeChange = text => {
    setUdyamType(text);
  };

  const handleUdyamNumberChange = text => {
    setUdyamNumber(text);
  };

  const handleApparelSelection = apparel => {
    // Toggle selection of apparel
    if (selectedApparels.includes(apparel)) {
      setSelectedApparels(selectedApparels.filter(item => item !== apparel));
    } else {
      setSelectedApparels([...selectedApparels, apparel]);
    }
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity style={styles.personalInfoContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            style={[styles.profileImage, { tintColor: 'gray' }]}
                            source={require('../../../assets/profile.png')}
                        />
                        <Image
                            style={styles.cameraIconRight}
                            source={require('../../../assets/cam.png')}
                        />
                    </View>
                </TouchableOpacity>
        <View style={styles.contentContainer}>
          <View style={styles.orgnmetxt}>
            <TextInput
              placeholder="Organization Name"
              placeholderTextColor="#000"
              value={organizationName}
              onChangeText={handleOrganizationNameChange}
            />
            <View style={styles.underlne} />
          </View>
          <View style={styles.contxt}>
            <TextInput
              placeholder="Contact Number"
              placeholderTextColor="#000"
              value={contactNumber}
              onChangeText={handleContactNumberChange}
              keyboardType="numeric"
            />
            <View style={styles.underlne} />
          </View>
          <View style={{marginTop: 10, marginLeft: 15}}>
            <Text style={{fontSize: 20, color: '#000', fontWeight: 'bold'}}>
              Apparel Type
            </Text>
          </View>
          <View style={styles.apparelContainer}>
  {apparelOptions.map((apparel, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.apparelButton,
        selectedApparels.includes(apparel) && styles.selectedApparel,
      ]}
      onPress={() => handleApparelSelection(apparel)}>
      <Text
        style={{
          textAlign: 'center',
          color: '#000',
          fontWeight: 'bold',
        }}>
        {apparel}
      </Text>
    </TouchableOpacity>
  ))}
</View>
          <View style={styles.contxt}>
            <TextInput
              placeholder="Address"
              placeholderTextColor="#000"
              value={address}
              onChangeText={handleAddressChange}
            />
            <View style={styles.underlne} />
          </View>
          <TouchableOpacity>
            <View style={styles.contxt}>
              <TextInput
                placeholder="Select State"
                placeholderTextColor="#000"
                value={selectState}
                onChangeText={handleSelectState}
              />
              <View style={styles.underlne} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.contxt}>
              <TextInput
                placeholder="Select City"
                placeholderTextColor="#000"
                value={selectCity}
                onChangeText={handleSelectCity}
              />
              <View style={styles.underlne} />
            </View>
          </TouchableOpacity>
          <View style={styles.contxt}>
            <TextInput
              placeholder="Pincode"
              placeholderTextColor="#000"
              value={pincode}
              onChangeText={handlePincodeChange}
              keyboardType="numeric"
            />
            <View style={styles.underlne} />
          </View>
          <View style={styles.contxt}>
            <TextInput
              placeholder="PAN Number"
              placeholderTextColor="#000"
              value={panNumber}
              onChangeText={handlePanNumberChange}
            />
            <View style={styles.underlne} />
          </View>
          <View style={styles.contxt}>
            <TextInput
              placeholder="GST Number"
              placeholderTextColor="#000"
              value={gstNumber}
              onChangeText={handleGstNumberChange}
            />
            <View style={styles.underlne} />
          </View>
          <View style={{marginLeft: 5, marginTop: 10}}>
            <TextInput
              placeholder="Udyam Type"
              placeholderTextColor="#000"
              value={udyamType}
              onChangeText={handleUdyamTypeChange}
            />
            <View style={styles.underlne} />
          </View>
          <View style={{marginBottom:80}}>
            <View style={styles.contxt}>
              <TextInput
                placeholder="Udyam Number"
                placeholderTextColor="#000"
                value={udyamNumber}
                onChangeText={handleUdyamNumberChange}
              />
              <View style={styles.underlne} />
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  personalInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
},
profileImageContainer: {
    position: 'relative',
},
profileImage: {
    height: 110,
    width: 110,
},
cameraIconRight: {
    height: 35,
    width: 35,
    position: 'absolute',
    top: 1,
    right: 1,
},
  orgnmetxt: {
    marginLeft: 5,
  },
  contxt: {
    marginLeft: 5,
    marginTop: 10,
  },
  underlne: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginRight: 10,
  },
  apparelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  apparelButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 60,
    paddingVertical: 6,
    width: '30%', // Adjust the width to fit three columns
    marginBottom: 10, // Adjust spacing between items
  },
  selectedApparel: {
    backgroundColor: '#390050',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  updateButton: {
    borderWidth: 1,
    backgroundColor: 'gray',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 20,
  },
  updateButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OrganizationInfo;
