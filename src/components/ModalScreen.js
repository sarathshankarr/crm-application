import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {updateCartItem} from '../redux/actions/Actions';

const ModalScreen = ({modalVisible, closeModal, selectedItem, modalItems}) => {
  const dispatch = useDispatch();
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

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

  const handleQuantityChange = (index, text) => {
    const updatedItems = [...modalItems];
    const parsedQuantity = parseInt(text, 10);
    if (!isNaN(parsedQuantity) || text === '') {
      updatedItems[index].quantity = text === '' ? '' : parsedQuantity;
      setModalItems(updatedItems);
    }
  };

  const handleSaveItem = () => {
    modalItems.forEach(item => {
      const updatedItem = { ...item, companyId };
      dispatch(updateCartItem(updatedItem));
    });
    closeModal();
  };
  

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <View style={styles.addqtyhead}>
          <TouchableOpacity onPress={closeModal}>
            <Image
              style={{height: 30, width: 30, tintColor: 'white'}}
              source={require('../../assets/back_arrow.png')}
            />
          </TouchableOpacity>
          <Text style={styles.addqtytxt}>Add Quantity</Text>
        </View>
        <View style={styles.sizehead}>
          <View style={{flex: 0.7}}>
            <Text style={{marginLeft: 10}}>COLOR/SIZE</Text>
          </View>
          <View style={{flex: 0.5}}>
            <Text>QUANTITY</Text>
          </View>
          <View style={{flex: 0.4}}>
            <Text>PRICE</Text>
          </View>
        </View>
        <ScrollView style={styles.modalContent}>
          {selectedItem && (
            <View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalText}>
                  Color Name: {selectedItem.colorName}
                </Text>
              </View>
              <View>
                {modalItems.map((item, index) => (
                  <View key={index} style={styles.rowContainer}>
                    <View style={styles.labelContainer}>
                      <Text>Size - {item.sizeDesc}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.quantityInput}
                        keyboardType="numeric"
                        placeholder="Quantity"
                        value={item.quantity.toString()}
                        onChangeText={text => handleQuantityChange(index, text)}
                      />
                    </View>
                    <View style={styles.priceContainer}>
                      <Text>{item.price}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginRight: 20,
                  marginTop: 20,
                  marginBottom: 30,
                }}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    borderWidth: 1,
                    borderColor: '#000',
                    backgroundColor: '#390050',
                    marginLeft: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 35,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveItem}
                  style={{
                    borderWidth: 1,
                    borderColor: '#000',
                    backgroundColor: '#390050',
                    marginLeft: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 35,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 200,
    marginLeft: 20,
    marginRight: 20,
    padding: 20,
    borderRadius: 10,
  },
  addqtyhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  addqtytxt: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sizehead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modalContent: {
    flex: 1,
    marginTop: 10,
  },
  modalTextContainer: {
    marginVertical: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:"#000"
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  labelContainer: {
    flex: 0.7,
  },
  inputContainer: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  quantityInput: {
    fontSize: 16,
  },
  priceContainer: {
    flex: 0.4,
    alignItems: 'flex-end',
  },
});

export default ModalScreen;
