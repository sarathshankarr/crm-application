import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {SET_SELECTED_COMPANY} from '../redux/ActionTypes';
import {setLoggedInUser} from '../redux/actions/Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import {API} from '../config/apiConfig';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

const CompanyDropdown = () => {
  const navigation = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const dispatch = useDispatch();
  const loggedInUser = useSelector(state => state.loggedInUser);
  const selectedCompany = useSelector(state => state.selectedCompany);

  //   useEffect(() => {
  //     const fetchUserData = async () => {
  //       try {
  //         const storedUserData = await AsyncStorage.getItem('userData');
  //         if (storedUserData) {
  //           const userData = JSON.parse(storedUserData);
  //           dispatch(setLoggedInUser(userData));
  //           if (userData?.compList?.length > 0) {
  //             const initialCompany = userData.compList[0];
  //             setCompanyLogo(initialCompany.companyLogo);
  //             dispatch({ type: SET_SELECTED_COMPANY, payload: initialCompany });
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error fetching user data:', error);
  //       }
  //     };

  //     fetchUserData();
  //   }, [dispatch]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          dispatch(setLoggedInUser(userData));

          // Check if compList exists and is not empty
          if (userData?.compList?.length > 0) {
            // Optionally set a default logo or leave it blank initially
            setCompanyLogo(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [dispatch]);

  useEffect(() => {
    if (selectedCompany && selectedCompany.id) {
      getCompany(selectedCompany.id);
    }
  }, [selectedCompany]);

  const getCompany = companyId => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_COMPANY}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const companyList = response.data.response.companyList;
        // console.log("getCompany",response.data.response.companyList)
        if (companyList && companyList.length > 0) {
          const company = companyList[0];
          setCompanyLogo(company.companyLogo);
        } else {
          console.log('No company data found');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setCompanyLogo(null);
      });
  };

  const toggleDropdown = () => {
    if (loggedInUser?.compList?.length > 1) {
      setDropdownVisible(!dropdownVisible);
    }
  };

  const handleCompanySelect = company => {
    console.log('Selected Company:', company); // Debugging
    setCompanyLogo(company.companyLogo);
    dispatch({type: SET_SELECTED_COMPANY, payload: company});
    setDropdownVisible(false);
    navigation.navigate('Home', {companyId: company.id});
  };
  if (userData?.compList?.length > 0) {
    const initialCompany = userData.compList[0];
    setCompanyLogo(initialCompany.companyLogo);
    dispatch({type: SET_SELECTED_COMPANY, payload: initialCompany});
  }

  return (
    <View style={{ backgroundColor: '#fff'}}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
        <FastImage
          source={
            companyLogo
              ? {uri: `data:image/png;base64,${companyLogo}`}
              : require('../../assets/NewNoImage.jpg')
          }
          style={{height: 35, width: 50}}
        />
        <Text style={styles.text}>
          {selectedCompany?.companyName} ({selectedCompany?.companyCode})
        </Text>
        {loggedInUser?.compList?.length > 1 && (
          <Image
            source={require('../../assets/dropdown.png')}
            style={styles.icon}
          />
        )}
      </TouchableOpacity>
      <Modal
        transparent
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={loggedInUser?.compList}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => handleCompanySelect(item)}
                  style={styles.companyItem}>
                  <Text style={styles.companyName}>{item.companyName}</Text>
                  <Text style={styles.companyCode}>({item.companyCode})</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logo: {
    height: 35,
    width: 50,
    marginHorizontal: 5,
  },
  text: {
    fontWeight: '600',
    color: '#000',
  },
  icon: {
    height: 10,
    width: 15,
    marginHorizontal: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    marginTop: Platform.OS === 'ios' ? 105 : 40,
    position: 'absolute',
    maxHeight: 130,
    marginHorizontal: 10,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#8e8e8e',
  },
  companyName: {
    fontWeight: '600',
    color: '#000',
  },
  companyCode: {
    marginLeft: 10,
    color: '#000',
  },
});

export default CompanyDropdown;
