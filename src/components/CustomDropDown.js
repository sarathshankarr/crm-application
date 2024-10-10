import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import axios from 'axios';
import {API} from '../config/apiConfig';

const CustomDropDown = () => {
  const [clicked, setClicked] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (clicked) {
      getCustomersDetails();
    }
  }, [clicked]);

  const getCustomersDetails = () => {
    const companyId = 1;
    const apiUrl = `${global?.userData?.productURL}${API.ADD_CUSTOMER_LIST}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCustomers(response?.data?.response?.customerList || []);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleDropdownClick = () => {
    setClicked(!clicked);
  };

  const handleCustomerSelection = (firstName, lastName) => {
    setSelectedCustomer(`${firstName} ${lastName}`);
    setClicked(false);
  };

  return (
    <View style={{}}>
      <TouchableOpacity
        style={{
          width: '90%',
          height: 50,
          borderRadius: 10,
          borderWidth: 0.5,
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 15,
          paddingRight: 15,
        }}
        onPress={handleDropdownClick}>
        <Text style={{fontWeight: '600'}}>
          {selectedCustomer || 'Customer'}
        </Text>
        <Image
          source={require('../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      {clicked && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          {customers.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: '100%',
                height: 50,
                justifyContent: 'center',
                borderBottomWidth: 0.5,
                borderColor: '#8e8e8e',
              }}
              onPress={() => {
                handleCustomerSelection(item.firstName, item.lastName);
              }}>
              <Text style={{fontWeight: '600', marginHorizontal: 15}}>
                {item.firstName} {item.lastName}
              </Text>
              {/* <Text>{item.phoneNumber}</Text> */}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default CustomDropDown;
