import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useState, useEffect, useContext} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  useColorScheme,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {RadioGroup} from 'react-native-radio-buttons-group';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import { API } from '../config/apiConfig';
import { ColorContext } from './colortheme/colorTheme';


const AddRetailerDistributor = (visible, onClose, type) => {
  const navigation = useNavigation();
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);

  const [selectedId, setSelectedId] = useState('1');
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryStylesData, setSearchQueryStylesData] = useState('');


  const [selectedDistributorDetails, setSelectedDistributorDetails] =
  useState(null);

  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;
  const [selectedStatus, setSelectedStatus] = useState('Active'); // Default is 'Active'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(0);

  const [selectedStateId, setSelectedStateId] = useState(null); // Track only the stateId
  const [selectedState, setSelectedState] = useState(null); // Track the full state object
  const [states, setStates] = useState([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const getState = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_STATE}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('response.data.state===>', response.data);
        setStates(response.data); // Assuming the response contains the states
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const toggleStateDropdown = () => {
    setShowStateDropdown(prev => !prev);
  };

  // Handle state selection
  const handleSelectState = state => {
    setSelectedStateId(state.stateId); // Set the selected stateId
    setSelectedState(state); // Set the full state object
    setShowStateDropdown(false); // Hide the dropdown after selection
  };

  // Fetch states when the component mounts
  useEffect(() => {
    getState();
  }, []);

  const statusOptions = [
    {label: 'Active', value: 0},
    {label: 'Inactive', value: 1},
  ];

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleSelectStatus = status => {
    // Update selectedStatus with the label and selectedStatusId with the value
    setSelectedStatus(status.label);
    setSelectedStatusId(status.value);
    setShowStatusDropdown(false);
  };

  const toggleModal = () => {
    setIsSaving(false);
    setIsModalVisible(!isModalVisible);
    setSelectedStatus('Active');
    if (!isModalVisible) {
      setSelectedState(null); // Reset selected state
      setSelectedStateId(null); // Reset selected stateId
    }
    // Reset error fields and input values when modal is closed
    if (isModalVisible) {
      setErrorFields([]);
      setInputValues({
        firstName: '',
        phoneNumber: '',
        cityOrTown: '',
        state: '',
        country: '',
        pincode: '',
        locationName: '',
        locationDescription: '',
      });
      setSearchQuery('');
      setSearchQueryStylesData('');
    }
  };
  const [inputValues, setInputValues] = useState({
    firstName: '',
    phoneNumber: '',
    whatsappId: '',
    cityOrTown: '',
    state: '',
    country: '',
    pincode: '',
    locationName: '',
    locationDescription: '',
  });

  const [errorFields, setErrorFields] = useState([]);

  const handleSaveButtonPress = () => {
    const mandatoryFields = [
      'firstName',
      'phoneNumber',
      'whatsappId',
      'cityOrTown',
      'country',
      'pincode',
      'locationName',
      'locationDescription',
    ];

    // Add state to mandatory fields only if selectedId is '2'
    if (selectedId === '2') {
      mandatoryFields.push('state');
    }

    setErrorFields([]);

    // Check if any mandatory fields are missing, including state
    const missingFields = mandatoryFields.filter(field => {
      // Check for mandatory fields that are not filled
      if (field === 'state') {
        // If selectedId is '2' and state is not selected, it's a missing field
        return !selectedState; // Check if selectedState is null or undefined
      }
      return !inputValues[field];
    });

    if (missingFields.length > 0) {
      setErrorFields(missingFields);
      Alert.alert('Alert', 'Please fill in all mandatory fields');
      return;
    }

    const hasExactlyTenDigits = /^\d{10,12}$/;

    // Validate phone number format
    if (!hasExactlyTenDigits.test(Number(inputValues?.phoneNumber))) {
      Alert.alert('Alert', 'Please Provide a valid Phone Number');
      return;
    }

    // Validate whatsappId if provided
    if (inputValues?.whatsappId?.length > 0) {
      if (!hasExactlyTenDigits.test(inputValues?.whatsappId)) {
        Alert.alert('Alert', 'Please Provide a valid Whatsapp Number');
        return;
      }
    }

    // Set saving state to true to disable the button
    setIsSaving(true);

    // Call appropriate function based on selectedId
    selectedId === '2' ? getisValidCustomer() : getisValidDistributors();
  };

  const getisValidCustomer = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATIONCUSTOMER}/${inputValues.firstName}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      // Check if the response indicates the distributor is valid
      if (response.data === true) {
        addCustomerDetails();
        // Proceed to save distributor details
      } else {
        // Show an alert if the distributor name is already used
        Alert.alert(
          'crm.codeverse.co says',
          'A Customer/Distributor already exist with this name.',
          [{text: 'OK', onPress: () => setIsSaving(false)}],
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the distributor validity. Please try again.',
      );
    }
  };
  const addCustomerDetails = () => {
    setIsSaving(true);
    const requestData = {
      firstName: inputValues.firstName,
      lastName: '',
      phoneNumber: inputValues.phoneNumber,
      whatsappId: inputValues.whatsappId,
      emailId: '',
      action: '',
      createBy: 1,
      createOn: new Date().toISOString(),
      modifiedBy: 1,
      modifiedOn: new Date().toISOString(),
      houseNo: '',
      street: '',
      locality: '',
      cityOrTown: inputValues.cityOrTown,
      state: selectedState?.stateName || '',
      stateId: selectedStateId,
      country: inputValues.country,
      pincode: '',
      pan: '',
      gstNo: '',
      creditLimit: 0,
      paymentReminderId: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription: inputValues.locationDescription,
      userId: userId,
      linkType: 3,
      statusId: selectedStatusId,
    };
    console.log('requestData====>', requestData);
    axios
      .post(
        global?.userData?.productURL + API.ADD_CUSTOMER_DETAILS,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      )
      .then(response => {
        const newCustomer = response.data.response.customerList[0];

        // Update the selected customer details and ID
        setSelectedCustomerDetails([newCustomer]);
        setSelectedCustomerId(newCustomer.customerId);

        // Close the modal
        setIsSaving(false);
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
        setIsSaving(false);
      });
  };
  const getisValidDistributors = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATIONDISTRIBUTOR}/${inputValues.firstName}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      // Check if the response indicates the distributor is valid
      if (response.data === true) {
        addDistributorDetails();
        // Proceed to save distributor details
      } else {
        // Show an alert if the distributor name is already used
        Alert.alert(
          'crm.codeverse.co says',
          'A Customer/Distributor already exist with this name.',
          [{text: 'OK', onPress: () => setIsSaving(false)}],
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the distributor validity. Please try again.',
      );
    }
  };

  const addDistributorDetails = () => {
    setIsSaving(true);
    const requestData = {
      id: null,
      distributorName: inputValues.firstName,
      areaMasterId: 0,
      areaPincodeId: '',
      emailId: '',
      phoneNumber: inputValues.phoneNumber,
      whatsappId: inputValues.whatsappId,
      houseNo: '',
      street: '',
      locality: '',
      cityOrTown: inputValues.cityOrTown,
      state: selectedState?.stateName || '',
      stateId: selectedStateId,
      currencyId: 9,
      country: inputValues.country,
      pincode: inputValues.pincode,
      customerLevel: '',
      pan: '',
      gstNo: '',
      riskId: 0,
      myItems: '',
      creditLimit: 0,
      paymentReminderId: 26,
      dayId: 0,
      files: [],
      remarks: '',
      transport: 0,
      mop: '',
      markupDisc: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription: inputValues.locationDescription,
      userId: userId,
      linkType: 3,
      statusId: selectedStatusId,
    };
    console.log('requestDatafordis===>', requestData);

    axios
      .post(
        global?.userData?.productURL + API.ADD_DISTRIBUTOR_DETAILS,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global.userData.token.access_token}`,
          },
        },
      )
      .then(response => {
        const newDistributor = response.data.response.distributorList[0];

        // Update the selected distributor details and ID
        setSelectedDistributorDetails([newDistributor]);
        setSelectedDistributorId(newDistributor.id);
        // Close the modal
        setIsSaving(false);
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding Distributor:', error);
        setIsSaving(false);
      });
  };

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
        if (initialCompanyData) {
          const initialCompany = JSON.parse(initialCompanyData);
          setInitialSelectedCompany(initialCompany);
        }
      } catch (error) {
        console.error('Error fetching initial selected company:', error);
      }
    };

    fetchInitialSelectedCompany();
  }, []);

  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

  const handleEndReached = () => {
    if (pageNo < totalPages && !isFetching) {
      setPageNo(prevPageNo => prevPageNo + 1);
    }
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const radioButtons = [
    {
      id: '1',
      label: 'Distributor',
      value: 'distributor',
      labelStyle: {color: '#000'},
      color: colors.color2,
    },
    {
      id: '2',
      label: 'Retailer',
      value: 'retailer',
      labelStyle: {color: '#000'},
      color: colors.color2,
    },
  ];

  const handleCloseModalDisRet = () => {
    setIsModalVisible(false);
    setInputValues([]); // Assuming inputValues should be an array too
    setErrorFields([]); // Reset errorFields to an empty array
  };


  return (
    <View >
      <View style={{flexDirection:"row",paddingVertical:4}}>
        <RadioGroup
        radioButtons={radioButtons}
        onPress={setSelectedId}
        selectedId={selectedId}
        containerStyle={styles.radioGroup}
      />

{selectedId === '1' && (
  

<TouchableOpacity style={styles.addButton} onPress={toggleModal}>
<Text style={styles.addButtonText}>Add (Dist/Ret)</Text>
</TouchableOpacity>
        )}
        {selectedId === '2' && (
       <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
       <Text style={styles.addButtonText}>Add (Dist/Ret)</Text>
       </TouchableOpacity>
        )}
        </View>
  <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          toggleModal();
        }}>
        <View style={styles.modalContainerr}>
          <View style={styles.modalContentt}>
            {/* <View style={{backgroundColor: '#1F74BA',
                borderRadius: 10,
                marginHorizontal: 10,
                marginTop: 10,
                flexDirection:'row',
                // justifyContent:'space-between',
                // alignItems:'center',
                width:'100%',
                marginBottom:10
                }}>
              <View>
            <Text style={[styles.txt3, {marginLeft:10, paddingVertical:5, fontSize:16, alignSelf:'center'}]}>
              {selectedId === '1' ? 'Distributor Details' : ' Retailer Details'}
            </Text>
              </View>
            <View
              style={{ marginRight: 10, alignSelf:'flex-end'}}>

          <TouchableOpacity onPress={handleCloseModalDisRet}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
              </View>
            </View> */}
            <View
              style={{
                backgroundColor: colors.color2,
                borderRadius: 10,
                marginHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                paddingVertical: 5,
                width: '100%',
                justifyContent: 'space-between',
                marginBottom: 15,
              }}>
              {selectedId === '1' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  Distributor Details
                </Text>
              )}
              {selectedId === '2' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  Retailer Details
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCloseModalDisRet}
                style={{paddingHorizontal: 10}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{width: '100%', height: '80%'}}>
              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('firstName') ? styles.errorBorder : null,
                ]}
                placeholder={
                  selectedId === '1' ? 'Distributor Name *' : 'Retailer Name *'
                }
                placeholderTextColor="#000"
                onChangeText={text =>
                  setInputValues({...inputValues, firstName: text})
                }
                value={inputValues.firstName}
              />
              {errorFields.includes('firstName') && (
                <Text style={styles.errorText}>
                  {selectedId === '1'
                    ? 'Please Enter Distributor Name'
                    : 'Please Enter Retailer Name'}
                </Text>
              )}

              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('phoneNumber')
                    ? styles.errorBorder
                    : null,
                ]}
                placeholder="Phone Number *"
                placeholderTextColor="#000"
                onChangeText={text =>
                  setInputValues({...inputValues, phoneNumber: text})
                }
              />
              {errorFields.includes('phoneNumber') && (
                <Text style={styles.errorText}>Please Enter Phone Number</Text>
              )}

              <TextInput
                style={[styles.input, {color: '#000'}]}
                placeholder="Whatsapp Number *"
                placeholderTextColor="#000"
                onChangeText={text =>
                  setInputValues({...inputValues, whatsappId: text})
                }
              />
              {errorFields.includes('whatsappId') && (
                <Text style={styles.errorText}>
                  Please Enter Whatsapp Number
                </Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('cityOrTown')
                    ? styles.errorBorder
                    : null,
                ]}
                placeholder="City or Town *"
                placeholderTextColor="#000"
                onChangeText={text =>
                  setInputValues({...inputValues, cityOrTown: text})
                }
              />
              {errorFields.includes('cityOrTown') && (
                <Text style={styles.errorText}>Please Enter City Or Town</Text>
              )}
              {/* <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('state') ? styles.errorBorder : null,
                ]}
                placeholderTextColor="#000"
                placeholder="State *"
                onChangeText={text =>
                  setInputValues({...inputValues, state: text})
                }
              />
              {errorFields.includes('state') && (
                <Text style={styles.errorText}>Please Enter State</Text>
              )} */}

              <Text style={styles.headerTxt}>
                {selectedId === '2' ? 'State*' : 'State'}{' '}
                {/* Conditionally render 'State*' based on selectedId */}
              </Text>

              <View style={styles.container1}>
                <View style={styles.container2}>
                  <TouchableOpacity
                    style={styles.container3}
                    onPress={toggleStateDropdown}>
                    <Text style={{fontWeight: '600', color: '#000'}}>
                      {selectedState?.stateName || 'Select'}{' '}
                      {/* Display the stateName if selected, otherwise 'Select' */}
                    </Text>
                    <Image
                      source={require('../../assets/dropdown.png')}
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>

                  {/* Dropdown list */}
                  {showStateDropdown && (
                    <View style={styles.dropdownContentstate}>
                      <ScrollView
                        style={styles.scrollView}
                        nestedScrollEnabled={true}>
                        {states.map(state => (
                          <TouchableOpacity
                            key={state.stateId}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectState(state)} // Pass the full state object
                          >
                            <Text style={styles.dropdownText}>
                              {state.stateName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('country') ? styles.errorBorder : null,
                ]}
                placeholderTextColor="#000"
                placeholder="Country *"
                onChangeText={text =>
                  setInputValues({...inputValues, country: text})
                }
              />
              {errorFields.includes('country') && (
                <Text style={styles.errorText}>Please Enter Country</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('pincode') ? styles.errorBorder : null,
                ]}
                placeholderTextColor="#000"
                placeholder="Pincode *"
                onChangeText={text =>
                  setInputValues({...inputValues, pincode: text})
                }
              />
              {errorFields.includes('pincode') && (
                <Text style={styles.errorText}>Please Enter Pincode</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('locationName')
                    ? styles.errorBorder
                    : null,
                ]}
                placeholderTextColor="#000"
                placeholder="Location Name *"
                onChangeText={text =>
                  setInputValues({...inputValues, locationName: text})
                }
              />
              {errorFields.includes('locationName') && (
                <Text style={styles.errorText}>Please Enter Location Name</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {color: '#000'},
                  errorFields.includes('locationDescription')
                    ? styles.errorBorder
                    : null,
                ]}
                placeholderTextColor="#000"
                placeholder="Location Description *"
                onChangeText={text =>
                  setInputValues({...inputValues, locationDescription: text})
                }
              />
              {errorFields.includes('locationDescription') && (
                <Text style={styles.errorText}>
                  Please Enter Location Description
                </Text>
              )}

              <Text style={styles.headerTxt}>{'Status *'}</Text>
              <View style={styles.container1}>
                <View style={styles.container2}>
                  <TouchableOpacity
                    style={styles.container3}
                    onPress={toggleStatusDropdown}>
                    <Text style={{fontWeight: '600', color: '#000'}}>
                      {selectedStatus}
                    </Text>
                    <Image
                      source={require('../../assets/dropdown.png')}
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>
                  {showStatusDropdown && (
                    <View style={styles.dropdownContainersstatus}>
                      {statusOptions.map((status, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectStatus(status)}>
                          <Text style={styles.dropdownText}>
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              {/* <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveButtonPress}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveButtonPress}
                disabled={isSaving} // Disable button when saving
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    radioGroup: {
      marginHorizontal: 10,
      flexDirection: 'row',
      marginBottom: 10,
    },
    modalContainerr: {
      flex: 1,
      alignItems: 'center',
      marginTop: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentt: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      elevation: 5, // Add elevation for shadow on Android
      top: 10,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: 10,
      marginBottom: 5,
      width: '100%',
    },
    errorBorder: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
    },
    saveButton: {
      backgroundColor: colors.color2,
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
      width: '100%',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    plusButton: {
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    noCategoriesText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#000',
      fontWeight: '600',
    },
    modalContainer: {
      flexGrow: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      maxHeight: '70%', // Adjust as needed
    },
    modalText: {
      fontSize: 16,
      marginBottom: 10,
      marginLeft: 10,
    },
    headerTxt: {
      marginVertical: 3,
      color: '#000',
    },
    container1: {
      marginBottom: 5,
      flexDirection: 'row',
      // marginTop: 20,
      alignItems: 'center',
      width: '100%',
    },
    container2: {
      justifyContent: 'flex-start',
      width: '100%',
    },
    container3: {
      width: '100%',
      height: 37,
      borderRadius: 10,
      borderWidth: 0.5,
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 15,
      paddingRight: 15,
    },
    container4: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '10%',
    },
    dropdownItem: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#8e8e8e',
    },

    dropdownContainersstatus: {
      elevation: 5,
      height: 100,
      alignSelf: 'center',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray',
      borderWidth: 1,
      marginTop: 5,
    },
    dropdownText: {
      fontWeight: '600',
      marginHorizontal: 15,
      color: '#000',
    },
    dropdownContentstate: {
      elevation: 5,
      // height: 220,
      alignSelf: 'center',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginHorizontal: 10,
      marginVertical: 3,
    },
    scrollView: {
      minHeight: 70,
      maxHeight: 150,
    },
    addButton: {
      paddingHorizontal: 15,
      padding: 10,
      backgroundColor:colors.color2,
      borderRadius: 5,
      marginLeft: 10,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    head3: {
      alignItems: 'center',
      borderWidth: 1,
      padding: 6,
      borderRadius: 10,
      marginLeft: 5,
      backgroundColor: colors.color2,
    },
      txt3: {
      color: '#000',
      fontWeight: '500',
      alignSelf: 'center',
    },
  });


export default AddRetailerDistributor;
