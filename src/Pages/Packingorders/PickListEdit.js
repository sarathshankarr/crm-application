import React, {useState, useEffect, useContext} from 'react';
import {
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {API} from '../../config/apiConfig';
import {ColorContext} from '../../components/colortheme/colorTheme';

const PickListEdit = () => {
  const navigation = useNavigation();
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);

  const compFlag = useSelector(state => state.selectedCompany.comp_flag);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const userId = useSelector(state => state?.loggedInUser?.userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [flag, setFlag] = useState(null);
  const [abInv, setAbInv] = useState([]);
  const [qtyMap, setQtyMap] = useState(new Map());

  const openModal = imageUrl => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    if (stylesData.length > 0) {
      processPickListData(stylesData);
    }
  }, [stylesData]);

  const processPickListData = orderInv => {
    let tempQtyMap = new Map();
    let tempAbInv = [];

  
    orderInv.forEach(lineItem => {
      if (lineItem.pickFlag) {
        setFlag(lineItem.pickFlag);
      }

      let styleSize = `${lineItem.styleName}!-${lineItem.color}!-${lineItem.size}`;

      if (tempQtyMap.has(styleSize)) {
        let qty = tempQtyMap.get(styleSize);
        if (qty > 0) {
          tempQtyMap.set(styleSize, qty - lineItem.qty);
          lineItem.dqty = qty - lineItem.qty > 0 ? lineItem.qty : qty;
          lineItem.companyId = companyId;
          lineItem.userId = userId;
          // lineItem.picklist_flag = this.picklist_flag;
          // lineItem.aisle_bin_inv_flag = this.aisle_bin_inv_flag;
          tempAbInv.push(lineItem);
        }
      } else {
        let qty = lineItem.oqty - lineItem.qty;
        tempQtyMap.set(styleSize, qty);
        lineItem.dqty = qty > 0 ? lineItem.qty : lineItem.oqty;
        lineItem.companyId = companyId;
        lineItem.userId = userId;
        // lineItem.picklist_flag = this.picklist_flag;
        // lineItem.aisle_bin_inv_flag = this.aisle_bin_inv_flag;
        tempAbInv.push(lineItem);
      }
    });

    console.log('tempQtyMap======>',tempQtyMap)
    console.log('tempAbInv======>',tempAbInv)

    setQtyMap(tempQtyMap);
    setAbInv(tempAbInv);
  };

  const route = useRoute();
  const orderId = route.params?.orderId; // Get orderId from navigation params

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

  useEffect(() => {
    if (companyId && orderId) {
      getQuantityStyles();
    }
  }, [companyId, orderId]);

  const getQuantityStyles = async () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.PICK_LIST_EDIT}/${orderId}/${companyId}/${compFlag}`;
    console.log('Fetching API:', apiUrl);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('API Response Data:', response.data);

      if (Array.isArray(response.data)) {
        setStylesData(response.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        setStylesData([]);
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.orderItem}>
      <TouchableOpacity onPress={() => openModal(item.imageUrl1)}>
        <Image source={{uri: item.imageUrl1}} style={styles.image} />
      </TouchableOpacity>
      <Text style={styles.orderIdText}> {item.styleName}</Text>
      <Text style={styles.customerText}> {item.color}</Text>
      <Text style={styles.qtyText}>{item.size}</Text>
      <Text style={styles.qtyText}> {item.location}</Text>
      <Text style={styles.statusText}> {item.aisle}</Text>
      <Text style={styles.dateText}> {item.bin}</Text>
      <Text style={styles.dateText}>{item.qty}</Text>
      <Text style={styles.dateText}>{item.oqty}</Text>
    </View>
  );

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const checkPickListAvailability = () => {
    let styVal = '';

    qtyMap.forEach((value, key) => {
      if (value > 0) {
        styVal += key + ' ';
      }
    });

    if (styVal !== '') {
      Alert.alert(
        'Quantity Not Available',
        'Qty is not available in Aisle/Bin Inventory for these styles and respective sizes: ' +
          styVal,
        [{text: 'OK'}],
      );
      return false;
    }

    return true;
  };

  const handleGeneratePickList = async () => {
    if (!checkPickListAvailability()) {
      return;
    }

    if (abInv.length === 0) {
      setGenerateError('No items to generate pick list');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);

    try {
      const apiUrl = `${global?.userData?.productURL}${API.GENARATE_PICK_LIST}`;

      const requestData = abInv.map(item => ({
        ab_id: item.ab_id,
        styleId: item.styleId,
        sizeId: item.sizeId,
        qty: item.qty,
        locationId: item.locationId,
        aisleId: item.aisleId,
        binId: item.binId,
        ab_picklist: item.ab_picklist || 0,
        dqty: item.dqty,
        companyId: item.companyId,
        scannedBarcodes: item.scannedBarcodes,
        styleName: item.styleName,
        color: item.color,
        size: item.size,
        location: item.location,
        aisle: item.aisle,
        bin: item.bin,
        orderId: item.orderId,
        oqty: item.oqty,
        pickFlag: item.pickFlag || 0,
        shipQty: item.shipQty || 0,
        pickId: item.pickId || 0,
        orderNum: item.orderNum,
        userId: item.userId,
        cnt: item.cnt || 0,
        uomName: item.uomName || '',
        imageUrl1: item.imageUrl1,
        barcodeSet: item.barcodeSet,
        compFlag: item.compFlag,
        cedgeStyleId: item.cedgeStyleId,
        cedgeSizeId: item.cedgeSizeId,
        userName: item.userName,
      }));

      console.log('Sending generate picklist data:', requestData);

      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('Generate PickList response:', response.data);

      if (response.data === true || (response.data && response.data.success)) {
        setGenerateSuccess(true);
        console.log('Navigating to PickList...');
        navigation.navigate('PickList');
      } else {
        console.log('Navigation not triggered - response:', response.data);
        setGenerateError(
          response.data?.message || 'Failed to generate pick list',
        );
      }
    } catch (error) {
      console.error('Error generating pick list:', error);
      setGenerateError(
        error.response?.data?.message || error.message || 'An error occurred',
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headertxt}>
        <Text style={styles.picklisttxt}>Picklist</Text>
        <TouchableOpacity
          style={[
            styles.genaratehead,
            (flag === 1 || abInv.length === 0) && styles.disabledButton,
          ]}
          onPress={handleGeneratePickList}
          disabled={generating || flag === 1 || abInv.length === 0}>
          <Text style={styles.genaratetxt}>Genarate PickList</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true}>
        <View>
          {/* Header Row */}
          <View style={styles.header}>
            <Text style={styles.orderIdText}>Image</Text>
            <Text style={styles.orderIdText}>Style</Text>
            <Text style={styles.customerText}>Color</Text>
            <Text style={styles.qtyText}>Size</Text>
            <Text style={styles.qtyText}>Location</Text>
            <Text style={styles.statusText}>Aisle</Text>
            <Text style={styles.dateText}>Bin</Text>
            <Text style={styles.dateText}>Available Qty</Text>
            <Text style={styles.dateText}>Order Qty</Text>
          </View>

          {/* Data Rows */}
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : stylesData.length > 0 ? (
            stylesData.map((item, index) => (
              <View key={index}>{renderItem({item, index})}</View>
            ))
          ) : (
            <Text style={styles.noDataText}>No Styles Found</Text>
          )}
        </View>
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
          animationType="fade">
          <View style={styles.modalOverlayImage}>
            <View style={styles.modalContentImage}>
              <TouchableOpacity
                style={styles.closeButtonImageModel}
                onPress={closeModal}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
              {selectedImage && (
                <Image
                  source={{uri: selectedImage}}
                  style={styles.modalImageImage}
                />
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    headertxt: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 10,
      marginVertical: 10,
    },
    picklisttxt: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 20,
    },
    disabledButton: {
      opacity: 0.6,
      backgroundColor: colors.color2 + '80', // Adds 50% transparency
    },
    genaratehead: {
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.color2,
    },
    genaratetxt: {
      color: '#fff',
    },
    image: {
      width: 70,
      height: 70,
      borderRadius: 5,
      marginRight: 10,
    },
    text: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    noDataText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 26,
      color: '#000',
      fontWeight: 'bold',
    },
    header: {
      flexDirection: 'row',
      paddingVertical: 10,
      backgroundColor: '#f0f0f0',
    },
    orderItem: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'lightgray',
    },
    borderBottomColor: '#f0f0f0',
    orderIdText: {
      width: 80, // Fixed width for each column
      textAlign: 'center',
      color: '#000',
    },
    customerText: {
      width: 120,
      textAlign: 'center',
      color: '#000',
    },
    qtyText: {
      width: 80,
      textAlign: 'center',
      color: '#000',
    },
    statusText: {
      width: 100,
      textAlign: 'center',
      color: '#000',
    },
    dateText: {
      width: 100,
      textAlign: 'center',
      color: '#000',
    },
    modalOverlayImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContentImage: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalImageImage: {
      width: 320,
      height: 470,
      marginBottom: 15,
    },
    closeButtonImage: {
      padding: 10,
      backgroundColor: '#007bff',
      borderRadius: 5,
    },
    closeButtonTextImage: {
      color: '#fff',
      fontSize: 16,
    },
    closeButtonImageModel: {
      backgroundColor: colors.color2,
      padding: 3,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
  });

export default PickListEdit;
