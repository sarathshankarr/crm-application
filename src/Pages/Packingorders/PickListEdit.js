import React, {useState, useEffect, useContext, useRef} from 'react';
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
  TextInput,
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
  const wo_creation_flag = useSelector(
    state => state.selectedCompany.wo_creation_flag,
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

  const tempQtyMap = useRef(new Map());

  const getPickedQty = item => {
    return item?.pickedQty || 0;
  };

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
    let count = 0;
    tempQtyMap.current.clear();

    const updatedAbInv = abInv.map(item => {
      if (item?.statusFlag === 0) {
        const key = item?.styleId + '!-' + item?.sizeId;
        let updatedItem = {...item, sttsFlag: isChecked};

        if (isChecked) {
          count++;
          if (picklist_flag === 1 && aisle_bin_inv_flag === 1) {
            const availQty = item.qty || 0;
            const orderQty = item.oqty || 0;
            const pickedQty = getPickedQty(item);

            const remOrderQty = parseFloat(
              (tempQtyMap.current.has(key)
                ? tempQtyMap.current.get(key) || 0
                : orderQty - pickedQty
              ).toFixed(2),
            );

            if (remOrderQty <= 0) {
              updatedItem.enterQty = 0;
            } else {
              const enterableQty = parseFloat(
                (availQty >= remOrderQty ? remOrderQty : availQty).toFixed(2),
              );

              updatedItem.enterQty = enterableQty;
              tempQtyMap.current.set(key, remOrderQty - enterableQty);
            }
          } else if (picklist_flag === 1 && aisle_bin_inv_flag === 0) {
            const orderQty = item.oqty || 0;
            const pickedQty = getPickedQty(item);
            const remOrderQty = parseFloat((orderQty - pickedQty).toFixed(2));
            updatedItem.enterQty = remOrderQty;
          } else {
            updatedItem.enterQty = 0;
          }
        } else {
          updatedItem.enterQty = 0;
        }

        return updatedItem;
      }
      return item;
    });

    abInv.forEach((item, index) => {
      if (item?.statusFlag === 0) {
        newCheckedItems[index] = isChecked;
      }
    });

    setCheckedItems(newCheckedItems);
    setCheckedCount(isChecked ? count : 0);
    setAbInv(updatedAbInv);
  };

  const handleCheck = (isChecked, index, lineItem) => {
    const newCheckedItems = {...checkedItems};
    let countDelta = 0;
    tempQtyMap.current.clear();

    const updatedAbInv = abInv.map((item, i) => {
      if (
        item?.styleId === lineItem?.styleId &&
        item?.sizeId === lineItem?.sizeId &&
        item?.statusFlag === 0
      ) {
        const wasChecked = !!newCheckedItems[i];
        newCheckedItems[i] = isChecked;

        if (isChecked && !wasChecked) countDelta++;
        if (!isChecked && wasChecked) countDelta--;

        const key = item.styleId + '!-' + item.sizeId;
        let updatedItem = {...item, sttsFlag: isChecked};

        if (isChecked && picklist_flag === 1 && aisle_bin_inv_flag === 1) {
          const availQty = item.qty || 0;
          const orderQty = item.oqty || 0;
          const pickedQty = getPickedQty(item);

          const remOrderQty = parseFloat(
            (tempQtyMap.current.has(key)
              ? tempQtyMap.current.get(key) || 0
              : orderQty - pickedQty
            ).toFixed(2),
          );

          if (remOrderQty <= 0) {
            updatedItem.enterQty = 0;
          } else {
            const enterableQty = parseFloat(
              (availQty >= remOrderQty ? remOrderQty : availQty).toFixed(2),
            );

            updatedItem.enterQty = enterableQty;
            tempQtyMap.current.set(key, remOrderQty - enterableQty);
          }
        } else if (
          isChecked &&
          picklist_flag === 1 &&
          aisle_bin_inv_flag === 0
        ) {
          const orderQty = item.oqty || 0;
          const pickedQty = getPickedQty(item);
          const remOrderQty = parseFloat((orderQty - pickedQty).toFixed(2));
          updatedItem.enterQty = remOrderQty;
        } else {
          updatedItem.enterQty = 0;
        }

        return updatedItem;
      }

      return item;
    });

    setCheckedItems(newCheckedItems);
    setCheckedCount(prev => prev + countDelta);
    setAbInv(updatedAbInv);
  };
  const handleEnterQtyChange = (text, index, lineItem) => {
    const inputValue = Number(text) || 0;
    const updatedAbInv = [...abInv];
    const item = updatedAbInv[index];

    if (inputValue > 0) {
      if (aisle_bin_inv_flag === 1) {
        const availQty = item.qty || 0;
        if (inputValue > availQty) {
          alert(
            `Entered quantity exceeds available quantity (${availQty}). Please check.`,
          );
          item.enterQty = 0;
          if (item.sttsFlag) {
            item.sttsFlag = false;
            setCheckedCount(prev => prev - 1);
          }
          setAbInv(updatedAbInv);
          return;
        }
      } else {
        const orderQty = item.oqty || 0;
        const pickedQty = getPickedQty(item);
        const remOrderQty = parseFloat((orderQty - pickedQty).toFixed(2));

        if (inputValue > remOrderQty) {
          alert(
            `Entered quantity exceeds the remaining order quantity (${remOrderQty}). Please enter a valid amount.`,
          );
          item.enterQty = 0;
          if (item.sttsFlag) {
            item.sttsFlag = false;
            setCheckedCount(prev => prev - 1);
          }
          setAbInv(updatedAbInv);
          return;
        }
      }

      item.enterQty = inputValue;

      if (!item.sttsFlag) {
        item.sttsFlag = true;
        setCheckedCount(prev => prev + 1);
      }
    } else {
      item.enterQty = 0;
      if (item.sttsFlag) {
        item.sttsFlag = false;
        setCheckedCount(prev => prev - 1);
      }
    }

    setAbInv(updatedAbInv);
  };

  const handleCloseOrder = () => {
    const selectedStyles = abInv.filter(item => item?.sttsFlag);
    const data = {
      userId: userId,
      companyId: companyId,
      picklist_flag: picklist_flag,
      aisle_bin_inv_flag: aisle_bin_inv_flag,
      wo_creation_flag: wo_creation_flag,
      linkType: 1,
      orderId: orderId,
    };

    if (selectedStyles.length > 0) {
      Alert.alert(
        'crm.codeverse.co says',
        'Are you sure you want to close these selected styles?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              data.callType = 1;
              data.abList = selectedStyles;
              await closePicklistOrderApi(data);
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'crm.codeverse.co says',
        'As there are no styles selected... order will be closed for remaining styles. If it is fine, please click OK.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              data.callType = 2;
              data.abList = abInv.filter(item => item?.statusFlag === 0);
              await closePicklistOrderApi(data);
            },
          },
        ],
      );
    }
  };
  const closePicklistOrderApi = async data => {
    try {
      const apiUrl = `${global?.userData?.productURL}${API.CLOSE_ORDER_PICKLIST}`;

      const response = await axios.post(apiUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data?.success || response.data === true) {
        Alert.alert('Success', 'Order closed successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to close order');
      }
    } catch (error) {
      console.error('Close Order API Error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error.message || 'An error occurred',
      );
    }
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
          lineItem.wo_creation_flag = wo_creation_flag;
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
        lineItem.wo_creation_flag = wo_creation_flag;
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
      picklist_flag === 1 && {},
    ];

    return (
      <View style={styles.itemContainer}>
        {isFirstOfStyle && (
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.styleNameText}>{item.styleName}</Text>
              <Text style={styles.colorLocationText}>{item.color}</Text>
              <Text style={styles.colorLocationText}>{item.location}</Text>
              <Text style={styles.colorLocationText}>
                Total Order Qty : {item.totalQty}
              </Text>
            </View>

            <TouchableOpacity onPress={() => openModal(item.imageUrl1)}>
              <Image source={{uri: item.imageUrl1}} style={styles.imageStyle} />
            </TouchableOpacity>
          </View>
        )}

        {isFirstOfStyle && (
          <View style={styles.columnHeaderContainer}>
            <View style={styles.columnHeaderRow}>
              {picklist_flag === 1 && <View style={{marginLeft: 2}} />}
              <Text style={sizeHeaderStyle}>Size</Text>

              {picklist_flag === 1 && aisle_bin_inv_flag === 0 && (
                <>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.centeredColumnHeaderText,
                    ]}>
                    Available Qty
                  </Text>
                </>
              )}
              {(picklist_flag === 0 || aisle_bin_inv_flag === 1) && (
                <>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.centeredColumnHeaderText,
                    ]}>
                    Aisle
                  </Text>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.centeredColumnHeaderText,
                    ]}>
                    Bin
                  </Text>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.centeredColumnHeaderText,
                    ]}>
                    Avail Qty
                  </Text>
                </>
              )}
              <Text
                style={[
                  styles.columnHeaderText,
                  styles.rightAlignedColumnHeaderText,
                ]}>
                Order Qty
              </Text>

              {picklist_flag === 1 && (
                <>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.rightAlignedColumnHeaderText,
                      {marginRight: 10},
                    ]}>
                    Picked Qty
                  </Text>
                </>
              )}
              {picklist_flag === 1 && (
                <>
                  <Text
                    style={[
                      styles.columnHeaderText,
                      styles.rightAlignedColumnHeaderText,
                      {marginRight: 5},
                    ]}>
                    Enter Qty
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Table Row Section */}
        {picklist_flag === 1 &&
          (item?.statusFlag !== 2 ? (
            <CustomCheckBoxPickList
              checked={!!checkedItems[index]}
              indeterminate={false}
              disabled={item?.statusFlag === 1}
              onChange={isChecked => handleCheck(isChecked, index, item)}
              style={styles.checkboxCell}
            />
          ) : (
            <Text style={styles.closedText}>Closed</Text>
          ))}
        <View style={styles.tableRowContainer}>
          <View style={styles.tableRow}>
            <Text style={styles.sizeText}>{item.size}</Text>

            {picklist_flag === 1 && aisle_bin_inv_flag === 0 && (
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
            <Text style={styles.centeredText}>{item.oqty || 0}</Text>
            {picklist_flag === 1 && (
              <>
                <Text style={styles.centeredText}>{item.pickedQty || 0}</Text>
              </>
            )}
            {picklist_flag === 1 && (
              <>
                {item?.statusFlag === 0 ? (
                  <TextInput
                    style={styles.enterQtyCell}
                    editable={true}
                    placeholder="Enter Qty"
                    keyboardType="numeric"
                    value={item.enterQty?.toString() || ''}
                    onChangeText={text =>
                      handleEnterQtyChange(text, index, item)
                    }
                  />
                ) : (
                  <TextInput
                    style={[styles.enterQtyCell, {backgroundColor: '#eee'}]} // Optional grey-out
                    editable={false}
                    placeholder="Locked"
                    value={item.enterQty?.toString() || ''}
                  />
                )}
              </>
            )}
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
    if (picklist_flag === 1) {
      const anyEntered = abInv.some(item => Number(item.enterQty) > 0);
      if (!anyEntered) {
        Alert.alert(
          'crm.codeverse.co says',
          'Please ensure at least one item has an Enter Qty greater than zero before proceeding.',
        );
        return;
      }
  
      tempQtyMap.current.clear();
      const enteredQtyMap = new Map();
      const remOrderQtyMap = new Map();
      const qtyExceededKeys = [];
  
      const updatedAbInv = [...abInv];
  
      updatedAbInv.forEach(item => {
        if (item?.sttsFlag) {
          const key = `${item.styleName}!-${item.color}!-${item.size}`;
          const orderQty = item.oqty || 0;
          const pickedQty = getPickedQty(item);
          const enteredQty = Number(item.enterQty) || 0;
  
          const remOrderQty = parseFloat((orderQty - pickedQty).toFixed(2));
          remOrderQtyMap.set(key, remOrderQty);
          enteredQtyMap.set(
            key,
            parseFloat(((enteredQtyMap.get(key) || 0) + enteredQty).toFixed(2)),
          );
  
          // Ensure consistency across same style/size lines
          updatedAbInv.forEach(lineItem => {
            if (
              item.styleId === lineItem.styleId &&
              item.sizeId === lineItem.sizeId
            ) {
              if (!lineItem.sttsFlag) {
                lineItem.sttsFlag = true;
                lineItem.enteredQty = 0;
              }
              const remainingQty =
                (remOrderQtyMap.get(key) || remOrderQty) -
                (enteredQtyMap.get(key) || 0);
              lineItem.remOrderQty = parseFloat(remainingQty.toFixed(2));
            }
          });
        }
      });
  
      // Check if any styles exceed remaining qty
      enteredQtyMap.forEach((entered, key) => {
        const allowed = remOrderQtyMap.get(key) || 0;
        if (entered > allowed) {
          qtyExceededKeys.push(
            `${key.replace(
              /!-/g,
              ' / ',
            )} (Entered Qty: ${entered}, Order Qty: ${allowed})`,
          );
        }
      });
  
      if (qtyExceededKeys.length > 0) {
        Alert.alert(
          'crm.codeverse.co says',
          'The following items have entered quantities exceeding the remaining order quantities:\n\n- ' +
            qtyExceededKeys.join('\n- '),
        );
        return;
      }
  
      await generatePickListApiCall(updatedAbInv);
    } else {
      // Aisle/Bin inventory mode
      let styVal = '';
  
      qtyMap.forEach((value, key) => {
        if (value > 0) {
          // Future logic placeholder for aisle/bin
        }
      });
  
      if (styVal === '') {
        await generatePickListApiCall(abInv);
      } else {
        Alert.alert(
          'crm.codeverse.co says',
          'Qty is not available in Aisle/Bin Inventory for these styles and respective sizes:\n\n' +
            styVal,
        );
        return;
      }
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
                  style={{width: 30}}
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
                  <Image
                    style={{height: 25, width: 25, marginHorizontal: 10}}
                    source={require('../../../assets/exclamation.png')}
                  />
                  <Text style={styles.warningText}>
                    Aisle and bin details are not mapped for the styles at this
                    location. Please check.
                  </Text>
                </View>
              )}
          </View>
          {picklist_flag === 1 && abInv.length > 0 && checkableCount > 0 && (
            <TouchableOpacity
              style={styles.closehead}
              onPress={handleCloseOrder}>
              <Text style={styles.closetxt}>Close</Text>
            </TouchableOpacity>
          )}
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      color: '#000', // dark yellow text
      fontSize: 16,
      fontWeight: 'bold',
    },
    itemContainer: {
      // marginHorizontal: 3,
      marginVertical: 8,
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },

    // Header section
    headerContainer: {
      flexDirection: 'row',
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#eeeeee',
      alignItems: 'center',
      backgroundColor: '#f8fafd',
    },
    headerTextContainer: {
      flex: 1,
    },
    styleNameText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#3867c4',
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    colorLocationText: {
      fontSize: 15,
      color: '#444444',
      marginBottom: 6,
      letterSpacing: 0.1,
    },
    imageStyle: {
      width: 95,
      height: 95,
      borderRadius: 8,
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#eeeeee',
    },

    // Column headers
    columnHeaderContainer: {
      backgroundColor: '#f1f5fa',
    },
    columnHeaderRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#dce4ee',
    },
    columnHeaderText: {
      fontWeight: '600',
      fontSize: 15,
      color: '#566a88',
      letterSpacing: 0.1,
    },
    sizeHeaderText: {
      flex: 1,
      // marginLeft: 30, // Default value, will be overridden conditionally
    },
    centeredColumnHeaderText: {
      flex: 1,
      textAlign: 'center',
    },
    rightAlignedColumnHeaderText: {
      flex: 1,
      textAlign: 'right',
      paddingRight: 8,
    },

    // Table rows
    tableRowContainer: {
      backgroundColor: '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      // paddingVertical: 3,
      // paddingHorizontal: 2,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    sizeText: {
      flex: 1,
      fontSize: 15,
      color: '#333333',
      fontWeight: '500',
      paddingLeft: 1,
    },
    centeredText: {
      flex: 1,
      fontSize: 15,
      textAlign: 'center',
      color: '#333333',
    },
    rightAlignedText: {
      flex: 1,
      fontSize: 15,
      textAlign: 'right',
      color: '#333333',
      paddingRight: 8,
    },

    // Special states
    closedText: {
      fontSize: 13,
      color: 'red',
      fontWeight: '500',
      // paddingHorizontal: 8,
    },

    // Input styling
    enterQtyCell: {
      // flex: 1,
      // height: 36,
      // fontSize: 15,
      // textAlign: 'center',
      borderWidth: 1,
      borderColor: '#d0d8e2',
      borderRadius: 6,
      // backgroundColor: '#ffffff',
      marginRight: 4,
      // color: '#333333',
      flex: 1,
      fontSize: 15,
      textAlign: 'center',
      color: '#333333',
    },

    // Checkbox styling
    checkboxCell: {
      marginRight: 15,
      alignItems: 'flex-start',
      marginHorizontal: 5,
      marginVertical: 5,
    },

    // Alternating row colors for better readability
    alternateRow: {
      backgroundColor: '#f9fbff',
    },

    // Status indicators
    statusPending: {
      color: '#e99c00',
    },
    statusComplete: {
      color: '#36a64f',
    },

    // Order quantity highlight
    orderQtyHighlight: {
      fontWeight: '600',
      color: '#3867c4',
    },
    closetxt: {
      color: '#fff',
    },
    closehead: {
      // flex: 1, // ❌ remove this
      borderWidth: 1,
      marginHorizontal: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.color2,
      alignItems: 'center',
      alignSelf: 'center', // ✅ ensures it only takes needed width
    },
  });

export default PickListEdit;
