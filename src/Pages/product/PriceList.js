import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {ColorContext} from '../../components/colortheme/colorTheme';
import {API} from '../../config/apiConfig';
import axios from 'axios';

const PriceList = ({route}) => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('');
  const [tabs, setTabs] = useState([]);
  const [priceListOptions, setPriceListOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedTabs, setCopiedTabs] = useState({});
  const [editedTabs, setEditedTabs] = useState({});

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [priceListName, setPriceListName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Store price data for each tab separately
  const [tabPriceData, setTabPriceData] = useState({});

  // Get initial price data from route params
  const initialPriceData = route?.params?.priceData || [];
  const selectedScale = route?.params?.selectedScale || '';

  // Get existing priceListData from route params
  const existingPriceListData = route?.params?.productStyle?.priceList || [];

  // Company ID for API calls
  const companyId = route?.params?.productStyle?.companyId || 1;

  // Navigation handlers with state preservation
  const handleNextproductImage = () => {
    const priceListData = Object.entries(tabPriceData)
      .map(([priceListName, sizes]) => {
        const priceList = priceListOptions.find(
          pl => pl.priceListName === priceListName,
        );
        const priceListId = priceList ? priceList.priceListId : 0;

        return sizes.map((size, index) => {
          // Get the corresponding sizeId from initialPriceData
          const originalSize = initialPriceData[index];
          const sizeId = originalSize?.sizeId || size.sizeId || 0;

          return {
            priceListId: priceListId,
            sizeId: sizeId, // Use preserved sizeId
            dealerPrice: Number(size.dealerPrice) || 0,
            retailerPrice: Number(size.retailerPrice) || 0,
            mrp: Number(size.mrp) || 0,
            corRate: Number(size.corRate) || 0,
            companyId: route.params?.productStyle?.companyId || 1,
          };
        });
      })
      .flat();

    navigation.navigate('UploadProductImage', {
      ...route.params,
      productStyle: route.params?.productStyle,
      priceListData,
      savedTabPriceData: tabPriceData,
      savedCopiedTabs: copiedTabs,
      savedEditedTabs: editedTabs,
    });
  };

  const handleNextBasicInfo = () => {
    navigation.navigate('StyleDetails', {
      // Pass existing params
      priceData: initialPriceData,
      selectedScale: selectedScale,
      // Pass preserved state
      savedTabPriceData: tabPriceData,
      savedCopiedTabs: copiedTabs,
      savedEditedTabs: editedTabs,
      // Pass any other existing params
      ...route.params,
    });
  };

  // Helper function to group existing price list data by priceListId
  const groupPriceListDataByPriceListId = priceListData => {
    const grouped = {};
    priceListData.forEach(item => {
      if (!grouped[item.priceListId]) {
        grouped[item.priceListId] = [];
      }
      grouped[item.priceListId].push(item);
    });
    return grouped;
  };

  // Helper function to convert grouped data to tab format
  const convertToTabPriceData = (
    groupedData,
    priceListOptions,
    initialPriceData,
  ) => {
    const tabData = {};

    Object.entries(groupedData).forEach(([priceListId, priceItems]) => {
      const priceList = priceListOptions.find(
        pl => pl.priceListId === parseInt(priceListId),
      );
      if (priceList) {
        const priceListName = priceList.priceListName;

        // Create a map of sizeId to price data for quick lookup
        const priceMap = {};
        priceItems.forEach(item => {
          priceMap[item.sizeId] = item;
        });

        // Map the initial price data structure with existing prices
        tabData[priceListName] = initialPriceData.map(sizeItem => {
          const existingPrice = priceMap[sizeItem.sizeId];
          if (existingPrice) {
            return {
              ...sizeItem,
              dealerPrice: existingPrice.dealerPrice?.toString() || '',
              retailerPrice: existingPrice.retailerPrice?.toString() || '',
              mrp: existingPrice.mrp?.toString() || '',
              corRate: existingPrice.corRate?.toString() || '',
            };
          } else {
            return {
              ...sizeItem,
              dealerPrice: '',
              retailerPrice: '',
              mrp: '',
              corRate: '',
            };
          }
        });
      }
    });

    return tabData;
  };

  // Modal functions
  const openModal = () => {
    setIsModalVisible(true);
    setPriceListName('');
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setPriceListName('');
    setProcessing(false);
  };

  const validatePriceListName = async () => {
    if (processing) return;
    setProcessing(true);

    if (priceListName.trim().length === 0) {
      Alert.alert('Please fill all mandatory fields');
      setProcessing(false);
      return;
    }

    const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_PRICE_LIST}${priceListName}/${companyId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data === true) {
        handleAddPricelist();
      } else {
        Alert.alert('This name has been used. Please enter a new name');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the price list name validity. Please try again.',
      );
      setProcessing(false);
    }
  };

  const handleAddPricelist = async () => {
    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ADD_PRICE_LIST}`;
    const requestData = {
      priceListName: priceListName.trim(),
      companyId: companyId,
      createBy: 0,
      createOn: '',
      linkType: 2,
      priceListId: 0,
      userId: 1,
    };
  
    try {
      console.log('📤 Sending request to:', apiUrl);
      console.log('📦 Request payload:', requestData);
  
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      console.log('📥 Response:', response?.data);
  
      // Modified response handling
      if (response.data?.status?.success) {
        Alert.alert('Success', 'Price list added successfully', [
          {
            text: 'OK',
            onPress: () => {
              closeModal();
              getPriceList();
            },
          },
        ]);
      } else {
        console.warn('❌ Response error:', response?.data);
        const errorMessage = response.data?.response?.message || 'Failed to add price list. Please try again.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❗ Axios error:', error);
      if (error.response) {
        console.error('🛑 Error response data:', error.response.data);
        console.error('🧾 Error response status:', error.response.status);
        console.error('📄 Error response headers:', error.response.headers);
        const errorMessage = error.response.data?.message || 'There was a problem adding the price list.';
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        console.error('📡 No response received:', error.request);
        Alert.alert('Error', 'No response received from server. Please check your connection.');
      } else {
        console.error('⚙️ Error setting up the request:', error.message);
        Alert.alert('Error', 'Failed to setup request. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setProcessing(false);
    }
  };
  

  useEffect(() => {
    // Restore saved state if returning from other screens
    const routeSavedTabPriceData = route?.params?.savedTabPriceData || {};
    const routeSavedCopiedTabs = route?.params?.savedCopiedTabs || {};
    const routeSavedEditedTabs = route?.params?.savedEditedTabs || {};

    if (Object.keys(routeSavedTabPriceData).length > 0) {
      setTabPriceData(routeSavedTabPriceData);
    }
    if (Object.keys(routeSavedCopiedTabs).length > 0) {
      setCopiedTabs(routeSavedCopiedTabs);
    }
    if (Object.keys(routeSavedEditedTabs).length > 0) {
      setEditedTabs(routeSavedEditedTabs);
    }

    getPriceList();
  }, []);

  // NEW: Effect to prepopulate data when priceListOptions and existingPriceListData are available
  useEffect(() => {
    if (
      priceListOptions.length > 0 &&
      existingPriceListData.length > 0 &&
      initialPriceData.length > 0
    ) {
      // Only prepopulate if we don't have saved data from navigation
      const routeSavedTabPriceData = route?.params?.savedTabPriceData || {};

      if (Object.keys(routeSavedTabPriceData).length === 0) {
        console.log('Prepopulating price data...');
        const groupedData = groupPriceListDataByPriceListId(
          existingPriceListData,
        );
        const prepopulatedTabData = convertToTabPriceData(
          groupedData,
          priceListOptions,
          initialPriceData,
        );

        console.log('Prepopulated tab data:', prepopulatedTabData);
        setTabPriceData(prepopulatedTabData);

        // Mark tabs as copied/edited if they have data
        const updatedCopiedTabs = {};
        const updatedEditedTabs = {};
        Object.keys(prepopulatedTabData).forEach(tabName => {
          const hasData = prepopulatedTabData[tabName].some(
            item =>
              item.dealerPrice ||
              item.retailerPrice ||
              item.mrp ||
              item.corRate,
          );
          if (hasData) {
            updatedCopiedTabs[tabName] = true;
            updatedEditedTabs[tabName] = true;
          }
        });

        setCopiedTabs(updatedCopiedTabs);
        setEditedTabs(updatedEditedTabs);
      }
    }
  }, [priceListOptions, existingPriceListData, initialPriceData]);

  // Initialize price data for the first tab when tabs are loaded with empty prices
  useEffect(() => {
    if (tabs.length > 0 && selectedTab && !tabPriceData[selectedTab]) {
      const emptyPriceData = initialPriceData.map(item => ({
        ...item,
        dealerPrice: '',
        retailerPrice: '',
        mrp: '',
        corRate: '',
      }));

      setTabPriceData(prev => ({
        ...prev,
        [selectedTab]: emptyPriceData,
      }));
    }
  }, [selectedTab, tabs, initialPriceData]);

  const getPriceList = () => {
    setLoading(true);
    setError(null);

    const apiUrl = `${global?.userData?.productURL}${API.GET_PRICE_LIST}/1/asc`;

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log(
          'response.data.priceList ===>',
          response.data?.response?.priceLIsts,
        );

        const priceLists = response.data?.response?.priceLIsts || [];
        console.log('Full priceLists array:', priceLists);

        setPriceListOptions(priceLists);

        const priceListNames = priceLists.map(item => item.priceListName);
        console.log('Extracted priceListNames:', priceListNames);

        setTabs(priceListNames);

        if (priceListNames.length > 0) {
          setSelectedTab(priceListNames[0]);
          console.log('Selected tab set to:', priceListNames[0]);
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching price list:', error);
        setError('Failed to load price lists');
        setLoading(false);
      });
  };

  const handleTabSelection = tabName => {
    setSelectedTab(tabName);

    // Initialize price data for the new tab if it doesn't exist with empty prices
    if (!tabPriceData[tabName]) {
      const emptyPriceData = initialPriceData.map(item => ({
        ...item,
        dealerPrice: '',
        retailerPrice: '',
        mrp: '',
        corRate: '',
      }));

      setTabPriceData(prev => ({
        ...prev,
        [tabName]: emptyPriceData,
      }));
    }
  };

  const renderTabItem = ({item}) => {
    const handleCopyTab = () => {
      setTabPriceData(prev => ({
        ...prev,
        [item]: [...initialPriceData],
      }));

      setCopiedTabs(prev => ({
        ...prev,
        [item]: true,
      }));
    };

    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === item && styles.selectedTab]}
          onPress={() => handleTabSelection(item)}>
          <Text
            style={[
              styles.tabText,
              selectedTab === item && styles.selectedTabText,
            ]}>
            {item}
          </Text>
        </TouchableOpacity>

        {/* Copy button for this tab */}
        <TouchableOpacity onPress={handleCopyTab}>
          <Image
            style={{height: 20, width: 20, marginRight: 8}}
            source={require('../../../assets/copy.png')}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPriceRow = ({item, index}) => {
    const handlePriceChange = (key, value) => {
      // Update price data for the currently selected tab only
      setTabPriceData(prev => {
        const currentTabData = [...(prev[selectedTab] || [])];
        if (currentTabData[index]) {
          currentTabData[index] = {
            ...currentTabData[index],
            [key]: value,
          };
        }

        return {
          ...prev,
          [selectedTab]: currentTabData,
        };
      });

      // Mark this tab as edited
      setEditedTabs(prev => ({
        ...prev,
        [selectedTab]: true,
      }));
    };

    return (
      <View style={styles.priceRow}>
        <View style={styles.sizeColumn}>
          <Text style={styles.sizeText}>{item.size}</Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Dealer Price</Text>
          <TextInput
            style={styles.priceInput}
            value={item.dealerPrice?.toString()}
            onChangeText={text => handlePriceChange('dealerPrice', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Retailer Price</Text>
          <TextInput
            style={styles.priceInput}
            value={item.retailerPrice?.toString()}
            onChangeText={text => handlePriceChange('retailerPrice', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>MRP</Text>
          <TextInput
            style={styles.priceInput}
            value={item.mrp?.toString()}
            onChangeText={text => handlePriceChange('mrp', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Cor.Rate</Text>
          <TextInput
            style={styles.priceInput}
            value={item.corRate?.toString()}
            onChangeText={text => handlePriceChange('corRate', text)}
            keyboardType="numeric"
          />
        </View>
      </View>
    );
  };

  // UPDATED: Always use tabPriceData if available, otherwise initialize with empty prices
  const currentPriceData =
    tabPriceData[selectedTab] ||
    initialPriceData.map(item => ({
      ...item,
      dealerPrice: '',
      retailerPrice: '',
      mrp: '',
      corRate: '',
    }));

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.color2} />
        <Text style={styles.loadingText}>Loading price lists...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getPriceList}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../../assets/back_arrow.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Price List</Text>
      </View>

      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
        <TouchableOpacity
          onPress={handleNextBasicInfo}
          style={styles.headbasicinfo}>
          <Text style={{color: '#000', fontWeight: 'bold'}}>Basic Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headpricelist}>
          <Text style={{color: '#000', fontWeight: 'bold'}}>Price List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextproductImage}
          style={[styles.headprductimage]}>
          <Text style={{color: '#000', fontWeight: 'bold'}}>
            Product Images
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navTabs}>
        <TouchableOpacity style={[styles.navTab, styles.activeNavTab]}>
          <Text style={[styles.navTabText, styles.activeNavTabText]}>
            Price List
          </Text>
          <View style={styles.tabIndicator} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // Copy to all tabs
            const updatedData = {};
            const updatedCopiedTabs = {};

            tabs.forEach(tab => {
              updatedData[tab] = [...initialPriceData];
              updatedCopiedTabs[tab] = true;
            });

            setTabPriceData(updatedData);
            setCopiedTabs(updatedCopiedTabs);
          }}>
          <Image
            style={{height: 20, width: 20, marginRight: 8}}
            source={require('../../../assets/copy.png')}
          />
        </TouchableOpacity>

        {/* Updated Plus button to open modal */}
        <TouchableOpacity onPress={openModal}>
          <Image
            resizeMode="contain"
            source={require('../../../assets/plus.png')}
            style={{height: 25, width: 25}}
          />
        </TouchableOpacity>
      </View>

      {/* Subscription Tier Tabs */}
      <View style={styles.tierTabsContainer}>
        {tabs.length > 0 ? (
          <FlatList
            data={tabs}
            renderItem={renderTabItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tierTabs}
          />
        ) : (
          <View style={styles.noTabsContainer}>
            <Text style={styles.noTabsText}>No price lists available</Text>
          </View>
        )}
      </View>

      {/* Price Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.sizeColumn}>
          <Text style={styles.headerText}>Size</Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.headerText}>Dealer Price</Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.headerText}>Retailer Price</Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.headerText}>MRP</Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.headerText}>Cor.Rate</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer}>
        {selectedScale && currentPriceData.length > 0 ? (
          <FlatList
            data={currentPriceData}
            renderItem={renderPriceRow}
            keyExtractor={(item, index) =>
              `${selectedTab}-${item.size}-${index}`
            }
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noPriceDataContainer}>
            <Text style={styles.noPriceDataText}>No price data available</Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Price List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Price List</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Image
                  source={require('../../../assets/close.png')} // You'll need a close icon
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Price Type *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Price Type"
                value={priceListName}
                onChangeText={setPriceListName}
                editable={!processing && !isLoading}
              />
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (processing ||
                    isLoading ||
                    priceListName.trim().length === 0) &&
                    styles.addButtonDisabled,
                ]}
                onPress={validatePriceListName}
                disabled={
                  processing || isLoading || priceListName.trim().length === 0
                }>
                {processing || isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>ADD</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    headbasicinfo: {
      marginTop: 10,
      paddingHorizontal: 20,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderColor: '#000',
      borderWidth: 1,
      paddingVertical: 10,
    },
    headprductimage: {
      marginTop: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderColor: '#000',
      borderWidth: 1,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
    headpricelist: {
      marginTop: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.color2,
      paddingVertical: 10,
      borderColor: '#000',
      borderWidth: 1,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
    errorText: {
      fontSize: 16,
      color: '#ff0000',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.color2,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    noTabsContainer: {
      padding: 20,
      alignItems: 'center',
    },
    noTabsText: {
      fontSize: 14,
      color: '#666',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 15,
      elevation: 5,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
      flex: 1,
      marginLeft: 15,
    },
    saveButton: {
      backgroundColor: colors.color2,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 4,
    },
    saveButtonText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 14,
    },
    menuimg: {
      height: 24,
      width: 24,
      tintColor: '#000',
    },
    navTabs: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    navTab: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      position: 'relative',
    },
    activeNavTab: {
      backgroundColor: 'white',
    },
    navTabText: {
      fontSize: 14,
      color: '#666',
    },
    activeNavTabText: {
      color: colors.color2,
      fontWeight: '500',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.color2,
    },
    tierTabsContainer: {
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: colors.color2,
    },
    tierTabs: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    tabItem: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 6,
      backgroundColor: '#f8f8f8',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    selectedTab: {
      backgroundColor: colors.color2,
      borderColor: '#1CBCD4',
    },
    tabText: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
    },
    selectedTabText: {
      color: 'white',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f8f8f8',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    headerText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
    },
    tableContainer: {
      flex: 1,
    },
    priceRow: {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      backgroundColor: 'white',
    },
    sizeColumn: {
      flex: 0.8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    priceColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
    },
    priceInput: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 4,
      width: '100%',
      textAlign: 'center',
    },
    sizeText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    priceLabel: {
      fontSize: 12,
      color: '#000',
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    noPriceDataContainer: {
      padding: 20,
      alignItems: 'center',
    },
    noPriceDataText: {
      fontSize: 14,
      color: '#666',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 10,
      width: '90%',
      maxWidth: 400,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      backgroundColor: '#4A90E2', // Blue header like in your image
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 5,
    },
    closeIcon: {
      width: 20,
      height: 20,
      tintColor: 'white',
    },
    modalBody: {
      padding: 20,
    },
    inputLabel: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
      fontWeight: '500',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#f9f9f9',
    },
    modalFooter: {
      padding: 20,
      alignItems: 'flex-end',
    },
    addButton: {
      backgroundColor: '#4A90E2',
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    addButtonDisabled: {
      backgroundColor: '#ccc',
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default PriceList;
