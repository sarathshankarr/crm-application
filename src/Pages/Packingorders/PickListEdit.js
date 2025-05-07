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
  SafeAreaView,
} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {API} from '../../config/apiConfig';
import {ColorContext} from '../../components/colortheme/colorTheme';
import CustomCheckBox from '../../components/CheckBox';
import CustomCheckBoxPickList from '../../components/CustomCheckBoxPickList';

const PickListEdit = () => {
  const navigation = useNavigation();
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);

  const compFlag = useSelector(state => state.selectedCompany.comp_flag);
  const picklist_flag = useSelector(
    state => state.selectedCompany.picklist_flag,
  );
  const aisle_bin_inv_flag = useSelector(
    state => state.selectedCompany.aisle_bin_inv_flag,
  );

  const selectedCompany = useSelector(state => state.selectedCompany);
  const userId = useSelector(state => state?.loggedInUser?.userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [flag, setFlag] = useState(null);
  const [abInv, setAbInv] = useState([]);
  const [qtyMap, setQtyMap] = useState(new Map());

  const [checkedItems, setCheckedItems] = useState({});
  const [checkedCount, setCheckedCount] = useState(0);
  const [checkableCount, setCheckableCount] = useState(0);

  useEffect(() => {
    const initialCheckedItems = {};
    let count = 0;
    let checkable = 0;

    abInv.forEach((item, index) => {
      if (item?.statusFlag === 0) {
        checkable++;
        initialCheckedItems[index] = item.sttsFlag || false;
        if (initialCheckedItems[index]) count++;
      }
    });

    setCheckedItems(initialCheckedItems);
    setCheckedCount(count);
    setCheckableCount(checkable);
  }, [abInv]);

  // Update masterToggles to properly update the state
  const masterToggles = isChecked => {
    const newCheckedItems = {};
    let newCheckedCount = 0;

    abInv.forEach((item, index) => {
      if (item?.statusFlag === 0) {
        newCheckedItems[index] = isChecked;
        if (isChecked) newCheckedCount++;
      }
    });

    setCheckedItems(newCheckedItems);
    setCheckedCount(newCheckedCount);

    // Update the abInv data
    const updatedAbInv = abInv.map(item => {
      if (item?.statusFlag === 0) {
        return {...item, sttsFlag: isChecked};
      }
      return item;
    });
    setAbInv(updatedAbInv);
  };

  const handleCheck = (isChecked, index, lineItem) => {
    const newCheckedItems = {...checkedItems};
    let countDelta = 0;

    abInv.forEach((item, i) => {
      if (
        item?.styleId === lineItem?.styleId &&
        item?.sizeId === lineItem?.sizeId &&
        item?.statusFlag === 0
      ) {
        const wasChecked = newCheckedItems[i] || false;
        newCheckedItems[i] = isChecked;

        if (isChecked && !wasChecked) countDelta++;
        if (!isChecked && wasChecked) countDelta--;
      }
    });

    setCheckedItems(newCheckedItems);
    setCheckedCount(prev => prev + countDelta);

    const updatedAbInv = abInv.map((item, i) => {
      if (
        item?.styleId === lineItem?.styleId &&
        item?.sizeId === lineItem?.sizeId &&
        item?.statusFlag === 0
      ) {
        return {...item, sttsFlag: isChecked}; // update sttsFlag to true or false
      }
      return item;
    });

    setAbInv(updatedAbInv); // Make sure the abInv state is updated with the correct checkbox status
  };

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
          lineItem.picklist_flag = picklist_flag;
          lineItem.aisle_bin_inv_flag = aisle_bin_inv_flag;
          (lineItem.linkType = 1), tempAbInv.push(lineItem);
        }
      } else {
        let qty = lineItem.oqty - lineItem.qty;
        tempQtyMap.set(styleSize, qty);
        lineItem.dqty = qty > 0 ? lineItem.qty : lineItem.oqty;
        lineItem.companyId = companyId;
        lineItem.userId = userId;
        (lineItem.linkType = 1), (lineItem.picklist_flag = picklist_flag);
        lineItem.aisle_bin_inv_flag = aisle_bin_inv_flag;
        tempAbInv.push(lineItem);
      }
    });
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
    const apiUrl = `${global?.userData?.productURL}${API.PICK_LIST_EDIT}/${orderId}/${companyId}/${compFlag}/`;
    const params = {
      picklist_flag: picklist_flag?.toString(),
      aisle_bin_inv_flag: aisle_bin_inv_flag?.toString(),
    };

    console.log(
      'Full API URL with params:',
      `${apiUrl}?${new URLSearchParams(params).toString()}`,
    );

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
        params,
      });

      console.log('API Response Data:', response.data);

      if (Array.isArray(response.data)) {
        processPickListData(response.data);
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

 
const renderItem = ({item, index}) => {
  const isFirstOfStyle =
    index === 0 ||
    abInv[index - 1].styleName !== item.styleName ||  
    abInv[index - 1].color !== item.color ||
    abInv[index - 1].orderId !== item.orderId;

  const sizeHeaderStyle = [
    styles.columnHeaderText,
    styles.sizeHeaderText,
    picklist_flag === 1 && {marginLeft: 15}
  ];

  return (
    <View style={styles.itemContainer}>
      {isFirstOfStyle && (
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.styleNameText}>{item.styleName}</Text>
            <Text style={styles.colorLocationText}>{item.color}</Text>
            <Text style={styles.colorLocationText}>{item.location}</Text>
            <Text style={styles.colorLocationText}>Total Order Qty : {item.totalQty}</Text>

          </View>

          <TouchableOpacity onPress={() => openModal(item.imageUrl1)}>
            <Image
              source={{uri: item.imageUrl1}}
              style={styles.imageStyle}
            />
          </TouchableOpacity>
        </View>
      )}

      {isFirstOfStyle && (
        <View style={styles.columnHeaderContainer}>
          <View style={styles.columnHeaderRow}>
            {picklist_flag === 1 && <View style={{width: 24}} />}
            <Text style={sizeHeaderStyle}>Size</Text>


            {(picklist_flag === 1 || aisle_bin_inv_flag === 0) && (
            <>
                <Text style={[styles.columnHeaderText, styles.centeredColumnHeaderText]}>
                  Available Qty
                </Text>
             </>
            )}
            {(picklist_flag === 0 || aisle_bin_inv_flag === 1) && (
              <>
                <Text style={[styles.columnHeaderText, styles.centeredColumnHeaderText]}>
                  Aisle
                </Text>
                <Text style={[styles.columnHeaderText, styles.centeredColumnHeaderText]}>
                  Bin
                </Text>
                <Text style={[styles.columnHeaderText, styles.centeredColumnHeaderText]}>
                  Avail Qty
                </Text>
              </>
            )}
            <Text style={[styles.columnHeaderText, styles.rightAlignedColumnHeaderText]}>
              Order Qty
            </Text>
          </View>
        </View>
      )}

      {/* Table Row Section */}
      <View style={styles.tableRowContainer}>
        <View style={styles.tableRow}>
          {picklist_flag === 1 && (
            <CustomCheckBoxPickList
              checked={!!checkedItems[index]}
              indeterminate={false}
              disabled={item?.statusFlag === 1}
              onChange={isChecked => handleCheck(isChecked, index, item)}
              style={{marginRight: 5}}
            />
          )}
          <Text style={styles.sizeText}>{item.size}</Text>


          {(picklist_flag === 1 || aisle_bin_inv_flag === 0) && (
            <>
              <Text style={styles.centeredText}>{item.availQty || 0}</Text>
            </>
          )}

          {(picklist_flag === 0 || aisle_bin_inv_flag === 1) && (
            <>
              <Text style={styles.centeredText}>{item.aisle}</Text>
              <Text style={styles.centeredText}>{item.bin}</Text>
              <Text style={styles.centeredText}>{item.qty || 0}</Text>
            </>
          )}
          <Text style={styles.rightAlignedText}>{item.oqty || 0}</Text>
        </View>
      </View>
    </View>
  );
};

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
    if (picklist_flag === 1 && aisle_bin_inv_flag === 0) {
      // Directly call the generate API when picklist is enabled but aisle/bin flag is not
      await generatePickListApiCall();
      return;
    }

    // Helper to determine if an item is checked
    const isItemChecked = key => {
      const keyArr = key.split('!-');
      return (
        abInv.find(
          li =>
            li?.styleName === keyArr[0] &&
            li?.color === keyArr[1] &&
            li?.size === keyArr[2],
        )?.sttsFlag || false
      );
    };

    let styVal = '';
    qtyMap.forEach((value, key) => {
      if (value > 0) {
        if (picklist_flag === 1 && aisle_bin_inv_flag === 1) {
          if (isItemChecked(key)) {
            styVal += key + ' ';
          }
        } else {
          styVal += key + ' ';
        }
      }
    });

    if (styVal === '') {
      await generatePickListApiCall();
    } else {
      Alert.alert(
        'crm.codeverse.co says',
        'Qty is not available in Aisle/Bin Inventory for these styles and respective sizes: ' +
          styVal,
        [{text: 'OK'}],
      );
      return;
    }
  };

  const generatePickListApiCall = async () => {
    if (abInv.length === 0) {
      setGenerateError('No items to generate pick list');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);

    try {
      const apiUrl = `${global?.userData?.productURL}${API.GENARATE_PICK_LIST}`;

      // const requestData = abInv.map(item => ({
      //   ab_id: item.ab_id,
      //   styleId: item.styleId,
      //   sizeId: item.sizeId,
      //   qty: item.qty,
      //   locationId: item.locationId,
      //   aisleId: item.aisleId,
      //   binId: item.binId,
      //   ab_picklist: item.ab_picklist || 0,
      //   dqty: item.dqty,
      //   companyId: item.companyId,
      //   scannedBarcodes: item.scannedBarcodes,
      //   styleName: item.styleName,
      //   color: item.color,
      //   size: item.size,
      //   location: item.location,
      //   aisle: item.aisle,
      //   bin: item.bin,
      //   orderId: item.orderId,
      //   oqty: item.oqty,
      //   pickFlag: item.pickFlag || 0,
      //   shipQty: item.shipQty || 0,
      //   pickId: item.pickId || 0,
      //   orderNum: item.orderNum,
      //   userId: item.userId,
      //   cnt: item.cnt || 0,
      //   uomName: item.uomName || '',
      //   imageUrl1: item.imageUrl1,
      //   barcodeSet: item.barcodeSet,
      //   compFlag: item.compFlag,
      //   cedgeStyleId: item.cedgeStyleId,
      //   cedgeSizeId: item.cedgeSizeId,
      //   userName: item.userName,
      //   sttsFlag: item.sttsFlag || false,
      //   statusFlag:item.statusFlag

      // }));

      const requestData = abInv.map(item => item);
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
        navigation.navigate('PickList');
      } else {
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
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.headertxt}>
        <Text style={styles.picklisttxt}>Picklist</Text>
        {picklist_flag === 1 && (
          <TouchableOpacity
            style={[
              styles.genaratehead,
              (abInv.length === 0 || checkedCount === 0) &&
                styles.disabledButton,
            ]}
            onPress={handleGeneratePickList}
            disabled={generating || abInv.length === 0 || checkedCount === 0}>
            <Text style={styles.genaratetxt}>Generate PickList</Text>
          </TouchableOpacity>
        )}

        {picklist_flag === 0 && (
          <TouchableOpacity
            style={[
              styles.genaratehead,
              (flag === 1 || abInv.length === 0) && styles.disabledButton,
            ]}
            onPress={handleGeneratePickList}
            disabled={generating || flag === 1 || abInv.length === 0}>
            <Text style={styles.genaratetxt}>Generate PickList</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.container}>
        <ScrollView>
          <View>
            {/* Header Row */}

            <View style={styles.header}>
              {picklist_flag === 1 && (
                <CustomCheckBoxPickList
                  checked={
                    checkedCount === checkableCount && checkableCount > 0
                  }
                  indeterminate={
                    checkedCount > 0 && checkedCount !== checkableCount
                  }
                  disabled={abInv.length === 0 || checkableCount === 0}
                  onChange={masterToggles}
                  style={{width: 50}}
                />
              )}
               {picklist_flag === 1 && (
              <Text style={{color: 'gray', fontWeight: 'bold'}}>
                Select All
              </Text>
              )}
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : abInv.length > 0 ? (
              abInv.map((item, index) => renderItem({item, index}))
            ) : (
              <Text style={styles.noDataText}></Text>
            )}

            {!loading &&
              abInv?.length === 0 &&
              picklist_flag === 1 &&
              aisle_bin_inv_flag === 1 && (
                <View style={styles.warningMessage}>
                  <Image style={{height:25,width:25,marginHorizontal:10}} source={require('../../../assets/exclamation.png')}/>
                  <Text style={styles.warningText}>
                    Aisle and bin details are not mapped for the styles at this
                    location. Please check.
                  </Text>
                </View>
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
      </ScrollView>
    </SafeAreaView>
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
      alignItems: 'center',
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
      resizeMode: 'contain',
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
    checkboxContainer: {
      padding: 8,
      width: 50,
    },
    indeterminateIndicator: {
      position: 'absolute',
      left: 8,
      top: 8,
      width: 20,
      height: 20,
      borderWidth: 2,
    },
    warningMessage: {
      padding: 10,
      margin: 10,
      borderRadius: 5,
      flexDirection:"row",
      alignItems:"center",
    },
    warningText: {
      color: '#000', // dark yellow text
      fontSize: 16,
      fontWeight: 'bold',
    },
    itemContainer: {
      marginHorizontal: 10,
      marginVertical: 5,
      backgroundColor: 'white',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      overflow: 'hidden',
    },
    headerContainer: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      alignItems: 'center',
    },
    headerTextContainer: {
      flex: 1,
    },
    styleNameText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#5783C3',
      marginBottom: 5,
    },
    colorLocationText: {
      fontSize: 16,
      color: '#000',
      marginBottom: 8,
    },
    imageStyle: {
      width: 100,
      height: 100,
      borderRadius: 5,
      resizeMode: 'contain',
    },
    columnHeaderContainer: {
      backgroundColor: '#f9f9f9',
      padding: 10,
    },
    columnHeaderRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    columnHeaderText: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#000',
    },
    sizeHeaderText: {
      flex: 1,
      marginLeft: 30, // Default value, will be overridden conditionally
    },
    centeredColumnHeaderText: {
      flex: 1,
      textAlign: 'center',
    },
    rightAlignedColumnHeaderText: {
      flex: 1,
      textAlign: 'right',
    },
    tableRowContainer: {
      backgroundColor: '#f9f9f9',
      paddingHorizontal: 10,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingLeft: 10,
    },
    sizeText: {
      flex: 1,
      fontSize: 15,
      color: '#000',
    },
    centeredText: {
      flex: 1,
      fontSize: 15,
      textAlign: 'center',
      color: '#000',
    },
    rightAlignedText: {
      flex: 1,
      fontSize: 15,
      textAlign: 'right',
      color: '#000',
    },
  });

export default PickListEdit;
