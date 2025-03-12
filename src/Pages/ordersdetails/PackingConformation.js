import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import CustomCheckBox from '../../components/CheckBox';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomCheckBoxStatus from '../../components/CustomCheckBoxStatus';
import {ColorContext} from '../../components/colortheme/colorTheme';

const PackingConformation = ({route}) => {
  const navigation = useNavigation();
  const {orderId} = route.params;
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState({ orderLineItems: [] });
  const [statusOptions, setStatusOptions] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [triggerUpdate, setTriggerUpdate] = useState(false);
  const loggedInUser = useSelector(state => state.loggedInUser);
  const [comments, setComments] = useState(''); // Add this state variable

  const orderApproval = loggedInUser?.role[0]?.orderApproval;
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const [originalStyleMap, setOriginalStyleMap] = useState(new Map());
  const [existingStyleMap, setExistingStyleMap] = useState(new Map());
  const [deletedStyleMap, setDeletedStyleMap] = useState(new Map());

  const [stylesData, setStylesData] = useState([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [filterFlag, setFilterFlag] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // Renamed from 'loading'
  const [loadingMore, setLoadingMore] = useState(false); // Keeping this for loading more tasks
  const [refreshing, setRefreshing] = useState(false); // To track refresh state

  const [skuData, setSkuData] = useState([]); // Store dropdown data
  const [showSkuDropdown, setShowSkuDropdown] = useState(false);
  const [loadingSku, setLoadingSku] = useState(false); // Loading state
  const [selectedSku, setSelectedSku] = useState('Select'); // State for the selected SKU
  const [searchFilterFlag, setsearchFilterFlag] = useState(false);

  const screenHeight = Dimensions.get('window').height;

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };
  
  const closeModal = () => {
    setIsImageModalVisible(false);
    setSelectedImage(null);
  };
  


  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.STYLE_BASED_ON_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      companyId: companyId,
      from: customFrom,
      to: customTo,
    };

    console.log('gettasksearch==> ', customFrom, customTo);

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response?.data) {
        // setOrders(response.data.response.ordersList);

        const newOrders = response?.data.filter(
          order => order !== null,
        );

        setStylesData(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreTasks(newOrders?.length >= 15);

        // setHasMoreTasks(false);
      } else {
        setStylesData([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(20);
    // setSearchKey(0);
    setFilterFlag(false);

    setSearchQuery('');
    // setShowSearchInput(false);
    // setSelectedSearchOption('');
    setHasMoreTasks(true);

    await getAllProducts(true, 0, 20);
    setRefreshing(false);
  };

  useEffect(() => {
    if (searchOption.length > 0) {
      setSelectedSearchOption(searchOption[0].label);
      setSearchKey(searchOption[0].value);
    }
  }, [searchOption]); // This will run whenever searchOption changes


  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };


  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      getAllProducts(true, 0, 20);
    }
  };

  const searchOption = [
    { label: 'style', value: 3 },
    { label: 'color', value: 5 },
    { label: 'sku', value: 8 },
  ];
  
  const handleDropdownSelect = option => {
    onRefresh();
    setTimeout(() => {
      setSelectedSearchOption(option.label);
      setSearchKey(option.value);
      setDropdownVisible(false);
      setSearchQuery(''); 
    }, 0);
  };


  const handleSearch = () => {
    if (!searchKey) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit the function if no search key is selected
    }

    if (!searchQuery.trim()) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit if the search query is empty
    }

    setFilterFlag(true);
    setFrom(0);
    setTo(20);

    gettasksearch(true, 0, 20);
  };

  const getAllProducts = async (reset = false, start = from, end = to) => {
    if (isLoading || loadingMore) return;
    
    if (reset) {
        start = 0;
        end = 20;
        setFrom(start);
        setTo(end);
    }

    setIsLoading(reset);

    const apiUrl = `${global?.userData?.productURL}${API.GET_SELECT_STYLE}/${start}/${end}/${companyId}/${order.customerLocation}`;
    console.log('apiUrl:', apiUrl);

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            },
        });

        const newTasks = response?.data;
        console.log('newTasks====>', newTasks);

        if (reset) {
            setStylesData(newTasks);
        } else {
            setStylesData(prevTasks => [...prevTasks, ...newTasks]);
        }

        if (newTasks.length < 15) {
            setHasMoreTasks(false);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setIsLoading(false);
        setLoadingMore(false);
    }
};


  const loadMoreTasks = async () => {
    if (!hasMoreTasks || loadingMore) return;

    setLoadingMore(true);
    const newFrom = to + 1;
    const newTo = newFrom + 19;
    setFrom(newFrom);
    setTo(newTo);

    if (filterFlag) {
      try {
        await gettasksearch(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    } else {
      try {
        await getAllProducts(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    }
    // getAllOrders(); // Call getAllOrders here to fetch new data
  };

  // useEffect(() => {
  //   if (companyId && modalVisible) {
  //     getAllProducts(true); // Trigger the function with reset flag
  //   }
  // }, [companyId, modalVisible]);

  useEffect(() => {
    if (companyId && modalVisible) {
      getAllProducts(true); // Fetch fresh data
      setStylesData(prevStylesData =>
        prevStylesData.map(item => ({
          ...item,
          qty: 0, // Reset quantity to 0
        }))
      );
    }
  }, [companyId, modalVisible]);

  // const updateQty = (index, value) => {
  //   const newStylesData = [...stylesData];
  //   newStylesData[index].qty = parseInt(value) || 0; // Convert to integer or set to 0 if invalid
  //   setStylesData(newStylesData);
  // };

  const updateQty = (index, value) => {
    const newStylesData = [...stylesData];
  
    // Remove leading zeros unless it's "0." to allow decimal input
    if (/^\d*\.?\d*$/.test(value)) {
      if (value.startsWith("0") && value.length > 1 && !value.startsWith("0.")) {
        value = value.replace(/^0+/, ""); // Remove leading zeros
      }
      newStylesData[index].qty = value; // Store as string
      setStylesData(newStylesData);
    }
  };
  

  
  // useEffect(() => {
  //   if (order?.orderLineItems?.length > 0) {
  //     const map = new Map();
  //     order.orderLineItems.forEach(item => {
  //       const key = `${item.styleId}-${item.size}`;
  //       map.set(key, item.qty);
  //     });
  //     setExistingStyleMap(map);
  //     setOriginalStyleMap(prev => (prev.size === 0 ? new Map(map) : prev)); // Preserve original map
  //     console.log('Existing style map after update:', map);
  //   }
  // }, [order]);

  // useEffect(() => {
  //   if (order?.orderLineItems?.length > 0) {
  //     const newMap = new Map(existingStyleMap); // Clone the existing map to avoid overwriting
  //     order.orderLineItems.forEach(item => {
  //       const key = `${item.styleId}-${item.size}`;
  //       newMap.set(key, item.qty);
  //       console.log("Processing Item Key:", key, "Qty:", item.qty);
  //     });
  
  //     setExistingStyleMap(new Map(newMap)); // Ensure React detects the update
  //     setOriginalStyleMap(prev => (prev.size === 0 ? new Map(newMap) : prev)); // Preserve original
  //     console.log("Existing style map after update:", newMap);
  //   }
  // }, [order]);
  
  useEffect(() => {
    if (order?.orderLineItems?.length > 0) {
      // console.log("Order data:", order);
  
      const newMap = new Map();
      existingStyleMap.forEach((value, key) => {
        newMap.set(key, value);
      });
  
      console.log("Current existingStyleMap before update:", Array.from(existingStyleMap));
  
      order.orderLineItems.forEach(item => {
        const key = `${item.styleId}-${item.size}`;
        newMap.set(key, item.qty);
        console.log("Processing Item Key:", key, "Qty:", item.qty);
      });
  
      console.log("Updated existingStyleMap after update:", Array.from(newMap));
  
      setTimeout(() => {
        setExistingStyleMap(newMap);
        setOriginalStyleMap(prev => (prev.size === 0 ? new Map(newMap) : prev));
      }, 100);
    }
  }, [order]);
  

  const calculateTotals = orderLineItems => {
    const totalQty = orderLineItems.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0; // Ensure qty is a number
      return item.statusFlag !== 2 ? sum + qty : sum;
    }, 0);

    // const totalAmount = orderLineItems.reduce((sum, item) => {
    //   if (item.statusFlag !== 2) {
    //     const qty = parseFloat(item.qty) || 0;
    //     const unitPrice = parseFloat(item.unitPrice) || 0;
    //     const gst = parseFloat(item.gst) || 0;
    //     const discountPercentage = parseFloat(item.discountPercentage) || 0;
    //     const discountPercentageSec =
    //       parseFloat(item.discountPercentageSec) || 0;
    //     const discountAmountThird =
    //       parseFloat(item.discountPercentageThird) || 0;

    //     // Ensure we have valid fixedPrice
    //     let fixedPrice = unitPrice;
    //     if (pdf_flag === 1 && discountAmountThird) {
    //       fixedPrice = unitPrice - discountAmountThird;
    //     }

    //     // Validate all intermediate calculations to avoid NaN
    //     const basePrice = qty * fixedPrice;
    //     const discountAmount = (basePrice * discountPercentage) / 100 || 0;
    //     const discountAmountSec =
    //       ((basePrice - discountAmount) * discountPercentageSec) / 100 || 0;
    //     const gstAmount =
    //       (basePrice - discountAmount - discountAmountSec) * (gst / 100) || 0;

    //     // Calculate the final line item total
    //     const lineitemTotal =
    //       basePrice - discountAmount - discountAmountSec + gstAmount || 0;

    //     // Log all intermediate and final calculations for debugging
    //     console.log(
    //       `Calculating totals for item ${item.styleId || item.orderLineitemId}`,
    //     );
    //     console.log({
    //       qty,
    //       fixedPrice,
    //       basePrice,
    //       discountAmount,
    //       discountAmountSec,
    //       gstAmount,
    //       lineitemTotal,
    //     });

    //     // Check for NaN in final calculation
    //     if (isNaN(lineitemTotal)) {
    //       console.error(
    //         `NaN detected in lineitemTotal calculation for item: `,
    //         item,
    //       );
    //     }

    //     return sum + lineitemTotal; // Accumulate the total
    //   }
    //   return sum;
    // }, 0);

    // console.log(`Total Amount Before Rounding: ${totalAmount}`);

    // const totalGst = orderLineItems.reduce((sum, item) => {
    //   if (item.statusFlag !== 2) {
    //     const qty = parseFloat(item.qty) || 0;
    //     const unitPrice = parseFloat(item.unitPrice) || 0;
    //     const gst = parseFloat(item.gst) || 0;

    //     const basePrice = qty * unitPrice;
    //     const gstAmount = basePrice * (gst / 100);

    //     return sum + gstAmount;
    //   }
    //   return sum;
    // }, 0);


    const totalAmount = orderLineItems.reduce((sum, item) => {
      if (item.statusFlag !== 2) {
        const qty = item.qty || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
        const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
        const fixDisc = parseFloat(item.fixDisc) || 0;
        const gst = parseFloat(item.gst) || 0;
        const pdfFlag = Number(pdf_flag); 

    let fixedPrice = 0;
if (pdfFlag !== 1) {
  if (unitPrice) {
    if (discountPercentageThird) {
      fixedPrice = item.unitPrice - item.discountPercentageThird;
    } else {
      fixedPrice = item.unitPrice;
    }

    if (item.fixDisc) {
      fixedPrice -= fixDisc
    }
  } else {
    fixedPrice = 0;
  }
} else {
  fixedPrice = unitPrice || 0;
}



// let gstAmnt;
// if (pdfFlag === 1) {
//   gstAmnt = ((qty * discountAmount - discountAmountSec) * gst) / 100;
// } else {
//   gstAmnt = ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
// }



    
          // let gstAmnt = pdf_flag === 1
          // ? ((qty * discountAmount - discountAmountSec) * gst) / 100
          // : ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
        
        // console.log("First GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
        let gstAmnt = pdf_flag === 1
        ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
        : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
      
        console.log("Final GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
        console.log("checking condition",pdf_flag === 1 ? 'block1':'block2' )

        const basePrice = qty * fixedPrice;
        return sum + basePrice + gstAmnt;
      }
      return sum;
    }, 0);
    
    
    const totalGst = orderLineItems.reduce((sum, item) => {
      if (item.statusFlag !== 2) {
        const qty = item.qty || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
        const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
        const fixDisc = parseFloat(item.fixDisc) || 0;
        const gst = parseFloat(item.gst) || 0;
    

        let fixedPrice = 0;
if (pdf_flag !== 1) {
  if (unitPrice) {
    if (discountPercentageThird) {
      fixedPrice = item.unitPrice - item.discountPercentageThird;
    } else {
      fixedPrice = item.unitPrice;
    }

    if (item.fixDisc) {
      fixedPrice -= fixDisc
    }
  } else {
    fixedPrice = 0;
  }
} else {
  fixedPrice = unitPrice || 0;
}


        // Apply both discountPercentageThird and fixDisc
        let gstAmnt = pdf_flag === 1
        ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
        : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
      
          
        return sum + gstAmnt;
      }
      return sum;
    }, 0);

    const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);

    console.log(
      `Final Totals: Qty=${totalQty}, GST=${totalGst}, Total=${roundedTotal}, RoundOff=${roundOff}`,
    );

    return {
      totalQty,
      totalAmount: roundedTotal,
      roundOff,
      totalGst,
    };
  };

  // const handleAddItems = () => {
  //   const newItems = stylesData.filter(item => item.qty > 0);
  //   console.log('New Items to Add:', newItems);

  //   setOrder(prevOrder => {
  //     // Clone the existing orderLineItems
  //     let updatedLineItems = prevOrder?.orderLineItems ? [...prevOrder.orderLineItems] : [];
  //     console.log('Cloned Order Line Items:', updatedLineItems);

  //     newItems.forEach(newItem => {
  //       const key = `${newItem.styleId}-${newItem.sizeDesc}-${newItem.style}`; // sizeDesc is used here
  //       console.log('Processing Item Key:', key);

  //       // Check if the item exists
  //       const existingIndex = updatedLineItems.findIndex(
  //         item => item.styleId === newItem.styleId && item.size === newItem.sizeDesc
  //       );
        
  //       console.log('Existing Item Index:', existingIndex);

  //       if (existingIndex !== -1) {
  //         // Update existing item
  //         const existingItem = updatedLineItems[existingIndex];
  //         updatedLineItems[existingIndex] = {
  //           ...existingItem,
  //           qty: Number(existingItem.qty) + Number(newItem.qty),
  //           unitPrice: newItem.dealerPrice ?? existingItem.unitPrice,
  //           gst: newItem.gst ?? existingItem.gst,
  //           discAmnt: newItem.discAmnt ?? existingItem.discAmnt,
  //           discAmntSec: newItem.discAmntSec ?? existingItem.discAmntSec,
  //           colorName: newItem.colorName ?? existingItem.colorName,
  //           colorId: newItem.colorId ?? existingItem.colorId,
  //           styleId:newItem.styleId ?? existingItem.styleId,
  //           style:newItem.style ?? existingItem.style,
  //           size:newItem.sizeDesc ?? existingItem.sizeDesc,
  //           gstSlotId:newItem.gstSlotId ?? existingItem.gstSlotId            
  //         };
  //         console.log(
  //           'Updated Existing Item:',
  //           updatedLineItems[existingIndex],
  //         );
  //       } else {
  //         // Add new item with a unique id to prevent overlap
  //         const newLineItem = {
  //           orderLineitemId: `${newItem.styleId}-${
  //             newItem.sizeDesc
  //           }-${new Date().getTime()}`, // Unique id using timestamp
  //           styleId: newItem.styleId,
  //           style:newItem.style,
  //           size: newItem.sizeDesc, // sizeDesc is used here
  //           qty: Number(newItem.qty),
  //           unitPrice: newItem.dealerPrice ?? 0,
  //           gst: newItem.gst ?? 0,
  //           discAmnt: newItem.discAmnt ?? 0,
  //           discAmntSec: newItem.discAmntSec ?? 0,
  //           gstSlotId:newItem.gstSlotId ?? existingItem.gstSlotId,
  //           colorName: newItem.colorName ?? existingItem.colorName,
  //           colorId: newItem.colorId ?? existingItem.colorId,
  //           statusFlag: 0,
  //         };
  //         updatedLineItems.push(newLineItem);
  //         console.log('Added New Item:', newLineItem);
  //       }
  //     });

  //     // Recalculate totals
  //     const totals = calculateTotals(updatedLineItems);
  //     console.log('Updated Line Items:', updatedLineItems);
  //     console.log('Updated Totals:', totals);

  //     return {
  //       ...prevOrder,
  //       orderLineItems: updatedLineItems,
  //       totalQty: totals.totalQty,
  //       totalAmount: totals.totalAmount,
  //       roundOff: totals.roundOff,
  //       totalGst: totals.totalGst,
  //     };
  //   });

  //   setModalVisible(false); // Close modal after adding
  // };


  const [gstSlotData, setGstSlotData] = useState([]); // Store GST slot data

useEffect(() => {
  getGstSlot();
}, []); // Fetch GST data on mount

const getGstSlot = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_GST_SLOT}/${companyId}`;
  console.log("API URL:", apiUrl);
  
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      const gstList = response?.data?.response?.gstList || [];
      setGstSlotData(gstList);
    })
    .catch(error => {
      console.error('Error fetching GST slot data:', error);
    });
};

const handleAddItems = () => {
  const newItems = stylesData.filter(item => item.qty > 0);
  console.log('New Items to Add:', newItems);

  setOrder(prevOrder => {
    let updatedLineItems = prevOrder?.orderLineItems ? JSON.parse(JSON.stringify(prevOrder.orderLineItems)) : [];
    console.log('Cloned Order Line Items:', updatedLineItems);

    newItems.forEach(newItem => {
      const key = `${newItem.styleId}-${newItem.sizeDesc}-${newItem.style}`;
      console.log('Processing Item Key:', key);

      const existingIndex = updatedLineItems.findIndex(
        item =>
          item.styleId === newItem.styleId &&
          item.size.trim().toLowerCase() === newItem.sizeDesc.trim().toLowerCase()
      );

      console.log('Existing Item Index:', existingIndex);

      // **Calculate GST based on GST Slot Data**
      const gstSlot = gstSlotData.find(c => c?.id === Number(newItem.gstSlotId));
      let calculatedGst = 0;
      if (gstSlot) {
        const { greterAmount, smalestAmount, greterPercent, smalestPercent } = gstSlot;
        calculatedGst = newItem.dealerPrice >= greterAmount ? greterPercent :
                        newItem.dealerPrice <= smalestAmount ? smalestPercent : 0;
      }

      // **Determine unitPrice using the same logic as renderItem**
      // let unitPrice;
      // if (order.orderType === 1) {
      //   unitPrice = newItem.corRate;
      // } else if (pdf_flag === 1) {
      //   unitPrice = newItem.mrp;
      // } else if (loggedInUser?.customerType === 1) {
      //   unitPrice = newItem.dealerPrice;
      // } else if (loggedInUser?.customerType === 2) {
      //   unitPrice = newItem.retailerPrice;
      // } else {
      //   unitPrice = newItem.dealerPrice; // Default fallback
      // }

      
      let unitPrice;

console.log("Customer Type:", order?.customerType);
console.log("PDF Flag:", pdf_flag);

// Apply discount logic before setting unitPrice
if (newItem?.mrp && newItem?.mrp > 0 && newItem?.fixDisc && newItem?.fixDisc > 0 && newItem?.mrp >= newItem?.fixDisc) {
    newItem.mrp = newItem.mrp - newItem.fixDisc;
    console.log("Updated MRP after FixDisc:", newItem.mrp);
}

if (order?.customerType === 3) {
    unitPrice = newItem.corRate;
    console.log("Price to Show (corRate):", unitPrice);
} else {
    if (pdf_flag === 1) {
        unitPrice = newItem.mrp; // Already adjusted above
        console.log("Price to Show (MRP due to pdf_flag):", unitPrice);
    } else if (order?.customerType === 1) {
        unitPrice = newItem.retailerPrice;
        console.log("Price to Show (Retailer Price for Customer Type 1):", unitPrice);
    } else if (order?.customerType === 2) {
        unitPrice = newItem.dealerPrice;
        console.log("Price to Show (Dealer Price for Customer Type 2):", unitPrice);
    } else {
        unitPrice = newItem.dealerPrice; // Default fallback
        console.log("Price to Show (Default - Dealer Price):", unitPrice);
    }
}


      if (existingIndex !== -1) {
        let existingItem = updatedLineItems[existingIndex];
        updatedLineItems[existingIndex] = {
          ...existingItem,
          qty: existingItem.qty,
          unitPrice: unitPrice ?? existingItem.unitPrice, // **Updated to match renderItem logic**
          gst: calculatedGst, // **Updated GST**
          discAmnt: newItem.discAmnt ?? existingItem.discAmnt,
          discAmntSec: newItem.discAmntSec ?? existingItem.discAmntSec,
          colorName: newItem.colorName ?? existingItem.colorName,
          colorId: newItem.colorId ?? existingItem.colorId,
          styleId: newItem.styleId,
          style: newItem.style,
          size: newItem.sizeDesc,
          gstSlotId: newItem.gstSlotId ?? existingItem.gstSlotId,
          fixDisc: newItem.fixDisc ?? existingItem.fixDisc,
          imageUrl: newItem.imageUrls?.length > 0 ? newItem.imageUrls[0] : existingItem.imageUrl,           
        };
        console.log('Updated Existing Item:', updatedLineItems[existingIndex]);
      } else {
        const newLineItem = {
          orderLineitemId: `${newItem.styleId}-${newItem.sizeDesc}-${Date.now()}`, 
          styleId: newItem.styleId,
          style: newItem.style,
          size: newItem.sizeDesc,
          qty: Number(newItem.qty),
          unitPrice: unitPrice ?? 0, // **Updated to match renderItem logic**
          gst: calculatedGst, // **Updated GST**
          discAmnt: newItem.discAmnt ?? 0,
          discAmntSec: newItem.discAmntSec ?? 0,
          gstSlotId: newItem.gstSlotId ?? 0,  
          colorName: newItem.colorName ?? '', 
          colorId: newItem.colorId ?? null,
          statusFlag: 0,
          fixDisc: newItem.fixDisc ?? 0,
          imageUrl: newItem.imageUrls?.length > 0 ? newItem.imageUrls[0] : '', // **Add Image URL**
                };
        updatedLineItems.push(newLineItem);
        console.log('Added New Item:', newLineItem);
      }
    });

    const totals = calculateTotals(updatedLineItems);
    console.log('Updated Line Items:', updatedLineItems);
    console.log('Updated Totals:', totals);

    return {
      ...prevOrder,
      orderLineItems: updatedLineItems,
      totalQty: totals.totalQty,
      totalAmount: totals.totalAmount,
      roundOff: totals.roundOff,
      totalGst: totals.totalGst,
    };
  });

  setModalVisible(false);
};


  
  // const handleAddItems = () => {
  //   const newItems = stylesData.filter(item => item.qty > 0);
  //   console.log('New Items to Add:', newItems);
  
  //   setOrder(prevOrder => {
  //     let updatedLineItems = prevOrder?.orderLineItems ? JSON.parse(JSON.stringify(prevOrder.orderLineItems)) : [];
  //     console.log('Cloned Order Line Items:', updatedLineItems);
  
  //     newItems.forEach(newItem => {
  //       const key = `${newItem.styleId}-${newItem.sizeDesc}-${newItem.style}`;
  //       console.log('Processing Item Key:', key);
  
  //       const existingIndex = updatedLineItems.findIndex(
  //         item =>
  //           item.styleId === newItem.styleId &&
  //           item.size.trim().toLowerCase() === newItem.sizeDesc.trim().toLowerCase()
  //       );
        
        
  //       console.log('Existing Item Index:', existingIndex);
  
  //       if (existingIndex !== -1) {
  //         let existingItem = updatedLineItems[existingIndex];
  //         updatedLineItems[existingIndex] = {
  //           ...existingItem,
  //           qty: Number(existingItem.qty) + Number(newItem.qty),
  //           unitPrice: newItem.dealerPrice ?? existingItem.unitPrice,
  //           gst: newItem.gst ?? existingItem.gst,
  //           discAmnt: newItem.discAmnt ?? existingItem.discAmnt,
  //           discAmntSec: newItem.discAmntSec ?? existingItem.discAmntSec,
  //           colorName: newItem.colorName ?? existingItem.colorName,
  //           colorId: newItem.colorId ?? existingItem.colorId,
  //           styleId: newItem.styleId,
  //           style: newItem.style,
  //           size: newItem.sizeDesc,
  //           gstSlotId: newItem.gstSlotId ?? existingItem.gstSlotId,
  //         };
  //         console.log('Updated Existing Item:', updatedLineItems[existingIndex]);
  //       } else {
  //         const newLineItem = {
  //           orderLineitemId: `${newItem.styleId}-${newItem.sizeDesc}-${Date.now()}`, 
  //           styleId: newItem.styleId,
  //           style: newItem.style,
  //           size: newItem.sizeDesc,
  //           qty: Number(newItem.qty),
  //           unitPrice: newItem.dealerPrice ?? 0,
  //           gst: newItem.gst ?? 0,
  //           discAmnt: newItem.discAmnt ?? 0,
  //           discAmntSec: newItem.discAmntSec ?? 0,
  //           gstSlotId: newItem.gstSlotId ?? 0,  // Avoid `existingItem` reference
  //           colorName: newItem.colorName ?? '', // Avoid `existingItem` reference
  //           colorId: newItem.colorId ?? null,
  //           statusFlag: 0,
  //         };
  //         updatedLineItems.push(newLineItem);
  //         console.log('Added New Item:', newLineItem);
  //       }
  //     });
  
  //     const totals = calculateTotals(updatedLineItems);
  //     console.log('Updated Line Items:', updatedLineItems);
  //     console.log('Updated Totals:', totals);
  
  //     return {
  //       ...prevOrder,
  //       orderLineItems: updatedLineItems,
  //       totalQty: totals.totalQty,
  //       totalAmount: totals.totalAmount,
  //       roundOff: totals.roundOff,
  //       totalGst: totals.totalGst,
  //     };
  //   });
  
  //   setModalVisible(false);
  // };
  

  const handleUnitPriceChange = (newPrice, itemId) => {
    const formattedPrice = newPrice.replace(/^0+/, '') || '0';
  
    const isValidPrice =
      !isNaN(formattedPrice) &&
      formattedPrice.trim() !== '' &&
      !formattedPrice.includes(',');
  
    console.log('Formatted Price:', formattedPrice);
    console.log('Is Valid Price:', isValidPrice);
  
    setOrder(prevOrder => {
      const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
        console.log('Checking Item:', item);
  
        if (item.orderLineitemId === itemId && isValidPrice) {
          console.log('Updating Item with New Price:', item);
          
          const updatedItem = { ...item, unitPrice: formattedPrice };
  
          // Recalculate GST dynamically
          const gstSlot = gstSlotData.find(c => c.id === Number(updatedItem.gstSlotId));
          if (gstSlot) {
            const { greterAmount, smalestAmount, greterPercent, smalestPercent } = gstSlot;
            updatedItem.gst = updatedItem.unitPrice >= greterAmount ? greterPercent : 
                              updatedItem.unitPrice <= smalestAmount ? smalestPercent : 0;
          } else {
            updatedItem.gst = 0;
          }
  
          return updatedItem;
        }
        return item;
      });
  
      const totals = calculateTotals(updatedOrderLineItems);
      console.log(
        'Updated Order Line Items after Price Change:',
        updatedOrderLineItems,
      );
      console.log('Updated Totals:', totals);
  
      return {
        ...prevOrder,
        orderLineItems: updatedOrderLineItems,
        totalQty: totals.totalQty,
        totalAmount: totals.totalAmount,
        roundOff: totals.roundOff,
        totalGst: totals.totalGst,
      };
    });
  };
  

  const handleQuantityChange = (newQuantity, itemId) => {
    // Ensure newQuantity is treated as a float and handle invalid inputs
    const formattedQuantity = (newQuantity);
    const isValidQuantity = !isNaN(formattedQuantity) && formattedQuantity >= 0; // Validate quantity
  
    console.log('Formatted Quantity:', formattedQuantity);
    console.log('Is Valid Quantity:', isValidQuantity);
  
    order?.orderLineItems.forEach(item => {
      const d_pkg_flag = order.d_pkg_flag;
      console.log('d_pkg_flag:', d_pkg_flag); // Log d_pkg_flag value
  
      if (item.statusFlag === 2) {
        console.log(
          `Skipping item with statusFlag 2: ${item.styleId}-${item.size}`,
        );
        return;
      }
      if (item.statusFlag === 0) {
        let availQty = item?.availQty ?? 0;
        const formattedQuantityNum = formattedQuantity;
        
        if (
          this.existingStyleMap &&
          this.existingStyleMap.has(item.styleId + '-' + item.size)
        ) {
          const additionalQty = this.existingStyleMap.get(
            item.styleId + '-' + item.size,
          );
          availQty += additionalQty;
          console.log(
            `Updated availQty for ${item.styleId}-${item.size} after adding from existingStyleMap:`,
            availQty,
          );
        }
        if (itemId === item.orderLineitemId) {
          if (
            formattedQuantityNum > availQty &&
            compFlag === 1 &&
            hold_qty_flag === 1 &&
            d_pkg_flag === 0
          ) {
            console.log(
              `Condition failed: Quantity cannot exceed available quantity (${availQty}) for item ${item.styleId}-${item.size}`,
            );
            alert(
              `Quantity cannot exceed available quantity (${availQty}) for item ${item.styleId}-${item.size}.`,
            );
            return; // Exit the function without updating the quantity for this item
          } else {
            console.log('Condition passed for item', item.styleId, item.size);
          }
        }
      } else {
        console.log(
          `Item statusFlag is not 0 for item ${item.styleId}-${item.size}, skipping quantity check.`,
        );
      }
    });
  
    setOrder(prevOrder => {
      const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
        console.log('Checking Item for Quantity Change:', item);
        if (item.orderLineitemId === itemId) {
          if (isValidQuantity) {
            console.log('Updating Item with New Quantity:', item);
            return {...item, qty: formattedQuantity}; // Directly use formattedQuantity
          }
          if (newQuantity === '') {
            console.log('Clearing Quantity for Item:', item);
            return {...item, qty: 0};
          }
        }
        return item;
      });
  
      const totalQty = updatedOrderLineItems.reduce((sum, item) => {
        return item.statusFlag !== 2 ? sum + parseFloat(item.qty || 0) : sum;
      }, 0);
      
  
      // const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice =
      //       parseFloat(item.qty || 0) * parseFloat(item.unitPrice);
      //     const gstAmount = basePrice * (item.gst / 100);
      //     return sum + basePrice + gstAmount;
      //   }
      //   return sum;
      // }, 0);
  
      // const totalGst = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice =
      //       parseFloat(item.qty || 0) * parseFloat(item.unitPrice);
      //     return sum + basePrice * (item.gst / 100);
      //   }
      //   return sum;
      // }, 0);


      const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
          const pdfFlag = Number(pdf_flag); 
  
      let fixedPrice = 0;
  if (pdfFlag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
  
  // let gstAmnt;
  // if (pdfFlag === 1) {
  //   gstAmnt = ((qty * discountAmount - discountAmountSec) * gst) / 100;
  // } else {
  //   gstAmnt = ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
  // }
  
  
  
      
            // let gstAmnt = pdf_flag === 1
            // ? ((qty * discountAmount - discountAmountSec) * gst) / 100
            // : ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
          
          // console.log("First GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
          console.log("Final GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          console.log("checking condition",pdf_flag === 1 ? 'block1':'block2' )
  
          const basePrice = qty * fixedPrice;
          return sum + basePrice + gstAmnt;
        }
        return sum;
      }, 0);
      
      
      const totalGst = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
      
  
          let fixedPrice = 0;
  if (pdf_flag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
          // Apply both discountPercentageThird and fixDisc
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
            
          return sum + gstAmnt;
        }
        return sum;
      }, 0);
  
  
      const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);
  
      console.log(
        'Updated Order Line Items after Quantity Change:',
        updatedOrderLineItems,
      );
      console.log('Total Quantity:', totalQty);
      console.log('Total Amount:', totalAmount);
      console.log('Total GST:', totalGst);
      console.log('Round Off:', roundOff);
  
      return {
        ...prevOrder,
        orderLineItems: updatedOrderLineItems,
        totalQty,
        totalAmount: roundedTotal,
        roundOff,
        totalGst,
      };
    });
  };
  

  const renderItem = ({item, index, updateQty}) => {
    // Determine the price based on the conditions
    // let priceToShow;
    // if (order.orderType === 1) {
    //   priceToShow = item.corRate;
    // } else if (pdf_flag === 1) {
    //   priceToShow = item.mrp;
    // } else if (loggedInUser?.customerType === 1) {
    //   priceToShow = item.dealerPrice;
    // } else if (loggedInUser?.customerType === 2) {
    //   priceToShow = item.retailerPrice;
    // } else {
    //   priceToShow = item.dealerPrice; // Default fallback
    // }


    let priceToShow;

    console.log("Customer Type:", order?.customerType);
    console.log("PDF Flag:", pdf_flag);
    
    if (order?.customerType === 3) {
      priceToShow = item.corRate;
      console.log("Price to Show (corRate):", priceToShow);
    } else {
      if (pdf_flag === 1) {
        priceToShow = item.mrp;
        console.log("Price to Show (MRP due to pdf_flag):", priceToShow);
      } else if (order?.customerType === 1) {
        priceToShow = item.retailerPrice;
        console.log("Price to Show (Dealer Price for Customer Type 1):", priceToShow);
      } else if (order?.customerType === 2) {
        priceToShow = item.dealerPrice;
        console.log("Price to Show (Retailer Price for Customer Type 2):", priceToShow);
      } else {
        priceToShow = item.dealerPrice; // Default fallback
        console.log("Price to Show (Default - Dealer Price):", priceToShow);
      }
    }
    
    console.log("Final Price to Show:", priceToShow);
    
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: '#ccc',
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
        <Text style={styles.itemText}>{item.style}</Text>
        <Text style={styles.itemText}>{item.colorName}</Text>
        <Text style={styles.itemText}>{item.sizeDesc}</Text>
        <Text style={styles.itemText}>{priceToShow}</Text>
        <Text style={styles.itemText}>{item.availQty}</Text>
        <TextInput
          style={styles.itemInput}
          value={item.qty.toString()} // Display the current quantity as string
          onChangeText={text => updateQty(index, text)} // Update the quantity when the user types
          keyboardType="decimal-pad"
        />
      </View>
    );
  };

  // useEffect(() => {
  //   if (order?.orderLineItems?.length > 0) {
  //     const map = new Map();
  //     order.orderLineItems.forEach(item => {
  //       const key = `${item.styleId}-${item.size}`;
  //       map.set(key, item.qty);
  //     });
  //     setExistingStyleMap(map);
  //     setOriginalStyleMap(prev => (prev.size === 0 ? new Map(map) : prev)); // Preserve original map
  //     console.log('Existing style map after update:', map);
  //   }
  // }, [order]);

  const handleDelete = (styleId, size, qty) => {
    const key = `${styleId}-${size}`;

    if (order?.orderLineItems?.length === 1) {
      Alert.alert(
        'crm.codeverse.co says',
        'An order must contain at least one style. You cannot delete the last remaining style.',
        [{text: 'OK'}],
      );
      return;
    }

    setDeletedStyleMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(key, qty); // Use qty directly
      return newMap;
    });

    setOrder(prevOrder => {
      const updatedOrderLineItems = prevOrder.orderLineItems.filter(
        item => !(item.styleId === styleId && item.size === size),
      );

      const totalQty = updatedOrderLineItems.reduce((sum, item) => {
        return item.statusFlag !== 2 ? sum + item.qty : sum;
      }, 0);

      // const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice = item.qty * parseFloat(item.unitPrice);
      //     const gstAmount = basePrice * (parseFloat(item.gst) / 100);
      //     return sum + basePrice + gstAmount;
      //   }
      //   return sum;
      // }, 0);

      // const totalGst = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice = item.qty * parseFloat(item.unitPrice);
      //     const gstAmount = basePrice * (parseFloat(item.gst) / 100);
      //     return sum + gstAmount;
      //   }
      //   return sum;
      // }, 0);

     
      const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
          const pdfFlag = Number(pdf_flag); 
  
      let fixedPrice = 0;
  if (pdfFlag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
  
  // let gstAmnt;
  // if (pdfFlag === 1) {
  //   gstAmnt = ((qty * discountAmount - discountAmountSec) * gst) / 100;
  // } else {
  //   gstAmnt = ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
  // }
  
  
  
      
            // let gstAmnt = pdf_flag === 1
            // ? ((qty * discountAmount - discountAmountSec) * gst) / 100
            // : ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
          
          // console.log("First GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
          console.log("Final GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          console.log("checking condition",pdf_flag === 1 ? 'block1':'block2' )
  
          const basePrice = qty * fixedPrice;
          return sum + basePrice + gstAmnt;
        }
        return sum;
      }, 0);
      
      
      const totalGst = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
      
  
          let fixedPrice = 0;
  if (pdf_flag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
          // Apply both discountPercentageThird and fixDisc
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
            
          return sum + gstAmnt;
        }
        return sum;
      }, 0);

      const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);
      const {roundedGst, gstRoundOff} = calculateRoundOff(totalGst);

      return {
        ...prevOrder,
        orderLineItems: updatedOrderLineItems,
        totalQty,
        totalAmount: roundedTotal,
        roundOff,
        totalGst,
        gstRoundOff,
      };
    });
  };

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const compFlag = useSelector(state => state.selectedCompany.comp_flag);
  const pdf_flag = useSelector(state => state.selectedCompany.pdf_flag);
  const hold_qty_flag = useSelector(
    state => state.selectedCompany.hold_qty_flag,
  );
  const gst_price_cal_flag = useSelector(
    state => state.selectedCompany.gst_price_cal_flag,
  );

  const wo_creation_flag = useSelector(
    state => state.selectedCompany.wo_creation_flag,
  );

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

  const getAllStatus = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_STATUS}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data.status.success) {
        setStatusOptions(response.data.response.statusList); // Update state with the status list
      } else {
        console.error('Failed to fetch status:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getDistributorOrder = async () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_ORDER}/${orderId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data.status.success) {
        const orderData = response.data.response.ordersList[0];
        console.log('orderData==>', orderData);
        setOrder(orderData);

        setComments(orderData.appComments || '');
        const hasConfirmedOrCanceled = orderData.orderLineItems.some(
          item => item.statusFlag === 1 || item.statusFlag === 2,
        );

        setSelectedStatus(
          hasConfirmedOrCanceled ? 'Select' : orderData.orderStatus,
        );
      } else {
        console.error('Failed to fetch order:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDistributorOrder();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDropdownToggle = async () => {
    if (!dropdownVisible && statusOptions.length === 0) {
      await getAllStatus();
    }
    setDropdownVisible(!dropdownVisible);
  };

  const filteredStatusOptions = statusOptions.filter(option => {
    if (selectedStatus === 'Select') {
      return ['Open', 'Select', 'Confirmed', 'Cancelled'].includes(option.stts);
    }
    return orderApproval === 1
      ? ['Open', 'Confirmed', 'Cancelled'].includes(option.stts)
      : ['Open', 'Cancelled'].includes(option.stts);
  });

  const handleDropdownSelectStatus = status => {
    setSelectedStatus(status.stts);
    setDropdownVisible(false);
  };

  const OrderDetailRow = ({label, value}) => (
    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <Text
        style={{width: 200, textAlign: 'right', color: '#000', marginLeft: 10}}>
        {label}
      </Text>
      <Text
        style={{width: 40, textAlign: 'center', color: '#000', marginLeft: 10}}>
        :
      </Text>
      <Text
        style={{
          width: 100,
          textAlign: 'right',
          color: '#000',
          marginRight: 10,
        }}>
        {' '}
        {typeof value === 'number' ? value.toFixed(2) : value}
      </Text>
    </View>
  );

  const handleCheckboxToggle = itemId => {
    setSelectedItems(prevSelectedItems => {
      const updated = {
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId],
      };
      return updated;
    });
  };

  const updateStatusForNonCanceledItems = status => {
    setSelectedItems(prevSelectedItems => {
      const updatedItems = {...prevSelectedItems};

      order?.orderLineItems.forEach(item => {
        if (
          item.statusFlag !== 2 &&
          prevSelectedItems[item.orderLineitemId] !== false
        ) {
          updatedItems[item.orderLineitemId] = status === 'Confirmed';
        }
      });

      return updatedItems;
    });
  };

  const updateStatusForNonCanceledWhenCancelled = status => {
    setSelectedItems(prevSelectedItems => {
      const updatedItems = {...prevSelectedItems};

      order?.orderLineItems.forEach(item => {
        if (
          item.statusFlag !== 1 &&
          prevSelectedItems[item.orderLineitemId] !== true
        ) {
          updatedItems[item.orderLineitemId] = status === 'Cancelled';
        }
      });

      return updatedItems;
    });
  };

  const handleUpdateOrderStatus = () => {
    if (selectedStatus === 'Open') {
      setTriggerUpdate(true);
      return;
    }

    const anySelected = Object.values(selectedItems).some(
      item => item === true,
    );

    if (!anySelected) {
      Alert.alert(
        'crm.codeverse.co says',
        `Since you haven't checked any styles, the ${selectedStatus.toLowerCase()} status will be assigned to all styles. If you are certain, please click on OK`,
        [
          {
            text: 'Cancel',
            onPress: () => 'Action Cancelled',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              if (selectedStatus === 'Cancelled') {
                updateStatusForNonCanceledWhenCancelled(selectedStatus);
              } else {
                updateStatusForNonCanceledItems(selectedStatus);
              }
              setTriggerUpdate(true);
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      setTriggerUpdate(true);
    }
  };

  useEffect(() => {
    if (triggerUpdate) {
      setTimeout(() => {
        updateDisOrder();
      }, 100); // Adding a slight delay to ensure state updates
      setTriggerUpdate(false);
    }
  }, [triggerUpdate]);

  // const calculateTotal = item => {
  //   let total = 0;
  //   let fixedPrice = 0;

  //   if (pdf_flag === 1) {
  //     if (item.discountPercentageThird) {
  //       fixedPrice = item.unitPrice
  //         ? item.unitPrice - item.discountPercentageThird
  //         : 0;
  //     } else {
  //       fixedPrice = item.unitPrice;
  //     }

  //     discountAmount =
  //       item.unitPrice - (item.unitPrice * item.discountPercentage) / 100;

  //     if (gst_price_cal_flag === 1 && gst && item.orgPrice) {
  //       item.orgPrice = item.unitPrice / (1.0 + gst / 100);
  //       item.discAmnt =
  //         item.orgPrice - (item.orgPrice * item.discountPercentage) / 100;
  //     }

  //     discountAmountSec =
  //       (item.qty * discountAmount * item.discountPercentageSec) / 100;
  //     gstAmnt =
  //       ((item.qty * discountAmount - item.discAmntSec) * item.gst) / 100;
  //     total =
  //       item.qty * discountAmount -
  //       (item.qty * discountAmount * item.discountPercentageSec) / 100 +
  //       gstAmnt;
  //   } else {
  //     fixedPrice = item.unitPrice;
  //     discountAmount = (item.qty * fixedPrice * item.discountPercentage) / 100;
  //     discountAmountSec =
  //       ((item.qty * fixedPrice - discountAmount) *
  //         item.discountPercentageSec) /
  //       100;
  //     gstAmnt =
  //       ((item.qty * fixedPrice - item.discAmnt - item.discAmntSec) *
  //         item.gst) /
  //       100;
  //     total =
  //       item.qty * fixedPrice - discountAmount - item.discAmntSec + gstAmnt;
  //   }

  //   return total;
  // };

  
  const calculateTotal = (item) => {
    let total = 0;
    let fixedPrice = 0;
    let discountAmount = 0;
    let discountAmountSec = 0;
    let gstAmnt = 0;
    let orgPrice = 0;
  
    const gstValue = item.gst ?? 0; // Ensure gst is not undefined/null
    const qty = item.qty ?? 0;
    const unitPrice = item.unitPrice ?? 0;
    const discountPercentage = item.discountPercentage ?? 0;
    const discountPercentageSec = item.discountPercentageSec ?? 0;
  
    if (pdf_flag === 1) {
      // Handle fixed price calculation
      fixedPrice = item.discountPercentageThird
        ? unitPrice - item.discountPercentageThird
        : unitPrice;
  
      // First discount application
      discountAmount = unitPrice - (unitPrice * discountPercentage) / 100;
  
      // Handle GST price recalculation
      if (gst_price_cal_flag === 1 && gstValue > 0 && item.orgPrice) {
        orgPrice = unitPrice / (1.0 + gstValue / 100);
        discountAmount = orgPrice - (orgPrice * discountPercentage) / 100;
      }
  
      // Secondary discount and GST calculations
      discountAmountSec = (qty * discountAmount * discountPercentageSec) / 100;
      gstAmnt = ((qty * discountAmount - discountAmountSec) * gstValue) / 100;
      
      total = qty * discountAmount - discountAmountSec + gstAmnt;
    } else {
      // Default pricing logic
      fixedPrice = unitPrice;
      discountAmount = (qty * fixedPrice * discountPercentage) / 100;
      discountAmountSec = ((qty * fixedPrice - discountAmount) * discountPercentageSec) / 100;
      
      gstAmnt = ((qty * fixedPrice - discountAmount - discountAmountSec) * gstValue) / 100;
      total = qty * fixedPrice - discountAmount - discountAmountSec + gstAmnt;
    }
  
    return total;
  };
  
  // const updateDisOrder = () => {
  //   console.log(
  //     'selectedStatus at the start of updateDisOrder:',
  //     selectedStatus,
  //   );

  //   const selectedStatuss = selectedStatus;

  //   if (selectedStatuss === 'Cancelled') {
  //     order.totalAmount -= order.roundOff || 0;
  //   }

  //   if (order.orderLineItems) {
  //     order.orderLineItems.forEach(item => {
  //       item.sttsFlag = selectedItems[item.orderLineitemId] || false;
  //       console.log('selectedStatus', selectedStatuss);
  //       console.log('item.sttsFlag', item.sttsFlag);

  //       const total = calculateTotal(item);
  //       const totalFormatted = isNaN(total) ? "0.00" : total.toFixed(2);

  //       if (selectedStatuss === 'Cancelled' && item.sttsFlag === true) {
  //         console.log(' order.totalAmount ', order.totalAmount);
  //         console.log(' item.gross ', item.gross);
  //         order.totalGst -= item.gstAmnt || 0;
  //         order.totalDiscount -= item.discAmnt || 0;
  //         order.totalDiscountSec -= item.discAmntSec || 0;
  //         order.totalAmount -= parseFloat(totalFormatted) || 0; // Use totalFormatted here
  //         order.totalQty -= item.qty || 0;
  //         item.statusFlag = 2;
  //         item.unitPrice = 0;
  //         item.fixDisc = 0;
  //         item.discountPercentageThird = 0;
  //         item.price = 0;
  //         item.gross = 0;
  //         item.gst = 0;
  //         item.gstAmnt = 0;
  //         item.discountPercentage = 0;
  //         item.discountPercentageSec = 0;

  //         return;
  //       } else {
  //         if (selectedStatuss === 'Confirmed' && item.sttsFlag === true) {
  //           item.statusFlag = 1;
  //         }
  //         item.gross = totalFormatted; // Update gross with totalFormatted
  //         item.sizeDesc = item.size;
  //         item.price = item.unitPrice;
  //         item.discountPercentageThird = item.fixDisc || 0;
  //       }
  //     });

  //     if (selectedStatuss === 'Cancelled') {
  //       try {
  //         const total = order.totalAmount;
  //         const decimal = parseFloat((total - Math.floor(total)).toFixed(2));
  //         let roundedTotal = 0;
  //         let roundOffValue = 0;

  //         if (decimal >= 0.5) {
  //           roundedTotal = Math.ceil(total);
  //           roundOffValue = +(roundedTotal - total).toFixed(2);
  //         } else {
  //           roundedTotal = Math.floor(total);
  //           roundOffValue = -(total - roundedTotal).toFixed(2);
  //         }

  //         order.roundOff = roundOffValue;
  //         order.totalAmount = roundedTotal;
  //       } catch (error) {
  //         console.error('Error rounding off total:', error);
  //       }
  //     }
  //   }
  //   console.log('order=========>', order.orderLineItems);
  //   console.log('order=========>', order.orderLineItems.length);
  //   const requestData = {
  //     orderId: order?.orderId || 0,
  //     totalGst: order?.totalGst || 0,
  //     totalAmount: order?.totalAmount || 0,
  //     colorId:order?.colorId || 0,
  //     colorName:order?.colorName || 0,
  //     totalDiscount: order?.totalDiscount || 0,
  //     totalDiscountSec: order?.totalDiscountSec || 0,
  //     companyId: companyId || '',
  //     userId: userId || '',
  //     totalQty: order?.totalQty || 0,
  //     updateStatus: selectedStatus || '',
  //     linkType: 1,
  //     appComments: comments,
  //     customerLocation: order?.customerLocation,
  //     d_pkg_flag: order.d_pkg_flag ? order.d_pkg_flag : 0,
  //     roundOff: order?.roundOff ? order?.roundOff : 0,
  //     inclusive: order?.inclusive ? order?.inclusive : 0,
  //     gOtherExp: order?.gOtherExp ? order?.gOtherExp : 0,
  //     gTranspExp: order?.gTranspExp ? order?.gTranspExp : 0,
  //     approveFlag: 0,
  //     orderNum: order.orderNum || 0,
  //     totalDiscountThird: order.totalDiscountThird,
  //     existingStyleMap: Array.from(originalStyleMap).reduce(
  //       (obj, [key, value]) => {
  //         obj[key] = value;
  //         return obj;
  //       },
  //       {},
  //     ),
  //     deletedStyleMap: Array.from(deletedStyleMap).reduce(
  //       (obj, [key, value]) => {
  //         obj[key] = value;
  //         return obj;
  //       },
  //       {},
  //     ),
  //     orderLineItems: order?.orderLineItems.map(item => {
  //       const total = calculateTotal(item);
  //       const totalFormatted = total.toFixed(2).padStart(5, '0');

  //       const isManuallyCanceled = item.statusFlag === 2;
  //       return {
  //         orderLineitemId: parseInt(item.orderLineitemId, 10),
  //         orderId: item.orderId,
  //         qty: item.qty,
  //         unitPrice: item.unitPrice,
  //         colorId:item?.colorId || 0,
  //         colorName:item?.colorName || 0,
  //         price: item.unitPrice,
  //         gross:totalFormatted,
  //         discountPercentage: item.discountPercentage,
  //         gst: item.gst,
  //         discountPercentageSec: item.discountPercentageSec,
  //         discAmnt: item.discAmnt,
  //         discAmntSec: item.discAmntSec,
  //         gstAmnt: item.gstAmnt,
  //         discountPercentageThird: item.discountPercentageThird,
  //         statusFlag: item.statusFlag,
  //         styleId: item?.styleId,
  //         closeFlag:0,
  //         size: item?.size,
  //         sizeDesc: item?.size,
  //         packageId: item?.packageId || 0,
  //         cedgeStyleId: item?.cedgeStyleId || 0,
  //         pack_qty: item?.pack_qty || 0,
  //         cedgeStyleId: item?.cedgeStyleId || 0,
  //         pack_qty: item?.pack_qty || 0,
  //         boxQty:item?.boxQty || 0,
  //         poId: item?.poId ? item?.poId : 0,
  //         availQty: item.availQty ? item.availQty : 0,
  //         cedgeStyleId: item?.cedgeStyleId ? item?.cedgeStyleId : 0,
  //         sttsFlag: selectedItems[item.orderLineitemId] || false,
  //       };
  //     }),
  //   };

  //   console.log('requestData====>', requestData); // Log the request data for debugging
  //   // Show success alert before making the API call (for UI purposes)
  //   // Alert.alert(
  //   //   "Success",
  //   //   "Order updated successfully",
  //   //   [
  //   //     {
  //   //       text: "OK",
  //   //       onPress: () => {
  //   //         // After the user presses "OK", navigate back immediately
  //   //         navigation.goBack();
  //   //       },
  //   //     },
  //   //   ],
  //   //   { cancelable: false }
  //   // );

  //   axios
  //     .post(
  //       `${global?.userData?.productURL}${API.UPDATE_DIS_ORDER}`,
  //       requestData,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //         },
  //       },
  //     )
  //     .then(response => {
  //       if (response.data.status.success) {
  //         console.log('Order update successful:', response.data);

  //         // Show success alert after successful API response
  //         Alert.alert(
  //           'Success',
  //           'Order updated successfully',
  //           [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 // After the user presses "OK", navigate back immediately
  //                 navigation.goBack();
  //               },
  //             },
  //           ],
  //           {cancelable: false},
  //         );
  //       } else {
  //         console.error('Failed to update order:', response.data.status);
  //       }
  //     })
  //     .catch(error => {
  //       // Log detailed error information
  //       console.error('Error updating order:', error);

  //       // Check if error has a response, and log response data if available
  //       if (error.response) {
  //         console.error('Error response data:', error.response.data);
  //         console.error('Error response status:', error.response.status);
  //         console.error('Error response headers:', error.response.headers);
  //       } else if (error.request) {
  //         console.error('Error request data:', error.request);
  //       } else {
  //         console.error('Error message:', error.message);
  //       }
  //     });
  // };

  useEffect(() => {
    console.log("Updated orderLineItems:", order.orderLineItems);
}, [order.orderLineItems]);

  const updateDisOrder = async () => {
    try {
      console.log('selectedStatus at the start of updateDisOrder:', selectedStatus);
  
      const selectedStatuss = selectedStatus;
  
      if (selectedStatuss === 'Cancelled') {
        order.totalAmount -= order.roundOff || 0;
      }
  
      if (order.orderLineItems) {
        for (const item of order.orderLineItems) {
          item.sttsFlag = selectedItems[item.orderLineitemId] || false;
          console.log('selectedStatus', selectedStatuss);
          console.log('item.sttsFlag', item.sttsFlag);
  
          const total = calculateTotal(item);
          const totalFormatted = isNaN(total) ? '0.00' : total.toFixed(2);
  
          if (selectedStatuss === 'Cancelled' && item.sttsFlag === true) {
            console.log(' order.totalAmount ', order.totalAmount);
            console.log(' item.gross ', item.gross);
            order.totalGst -= item.gstAmnt || 0;
            order.totalDiscount -= item.discAmnt || 0;
            order.totalDiscountSec -= item.discAmntSec || 0;
            order.totalAmount -= parseFloat(totalFormatted) || 0; // Use totalFormatted here
            order.totalQty -= item.qty || 0;
            item.statusFlag = 2;
            item.unitPrice = 0;
            item.fixDisc = 0;
            item.discountPercentageThird = 0;
            item.price = 0;
            item.gross = 0;
            item.gst = 0;
            item.gstAmnt = 0;
            item.discountPercentage = 0;
            item.discountPercentageSec = 0;
  
            continue;
          } else {
            if (selectedStatuss === 'Confirmed' && item.sttsFlag === true) {
              item.statusFlag = 1;
            }
            item.gross = totalFormatted; // Update gross with totalFormatted
            item.sizeDesc = item.size;
            item.price = item.unitPrice;
            item.discountPercentageThird = parseFloat(item.discountPercentageThird) || parseFloat(item.fixDisc) || 0;
          }
        }
  
        if (selectedStatuss === 'Cancelled') {
          try {
            const total = order.totalAmount;
            const decimal = parseFloat((total - Math.floor(total)).toFixed(2));
            let roundedTotal = 0;
            let roundOffValue = 0;
  
            if (decimal >= 0.5) {
              roundedTotal = Math.ceil(total);
              roundOffValue = +(roundedTotal - total).toFixed(2);
            } else {
              roundedTotal = Math.floor(total);
              roundOffValue = -(total - roundedTotal).toFixed(2);
            }
  
            order.roundOff = roundOffValue;
            order.totalAmount = roundedTotal;
          } catch (error) {
            console.error('Error rounding off total:', error);
          }
        }
      }
  
      console.log('order=========>', order.orderLineItems);
      console.log('order=========>', order.orderLineItems.length);
  let i2 =0;
      const requestData = {
        orderId: order?.orderId || 0,
        totalGst: order?.totalGst || 0,
        totalAmount: order?.totalAmount || 0,
        colorId: order?.colorId || 0,
        colorName: order?.colorName || '',
        totalDiscount: order?.totalDiscount || 0,
        totalDiscountSec: order?.totalDiscountSec || 0,
        companyId: companyId || '',
        userId: userId || '',
        totalQty: order?.totalQty || 0,
        updateStatus: selectedStatus || '',
        linkType: 1,
        appComments: comments,
        customerLocation: order?.customerLocation,
        d_pkg_flag: order.d_pkg_flag ? order.d_pkg_flag : 0,
        roundOff: order?.roundOff ? order?.roundOff : 0,
        inclusive: order?.inclusive ? order?.inclusive : 0,
        gOtherExp: order?.gOtherExp ? order?.gOtherExp : 0,
        gTranspExp: order?.gTranspExp ? order?.gTranspExp : 0,
        approveFlag: 0,
        orderNum: order.orderNum || 0,
        totalDiscountThird: order.totalDiscountThird || 0,
        existingStyleMap: Object.fromEntries(originalStyleMap),
        deletedStyleMap: Object.fromEntries(deletedStyleMap),
        orderLineItems: order?.orderLineItems.map(item => {
          const total = calculateTotal(item);
          const totalFormatted = total.toFixed(2).padStart(5, '0');
  console.log("before inside lineitems=====>" ,i2++)
          return {
            // orderLineitemId: parseInt(item.orderLineitemId, 10),
            orderId: item.orderId  || 0,
            qty: item.qty  || 0,
            unitPrice: item.unitPrice  || 0,
            colorId: item?.colorId || 0,
            colorName: item?.colorName || '',
            price: item.unitPrice  || 0,
            gross: totalFormatted  || 0,
            discountPercentage: item.discountPercentage  || 0,
            gst: item.gst  || 0,
            discountPercentageSec: item.discountPercentageSec  || 0,
            discAmnt: item.discAmnt  || 0,
            discAmntSec: item.discAmntSec  || 0,
            gstAmnt: item.gstAmnt  || 0,
discountPercentageThird: parseFloat(item.discountPercentageThird) || parseFloat(item.fixDisc) || 0,
            statusFlag: item.statusFlag  || 0,
            styleId: item?.styleId  || 0,
            closeFlag: 0,
            size: item?.size  || '',
            sizeDesc: item?.size  || '',
            packageId: item?.packageId || 0,
            cedgeStyleId: item?.cedgeStyleId || 0,
            pack_qty: item?.pack_qty || 0,
            boxQty: item?.boxQty || 0,
            poId: item?.poId ? item?.poId : 0,
            availQty: item.availQty ? item.availQty : 0,
            cedgeStyleId: item?.cedgeStyleId ? item?.cedgeStyleId : 0,
            sttsFlag: selectedItems[item.orderLineitemId] || false,
          };
        }),
      };
      console.log('requestData====>', requestData);
  console.log('requestData====>', requestData.orderLineItems);
      console.log('requestData====>', requestData.orderLineItems.length);
  console.log("Final orderLineItems being sent:", JSON.stringify(requestData.orderLineItems, null, 2));

      const response = await axios.post(
        `${global?.userData?.productURL}${API.UPDATE_DIS_ORDER}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      );
  
      if (response.data.status.success) {
      console.log('Order update successful:', JSON.stringify(response.data, null, 2));
        Alert.alert('Success', 'Order updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        console.error('Failed to update order:', response.data.status);
      }
    } catch (error) {
      console.error('Error updating order:', error);
  
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };


 
  

  
  useEffect(() => {
    if (order && order.orderLineItems) {
      const totalAmount = order.orderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const basePrice = item.qty * parseFloat(item.unitPrice || 0); // Calculate base price
          const gstAmount = basePrice * (item.gst / 100); // GST amount
          return sum + basePrice + gstAmount; // Add to total
        }
        return sum;
      }, 0);

      const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);
      setOrder(prevOrder => ({
        ...prevOrder,
        totalAmount: roundedTotal,
        roundOff,
      }));
    }
  }, []);

  // const handleUnitPriceChange = (newPrice, itemId) => {
  //   const formattedPrice = newPrice.replace(/^0+/, '') || '0';

  //   const isValidPrice =
  //     !isNaN(formattedPrice) &&
  //     formattedPrice.trim() !== '' &&
  //     !formattedPrice.includes(',');

  //   setOrder(prevOrder => {
  //     const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
  //       if (item.orderLineitemId === itemId && isValidPrice) {
  //         return {...item, unitPrice: formattedPrice};
  //       }
  //       return item;
  //     });

  //     const totalQty = updatedOrderLineItems.reduce((sum, item) => {
  //       if (item.statusFlag !== 2) {
  //         return sum + item.qty;
  //       }
  //       return sum;
  //     }, 0);

  //     const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
  //       if (item.statusFlag !== 2) {
  //         const basePrice = item.qty * parseFloat(item.unitPrice); // Ensure we calculate using numbers
  //         const gstAmount = basePrice * (item.gst / 100); // GST as percentage
  //         return sum + basePrice + gstAmount;
  //       }
  //       return sum; // Skip items with statusFlag 2
  //     }, 0);

  //     const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);

  //     return {
  //       ...prevOrder,
  //       orderLineItems: updatedOrderLineItems,
  //       totalQty,
  //       totalAmount: roundedTotal,
  //       roundOff,
  //       totalGst: updatedOrderLineItems.reduce((sum, item) => {
  //         if (item.statusFlag !== 2) {
  //           const basePrice = item.qty * parseFloat(item.unitPrice);
  //           return sum + basePrice * (item.gst / 100);
  //         }
  //         return sum; // Skip items with statusFlag 2
  //       }, 0),
  //     };
  //   });
  // };

  // const handleUnitPriceChange = (newPrice, itemId) => {
  //   const formattedPrice = newPrice.replace(/^0+/, '') || '0';

  //   const isValidPrice =
  //     !isNaN(formattedPrice) &&
  //     formattedPrice.trim() !== '' &&
  //     !formattedPrice.includes(',');

  //   setOrder(prevOrder => {
  //     const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
  //       if (item.orderLineitemId === itemId && isValidPrice) {
  //         return { ...item, unitPrice: formattedPrice };
  //       }
  //       return item;
  //     });

  //     const totals = calculateTotals(updatedOrderLineItems);

  //     return {
  //       ...prevOrder,
  //       orderLineItems: updatedOrderLineItems,
  //       totalQty: totals.totalQty,
  //       totalAmount: totals.totalAmount,
  //       roundOff: totals.roundOff,
  //       totalGst: totals.totalGst,
  //     };
  //   });
  // };
  // const handleQuantityChange = (newQuantity, itemId) => {
  //   const formattedQuantity = newQuantity.replace(/^0+/, '').trim();
  //   const isValidQuantity = /^(\d+(\.\d{0,2})?)$/.test(formattedQuantity);

  //   order?.orderLineItems.forEach(item => {
  //     const d_pkg_flag = order.d_pkg_flag;
  //     console.log('d_pkg_flag:', d_pkg_flag); // Log d_pkg_flag value

  //     if (item.sttsFlag === 2) {
  //       ret;
  //     }
  //     if (item.statusFlag === 0) {
  //       let availQty = item?.availQty ?? 0;
  //       const formattedQuantityNum = Number(formattedQuantity);
  //       if (
  //         this.existingStyleMap &&
  //         this.existingStyleMap.has(item.styleId + '-' + item.size)
  //       ) {
  //         const additionalQty = this.existingStyleMap.get(
  //           item.styleId + '-' + item.size,
  //         );
  //         availQty += additionalQty;
  //         console.log(
  //           `Updated availQty for ${item.styleId}-${item.size} after adding from existingStyleMap:`,
  //           availQty,
  //         );
  //       }
  //       if (itemId === item.orderLineitemId) {
  //         if (
  //           formattedQuantityNum > availQty &&
  //           compFlag === 1 &&
  //           hold_qty_flag === 1 &&
  //           d_pkg_flag === 0
  //         ) {
  //           console.log(
  //             `Condition failed: Quantity cannot exceed available quantity (${availQty}) for item ${item.styleId}-${item.size}`,
  //           );
  //           alert(
  //             `Quantity cannot exceed available quantity (${availQty}) for item ${item.styleId}-${item.size}.`,
  //           );
  //           return; // Exit the function without updating the quantity for this item
  //         } else {
  //           console.log('Condition passed for item', item.styleId, item.size);
  //         }
  //       }
  //     } else {
  //       console.log(
  //         `Item statusFlag is not 0 for item ${item.styleId}-${item.size}, skipping quantity check.`,
  //       );
  //     }
  //   });
  //   setOrder(prevOrder => {
  //     const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
  //       if (item.orderLineitemId === itemId) {
  //         if (isValidQuantity) {
  //           return {...item, qty: parseFloat(formattedQuantity)};
  //         }
  //         if (formattedQuantity === '') {
  //           return {...item, qty: 0};
  //         }
  //       }
  //       return item;
  //     });

  //     const totalQty = updatedOrderLineItems.reduce((sum, item) => {
  //       return item.statusFlag !== 2 ? sum + parseFloat(item.qty || 0) : sum;
  //     }, 0);

  //     const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
  //       if (item.statusFlag !== 2) {
  //         const basePrice =
  //           parseFloat(item.qty || 0) * parseFloat(item.unitPrice);
  //         const gstAmount = basePrice * (item.gst / 100);
  //         return sum + basePrice + gstAmount;
  //       }
  //       return sum;
  //     }, 0);

  //     const totalGst = updatedOrderLineItems.reduce((sum, item) => {
  //       if (item.statusFlag !== 2) {
  //         const basePrice =
  //           parseFloat(item.qty || 0) * parseFloat(item.unitPrice);
  //         return sum + basePrice * (item.gst / 100);
  //       }
  //       return sum;
  //     }, 0);

  //     const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);

  //     return {
  //       ...prevOrder,
  //       orderLineItems: updatedOrderLineItems,
  //       totalQty,
  //       totalAmount: roundedTotal,
  //       roundOff,
  //       totalGst,
  //     };
  //   });
  // };

  const handleGstChange = (newGst, itemId) => {
    const formattedGst = newGst.replace(/^0+/, '') || '0';
    const isValidGst =
      !isNaN(formattedGst) &&
      formattedGst.trim() !== '' &&
      !formattedGst.includes(',') &&
      !formattedGst.includes('.');

    setOrder(prevOrder => {
      const updatedOrderLineItems = prevOrder.orderLineItems.map(item => {
        if (item.orderLineitemId === itemId && isValidGst) {
          return {...item, gst: formattedGst};
        }
        return item;
      });

      const totalQty = updatedOrderLineItems.reduce((sum, item) => {
        return item.statusFlag !== 2 ? sum + parseFloat(item.qty || 0) : sum;
      }, 0);
      

      // const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice = item.qty * parseFloat(item.unitPrice);
      //     const gstAmount = basePrice * (parseFloat(item.gst) / 100);
      //     return sum + basePrice + gstAmount;
      //   }
      //   return sum;
      // }, 0);


    
      const totalAmount = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
          const pdfFlag = Number(pdf_flag); 
  
      let fixedPrice = 0;
  if (pdfFlag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
  
  // let gstAmnt;
  // if (pdfFlag === 1) {
  //   gstAmnt = ((qty * discountAmount - discountAmountSec) * gst) / 100;
  // } else {
  //   gstAmnt = ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
  // }
  
  
  
      
            // let gstAmnt = pdf_flag === 1
            // ? ((qty * discountAmount - discountAmountSec) * gst) / 100
            // : ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100;
          
          // console.log("First GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
          console.log("Final GST Calculation:", { pdf_flag, qty, discountAmount, discountAmountSec, fixedPrice, gst, gstAmnt });
          console.log("checking condition",pdf_flag === 1 ? 'block1':'block2' )
  
          const basePrice = qty * fixedPrice;
          return sum + basePrice + gstAmnt;
        }
        return sum;
      }, 0);
      
      
      const totalGst = updatedOrderLineItems.reduce((sum, item) => {
        if (item.statusFlag !== 2) {
          const qty = item.qty || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const discountAmount = parseFloat(item.discountAmount) || 0;
          const discountAmountSec = parseFloat(item.discountAmountSec) || 0;
          const discountPercentageThird = parseFloat(item.discountPercentageThird) || 0;
          const fixDisc = parseFloat(item.fixDisc) || 0;
          const gst = parseFloat(item.gst) || 0;
      
  
          let fixedPrice = 0;
  if (pdf_flag !== 1) {
    if (unitPrice) {
      if (discountPercentageThird) {
        fixedPrice = item.unitPrice - item.discountPercentageThird;
      } else {
        fixedPrice = item.unitPrice;
      }
  
      if (item.fixDisc) {
        fixedPrice -= fixDisc
      }
    } else {
      fixedPrice = 0;
    }
  } else {
    fixedPrice = unitPrice || 0;
  }
  
  
          // Apply both discountPercentageThird and fixDisc
          let gstAmnt = pdf_flag === 1
          ? ((qty * fixedPrice - discountAmount - discountAmountSec) * gst) / 100
          : ((qty * (fixedPrice - discountAmount - discountAmountSec)) * gst) / 100;
        
            
          return sum + gstAmnt;
        }
        return sum;
      }, 0);
  
      
      // const totalGst = updatedOrderLineItems.reduce((sum, item) => {
      //   if (item.statusFlag !== 2) {
      //     const basePrice = item.qty * parseFloat(item.unitPrice);
      //     return sum + basePrice * (parseFloat(item.gst) / 100);
      //   }
      //   return sum;
      // }, 0);
      


      const {roundedTotal, roundOff} = calculateRoundOff(totalAmount);
      const {roundedGst, gstRoundOff} = calculateRoundOff(totalGst);

      return {
        ...prevOrder,
        orderLineItems: updatedOrderLineItems,
        totalQty,
        totalAmount: roundedTotal,
        roundOff,
        totalGst,
        gstRoundOff,
      };
    });
  };

  // const calculateRoundOff = totalAmount => {
  //   const decimal = parseFloat(
  //     (totalAmount - Math.floor(totalAmount)).toFixed(2),
  //   );
  
  //   if (decimal >= 0.5) {
  //     const roundedTotal = Math.ceil(totalAmount);
  //     return {
  //       roundedTotal,
  //       roundOff: `+${(Math.ceil(totalAmount) - totalAmount).toFixed(2)}`, // Always show '+' for positive values
  //     };
  //   } else {
  //     const roundedTotal = Math.floor(totalAmount);
  //   return {
  //       roundedTotal,
  //       roundOff: `-${(totalAmount - Math.floor(totalAmount)).toFixed(2)}`, // Negative values remain as '-'
  //   };
  //   }
  // };

  const calculateRoundOff = totalAmount => {
    const decimal = parseFloat((totalAmount - Math.floor(totalAmount)).toFixed(2));
  
    if (decimal >= 0.5) {
      const roundedTotal = Math.ceil(totalAmount);
      const roundOff = (Math.ceil(totalAmount) - totalAmount).toFixed(2);
      return {
        roundedTotal,
        roundOff: roundOff === '0.00' ? '0.00' : `+${roundOff}`, // Avoid showing `+0.00`
      };
    } else {
      const roundedTotal = Math.floor(totalAmount);
      const roundOff = (totalAmount - Math.floor(totalAmount)).toFixed(2);
      return {
        roundedTotal,
        roundOff: roundOff === '0.00' ? '0.00' : `-${roundOff}`, // Avoid showing `-0.00`
      };
    }
  };
  
  
  const renderOrderLineItem = ({item}) => {
    // console.log('Rendering Item:', item);

    const getCheckboxColor = statusFlag => {
      if (statusFlag === 2) {
        return 'red'; // Red for cancel (statusFlag 2)
      } else if (statusFlag === 1) {
        return 'green'; // Green for confirmed (statusFlag 1)
      }
      return 'black'; // Default color for other statuses
    };

    const checkboxColor = getCheckboxColor(item.statusFlag);

    // let fixedPrice = 0;
    // if (pdf_flag !== 1) {
    //   if (item.discountPercentageThird) {
    //     if (item.unitPrice) {
    //       fixedPrice = item.unitPrice - item.discountPercentageThird;
    //     } else {
    //       fixedPrice = 0;
    //     }
    //   } else {
    //     fixedPrice = item.unitPrice || 0;
    //   }
    // } else {
    //   fixedPrice = item.unitPrice || 0;
    // }

    let fixedPrice = 0;
if (pdf_flag !== 1) {
  if (item.unitPrice) {
    if (item.discountPercentageThird) {
      fixedPrice = item.unitPrice - item.discountPercentageThird;
    } else {
      fixedPrice = item.unitPrice;
    }

    if (item.fixDisc) {
      fixedPrice -= item.fixDisc;
    }
  } else {
    fixedPrice = 0;
  }
} else {
  fixedPrice = item.unitPrice || 0;
}


    // console.log('Fixed Price:', fixedPrice);

    let discountAmount = 0;
    let discountAmountSec = 0;
    let gstAmnt = 0;
    let grosss = 0;
    let total = 0;

    if (pdf_flag === 1) {
      discountAmount = item.unitPrice
        ? item.unitPrice -
          (item.unitPrice * (item.discountPercentage || 0)) / 100
        : 0;
      // console.log('Discount Amount:', discountAmount);

      if (gst_price_cal_flag === 1 && gst && item.unitPrice) {
        item.orgPrice = item.unitPrice / (1.0 + (gst || 0) / 100);
        console.log('GST Price Calc Flag ON: Org Price =', item.orgPrice);

        item.discAmnt = item.orgPrice
          ? item.orgPrice -
            (item.orgPrice * (item.discountPercentage || 0)) / 100
          : 0;
        console.log('Discount Amount (After Org Price Calc):', item.discAmnt);
      }

      discountAmountSec = isNaN(
        (item.qty * discountAmount * (item.discountPercentageSec || 0)) / 100,
      )
        ? 0
        : (item.qty * discountAmount * (item.discountPercentageSec || 0)) / 100;

      gstAmnt = isNaN(
        ((item.qty * discountAmount - (item.discAmntSec || 0)) *
          (item.gst || 0)) /
          100,
      )
        ? 0
        : ((item.qty * discountAmount - (item.discAmntSec || 0)) *
            (item.gst || 0)) /
          100;

      total = isNaN(
        item.qty * discountAmount -
          (item.qty * discountAmount * (item.discountPercentageSec || 0)) /
            100 +
          gstAmnt,
      )
        ? 0
        : item.qty * discountAmount -
          (item.qty * discountAmount * (item.discountPercentageSec || 0)) /
            100 +
          gstAmnt;

      grosss = isNaN(item.qty * discountAmount) ? 0 : item.qty * discountAmount;
    } else {
      discountAmount = isNaN(
        (item.qty * fixedPrice * (item.discountPercentage || 0)) / 100,
      )
        ? 0
        : (item.qty * fixedPrice * (item.discountPercentage || 0)) / 100;

      // console.log('Discount Amount:', discountAmount);

      discountAmountSec = isNaN(
        ((item.qty * fixedPrice - discountAmount) *
          (item.discountPercentageSec || 0)) /
          100,
      )
        ? 0
        : ((item.qty * fixedPrice - discountAmount) *
            (item.discountPercentageSec || 0)) /
          100;

      // console.log('Discount Amount (Secondary):', discountAmountSec);

      grosss = isNaN(item.qty * fixedPrice) ? 0 : item.qty * fixedPrice;

      gstAmnt = isNaN(
        ((item.qty * fixedPrice - discountAmount - discountAmountSec) *
          (item.gst || 0)) /
          100,
      )
        ? 0
        : ((item.qty * fixedPrice - discountAmount - discountAmountSec) *
            (item.gst || 0)) /
          100;

      // console.log('GST Amount:', gstAmnt);

      total = isNaN(
        item.qty * fixedPrice - discountAmount - discountAmountSec + gstAmnt,
      )
        ? 0
        : item.qty * fixedPrice - discountAmount - discountAmountSec + gstAmnt;

      // console.log('Total:', total);
    }

    // Ensure all formatted values are valid
    const grosssFormatted = grosss.toFixed(2).padStart(5, '0');
    const totalFormatted = total.toFixed(2).padStart(5, '0');
    const gstAmntFormatted = gstAmnt.toFixed(2).padStart(5, '0');

    // console.log('Formatted Values:', {
    //   grosssFormatted,
    //   totalFormatted,
    //   gstAmntFormatted,
    // });
    return (
      <View style={styles.orderItem}>
        <View style={{flexDirection: 'row', marginLeft: 10, }}>
          <CustomCheckBoxStatus
            isChecked={
              !!selectedItems[item.orderLineitemId] ||
              checkboxColor === 'green' ||
              checkboxColor === 'red'
            }
            onToggle={() =>
              handleCheckboxToggle(item.orderLineitemId, item?.statusFlag)
            }
            disabled={item.statusFlag !== 0}
            borderColor={checkboxColor}
          />
      
          <Text style={styles.orderstylenametxt}>{item?.styleName || item.style}</Text>
        
          {item.statusFlag !== 1 && item.statusFlag !== 2 && (
            <TouchableOpacity
              onPress={() => handleDelete(item.styleId, item.size, item.qty)}>
              <Image
                style={styles.buttonIcon}
                source={require('../../../assets/del.png')}
              />
            </TouchableOpacity>
          )}
          
        </View>

        {(item.imageUrl || item.imageUrl1) && (
        <TouchableOpacity onPress={() => openImageModal(item.imageUrl || item.imageUrl1)}>
          <Image
            source={{ uri: item.imageUrl || item.imageUrl1 }}
            style={{ width: 50, height: 50, marginHorizontal: 10, borderRadius: 5 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
        
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                Size
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {item?.size}
              </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                {pdf_flag ? 'MRP' : 'Price'}
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                  borderBottomWidth: 1,
                }}
                value={String(item.unitPrice)} // Ensure the value is a string for display
                keyboardType="decimal-pad" // Allows decimal input
                onChangeText={newPrice =>
                  handleUnitPriceChange(newPrice, item.orderLineitemId)
                } // Handle price change
              />
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 46,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                {pdf_flag ? 'WSP' : 'Dis Amnt 1'}
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {item?.discAmnt}
              </Text>
            </View>

            <View style={{flexDirection: 'row', top: 15}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                Gross
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {grosssFormatted}
              </Text>
            </View>

            <View style={{flexDirection: 'row', marginVertical: 10, top: 10}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                {pdf_flag ? 'Disc Amnt1' : 'Disc Amnt 2'}
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {item.discAmntSec}
              </Text>
            </View>
          </View>

          <View style={{flex: 1, alignItems: 'center'}}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 52,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                Qty
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                  bottom: 12,
                  borderBottomWidth: 1,
                }}
                value={String(item.qty)} // Ensure the value is a string for display
                keyboardType="decimal-pad" // Allows decimal input
                onChangeText={newQuantity =>
                  handleQuantityChange(newQuantity, item.orderLineitemId)
                } // Handle quantity change
                editable={item.statusFlag !== 1 && item.statusFlag !== 2}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 52,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                {pdf_flag ? 'M.Down' : 'Disc 1'}
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                  marginLeft: 3,
                }}>
                {item.discountPercentage}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 52,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                {pdf_flag ? 'Disc' : 'Disc 2'}
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                  marginLeft: 3,
                }}>
                {item.discountPercentageSec}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 52,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                  top: 14,
                }}>
                GST
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                  top: 14,
                }}>
                :
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                  borderBottomWidth: 1,
                  marginLeft:4
                }}
                value={item?.gst !== undefined ? String(item.gst) : ''} // Ensure the value is a string for display
                keyboardType="decimal-pad" // Allows decimal input
                onChangeText={newGst =>
                  handleGstChange(newGst, item.orderLineitemId)
                } // Handle GST change
              />
            </View>
          </View>

          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                Total
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {totalFormatted}
              </Text>
            </View>
            <View style={{flexDirection: 'row', top: 15}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                Color
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {item?.colorName}
              </Text>
            </View>
            <View style={{flexDirection: 'row', top: 15}}>
              <Text
                style={{
                  width: 45,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                GST AMT
              </Text>
              <Text
                style={{
                  width: 15,
                  color: '#000',
                  marginLeft: 10,
                  marginVertical: 5,
                }}>
                :
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#000',
                  marginRight: 10,
                  marginVertical: 5,
                }}>
                {gstAmntFormatted}
              </Text>
            </View>
            {!pdf_flag && (
              <View style={{flexDirection: 'row', top: 15}}>
                <Text
                  style={{
                    width: 45,
                    color: '#000',
                    marginLeft: 10,
                    marginVertical: 5,
                  }}>
                  Fixed Disc
                </Text>
                <Text
                  style={{
                    width: 15,
                    color: '#000',
                    marginLeft: 10,
                    marginVertical: 5,
                  }}>
                  :
                </Text>
                <Text
                  style={{
                    flex: 1,
                    color: '#000',
                    marginRight: 10,
                    marginVertical: 5,
                  }}>
                  {item?.discountPercentageThird|| item.fixDisc}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row', backgroundColor: '#f0f0f0'}}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              style={{height: 25, width: 25, marginRight: 8}}
              source={require('../../../assets/back_arrow.png')}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: 20,
                marginVertical: 10,
              }}>
              Order Details
            </Text>
          </View>
        </View>
        <ScrollView>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={styles.orderhead}>
              <Text style={styles.orderidtxt}>Order : {order?.orderNum}</Text>
              <Text style={styles.ordercusttxt}>
                Name : {order?.customerName}
              </Text>
            </View>
            <View style={styles.orderhead}>
              <Text style={styles.orderDate}>
                Order Date : {order?.orderDate}
              </Text>
             <Text style={styles.ordertotalQty}>
  Total Qty : {order?.totalQty?.toFixed(2)}
</Text>

            </View>
          </View>
          <View style={styles.selectheader}>
            <View>
              <Text style={styles.Productdettext}>Product Details</Text>
            </View>
            {order && order.completeFlag !== 1 && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#007bff',
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => setModalVisible(true)}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>
                  Select Styles
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <View>
              {order?.orderLineItems?.map(item => (
                <View
                  key={
                    item.orderLineitemId
                      ? item.orderLineitemId.toString()
                      : item.styleId.toString() + item.size.toString()
                  }>
                  {renderOrderLineItem({item})}
                </View>
              ))}
              <View
                style={{
                  marginHorizontal: 15,
                  alignItems: 'flex-end',
                  marginBottom: 15,
                }}>
                <OrderDetailRow label="Total Qty" value={order?.totalQty} />
                {console.log('order?.totalQty', order?.totalQty)}
                <OrderDetailRow label="Total Gst" value={order?.totalGst} />

                {/* <OrderDetailRow label="IGST" value={order?.igst} /> */}
                {!pdf_flag && (
                  <OrderDetailRow
                    label="Total Disc 1"
                    value={order?.totalDiscount}
                  />
                )}
                <OrderDetailRow
                  label={pdf_flag ? 'Total Disc 1' : 'Total Disc 2'}
                  value={order?.totalDiscountSec}
                />
                <OrderDetailRow
                  label="Transport Exp"
                  value={order?.gTranspExp}
                />
                <OrderDetailRow label="Other Exp" value={order?.gOtherExp} />
                <OrderDetailRow label="Round Off" value={order?.roundOff} />

                <OrderDetailRow label="Total Cost" value={order?.totalAmount} />
              </View>
              {order?.completeFlag === 0 && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        marginLeft: 10,
                        marginRight: 25,
                        fontWeight: 'bold',
                      }}>
                      Remarks :{' '}
                    </Text>
                    <View
                      style={{flex: 1, marginLeft: 10, marginHorizontal: 30}}>
                      <TextInput
                        style={{
                          color: '#000',
                          borderWidth: 1,
                          paddingVertical: 10,
                          borderRadius: 5,
                          paddingLeft: 10,
                        }}
                        placeholder="Status Comments"
                        placeholderTextColor={'#000'}
                        value={comments} // Bind the input value to the state
                        onChangeText={text => setComments(text)} // Update the state on text change
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <View style={{}}>
                      <Text
                        style={{
                          color: '#000',
                          marginLeft: 10,
                          fontWeight: 'bold',
                        }}>
                        Status :{' '}
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        marginLeft: 40,
                      }}>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={handleDropdownToggle}>
                        <Text style={styles.dropdownText}>
                          {selectedStatus || 'Select Status'}
                        </Text>
                        <Image
                          source={require('../../../assets/dropdown.png')}
                          style={styles.dropdownImage}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {dropdownVisible && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={styles.scrollView}
                        nestedScrollEnabled={true}>
                        {filteredStatusOptions.map(option => (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              styles.dropdownOption,
                              selectedStatus === option.stts &&
                                styles.selectedOption,
                            ]}
                            onPress={() => handleDropdownSelectStatus(option)}>
                            <Text style={styles.dropdownOptionText}>
                              {option.stts}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          onPress={handleUpdateOrderStatus}
          style={{
            borderWidth: 1,
            marginTop: 50,
            marginBottom: 50,
            marginHorizontal: 20,
            borderRadius: 10,
            paddingVertical: 10,
            backgroundColor: '#F09120',
          }}>
          <Text style={{color: '#000', alignSelf: 'center'}}>
            Update Order Status
          </Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true} // Makes the background slightly dimmed
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <TouchableOpacity style={styles.selstyleheader}>
                <Text style={styles.selstyle}>
                  Select Styles
                </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Image
                    style={{height: 30, width: 30, marginRight: 5}}
                    source={require('../../../assets/close.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10 }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text style={{ color: "#000", marginRight: 5 }}>
              {selectedSearchOption ? selectedSearchOption : 'Select'}
            </Text>
            <Image
              style={styles.dropdownIcon}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

              <View style={styles.hesderselect}>
                <Text style={styles.itemTextname}>Name</Text>
                <Text style={styles.itemTextcolor}>Color</Text>
                <Text style={styles.itemTextsize}>Size</Text>
                <Text style={{ color: '#000' }}>
    {pdf_flag ? 'MRP' : 'PRICE'}
  </Text>
                <Text style={styles.itemTextavl}>Avl Qty</Text>
                <Text style={styles.itemTextqty}>Qty</Text>
              </View>
              {stylesData?.length === 0 ? (
  <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
) : (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    }
    onScrollEndDrag={loadMoreTasks}
  >
    {stylesData.map((item, index) => (
      <View key={`${item.styleId}-${index}`}>
        {renderItem({ item, index, updateQty })}
      </View>
    ))}
    {loadingMore && <ActivityIndicator size="small" color="#0000ff" />}
  </ScrollView>
)}

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItems} // Add this line
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal transparent={true} visible={isImageModalVisible} onRequestClose={closeModal} animationType="fade">
        <View style={styles.modalOverlayImage}>
       
          <View style={styles.modalContentImage}>
             <TouchableOpacity
                  style={styles.closeButtonImageModel}
                  onPress={closeModal}>
                  <Image
                    style={{height: 30, width: 30,}}
                    source={require('../../../assets/close.png')}
                  />
                </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImageImage} />}
            {/* <TouchableOpacity onPress={closeModal} style={styles.closeButtonImage}>
              <Text style={styles.closeButtonTextImage}>Close</Text>
            </TouchableOpacity> */}
        
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors,screenHeight) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    backButton: {
      padding: 8,
    },
    buttonIcon: {
      width: 25,
      height: 25,
      marginRight: 10,
      alignItems: 'center',
    },
    orderItem: {
      marginVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    orderDate: {
      fontWeight: 'bold',
      color: '#000',
    },
    orderhead: {
      flexDirection: 'column', // Change to column to stack vertically
      marginHorizontal: 10,
      marginTop: 10,
    },

    orderidtxt: {
      color: '#000',
      fontWeight: 'bold',
    },

    ordercusttxt: {
      color: '#000',
      fontWeight: 'bold',
      marginTop: 5,
    },

    ordertotalQty: {
      color: '#000',
      fontWeight: 'bold',
      marginTop: 5,
    },
    Productdettext: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 17,
    },
    orderstylenametxt: {
      color: '#000',
      flex: 1.4,
      marginLeft: 13,
    },
    orderqtytxt: {
      color: '#000',
      flex: 1.1,
    },
    ordertotaltxt: {
      color: '#000',
      flex: 1,
    },
    sizetxt: {
      color: '#000',
      marginLeft: 40,
      flex: 1,
    },
    colortxt: {
      color: '#000',
      marginLeft: 78,
      flex: 2,
    },
    sizedistxt: {
      color: '#000',
      marginLeft: 40,
      flex: 1,
    },
    Fixedtxt: {
      color: '#000',
      marginLeft: 23,
      flex: 2,
    },
    sizegsttxt: {
      color: '#000',
      marginLeft: 27,
      flex: 0.8,
    },
    sizegstAmnttxt: {
      color: '#000',
      marginLeft: 40,
      marginRight: 10,
      flex: 0.8,
    },
    sizegrosstxt: {
      color: '#000',
      marginLeft: 40,
      flex: 1,
      marginTop: 3,
      marginBottom: 5,
    },
    switchContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginHorizontal: 10,
      marginVertical: 10,
    },
    dropdownButton: {
      height: 35,
      borderRadius: 10,
      borderWidth: 0.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 15,
      paddingRight: 15,
      marginHorizontal: 10,
      marginVertical: 1,
    },
    dropdownText: {
      color: '#000',
    },
    dropdownImage: {
      width: 20,
      height: 20,
      marginRight: 5,
      marginLeft: 20,
    },
    // dropdownContainer: {
    //   marginLeft: 15,
    //   marginTop: 1,
    //   marginBottom: 50,
    //   width: '51%',
    //   backgroundColor: 'white',
    //   borderWidth: 0.5,
    //   borderRadius: 10,
    //   alignSelf: 'center',
    //   ...(screenHeight > 20 ? { top: 50 } : { bottom: 50 }), // Adjust based on screen size

    // },

    dropdownContainer: {
      position: 'absolute',
      width: '51%',
      alignSelf: 'center',
      backgroundColor: 'white',
      borderWidth: 0.5,
      borderRadius: 10,
      zIndex: 10,
      elevation: 10,
      ...(screenHeight > 700 ? { top: 35 } : { bottom: 47 }), // Adjust based on screen size
    },
    dropdownOption: {
      padding: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: '#ddd',
    },
    dropdownOptionText: {
      color: '#000',
    },
    selectedOption: {
      backgroundColor: '#ddd',
      borderRadius: 10,
    },
    scrollView: {
      maxHeight: 100, // Adjust height as needed
    },
    selectstyle: {
      borderWidth: 1,
      marginHorizontal: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: colors.color2,
      alignSelf: 'center', // Aligns the button vertically
    },
    selecrtext: {
      color: '#fff',
      fontWeight: 'bold',
    },
    selectheader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center', // Aligns items vertically
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '97%', // Adjust to desired width
      maxHeight: '80%', // Limit height to 80% of the screen
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
    },
    closeButton: {
      backgroundColor: 'lightgray',
      padding: 3,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    noCategoriesText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#000',
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: colors.color2,
      padding: 10,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginVertical: 5,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    hesderselect: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    itemText: {
      flex: 1,
      color: '#000',
      textAlign: 'center', // Center align the text in each column
    },
    itemTextname: {
      flex: 0.7,
      color: '#000',
      textAlign: 'center',
    },
    itemTextcolor: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemTextsize: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemTextprice: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemTextavl: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemTextqty: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemInput: {
      color: '#000',
      flex: 1,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingLeft: 5,
      textAlign: 'center', // Align the input text in the center
      marginVertical: 5,
      ...(Platform.OS === 'ios' && {paddingVertical: 7}),
    },
    container1: {
      marginBottom: 5,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 25,
      paddingHorizontal: 15,
      color: '#000',
      // backgroundColor: '#f1f1f1',
      marginRight: 10,
    },
    container3: {
      height: 40,
      borderRadius: 10,
      borderWidth: 0.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    dropdownContainersku: {
      elevation: 5,
      maxHeight: 200,
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray',
      borderWidth: 1,
      marginTop: 5,
      overflow: 'hidden', 
    },
    dropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#8e8e8e',
    },
    searchButton: {
      backgroundColor: colors.color2,
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 9,
      elevation: 3,
      bottom:2
    },
    selstyle: {
      color: '#000',
      fontSize: 15,
      fontWeight: 'bold',
    },
    selstyleheader:{
      backgroundColor: colors.color2,
      paddingHorizontal:10,
      paddingVertical:8,
      borderRadius:10
    } ,
    buttonIcondel: {
      width: 25,
      height: 25,
      marginRight:5
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingLeft: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
      flex: 1,
      marginRight: 10,
      
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 25,
      paddingHorizontal: 15,
      color: '#000',
      // backgroundColor: '#f1f1f1',
      marginRight: 10,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: '#e6e6e6',
      borderRadius: 15,
    },
    dropdownIcon: {
      width: 15,
      height: 15,
      tintColor: '#000',
    },
    searchButton: {
      backgroundColor:  colors.color2,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 10,
      elevation: 3,
      
    },
    searchButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    dropdownContent1: {
      elevation: 5,
      // height: 220,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginBottom:5
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
      width: 300,
      height: 300,
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
      backgroundColor: 'lightgray',
      padding: 3,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
  });

export default PackingConformation;
