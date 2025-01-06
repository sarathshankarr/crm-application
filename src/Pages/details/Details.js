import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../redux/actions/Actions';
import ModalComponent from '../../components/ModelComponent';
import ImageSlider from '../../components/ImageSlider';  // Adjust the import path as necessary
import { API } from '../../config/apiConfig';
import axios from 'axios';

const Details = ({ route }) => {
  const {
    item,
    name,
    image,
    image2,
    image3,
    image4,
    image5,
    category,
    disription,
    tags,
    set,
  } = route.params;

  const images = [image, image2, image3, image4, image5];
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]); // New state for image URLs
  const [stylesData, setStylesData] = useState([]);
  const [fullImageUrls, setFullImageUrls] = useState([]);

  const openModal = item => {
    if (item && item.styleId) {
      setSelectedItem(item);
      setModalVisible(true);
    } else {
      console.error('Invalid item format:', item);
    }
  };
  
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const addItem = item => {
    dispatch(addItemToCart(item));
  };

  useEffect(()=>{
    getAllImages()
  },[])

 
 
  const getAllImages = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_IMAGES}/${item.styleId}`;
    
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        if (response?.data?.response?.stylesList?.length > 0) {
          const fetchedStyle = response?.data?.response?.stylesList[0];
          
          if (fetchedStyle.imageUrls && fetchedStyle.imageUrls.length > 0) {
            // Load the first image immediately
            setImageUrls([fetchedStyle.imageUrls[0]]);
            setFullImageUrls(fetchedStyle.imageUrls);
            console.log("Initial image URL loaded:", fetchedStyle.imageUrls[0]); 
          } else {
            console.error("No imageUrls found in the response.");
          }
        } else {
          console.error("stylesList is empty or not available.");
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
};


  

  return (
    <SafeAreaView style={styles.container}>
       <View>
            <Text style={{color:"#000",fontSize:20,fontWeight:"bold",alignSelf:"center"}}>
            Product Details
            </Text>
          </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
       {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ImageSlider fullImageUrls={fullImageUrls} />
      )}
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Style Name</Text>
          <Text style={styles.detailValue}>{item.styleName}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>MRP</Text>
          <Text style={styles.detailValue}>{item.realMrp}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Sizes</Text>
          <Text style={styles.detailValue}>{item.sizes}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{item.type}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Fabric</Text>
          <Text style={styles.detailValue}>{item.fabricQuality}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>GSM</Text>
          <Text style={styles.detailValue}>{item.gsm}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Price</Text>
          <Text style={styles.detailValue}>{item.mrp}</Text>

        </View>
        <View style={styles.setContainer}>
          <Text style={styles.detailLabel}>Color Name</Text>
          <Text style={styles.detailValue}>{item.colorName}</Text>
        </View>
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Description</Text>
          <Text style={styles.txt}>{item.styleDesc}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => openModal(item)} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>ADD QUANTITY</Text>
      </TouchableOpacity>

      <ModalComponent
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        selectedItem={selectedItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 60, // Ensure space for the button
  },
  priceContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },
  tagsContainer: {
    marginHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 7,
  },
  setContainer: {
    paddingHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },
  notesContainer: {
    marginHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 10,
  },
  priceText: {
    marginVertical: 10,
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginRight: 10,
    color:"#000"
  },
  detailValue: {
    fontSize: 18,
    marginHorizontal:5,
    color:"#000"
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#000"
  },
  txt: {
    fontSize: 20,
    color: '#000',
    marginHorizontal: 5,
  },
  buttonContainer: {
    borderWidth: 1,
    // backgroundColor: '#f55951',
    backgroundColor: '#F09120',
    width: '100%',
    paddingVertical: 13,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Details;
