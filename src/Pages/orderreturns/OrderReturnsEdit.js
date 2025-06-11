import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RadioGroup} from 'react-native-radio-buttons-group';
import {ColorContext} from '../../components/colortheme/colorTheme';
import FastImage from 'react-native-fast-image';
import ReactNativeBlobUtil from 'react-native-blob-util';



const OrderReturnsEdit = () => {
  const navigation = useNavigation();
const route = useRoute();
const { orderId } = route.params;
const { colors } = useContext(ColorContext);
const styles = getStyles(colors);

const [orderData, setOrderData] = useState([]);
const [groupedOrders, setGroupedOrders] = useState([]);
const [childItems, setChildItems] = useState([]);
const [loading, setLoading] = useState(false);
const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
const compFlag = useSelector(state => state.selectedCompany.comp_flag);
  const pdf_flag = useSelector(state => state.selectedCompany.pdf_flag);
// Calculation state variables
const [grosses, setGrosses] = useState([]);
const [totalQtyArr, setTotalQtyArr] = useState([]);
const [totalAmountArr, setTotalAmountArr] = useState([]);
const [totalGstArr, setTotalGstArr] = useState([]);
const [totalDiscountArr, setTotalDiscountArr] = useState([]);
const [totalDiscountSecArr, setTotalDiscountSecArr] = useState([]);
const [newOrder, setNewOrder] = useState({
  totalQty: 0,
  totalAmount: 0,
  totalGst: 0,
  totalDiscount: 0,
  totalDiscountSec: 0,
});

// Configuration flags (these should come from your app configuration)
const [pdfFlag, setPdfFlag] = useState(1); // Set based on your app logic
const [gstPriceCalFlag, setGstPriceCalFlag] = useState(0); // Set based on your app logic

// Return reason states
const [showReasonList, setShowReasonList] = useState(false);
const [reasonList, setReasonList] = useState([]);
const [filteredReasonList, setFilteredReasonList] = useState([]);
const [selectedReason, setSelectedReason] = useState('');
const [selectedReasonID, setSelectedReasonID] = useState(0);


const [isPreviewVisible, setIsPreviewVisible] = useState(false);
const [previewImageUri, setPreviewImageUri] = useState('');
// Modal and form states



const [ReasonModal, setReasonModal] = useState(false);
const [editShortcutKey, setEditShortcutKey] = useState(true);
const [mReasonName, setmReasonName] = useState('');
const [ReasonDesc, setReasonDesc] = useState('');
const [processing, setProcessing] = useState(false);
const [isLoading, setIsLoading] = useState(false);


const [refreshing, setRefreshing] = useState(false);

const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [orderReturnList, setOrderReturnList] = useState([]);
  const [isFetchingReturns, setIsFetchingReturns] = useState(false);

  const fetchOrderReturnData = () => {
    const apiUrl = `${global?.userData?.productURL}${API.ORDER_RETURNS_MODEL}/${orderId}`;
    setLoading(true);
  
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const result = response?.data?.response?.ordersList?.[0];
  
        console.log('result=====>', result);
  
        const creditNotesArray = result?.creditNotes || [];
  
        setOrderReturnList(creditNotesArray);  // ✅ Ensure this is an array
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching order returns:', error);
        setLoading(false);
      });
  };
  

  const handleOpenReturnModal = () => {
    setIsReturnModalVisible(true);
    fetchOrderReturnData();
  };

  const renderOrderReturnItem = ({ item }) => {
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item?.ordReturnNo || '-'}</Text>
        <Text style={styles.cell}>{item?.invNos || '-'}</Text>
        <Text style={styles.cell}>{item?.cn_tot_qty ?? '-'}</Text>
        <Text style={styles.cell}>₹{item?.cn_tot_amnt ?? '-'}</Text>
        <Text style={styles.cell}>{item?.createdBy || '-'}</Text>
        <TouchableOpacity
          style={styles.cellpdf}
          onPress={() => getPdfForModel(item?.cn_order_id, item?.cn_id)}
        >
          <Image
            style={styles.pdfimgmodel}
            source={require('../../../assets/pdf.png')}
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  

    const requestStoragePermission = async () => {
      try {
        if (Platform.OS === 'android') {
          if (Platform.Version >= 33) {
            // Android 13 and above
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              {
                title: 'Storage Permission Required',
                message: 'This app needs access to your storage to download PDF',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          } else if (Platform.Version >= 30) {
            // Android 11 - 12 (Scoped Storage)
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission Required',
                message: 'This app needs access to your storage to download PDF',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            // Below Android 11
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission Required',
                message: 'This app needs access to your storage to download PDF',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          }
        }
        return false;
      } catch (err) {
        console.warn('Error requesting storage permission:', err);
        return false;
      }
    };
  
    const getPdfForModel = async (cn_order_id, cn_id) => {
      const apiUrl = `${global?.userData?.productURL}${API.PDF_DOWNLOAD_FOR_ORDER_RETURNS_MODEL}/${cn_order_id}/${cn_id}`;
      console.log("apiUrl====>s",apiUrl)
      
      try {
        const response = await axios.post(
          apiUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${global?.userData?.token?.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        const pdfBase64 = response.data.body;
    
        if (Platform.OS === 'android') {
          const hasPermission = await requestStoragePermission();
          if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to save the PDF.');
            return;
          }
        }
    
        const pdfPath =
          Platform.OS === 'android'
            ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Sales_Return_${cn_order_id}.pdf`
            : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Sales_Return_${cn_order_id}.pdf`;
    
        await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
        Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      } catch (error) {
        console.error('Error generating or saving PDF:', error);
        Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
      }
    };


    const getPdfForOrderReturns = async (orderId, p_id) => {
      const apiUrl = `${global?.userData?.productURL}${API.PDF_DOWNLOAD_ORDER_RETURNS}/${orderId}/${p_id}`;
      console.log("apiUrl====>", apiUrl);
    
      try {
        const response = await axios.post(
          apiUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${global?.userData?.token?.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        const pdfBase64 = response.data.body;
    
        if (Platform.OS === 'android') {
          const hasPermission = await requestStoragePermission();
          if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to save the PDF.');
            return;
          }
        }
    
        const pdfPath =
          Platform.OS === 'android'
            ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Sales_Return_${orderId}_${p_id}.pdf`
            : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Sales_Return_${orderId}_${p_id}.pdf`;
            
        await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
        Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      } catch (error) {
        console.error('Error generating or saving PDF:', error);
        Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
      }
    };
    

const [remarks, setRemarks] = useState('');
const [selectedId, setSelectedId] = useState('0');

const [radioButtons, setRadioButtons] = useState([
  {
    id: '0',
    label: 'Cash',
    value: '0',
    labelStyle: styles.radioLabel,
    color: colors.color2,
    disabled: false,
  },
  {
    id: '1',
    label: 'Credit Note',
    value: '1',
    labelStyle: styles.radioLabel,
    color: colors.color2,
    disabled: false,
  },
]);

const selectedCompany = useSelector(state => state.selectedCompany);

// Main calculation function - updated for decimal quantity support
const calculateOrderTotals = (groupedOrdersData) => {
  let newOrderTotals = {
    totalQty: 0,
    totalAmount: 0,
    totalGst: 0,
    totalDiscount: 0,
    totalDiscountSec: 0,
  };

  const newGrosses = [];
  const newTotalQtyArr = [];
  const newTotalAmountArr = [];
  const newTotalGstArr = [];
  const newTotalDiscountArr = [];
  const newTotalDiscountSecArr = [];

  groupedOrdersData.forEach((pack, grossIndex) => {
    // Initialize pack totals
    pack.retTotalQty = 0.00;
    pack.retTotalAmnt = 0;
    pack.retTotalGst = 0;
    pack.retTotalDisc = 0;
    pack.retTotalDiscSec = 0;

    const totAmnt = pack?.totAmnt || 0;
    const creditApplied = pack?.creditApplied || 0;

    if (pack && pack?.orders && pack?.orders?.length > 0) {
      newGrosses[grossIndex] = [];
      
      pack.orders.forEach((lineItem, styleIndex) => {
        newGrosses[grossIndex][styleIndex] = lineItem?.gross || 0;
        
        // Get entered quantity (support decimal values)
        const enterQty = parseFloat(lineItem.enterQty) || 0;
        
        if (enterQty && enterQty < 0) {
          Alert.alert('Please enter positive numbers only.');
          lineItem.enterQty = 0;
          return;
        }

        // Support decimal quantities - round to 2 decimal places for consistency
        const qty = parseFloat((enterQty + (lineItem.retQty || 0)).toFixed(2));
        
        // Allow decimal comparison with shipQty
        if (qty > (lineItem.shipQty || 0)) {
          Alert.alert('Qty is greater than Ship Qty');
          lineItem.enterQty = 0;
          return;
        }

        const prevLineItem = { ...lineItem };
        const prevPack = {
          retTotalQty: pack.retTotalQty,
          retTotalGst: pack.retTotalGst,
          retTotalDisc: pack.retTotalDisc,
          retTotalDiscSec: pack.retTotalDiscSec,
          retTotalAmnt: pack.retTotalAmnt
        };

        if (qty) {
          const tempQty = lineItem?.retQty || 0;
          
          if (pdf_flag === 1) {
            // PDF calculation logic with decimal support
            if (lineItem.boxQty === null || lineItem.boxQty === undefined || lineItem.boxQty === 0) {
              lineItem.boxQty = 1;
            }
            
            // Calculate piece quantity with decimal support
            lineItem.pcqty = parseFloat((qty * lineItem.boxQty).toFixed(4));

            // Calculate discount amount (this is the actual amount, not percentage)
            lineItem.discountAmount = parseFloat((
              lineItem.price - (lineItem.price * lineItem.disc) / 100
            ).toFixed(4));

            // Handle inclusive pricing
            if (orderData[0]?.inclusive === 1 && lineItem.gst) {
              lineItem.discountAmount = parseFloat((
                lineItem.discountAmount / (1.0 + (lineItem.gst / 100))
              ).toFixed(4));
            }

            // Handle GST price calculation
            if (gstPriceCalFlag === 1 && lineItem.gst) {
              lineItem.orgPrice = parseFloat((
                lineItem.price / (1.0 + (lineItem.gst / 100))
              ).toFixed(4));
              lineItem.discountAmount = parseFloat((
                lineItem.orgPrice - (lineItem.orgPrice * lineItem.disc) / 100
              ).toFixed(4));
            }

            // Calculate second discount amount with decimal qty
            lineItem.discountAmountSec = parseFloat((
              (qty * lineItem.discountAmount * lineItem.discSec) / 100
            ).toFixed(4));

            // Calculate GST amount with decimal qty
            lineItem.gstAmnt = parseFloat((
              ((qty * lineItem.discountAmount - lineItem.discountAmountSec) * lineItem.gst) / 100
            ).toFixed(4));

            pack.retTotalQty += qty;
            pack.retTotalGst += lineItem.gstAmnt;
            // Fix: Add the actual discount amounts, not the discounted price
            pack.retTotalDisc += parseFloat((qty * lineItem.price * lineItem.disc / 100).toFixed(4));
            pack.retTotalDiscSec += parseFloat(lineItem.discountAmountSec);

            lineItem.gross = parseFloat((
              qty * lineItem.discountAmount -
              (qty * lineItem.discountAmount * lineItem.discSec) / 100 +
              lineItem.gstAmnt
            ).toFixed(2)); // Final gross rounded to 2 decimal places

            newGrosses[grossIndex][styleIndex] = lineItem.gross;
            pack.retTotalAmnt += parseFloat(lineItem.gross);

            // Credit applied validation
            if (creditApplied > 0 && totAmnt > 0 ) {
              const eligibleReturnAmnt = parseFloat((
                Math.round(Math.round(totAmnt) - creditApplied)
              ).toFixed(2));
              
              if (pack.retTotalAmnt > eligibleReturnAmnt) {
                Alert.alert(
                  `The return amount exceeds the eligible amount after credit adjustment (${orderData[0]?.currencySymbol || '₹'}${eligibleReturnAmnt}). Please review the return details.`
                );

                // Revert calculations
                Object.assign(lineItem, prevLineItem);
                Object.assign(pack, prevPack);
                lineItem.enterQty = 0;
                newGrosses[grossIndex][styleIndex] = lineItem?.gross || 0;
              }
            }

          } else {
            // Non-PDF calculation logic with decimal support
            let fixedPrice = lineItem.price;
            if (lineItem.discThird) {
              fixedPrice -= lineItem.discThird;
            }

            // Calculate actual discount amounts with decimal qty
            lineItem.discountAmount = parseFloat((
              (qty * fixedPrice * lineItem.disc) / 100
            ).toFixed(4));

            lineItem.discountAmountSec = parseFloat((
              ((qty * fixedPrice - lineItem.discountAmount) * lineItem.discSec) / 100
            ).toFixed(4));

            lineItem.gstAmnt = parseFloat((
              ((qty * fixedPrice - lineItem.discountAmount - lineItem.discountAmountSec) * lineItem.gst) / 100
            ).toFixed(4));

            pack.retTotalGst += lineItem.gstAmnt;
            pack.retTotalQty += qty;
            pack.retTotalDisc += parseFloat(lineItem.discountAmount);
            pack.retTotalDiscSec += parseFloat(lineItem.discountAmountSec);

            lineItem.gross = parseFloat((
              qty * fixedPrice -
              (qty * fixedPrice * lineItem.disc) / 100 -
              ((qty * fixedPrice - lineItem.discountAmount) * lineItem.discSec) / 100 +
              lineItem.gstAmnt
            ).toFixed(2)); // Final gross rounded to 2 decimal places

            newGrosses[grossIndex][styleIndex] = lineItem.gross;
            pack.retTotalAmnt += parseFloat(lineItem.gross);

            // Credit applied validation (same as PDF logic)
            if (creditApplied > 0 && totAmnt > 0 ) {
              const eligibleReturnAmnt = parseFloat((
                Math.round(Math.round(totAmnt) - creditApplied)
              ).toFixed(2));
              
              if (pack.retTotalAmnt > eligibleReturnAmnt) {
                Alert.alert(
                  `The return amount exceeds the eligible amount after credit adjustment (${orderData[0]?.currencySymbol || '₹'}${eligibleReturnAmnt}). Please review the return details.`
                );

                // Revert calculations with non-PDF logic
                Object.assign(lineItem, prevLineItem);
                Object.assign(pack, prevPack);
                lineItem.enterQty = 0;
                newGrosses[grossIndex][styleIndex] = lineItem?.gross || 0;
              }
            }
          }

          // Round pack totals to appropriate decimal places
          pack.retTotalQty = parseFloat(pack.retTotalQty.toFixed(2));
          pack.retTotalGst = parseFloat(pack.retTotalGst.toFixed(2));
          pack.retTotalDisc = parseFloat(pack.retTotalDisc.toFixed(2));
          pack.retTotalDiscSec = parseFloat(pack.retTotalDiscSec.toFixed(2));
          pack.retTotalAmnt = parseFloat(pack.retTotalAmnt.toFixed(2));
        }
      });
    }

    // Store totals in arrays
    newTotalQtyArr[grossIndex] = pack.retTotalQty;
    newTotalAmountArr[grossIndex] = pack.retTotalAmnt;
    newTotalGstArr[grossIndex] = pack.retTotalGst;
    newTotalDiscountArr[grossIndex] = pack.retTotalDisc;
    newTotalDiscountSecArr[grossIndex] = pack.retTotalDiscSec;

    // Add to order totals
    newOrderTotals.totalQty += pack.retTotalQty;
    newOrderTotals.totalAmount += pack.retTotalAmnt;
    newOrderTotals.totalDiscount += pack.retTotalDisc;
    newOrderTotals.totalDiscountSec += pack.retTotalDiscSec;
    newOrderTotals.totalGst += pack.retTotalGst;
  });

  // Round final totals
  newOrderTotals.totalQty = parseFloat(newOrderTotals.totalQty.toFixed(2));
  newOrderTotals.totalGst = parseFloat(newOrderTotals.totalGst.toFixed(2));
  newOrderTotals.totalDiscount = parseFloat(newOrderTotals.totalDiscount.toFixed(2));
  newOrderTotals.totalDiscountSec = parseFloat(newOrderTotals.totalDiscountSec.toFixed(2));
  newOrderTotals.totalAmount = parseFloat(newOrderTotals.totalAmount.toFixed(2));

  // Update state
  setGrosses(newGrosses);
  setTotalQtyArr(newTotalQtyArr);
  setTotalAmountArr(newTotalAmountArr);
  setTotalGstArr(newTotalGstArr);
  setTotalDiscountArr(newTotalDiscountArr);
  setTotalDiscountSecArr(newTotalDiscountSecArr);
  setNewOrder(newOrderTotals);

  return newOrderTotals;
};

// Handle quantity input change - already supports decimals
const handleQuantityChange = (text, groupIndex, itemIndex) => {
  const validDecimal = /^(\d+)?(\.\d{0,2})?$/;

  // Allow empty input for clearing the field
  if (text === '' || validDecimal.test(text)) {
    const updatedGroups = [...groupedOrders];

    if (updatedGroups[groupIndex] && updatedGroups[groupIndex].orders[itemIndex]) {
      // Store raw input as string for smooth typing
      updatedGroups[groupIndex].orders[itemIndex].enterQty = text;
      setGroupedOrders(updatedGroups);

      // Convert to number only when it's a valid float
      const qty = parseFloat(text);
      if (!isNaN(qty)) {
        calculateOrderTotals(updatedGroups);
      }
    }
  }
};



// Function to group orders by invoiceNo and packNo
// Function to group orders by invoiceNo and packNo
const groupOrdersByInvoiceAndPack = (orders) => {
  const grouped = {};

  orders.forEach(order => {
    const key = `${order.invoiceNo}_${order.packNo}`;
    if (!grouped[key]) {
      grouped[key] = {
        p_id: order.p_id,
        invoiceNo: order.invoiceNo,
        packNo: order.packNo,
        creditApplied: order.creditApplied,
        totAmnt: order.totAmnt,
        orderId: order.orderId,
        orders: [],
        showPdf: false, // 👈 add this
      };
    }

    if (order.childLists && Array.isArray(order.childLists)) {
      order.childLists.forEach(child => {
        const currentReturnQty = child.retQty || 0;

        grouped[key].orders.push({
          ...child,
          currentReturnQty,
          maxReturnQty: child.shipQty || 0,
          invoiceNo: order.invoiceNo,
          packNo: order.packNo,
          p_id: order.p_id,
          enterQty: 0,
        });

        // 👇 Check if any item has currentReturnQty > 0
        if (currentReturnQty > 0) {
          grouped[key].showPdf = true;
        }
      });
    }
  });

  return Object.values(grouped);
};


// Also make sure in buildOrderReturnObject function, you're using pack.p_id correctly:
// In the orderPackingList mapping, change:
//   p_id: pack.p_id || 0,
// to:
//   p_id: pack.p_id, // Remove the || 0 default since p_id should always have a value

// Refresh data function

// Rest of your existing functions remain the same...
const handReasonDropDown = () => {
  setShowReasonList(!showReasonList);
};

const handleSelectReason = item => {
  console.log('Full selected item:', item);
  console.log('Selected reason:', item.returnReason, 'ID:', item.id);
  setSelectedReason(item.returnReason);
  setSelectedReasonID(item.id);  // Use `id` here, not `returnReasonId`
  setShowReasonList(false);
};

const toggleSeasonReasonModal = () => {
  setReasonModal(!ReasonModal);
};

const handleCloseReasonModal = () => {
  setReasonModal(false);
  setmReasonName('');
  setReasonDesc('');
};

const filterReason = text => {
  const filtered = reasonList.filter(item =>
    item?.returnReason?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredReasonList(filtered);
};

const handleSelect = id => {
  setSelectedId(id);
};

// Initialize component
useEffect(() => {
  const fetchInitialSelectedCompany = async () => {
    try {
      const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
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

const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

 const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

useEffect(() => {
  if (companyId) {
    getReason();
  }
}, [companyId]);

useEffect(() => {
  if (orderId && companyId) {
    getOrderPacking(orderId, companyId);
    getOrderReturnDetails(orderId);
  }
}, [orderId, companyId]);

// Add focus listener to refresh data when screen comes into focus
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // Refresh data when coming back to this screen
    if (orderId && companyId) {
      console.log('Screen focused, refreshing data...');
      refreshData();
    }
  });

  return unsubscribe;
}, [navigation, orderId, companyId]);

const getReason = () => {
  setIsLoading(true);
  const apiUrl = `${global?.userData?.productURL}${API.GET_RETURN_REASON}/${companyId}`;
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setReasonList(response?.data?.response?.returnList || []);
      setFilteredReasonList(response?.data?.response?.returnList || []);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};

const ValidateReason = async () => {
  if (processing) return;
  setProcessing(true);

  if (mReasonName.length === 0 || ReasonDesc.length === 0) {
    Alert.alert('Please fill all mandatory fields');
    setProcessing(false);
    return;
  }

  const apiUrl = `${global?.userData?.productURL}${API.GET_RETURN_REASON_VALIDATE}${mReasonName}/${companyId}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });

    if (response.data === true) {
      handleSaveReasonModal();
    } else {
      Alert.alert('This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Return Reason validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};


const handleSaveReasonModal = () => {
  setIsLoading(true);
  const apiUrl = `${global?.userData?.productURL}${API.ADD_RETURN_REASON}`;
  const requestData = {
    returnReason: mReasonName,
    returnDescription: ReasonDesc,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setSelectedReason(
        response?.data?.response?.returnList[0]?.returnReason,
      );
      setSelectedReasonID(
        response?.data?.response?.returnList[0]?.id,
      );
      getReason();
      setIsLoading(false);
      setShowReasonList(false);
    })
    .catch(error => {
      console.error(
        'Error:',
        error.response ? error.response.data : error.message,
      );
      Alert.alert(
        'Error',
        error.response
          ? error.response.data.message
          : 'An unknown error occurred',
      );
      setIsLoading(false);
    });

  setReasonModal(false);
  setmReasonName('');
  setReasonDesc('');
};

// The main issue is in the getOrderPacking function where you're setting the reason
// but the reasonList might not be loaded yet when trying to find the matching ID

const getOrderPacking = (orderId, companyId) => {
  setLoading(true);
  const apiUrl = `${global?.userData?.productURL}${API.GET_ORDER_RETURNSEDIT_BY_ID}/${orderId}`;
  return axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      if (response.data?.response?.ordersList) {
        setOrderData(response.data.response.ordersList);

        const orderData = response.data.response.ordersList[0];
        if (orderData?.returnReason && !refreshing) {
          setSelectedReason(orderData.returnReason);
          
          // FIX: Set a timeout to ensure reasonList is loaded before finding the matching reason
          setTimeout(() => {
            const matchingReason = reasonList.find(
              reason => reason.returnReason === orderData.returnReason,
            );
            if (matchingReason) {
              console.log('Found matching reason:', matchingReason);
              setSelectedReasonID(matchingReason.id);
            } else {
              console.log('No matching reason found for:', orderData.returnReason);
              console.log('Available reasons:', reasonList);
            }
          }, 500);
          
          if (!remarks) {
            setRemarks(orderData.returnRemarks);
          }
        }
      } else {
        setOrderData([]);
      }
    })
    .catch(error => {
      console.error('Error fetching order packing:', error);
      setOrderData([]);
    })
    .finally(() => {
      setLoading(false);
    });
};

// BETTER SOLUTION: Modify the useEffect that handles when both reasonList and orderData are available
useEffect(() => {
  if (reasonList.length > 0 && orderData.length > 0 && !refreshing) {
    const orderDataItem = orderData[0];
    if (orderDataItem?.returnReason && !selectedReasonID) {
      const matchingReason = reasonList.find(
        reason => reason.returnReason === orderDataItem.returnReason,
      );
      if (matchingReason) {
        console.log('Setting reason from useEffect:', matchingReason);
        setSelectedReason(orderDataItem.returnReason);
        setSelectedReasonID(matchingReason.id);
      }
    }
  }
}, [reasonList, orderData, refreshing, selectedReasonID]);

// Also update the validation in handleSubmitReturn to be more specific:


// Also update the refreshData function to properly reset the reason ID:
const refreshData = async () => {
  console.log('Refreshing data...');
  if (orderId && companyId) {
    try {
      setRefreshing(true);
      
      // Reset all input quantities to 0
      const resetGroupedOrders = groupedOrders.map(pack => ({
        ...pack,
        orders: pack.orders.map(item => ({
          ...item,
          enterQty: 0
        }))
      }));
      setGroupedOrders(resetGroupedOrders);
      
      // Clear remarks and reason - IMPORTANT: Clear both reason and ID
      setRemarks('');
      setSelectedReason('');
      setSelectedReasonID(0);
      
      // Refresh order data and return details
      await Promise.all([
        getOrderPacking(orderId, companyId),
        getOrderReturnDetails(orderId)
      ]);
      
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }
};

const getOrderReturnDetails = (orderId) => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_ORDER_RETURN}/${orderId}`;
  return axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      if (response.data && Array.isArray(response.data)) {
        const shippedOrders = response.data.filter(order => order?.ship === 1);
        const grouped = groupOrdersByInvoiceAndPack(shippedOrders);
        setGroupedOrders(grouped);
        
        // Initialize calculations
        calculateOrderTotals(grouped);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

// Render functions
const renderOrderItem = ({item, index}) => {
  return (
    <View style={styles.card}>
  <View style={styles.cardHeader}>
    <View style={styles.leftSection}>
      {item.orderNoWithPrefix && (
        <Text style={styles.text}>
          <Text style={styles.label}>Order </Text>
          {item.orderNoWithPrefix}
        </Text>
      )}
      {item.customerName && (
        <Text style={styles.text}>
          <Text style={styles.label}>Customer: </Text>
          {item.customerName}
        </Text>
      )}
      {(item.companyName || item.cedgeCompanyLocationName) && (
        <Text style={styles.text}>
          <Text style={styles.label}>Company Location: </Text>
          {compFlag === 1 ? item.companyName : item.cedgeCompanyLocationName}
        </Text>
      )}
    </View>

    <TouchableOpacity 
      style={styles.submitButton}
      onPress={handleSubmitReturn}
      disabled={processing}
    >
      <Text style={styles.submitButtonText}>
        {processing ? 'Submitting...' : 'Submit Return'}
      </Text>
    </TouchableOpacity>
  </View>
</View>

    
  );
};

const d_pkg_flag = orderData.length > 0 ? orderData[0].d_pkg_flag : null;

const renderGroupHeader = (group, groupIndex) => {
  const d_pkg_flag = orderData.length > 0 ? orderData[0].d_pkg_flag : null;
  
  return (
    <View style={styles.groupHeader}>
      <View style={styles.groupHeaderone}>
        <Text style={styles.groupHeaderText}>
          Invoice: {group.invoiceNo}  
        </Text>
        {group.showPdf && (
  <TouchableOpacity
    style={styles.cellpdf}
    onPress={() => getPdfForOrderReturns(group.orderId, group.p_id)}
  >
    <Image
      style={styles.pdfimg}
      source={require('../../../assets/pdf.png')}
    />
  </TouchableOpacity>
)}


          <Text style={styles.creditAppliedText}>
            Credit Applied: ₹{group.creditApplied}
          </Text>
      </View>
      <Text style={styles.groupHeaderTextpack}>
        Pack: {group.packNo}
      </Text>
   
    </View>
  );
};

const renderTableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={[styles.tableHeaderText, styles.colNo]}>No.</Text>
    {d_pkg_flag === 0 && (
    <Text style={[styles.tableHeaderText, styles.colImage]}>Image</Text>
    )}
      {d_pkg_flag !== 0 && (
  <Text style={[styles.tableHeaderText, styles.colName]}>packages</Text>
)}
    <Text style={[styles.tableHeaderText, styles.colName]}>{d_pkg_flag === 0 ? 'Name' : 'styles'}</Text>
  
    {d_pkg_flag === 0 && (
    <Text style={[styles.tableHeaderText, styles.colColor]}>Color</Text>
    )}
    <Text style={[styles.tableHeaderText, styles.colSize]}>Size</Text>
    <Text style={[styles.tableHeaderText, styles.colShippedQty]}>Shipped Qty</Text>
    <Text style={[styles.tableHeaderText, styles.colQty]}>Return Qty</Text>
    <Text style={[styles.tableHeaderText, styles.colReturnQty]}>New Qty</Text>
    <Text style={[styles.tableHeaderText, styles.colPrice]}> {pdf_flag ? 'MRP' : 'PRICE'}</Text>
    {!pdf_flag && (
    <Text style={[styles.tableHeaderText, styles.fixeddiscPrice]}>Fixed Disc.</Text>
    )}
    <Text style={[styles.tableHeaderText, styles.discPrice]}>{pdf_flag ? 'M.Down' : 'Discount 1(%)'}</Text>
    <Text style={[styles.tableHeaderText, styles.discSecPrice]}> {pdf_flag ? 'Discount 1(%) ' : 'Discount 2(%) '}</Text>
    <Text style={[styles.tableHeaderText, styles.colGST]}>GST %</Text>
    <Text style={[styles.tableHeaderText, styles.colGross]}>Gross</Text>
  </View>
);

const renderTableRow = ({item, index, groupIndex}) => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCellText, styles.colNo]}>{item.styleNum || '-'}</Text>
    {d_pkg_flag === 0 && (
    <TouchableOpacity 
  style={[styles.tableCell, styles.colImage]}
  onPress={() => {
    if (item.imageUrl1) {
      setPreviewImageUri(item.imageUrl1);
      setIsPreviewVisible(true);
    }
  }}
>

  {item.imageUrl1 ? (
    <FastImage source={{uri: item.imageUrl1}} style={styles.productImage} />
  ) : (
    <View style={styles.noImage}>
      <Text style={styles.noImageText}>No Image</Text>
    </View>
  )}

</TouchableOpacity>
)}
    {d_pkg_flag !== 0 && (
    <Text style={[styles.tableCellText, styles.colName]}>{item.pkgName || '-'}</Text>
    )}
    <Text style={[styles.tableCellText, styles.colName]}>{item.styleName || '-'}</Text>
    {d_pkg_flag === 0 && (
    <Text style={[styles.tableCellText, styles.colColor]}>{item.colorName || '-'}</Text>
    )}
<Text style={[styles.tableCellText, styles.colSize]}>
  {d_pkg_flag === 0 ? (item.size || '-') : (item.sizes || '-')}
</Text>
    <Text style={[styles.tableCellText, styles.colShippedQty]}>{item.shipQty || 0}</Text>
    <Text style={[styles.tableCellText, styles.colShippedQty]}>{item.currentReturnQty || 0}</Text>

    <View style={[styles.tableCell, styles.colQty]}>
      <TextInput
        style={styles.qtyInput}
        placeholder="Qty"
        placeholderTextColor="#000"
        keyboardType="numeric"
        value={item.enterQty?.toString() || ''}
        onChangeText={(text) => handleQuantityChange(text, groupIndex, index)}
      />
    </View>
    
    <Text style={[styles.tableCellText, styles.colPrice]}>₹{item.price || 0}</Text>
    {!pdf_flag && (
    <Text style={[styles.tableCellText, styles.fixeddiscPrice]}>{item.discThird || 0}</Text>
    )}
    {/* Fix: Show discount percentage, not amount */}
    <Text style={[styles.tableCellText, styles.discPrice]}>{item.disc || 0}</Text>
    <Text style={[styles.tableCellText, styles.discSecPrice]}>{item.discSec || 0}</Text>
    <Text style={[styles.tableCellText, styles.colGST]}>{item.gst || 0}</Text>
    <Text style={[styles.tableCellText, styles.colGross]}>
      ₹{(item.gross || 0).toFixed(2)}
    </Text>
  </View>
);


const OrderDetailRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row' }}>
    <Text
      style={{
        width: 155,
        textAlign: 'right',
        color: '#000',
        marginVertical: 3,
      }}
    >
      {label}
    </Text>
    <Text
      style={{ width: 50, textAlign: 'center', color: '#000', marginLeft: 20 }}
    >
      :
    </Text>
    <Text
      style={{ width: 80, textAlign: 'right', color: '#000' }}
      adjustsFontSizeToFit
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);



  const renderGroupSummary = (groupIndex) => {
    return (
      <View style={styles.groupSummary}>
        <OrderDetailRow label="Total Qty" value={totalQtyArr[groupIndex] || 0} />
        <OrderDetailRow label="Total GST" value={`₹${(totalGstArr[groupIndex] || 0).toFixed(2)}`} />
        <OrderDetailRow label="Total Discount(1)" value={`₹${(totalDiscountArr[groupIndex] || 0).toFixed(2)}`} />
        {!pdf_flag && (
        <OrderDetailRow label="Total Discount(2)" value={`₹${(totalDiscountSecArr[groupIndex] || 0).toFixed(2)}`} />
        )}
        <OrderDetailRow label="Total Cost" value={`₹${(totalAmountArr[groupIndex] || 0).toFixed(2)}`} />
      </View>
    );
  };
  

const renderGroupedItems = () => {
  return groupedOrders.map((group, groupIndex) => {
    return (
      <View key={`group-${groupIndex}`} style={styles.groupContainer}>
        {renderGroupHeader(group, groupIndex)}

        {group.orders.length > 0 && (
          <ScrollView horizontal={true} style={styles.horizontalScroll}>
            <View>
              {renderTableHeader()}
              <FlatList
                data={group.orders}
                renderItem={({item, index}) => renderTableRow({item, index, groupIndex})}
                keyExtractor={(item, index) =>
                  `${group.invoiceNo}-${group.packNo}-${item.pc_id?.toString() || index.toString()}`
                }
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        )}
         {renderGroupSummary(groupIndex)}
      </View>
    );
  });
};
 // Updated buildOrderReturnObject function
// Updated buildOrderReturnObject function - Fix for selectedReasonID
const buildOrderReturnObject = (
  orderData,
  groupedOrders,
  newOrder,
  selectedReasonID,
  remarks,
  selectedId,
  userId,
  companyId,
  userName,
  pdfFlag = 0,
  gstPriceCalFlag = 0
) => {
  // Get the base order information
  const baseOrder = orderData[0];
  
  // Initialize totals
  let totalQty = 0;
  let totalAmount = 0;
  let totalGst = 0;
  let totalDiscount = 0;
  let totalDiscountSec = 0;
  
  // Build orderLineItems array (unique items across all packs)
  const orderLineItems = [];
  const processedLineItems = new Map();
  
  groupedOrders.forEach(pack => {
    pack.orders.forEach(item => {
      // UPDATED: Support decimal quantities with parseFloat
      const enterQty = parseFloat(item.enterQty) || 0;
      const retQty = parseFloat(item.retQty) || 0;
      const shipQty = parseFloat(item.shipQty) || 0;
    
      // UPDATED: Calculate with decimal precision
      const maxReturnableQty = parseFloat((shipQty - retQty).toFixed(2));
    
      // UPDATED: Decimal-aware validation
      if (enterQty > maxReturnableQty) {
        throw new Error(
          `Quantity (${enterQty}) exceeds available return quantity (${maxReturnableQty}) for ${item.styleName || 'item'}`
        );
      }
      
      // Use styleId and size as unique key
      const key = `${item.styleId}_${item.size || item.sizes}`;
      
      if (!processedLineItems.has(key)) {
        // Find matching item from original order data
        const originalItem = baseOrder?.orderLineItems?.find(oli => 
          oli.styleId === item.styleId && 
          (oli.size === item.size || oli.size === item.sizes)
        );
        
        // UPDATED: Calculate totals with decimal support
        const totalEnterQty = groupedOrders.reduce((sum, p) => {
          return sum + p.orders
            .filter(o => o.styleId === item.styleId && 
                        (o.size === item.size || o.sizes === item.size))
            .reduce((itemSum, o) => itemSum + (parseFloat(o.enterQty) || 0), 0);
        }, 0);
        
        const totalRetQty = groupedOrders.reduce((sum, p) => {
          return sum + p.orders
            .filter(o => o.styleId === item.styleId && 
                        (o.size === item.size || o.sizes === item.size))
            .reduce((itemSum, o) => itemSum + (parseFloat(o.retQty) || 0), 0);
        }, 0);
        
        const totalItemQty = parseFloat(enterQty.toFixed(2)); // Round to 2 decimal places
        
        // UPDATED: Decimal-aware validation
        if (totalItemQty > parseFloat(item.shipQty)) {
          throw new Error(`Quantity (${totalItemQty}) is greater than Ship Qty (${item.shipQty}) for ${item.styleName}`);
        }
        
        // Use the calculated values from the item (which includes discounts and GST)
        const unitPrice = item.price || originalItem?.price || 0;
        const gstPercentage = item.gst || originalItem?.gst || 0;
        
        // Calculate amounts based on the calculation logic you're using
        let gstAmount = 0;
        let grossAmount = 0;
        let discountAmount = 0;
        let discountAmountSec = 0;
        
        if (totalItemQty > 0) {
          if (pdfFlag === 1) {
            // PDF calculation logic with decimal support
            discountAmount = parseFloat((
              unitPrice - (unitPrice * (item.disc || 0)) / 100
            ).toFixed(4)); // More precision for intermediate calculations
            
            if (baseOrder?.inclusive === 1 && gstPercentage) {
              discountAmount = parseFloat((
                discountAmount / (1.0 + (gstPercentage / 100))
              ).toFixed(4));
            }
            
            if (gstPriceCalFlag === 1 && gstPercentage) {
              const orgPrice = parseFloat((
                unitPrice / (1.0 + (gstPercentage / 100))
              ).toFixed(4));
              discountAmount = parseFloat((
                orgPrice - (orgPrice * (item.disc || 0)) / 100
              ).toFixed(4));
            }
            
            // UPDATED: Use decimal quantity in calculations
            discountAmountSec = parseFloat((
              (totalItemQty * discountAmount * (item.discSec || 0)) / 100
            ).toFixed(4));
            
            gstAmount = parseFloat((
              ((totalItemQty * discountAmount - discountAmountSec) * gstPercentage) / 100
            ).toFixed(4));
            
            grossAmount = parseFloat((
              totalItemQty * discountAmount - discountAmountSec + gstAmount
            ).toFixed(2)); // Final amount rounded to 2 decimal places
            
          } else {
            // Non-PDF calculation logic with decimal support
            let fixedPrice = unitPrice;
            if (item.discThird) {
              fixedPrice -= item.discThird;
            }
            
            // UPDATED: Use decimal quantity in calculations
            const actualDiscountAmount = parseFloat((
              (totalItemQty * fixedPrice * (item.disc || 0)) / 100
            ).toFixed(4));
            
            discountAmountSec = parseFloat((
              ((totalItemQty * fixedPrice - actualDiscountAmount) * (item.discSec || 0)) / 100
            ).toFixed(4));
            
            gstAmount = parseFloat((
              ((totalItemQty * fixedPrice - actualDiscountAmount - discountAmountSec) * gstPercentage) / 100
            ).toFixed(4));
            
            grossAmount = parseFloat((
              totalItemQty * fixedPrice - actualDiscountAmount - discountAmountSec + gstAmount
            ).toFixed(2)); // Final amount rounded to 2 decimal places
            
            discountAmount = actualDiscountAmount;
          }
        }
        
        orderLineItems.push({
          qty: originalItem?.qty || item.shipQty || 0,
          orderLineitemId: originalItem?.orderLineitemId || 0,
          styleId: item.styleId,
          colorId: item.colorId || 0,
          gscodeMapId: originalItem?.gscodeMapId || 0,
          size: item.size || item.sizes || "",
          gsCode: originalItem?.gsCode || 0,
          availQty: originalItem?.availQty || item.shipQty || 0,
          boxQty: item.boxQty || originalItem?.boxQty || 0,
          shipQty: item.shipQty || 0,
          unitPrice: unitPrice,
          orgPrice: unitPrice,
          price: unitPrice,
          gross: grossAmount,
          enterqty: parseFloat(totalEnterQty.toFixed(2)), // UPDATED: Ensure decimal precision
          sizeId: item.sizeId || originalItem?.sizeId || 0,
          discountPercentage: item.disc || 0,
          discountPercentageSec: item.discSec || 0,
          discountPercentageThird: item.discThird || 0,
          discountAmount: discountAmount,
          gst: gstPercentage,
          gstAmnt: gstAmount,
          total: grossAmount,
          totQty: parseFloat(totalItemQty.toFixed(2)), // UPDATED: Decimal precision
          retQty: parseFloat(totalRetQty.toFixed(2)), // UPDATED: Decimal precision
          styleName: item.styleName || originalItem?.styleName || "",
          poId: originalItem?.poId || 0,
          tsiId: originalItem?.tsiId || 0
        });
        
        processedLineItems.set(key, true);
      }
    });
  });
  
  // Build orderPackingList array with proper calculations
  const orderPackingList = groupedOrders.map(pack => {
    // Use the calculated values from pack totals (already decimal-aware from calculateOrderTotals)
    const packRetTotalQty = parseFloat((pack.retTotalQty || 0).toFixed(2));
    const packRetTotalAmnt = parseFloat((pack.retTotalAmnt || 0).toFixed(2));
    const packRetTotalGst = parseFloat((pack.retTotalGst || 0).toFixed(2));
    const packRetTotalDisc = parseFloat((pack.retTotalDisc || 0).toFixed(2));
    const packRetTotalDiscSec = parseFloat((pack.retTotalDiscSec || 0).toFixed(2));
    
    // Build styleList for this pack
    const styleList = pack.orders.map(style => {
      // UPDATED: Support decimal quantities
      const enterQty = parseFloat(style.enterQty) || 0;
      const retQty = parseFloat(style.retQty) || 0;
      const totalQty = parseFloat((enterQty + retQty).toFixed(2));
      
      return {
        pc_id: style.pc_id || 0,
        styleNum: style.styleNum || 0,
        styleId: style.styleId,
        colorId: style.colorId || 0,
        size: style.size || "",
        sizes: style.sizes || "",
        sizeId: style.sizeId || 0,
        shipQty: style.shipQty || 0,
        enterqty: parseFloat(enterQty.toFixed(2)), // UPDATED: Decimal precision
        disc: style.disc || 0,
        discSec: style.discSec || 0,
        discThird: style.discThird || 0,
        gst: style.gst || 0,
        price: style.price || 0,
        retQty: parseFloat(retQty.toFixed(2)), // UPDATED: Decimal precision
        styleName: style.styleName || "",
        pkgName: style.pkgName || "",
        colorName: style.colorName || "",
        sizeAndQty: style.sizeAndQty || "",
        gross: style.gross || 0,
        boxQty: style.boxQty || 0,
        imageUrl1: style.imageUrl1 || "",
        totQty: totalQty // UPDATED: Decimal precision
      };
    });
    
    // UPDATED: Calculate pack total quantity with decimal support
    const packTotalQty = parseFloat(pack.orders.reduce((sum, item) => {
      return sum + (parseFloat(item.enterQty) || 0) + (parseFloat(item.retQty) || 0);
    }, 0).toFixed(2));
    
    // Add pack totals to overall totals
    totalQty = parseFloat((totalQty + packTotalQty).toFixed(2));
    totalAmount = parseFloat((totalAmount + packRetTotalAmnt).toFixed(2));
    totalGst = parseFloat((totalGst + packRetTotalGst).toFixed(2));
    totalDiscount = parseFloat((totalDiscount + packRetTotalDisc).toFixed(2));
    totalDiscountSec = parseFloat((totalDiscountSec + packRetTotalDiscSec).toFixed(2));
    
    return {
      p_id: pack.p_id || 0,
      invoiceNo: pack.invoiceNo || "",
      packNo: pack.packNo || "",
      retTotalAmnt: packRetTotalAmnt,
      retTotalDisc: packRetTotalDisc,
      retTotalDiscSec: packRetTotalDiscSec,
      retTotalGst: packRetTotalGst,
      retTotalQty: packTotalQty, // UPDATED: Use calculated decimal total
      d_pkg_flag: baseOrder?.d_pkg_flag || 0,
      creditApplied: pack.creditApplied || 0,
      totAmnt: pack.totAmnt || packRetTotalAmnt,
      returnTally: pack.returnTally || 0,
      returnTallyDate: pack.returnTallyDate || "",
      orderId: pack.orderId || baseOrder.orderId,
      // UPDATED: Decimal-aware check for showing tally
      showTally: (pack.orders.reduce((sum, item) => sum + (parseFloat(item.enterQty) || 0), 0)) > 0,
      styleList: styleList
    };
  });
  
  // Build the main order return object
  const orderReturnObject = {
    // Order identification
    orderId: baseOrder.orderId,
    shippingAddressId: baseOrder.shippingAddressId,
    customerLocation: baseOrder.customerLocation,
    customerId: baseOrder.customerId,
    customerType: baseOrder.customerType,
    tQty: totalQty || 0,
    
    // Arrays
    orderLineItems: orderLineItems,
    orderPackingList: orderPackingList,
    
    returnReasonId: selectedReasonID || 0,
    returnRemarks: remarks || "",
    returnType: parseInt(selectedId) || 0,
    
    // User and company info
    userId: userId,
    companyId: companyId,
    userName: userName,
    
    // UPDATED: Calculated totals with decimal precision
    totalQty: totalQty,
    totalAmount: totalAmount,
    totalGst: totalGst,
    totalDiscount: totalDiscount,
    totalDiscountSec: totalDiscountSec,
    
    // Additional required fields
    d_pkg_flag: baseOrder?.d_pkg_flag || 0,
    pdfFlag: pdfFlag,
    inclusive: baseOrder?.inclusive || 0,
    gst_price_cal_flag: gstPriceCalFlag,
    linkType: 0,
    orderStatus: baseOrder?.orderStatus || "PENDING",
    barcodeSet: []
  };
  
  return orderReturnObject;
};

// Updated handleSubmitReturn function
// Updated handleSubmitReturn function with proper validation
const handleSubmitReturn = async () => {
  try {
    setProcessing(true);
    console.log('Starting return submission');

    // UPDATED: Validate return quantities with decimal support
    const hasNewReturnQty = groupedOrders.some(pack => 
      pack.orders.some(item => (parseFloat(item.enterQty) || 0) > 0)
    );

    if (!hasNewReturnQty) {
      console.log('Validation Failed: No new return quantities entered');
      Alert.alert('Error', 'Please enter new return quantities');
      return;
    }

    // Additional validation for decimal quantities
    const hasInvalidQty = groupedOrders.some(pack => 
      pack.orders.some(item => {
        const enterQty = parseFloat(item.enterQty) || 0;
        const retQty = parseFloat(item.retQty) || 0;
        const shipQty = parseFloat(item.shipQty) || 0;
        const maxReturnable = shipQty - retQty;
        
        // Check if entered quantity exceeds returnable quantity
        return enterQty > 0 && enterQty > maxReturnable;
      })
    );

    if (hasInvalidQty) {
      console.log('Validation Failed: Invalid return quantities');
      Alert.alert('Error', 'One or more return quantities exceed the available returnable quantity');
      return;
    }

    // Validate return reason is selected
    if (!selectedReasonID || selectedReasonID === 0) {
      console.log('Validation Failed: No return reason selected');
      Alert.alert('Error', 'Please select a return reason');
      return;
    }

    // Build the order return object
    let orderReturnData;
    try {
      console.log('Building order return object...');
      console.log('Selected Reason ID:', selectedReasonID);
      orderReturnData = buildOrderReturnObject(
        orderData,
        groupedOrders,
        newOrder,
        selectedReasonID,
        remarks,
        selectedId,
        userId,
        companyId,
        global?.userData?.name || 'Unknown User',
        pdfFlag,
        gstPriceCalFlag
      );
      console.log('Order Return Object:', JSON.stringify(orderReturnData, null, 2));
    } catch (validationError) {
      console.log('Validation Error:', validationError);
      Alert.alert('Validation Error', validationError.message);
      return;
    }

    // Make API call
    const response = await axios.post(
      global?.userData?.productURL + API.ADD_ORDER_RETURN, 
      orderReturnData, 
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      }
    );

    console.log('API Response:', JSON.stringify(response.data));
    if (response.data?.status?.success) {
      console.log('Return submitted successfully');
      Alert.alert('Success', 'Order return submitted successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('OrderReturns');
          }
        }
      ]);
    } else {
      const apiErrorMsg = response.data?.status?.message || 'Failed to submit return';
      console.log('API Response Error:', apiErrorMsg);
      Alert.alert('Error', apiErrorMsg);
    }

  } catch (error) {
    console.error('Exception in handleSubmitReturn:', error);

    let errorMessage = 'Failed to submit return. Please try again.';

    if (error.response) {
      console.log('Server error response:', error.response.data);
      errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`;
        
      // Handle specific error cases
      if (error.response.data.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      }
    } else if (error.request) {
      console.log('Network error (no response)');
      errorMessage = 'Network error. Please check your connection.';
    } else {
      console.log('Error message:', error.message);
      errorMessage = error.message;
    }

    Alert.alert('Error', errorMessage);
  } finally {
    setProcessing(false);
  }
};
  return (
    <ScrollView style={styles.container}>
       
     
      {loading ? (
        <View style={styles.noDataContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : orderData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Sorry, no results found!</Text>
        </View>
      ) : (
        <FlatList
          data={orderData}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) =>
            item.orderId?.toString() || index.toString()
          }
          scrollEnabled={false}
        />
      )}

      <Text style={styles.headerTxt}>{'Return Reason'}</Text>

      <View style={styles.container1}>
        <View style={styles.container2}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={handReasonDropDown}>
            <Text style={styles.dropdownButtonText}>
              {selectedReason ? selectedReason : 'Select Return Reason'}
            </Text>
            <Image
              source={require('../../../assets/dropdown.png')}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.container4}>
          <TouchableOpacity
            onPress={toggleSeasonReasonModal}
            style={styles.plusButton}>
            <Image
              style={styles.plusIcon}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.remarksContainer}>
          <TextInput
            style={styles.remarksInput}
            placeholder="Remarks"
            placeholderTextColor="#000"
            value={remarks}
            onChangeText={text => setRemarks(text)}
          />
        </View>
      </View>

      {showReasonList && (
        <View style={styles.dropdownContainer}>
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#000"
            placeholder="Search Return Reasons"
            onChangeText={filterReason}
          />

          {filteredReasonList.length === 0 && !isLoading ? (
            <Text style={styles.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView nestedScrollEnabled={true}>
              {filteredReasonList?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectReason(item)}>
                  <Text style={styles.dropdownItemText}>
                    {item?.returnReason}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    <TouchableOpacity onPress={handleOpenReturnModal}>
        <Text style={styles.viewText}>View Order Returns</Text>
      </TouchableOpacity>
      <View style={styles.radiobutheader}>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={handleSelect}
          selectedId={selectedId}
          containerStyle={styles.radioGroup}
        />
      </View>
     
      {groupedOrders.length > 0 && (
        <View style={styles.tableContainer}>
          {renderGroupedItems()}
        </View>
      )}
        <Modal
        animationType="fade"
        transparent={true}
        visible={ReasonModal && editShortcutKey}
        onRequestClose={() => {
          toggleSeasonReasonModal();
        }}>
        <View style={styles.modalContainerr}>
          <View style={styles.modalContentt}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleCentered}>
                {'Add New Return Reason'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseReasonModal}
                style={styles.modalCloseButton}>
                <Image
                  style={styles.modalCloseIcon}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>
              {'Return Reason * '}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter return reason"
              placeholderTextColor="#000"
              onChangeText={text => setmReasonName(text)}
              value={mReasonName}
            />

            <Text style={styles.modalLabel}>
              {'Return Description * '}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter return description"
              placeholderTextColor="#000"
              onChangeText={text => setReasonDesc(text)}
              value={ReasonDesc}
            />

            <TouchableOpacity
              style={[styles.saveButton, processing && styles.saveButtonDisabled]}
              onPress={ValidateReason}
              disabled={processing}>
              <Text style={styles.saveButtonText}>
                {processing ? 'Processing' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  transparent={true}
  visible={isPreviewVisible}
  onRequestClose={() => setIsPreviewVisible(false)}>
  <TouchableOpacity
    style={styles.modalOverlayImage}
    activeOpacity={1}
    onPress={() => setIsPreviewVisible(false)}>
    <View style={styles.modalContentImage}>
      <TouchableOpacity
        style={styles.closeButtonImageModel}
        onPress={() => setIsPreviewVisible(false)}>
        <FastImage
          style={{height: 30, width: 30, tintColor: '#000'}}
          source={require('../../../assets/close.png')}
        />
      </TouchableOpacity>
      <FastImage
        style={styles.fullscreenImage}
        source={
          previewImageUri
            ? {uri: previewImageUri}
            : require('../../../assets/NewNoImage.jpg')
        }
        resizeMode="contain"
      />
    </View>
  </TouchableOpacity>
</Modal>
<Modal
  visible={isReturnModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setIsReturnModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Modal Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.title}>Order Returns</Text>
        <TouchableOpacity onPress={() => setIsReturnModalVisible(false)} style={styles.closeButton}>
          <Image style={styles.modalCloseIcon} source={require('../../../assets/close.png')} />
        </TouchableOpacity>
      </View>

      {/* Loader or List */}
      {isFetchingReturns ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : orderReturnList?.length > 0 ? (
        <>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.headerCell}>Order Return No</Text>
            <Text style={styles.headerCell}>Invoice Nos</Text>
            <Text style={styles.headerCell}>Total Qty</Text>
            <Text style={styles.headerCell}>Total Amount</Text>
            <Text style={styles.headerCell}>Returned By</Text>
            <Text style={styles.headerCellpdf}>PDF</Text>
          </View>

          {/* Table Rows */}
          <FlatList
            data={orderReturnList}
            renderItem={renderOrderReturnItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      ) : (
        <View style={{ alignItems: 'center',}}>
          <Text style={{ fontSize: 16, color: '#000',fontWeight:"bold" }}>No data available</Text>
        </View>
      )}
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};


const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
    },
    headerTxt: {
      fontSize: 16,
      fontWeight: 'bold',
      marginHorizontal: 15,
      marginBottom: 10,
      marginTop: 20,
      color: '#000',
    },
    container1: {
      flexDirection: 'row',
      marginHorizontal: 15,
      alignItems: 'center',
    },
    container2: {
      flex: 1,
      marginRight: 10,
    },
    container3: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    container4: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusButton: {
      padding: 5,
    },
    dropdownButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    dropdownButtonText: {
      fontWeight: '600',
      color: '#000',
    },
    dropdownIcon: {
      width: 20,
      height: 20,
    },
    plusIcon: {
      height: 30,
      width: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    remarksContainer: {
      flex: 1,
    },
    remarksInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: '#000',
    },
    dropdownContainer: {
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray',
      borderWidth: 1,
      marginTop: 5,
    },
    searchInput: {
      marginTop: 10,
      borderRadius: 10,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginHorizontal: 10,
      paddingLeft: 10,
      marginBottom: 10,
      color: '#000000',
    },
    dropdownItem: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#8e8e8e',
    },
    dropdownItemText: {
      fontWeight: '600',
      marginHorizontal: 15,
      color: '#000',
    },
    modalHeader: {
      backgroundColor: '#007bff',
      borderRadius: 10,
      marginHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 5,
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    modalTitleCentered: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      flex: 1,
    },
    modalCloseButton: {
      alignSelf: 'flex-end',
    },
    modalCloseIcon: {
      height: 30,
      width: 30,
      marginRight: 5,
    },
    modalLabel: {
      fontWeight: 'bold',
      color: '#000',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 5,
      padding: 10,
      marginVertical: 10,
      fontSize: 16,
      color: '#000',
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    card: {
      marginVertical: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    leftSection: {
      flex: 1,
    },
    submitButton: {
      paddingVertical: 8,
      paddingHorizontal: 6,
      backgroundColor: '#007AFF',
      borderRadius: 5,
      marginRight:10
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    text: {
      color: '#000',
      fontSize: 16,
      marginLeft:13
    },
    label: {
      fontWeight: 'bold',
      color: '#000',
    },
    loadingText: {
      fontSize: 18,
      color: '#000',
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    noDataText: {
      fontSize: 18,
      color: '#666',
      textAlign: 'center',
    },
    noCategoriesText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 20,
    },
    modalContainerr: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentt: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginVertical: 10,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    radioGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    radiobutheader: {
      backgroundColor: '#fff',
      borderColor: '#ddd',
      marginTop: 15,
    },
    // Table styles
    tableContainer: {
      marginTop: 10,
    },
    horizontalScroll: {
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottomWidth: 2,
      borderBottomColor: '#ddd',
      paddingVertical: 10,
    },
    tableHeaderText: {
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      fontSize: 12,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingVertical: 8,
      alignItems: 'center',
    },
    tableCell: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    tableCellText: {
      color: '#000',
      textAlign: 'center',
      fontSize: 11,
    },
    colNo: { width: 40 },
    colImage: { width: 60 },
    colName: { width: 120 },
    colColor: { width: 80 },
    colSize: { width: 60 },
    colShippedQty: { width: 80 },
    colQty: { width: 80 },
    colReturnQty: { width: 80 },
    colPrice: { width: 80 },
    fixeddiscPrice: { width: 80 },
    discPrice: { width: 80 },
    discSecPrice: { width: 80 },
    colGST: { width: 60 },
    colGross: { width: 100 },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 5,
    },
    noImage: {
      width: 50,
      height: 50,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
    },
    noImageText: {
      fontSize: 8,
      color: '#666',
      textAlign: 'center',
    },
    qtyInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 3,
      width: 60,
      height: 35,
      textAlign: 'center',
      color: '#000',
      fontSize: 12,
    },
    totalContainer: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      borderRadius: 5,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    totalText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'right',
    },
    groupContainer: {
        marginBottom: 20,
      },
      groupHeader: {

      },
      groupHeaderone: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        paddingHorizontal: 10,
        justifyContent:"space-between"
      },
      
      groupHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary || '#333',
        marginBottom: 4,
      },
      groupHeaderTextpack:{
        marginLeft:10,
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
      },
      creditAppliedText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
        marginBottom: 4,

      },
      groupSummary: {
    justifyContent:'flex-end',
    alignItems: 'flex-end',
    marginRight:10
      },
      summaryText:{
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
      },
      radioLabel: {
        color: '#000',
      },
      modalOverlayImage: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContentImage: {
        width: '90%',
        height: '60%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
      },
      fullscreenImage: {
        width: '100%',
        height: '100%',
      },
      closeButtonImageModel: {
        backgroundColor: colors.color2,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
      },
      viewText: {
        color: 'blue',
        textDecorationLine: 'underline',
        marginTop:5,
        marginLeft:15
      },
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 10,
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        maxHeight: '80%',
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007BFF',
      },
      row: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        alignItems: 'center',
      },
      headerRow: {
        backgroundColor: '#e7f0f7',
      },
      cell: {
        flex: 1,
        fontSize: 12,
        paddingHorizontal: 4,
        color:'#000',
        marginLeft:5
      },
      cellpdf:{
        marginHorizontal:2
      },
      headerCell: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 12,
        paddingHorizontal: 4,
      },
      headerCellpdf:{
        fontWeight: 'bold',
        fontSize: 12,
        marginHorizontal:5
      },
      icon: {
        flex: 0.5,
        textAlign: 'center',
      },
      closeButton: {
        backgroundColor: colors.color2,
        padding: 5,
      marginVertical:5,
        alignItems: 'center',
        borderRadius: 5,
      },
      pdfimg: {
        height: 30,
        width: 30,
        paddingHorizontal: 4,
        marginRight:40
      },
      pdfimgmodel: {
        height: 30,
        width: 30,
        paddingHorizontal: 4,
      },
  });

export default OrderReturnsEdit;

