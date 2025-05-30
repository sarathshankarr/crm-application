import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useNavigation, useRoute} from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';

// Define pdfPath outside the component
let pdfPath = null;

const PackingOrders = () => {
  const navigation = useNavigation();
  const [packingOrders, setPackingOrders] = useState([]);
  const [invoiceOrderData, setInvoiceOrderData] = useState(null);
  const [invoiceFormat, setInvoiceFormat] = useState(null);
  const [dPkgFlag, setDPkgFlag] = useState(null);
  const [customerName, setCustomerName] = useState('');
const [orderNoWithPrefix, setOrderNum] = useState('');


  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const {orderId} = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (orderId) {
      getOrderPacking(orderId);
    }
  }, [orderId]);

  const getOrderPacking = orderId => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ORDER_PACKING}/${orderId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setPackingOrders(response.data);
        getInvoiseFormat(orderId);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const getInvoiseFormat = orderId => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_ORDER}/${orderId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const orderData = response?.data?.response?.ordersList?.[0];
        console.log('Order Data:', orderData);
        setInvoiceOrderData(orderData);
        setInvoiceFormat(orderData?.invoiceFormat);
        setDPkgFlag(orderData?.d_pkg_flag); // Add this line
        setCustomerName(orderData?.customerName);
        setOrderNum(orderData?.orderNoWithPrefix);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching invoice format:', error);
        setLoading(false);
      });
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

  const getInvoice = async (orderId, pId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF}/${orderId}/P/${pId}/I`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to save the PDF.',
          );
          return;
        }
      }

      const pdfPath =
        Platform.OS === 'android'
          ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Invoice_${orderId}_${pId}.pdf`
          : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Invoice_${orderId}_${pId}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const getInvoiceInvoiceFormat = async (orderId, pId, invoiceFormat) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF_INVOICEFORMAT}/${orderId}/P/${pId}/${invoiceFormat}/I`;
    console.log('API URL:', apiUrl);
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to save the PDF.',
          );
          return;
        }
      }

      const pdfPath =
        Platform.OS === 'android'
          ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Invoice_${orderId}_${pId}.pdf`
          : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Invoice_${orderId}_${pId}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const getPackingList = async (orderId, pId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF}/${orderId}/P/${pId}/P`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;

      //   pdfPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Pakinglist_${orderId}_${pId}.pdf`;

      //   await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      //   Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      // }
      const pdfPath =
        Platform.OS === 'android'
          ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Pakinglist_${orderId}_${pId}.pdf`
          : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Pakinglist_${orderId}_${pId}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const getPackingListInvoiceFormat = async (orderId, pId, invoiceFormat) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF}/${orderId}/P/${pId}/${invoiceFormat}/P`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;

      //   pdfPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Pakinglist_${orderId}_${pId}.pdf`;

      //   await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      //   Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      // }
      const pdfPath =
        Platform.OS === 'android'
          ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Pakinglist_${orderId}_${pId}.pdf`
          : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Pakinglist_${orderId}_${pId}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const renderOrder = ({item}) => (
    <View style={{borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
      <View style={styles.orderContainer}>
        <Text style={styles.text}>{item.p_id}</Text>
        <Text style={styles.text1}>{item.totQty}</Text>
        <Text style={{textAlign: 'center', flex: 0.4, color: '#000'}}>
          {item.shipQty}
        </Text>
        <Text style={styles.text2}>{item.totAmnt}</Text>
        <Text style={styles.text3}>{item.packNo}</Text>
        <Text style={styles.text4}>{item.packUserName}</Text>
        <Text style={styles.text5}>{item.shipUserName}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 10,
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity
          onPress={() => {
            if (invoiceFormat !== 0) {
              getInvoiceInvoiceFormat(orderId, item.p_id, invoiceFormat);
            } else {
              getInvoice(orderId, item.p_id);
            }
          }}>
          <Image
            style={{height: 30, width: 30, alignSelf: 'center'}}
            source={require('../../../assets/packagelist.png')}
          />
          <Text style={{marginHorizontal: 10, color: '#000'}}>Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (invoiceFormat === 2 && dPkgFlag === 0) {
              getPackingListInvoiceFormat(orderId, item.p_id, invoiceFormat);
            } else {
              getPackingList(orderId, item.p_id);
            }
          }}
          style={{marginHorizontal: 10}}>
          <Image
            style={{height: 30, width: 30, alignSelf: 'center'}}
            source={require('../../../assets/invoice.png')}
          />
          <Text style={{color: '#000'}}>PackingList</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // if (loading) {
  //   return <ActivityIndicator size="large" color="#0000ff" />;
  // }

  return (
    <SafeAreaView style={styles.container}>
    <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
  {/* Back Button */}
  <TouchableOpacity
    onPress={handleGoBack}
    style={{
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
      padding: 5,
      marginRight: 10,
    }}>
    <Image
      style={{height: 25, width: 25}}
      source={require('../../../assets/back_arrow.png')}
    />
  </TouchableOpacity>

  {/* Customer Info */}
  <View style={{flex: 1}}>
    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#000'}}>
      Customer Name: {customerName || 'N/A'}
    </Text>
    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#000'}}>
      Order No: {orderNoWithPrefix || 'N/A'}
    </Text>
  </View>
</View>

      <View style={styles.header}>
        <Text style={styles.headerText}>ID</Text>
        <Text style={styles.headerText1}>Packed Qty</Text>
        <Text style={{textAlign: 'center', flex: 0.5, color: '#000'}}>
          ship Qty
        </Text>
        <Text style={styles.headerText5}>Total Amnt</Text>
        <Text style={styles.headerText2}>Packing Slip No</Text>
        <Text style={styles.headerText3}>Pack By</Text>
        <Text style={styles.headerText4}>Ship By</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={packingOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.p_id.toString()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    textAlign: 'center',
    flex: 0.4,
    color: '#000',
  },
  headerText1: {
    textAlign: 'center',
    flex: 0.6,
    color: '#000',
  },
  headerText5: {
    textAlign: 'center',
    flex: 0.6,
    color: '#000',
  },
  headerText2: {
    textAlign: 'center',
    flex: 0.8,
    marginLeft: 5,
    color: '#000',
  },
  headerText3: {
    textAlign: 'center',
    flex: 1,
    color: '#000',
  },
  headerText4: {
    textAlign: 'center',
    flex: 0.8,
    color: '#000',
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  text: {
    textAlign: 'center',
    flex: 0.4,
    color: '#000',
  },
  text1: {
    textAlign: 'center',
    flex: 0.8,
    color: '#000',
  },
  text2: {
    textAlign: 'center',
    flex: 1,
    color: '#000',
  },
  text3: {
    textAlign: 'center',
    flex: 1,
    color: '#000',
  },
  text4: {
    textAlign: 'center',
    flex: 1,
    color: '#000',
  },
  text5: {
    textAlign: 'center',
    flex: 1,
    marginLeft: 3,
    color: '#000',
  },
  pdf: {
    flex: 8,
    width: '100%',
    height: '100%',
  },
});

export default PackingOrders;
