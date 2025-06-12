import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {ColorContext} from '../../components/colortheme/colorTheme';

const CreditNotesEdit = () => {
  const route = useRoute();
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const {cn_id, customerName, orderNoWithPrefix} = route.params;
  const [stylesData, setStylesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pkgFlag, setPkgFlag] = useState(null);

  const openImageModal = uri => {
    setSelectedImage(uri);
    setImageModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setImageModalVisible(false);
  };

  useEffect(() => {
    getCreitNotedEdit();
  }, []);

  const getCreitNotedEdit = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_CREDI_TNOTES_EDIT}/${cn_id}`;
    console.log('apiUrl', apiUrl);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const list = response?.data?.response?.creditNoteList || [];
        setStylesData(list);

        if (list.length > 0) {
          setPkgFlag(list[0].pkgFlag); // ✅ Set the pkgFlag in state
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to fetch credit note details');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, styles.snoColumn]}>S.No</Text>
      {pkgFlag === 0 && (
        <Text style={[styles.headerText, styles.imageColumn]}>Image</Text>
      )}
      {pkgFlag !== 0 && (
        <Text style={[styles.headerText, styles.styleColumn]}>Package</Text>
      )}
      <Text style={[styles.headerText, styles.styleColumn]}>Style</Text>
      {pkgFlag === 0 && (
        <Text style={[styles.headerText, styles.colorColumn]}>Color</Text>
      )}
      <Text style={[styles.headerText, styles.sizeColumn]}>Size</Text>
      <Text style={[styles.headerText, styles.qtyColumn]}>Qty</Text>
      <Text style={[styles.headerText, styles.priceColumn]}>Price</Text>
      <Text style={[styles.headerText, styles.discColumn]}>Fixed Disc.</Text>
      <Text style={[styles.headerText, styles.discColumn]}>
        Discount1 (in %)
      </Text>
      <Text style={[styles.headerText, styles.discColumn]}>
        Discount2 (in %)
      </Text>
      <Text style={[styles.headerText, styles.gstColumn]}>GST (in %)</Text>
      <Text style={[styles.headerText, styles.amountColumn]}>Disc. Amnt1</Text>
      <Text style={[styles.headerText, styles.amountColumn]}>Disc. Amnt2</Text>
      <Text style={[styles.headerText, styles.amountColumn]}>GST Amnt</Text>
      <Text style={[styles.headerText, styles.totalColumn]}>Total</Text>
    </View>
  );

  const renderTableRow = (item, index) => {
    const lineItem = item.lineItemList?.[0] || {};

    return (
      <View key={index} style={styles.tableRow}>
        <Text style={[styles.cellText, styles.snoColumn]}>{index + 1}</Text>
        {pkgFlag === 0 && (
          <TouchableOpacity
            onPress={() =>
              openImageModal(
                lineItem.imageUrl1 ||
                  'https://d11vfll6ybmzw5.cloudfront.net/noimage.jpg',
              )
            }
            style={[styles.imageColumn, styles.imageContainer]}>
            <Image
              source={{
                uri:
                  lineItem.imageUrl1 ||
                  'https://d11vfll6ybmzw5.cloudfront.net/noimage.jpg',
              }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {pkgFlag !== 0 && (
          <Text style={[styles.cellText, styles.styleColumn]}>
            {lineItem.pkgName || ''}
          </Text>
        )}
        <Text style={[styles.cellText, styles.styleColumn]}>
          {lineItem.styleName || ''}
        </Text>
        {pkgFlag === 0 && (
          <Text style={[styles.cellText, styles.colorColumn]}>
            {lineItem.colorName || ''}
          </Text>
        )}
        {pkgFlag === 0 ? (
          <Text style={[styles.cellText, styles.sizeColumn]}>
            {lineItem.sizeName || ''}
          </Text>
        ) : (
          <Text style={[styles.cellText, styles.sizeColumn]}>
            {lineItem.sizes || ''}
          </Text>
        )}
        <Text style={[styles.cellText, styles.qtyColumn]}>
          {lineItem.cnl_qty || 0}
        </Text>
        <Text style={[styles.cellText, styles.priceColumn]}>
          ${lineItem.cnl_price?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cellText, styles.discColumn]}>
          {lineItem.fixDisc || 0}
        </Text>
        <Text style={[styles.cellText, styles.discColumn]}>
          {lineItem.disc1 || 0}
        </Text>
        <Text style={[styles.cellText, styles.discColumn]}>
          {lineItem.disc2 || 0}
        </Text>
        <Text style={[styles.cellText, styles.gstColumn]}>
          {lineItem.gst || 0}
        </Text>
        <Text style={[styles.cellText, styles.amountColumn]}>
          ${lineItem.cnl_disc1?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cellText, styles.amountColumn]}>
          ${lineItem.cnl_disc2?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cellText, styles.amountColumn]}>
          ${lineItem.cnl_gst?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.cellText, styles.totalColumn]}>
          ${lineItem.cnl_tot_amnt?.toFixed(2) || '0.00'}
        </Text>
      </View>
    );
  };

  const OrderDetailRow = ({label, value}) => (
    <View style={{flexDirection: 'row'}}>
      <Text
        style={{
          width: 155,
          textAlign: 'right',
          color: '#000',
          marginVertical: 3,
        }}>
        {label}
      </Text>
      <Text
        style={{width: 50, textAlign: 'center', color: '#000', marginLeft: 20}}>
        :
      </Text>
      <Text
        style={{width: 80, textAlign: 'right', color: '#000'}}
        adjustsFontSizeToFit
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  const renderSummary = () => {
    if (stylesData.length === 0) return null;

    const creditNote = stylesData[0];

    return (
      <View style={styles.groupSummary}>
        <OrderDetailRow label="Total Qty" value={creditNote.cn_tot_qty || 0} />
        <OrderDetailRow
          label="Total GST"
          value={`₹${(creditNote.cn_tot_gst || 0).toFixed(2)}`}
        />
        <OrderDetailRow
          label="Total Discount(1)"
          value={`₹${(creditNote.cn_tot_disc1 || 0).toFixed(2)}`}
        />

        <OrderDetailRow
          label="Total Discount(2)"
          value={`₹${(creditNote.cn_tot_disc2 || 0).toFixed(2)}`}
        />
        <OrderDetailRow
          label="Total Cost"
          value={`₹${(creditNote.cn_tot_amnt || 0).toFixed(2)}`}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading credit note details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order {orderNoWithPrefix}</Text>
        <Text style={styles.headerSubtitle}>{customerName}</Text>
      </View>

      {/* Table */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.tableContainer}>
        <View>
          {renderTableHeader()}
          {stylesData.map((item, index) => renderTableRow(item, index))}
        </View>
      </ScrollView>

      {/* Summary */}
      {renderSummary()}
      <Modal
        transparent={true}
        visible={isImageModalVisible}
        onRequestClose={closeModal}
        animationType="none">
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
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors, screenHeight) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
    header: {
      backgroundColor: '#4A90E2',
      padding: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'white',
      marginTop: 4,
    },
    tableContainer: {
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f8f9fa',
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      paddingVertical: 12,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
      paddingVertical: 10,
      alignItems: 'center',
    },
    headerText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#495057',
      textAlign: 'center',
    },
    cellText: {
      fontSize: 12,
      color: '#000',
      textAlign: 'center',
    },
    snoColumn: {
      width: 40,
      color: '#000',
    },
    imageColumn: {
      width: 60,
      color: '#000',
    },
    styleColumn: {
      width: 100,
      color: '#000',
    },
    colorColumn: {
      width: 50,
      color: '#000',
    },
    sizeColumn: {
      width: 50,
      color: '#000',
    },
    qtyColumn: {
      width: 40,
      color: '#000',
    },
    priceColumn: {
      width: 80,
      color: '#000',
    },
    discColumn: {
      width: 70,
      color: '#000',
    },
    gstColumn: {
      width: 60,
      color: '#000',
    },
    amountColumn: {
      width: 80,
      color: '#000',
    },
    totalColumn: {
      width: 80,
      color: '#000',
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    productImage: {
      width: 40,
      height: 40,
      borderRadius: 4,
    },
    summaryContainer: {
      backgroundColor: 'white',
      margin: 10,
      padding: 16,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    summaryLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#495057',
      flex: 1,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#495057',
      textAlign: 'right',
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
  });

export default CreditNotesEdit;
