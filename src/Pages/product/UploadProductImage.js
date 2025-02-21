import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import {useNavigation} from '@react-navigation/native';
import {ColorContext} from '../../components/colortheme/colorTheme';

const UploadProductImage = ({route}) => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const styleDetails = route?.params?.Style;
  // console.log('styleDetails12344', styleDetails);
  const [productStyle, setProductStyle] = useState({});
  const [allProductStyles, setAllProductStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveBtn, setSaveBtn] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // State to hold selected images
  const [styleId, setStyleId] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleImages, setIsModalVisibleImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);


  const [deletedImageNames, setDeletedImageNames] = useState([]);
  
  const navigation = useNavigation();

  const selectedCompany = useSelector(state => state.selectedCompany);
  const companyId = selectedCompany?.id;

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalVisibleImages(true);
  };

  const closeModal = () => {
    setIsModalVisibleImages(false);
    setSelectedImage(null);
  };

  // useEffect(() => {
  //   if (route.params && route?.params?.productStyle) {
  //     const styleDetails = route?.params?.productStyle;
  //     setProductStyle(styleDetails);

  //     // If images exist in productStyle, set them to selectedImages
  //     if (styleDetails.imageUrls && styleDetails.imageUrls.length > 0) {
  //       const imageArray = styleDetails.imageUrls.map((url, index) => ({
  //         uri: url,
  //         width: 100,
  //         height: 100,
  //         mime: 'image/jpeg',
  //         name: `image_${index}.jpg`,
  //       }));
  //       setSelectedImages(imageArray);
  //     }

  //     setSaveBtn(true);
  //   }

  //   getStyleList();
  // }, [route]);

  useEffect(() => {
    const styleDetails =
      route?.params?.productStyle || route?.params?.styleDetails;
    if (styleDetails) {
      setProductStyle(styleDetails);

      if (
        styleDetails?.imageUrls &&
        styleDetails?.imageUrls.length > 0 &&
        selectedImages?.length === 0
      ) {
        const imageArray = styleDetails.imageUrls.map((url, index) => ({
          uri: url,
          width: 100,
          height: 100,
          mime: 'image/jpeg',
          name: `image_${index}.jpg`,
        }));
        setSelectedImages(imageArray);
      }

      setStyleId(styleDetails?.styleId || 0);
      setSaveBtn(true);
    }

    getStyleList();
  }, [route]);

  const getStyleList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_STYLE_LIST}${companyId}`;
    setIsLoading(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setAllProductStyles(
          response?.data.response.customerLevelTypeList || [],
        );
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  // const selectImages = () => {
  //   if (selectedImages.length >= 10) {
  //     Alert.alert(
  //       'Image Limit Reached',
  //       'You can only upload a maximum of 10 images.',
  //     );
  //     return;
  //   }

  //   ImagePicker.openPicker({
  //     multiple: true,
  //     maxFiles: 10 - selectedImages.length,
  //     mediaType: 'photo',
  //     cropping: true, // Enable cropping
  //   })
  //     .then(images => {
  //       const imageArray = images.map(image => ({
  //         uri: image.path,
  //         width: image.width,
  //         height: image.height,
  //         mime: image.mime,
  //       }));

  //       if (selectedImages.length + imageArray.length > 10) {
  //         Alert.alert(
  //           'Image Limit Exceeded',
  //           'You can only upload a maximum of 10 images.',
  //         );
  //       } else {
  //         setSelectedImages([...selectedImages, ...imageArray]);
  //       }
  //     })
  //     .catch(error => {
  //       if (error.message.includes('User cancelled image selection')) {
  //       } else {
  //         console.error('Error selecting images: ', error);
  //         Alert.alert(
  //           'Error',
  //           'An error occurred while selecting images. Please try again.',
  //         );
  //       }
  //     });
  // };

  // const openCamera = () => {
  //   setModalVisible(false);
  //   ImagePicker.openCamera({
  //     cropping: true, // Enable cropping
  //     mediaType: 'photo',
  //   })
  //     .then(image => {
  //       const imageObj = {
  //         uri: image.path,
  //         width: image.width,
  //         height: image.height,
  //         mime: image.mime,
  //       };
  //       if (selectedImages.length >= 10) {
  //         Alert.alert(
  //           'Image Limit Reached',
  //           'You can only upload a maximum of 10 images.',
  //         );
  //       } else {
  //         setSelectedImages([...selectedImages, imageObj]);
  //       }
  //     })
  //     .catch(error => {
  //       if (!error.message.includes('User cancelled image selection')) {
  //         console.error('Error taking photo: ', error);
  //         Alert.alert(
  //           'Error',
  //           'An error occurred while taking a photo. Please try again.',
  //         );
  //       }
  //     });
  // };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 30) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
  
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert(
            'Permission Denied',
            'Camera and storage permissions are required to upload images.',
          );
          return false;
        }
      }
      return true; // Permissions automatically granted for Android 11+
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

const openCamera = async () => {
  // setModalVisible(false);

  // Check and request camera permissions
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return;
  }

  // Open the camera
  ImagePicker.openCamera({
    cropping: true, // Enable cropping
    mediaType: 'photo', // Capture photos only
    compressImageQuality: 0.8, // Optional: Adjust image quality
  })
    .then(image => {
      const imageObj = {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      };

      // Check if the maximum image limit is reached
      if (selectedImages.length >= 10) {
        Alert.alert(
          'Image Limit Reached',
          'You can only upload a maximum of 10 images.',
        );
      } else {
        // Add the new image to the selected images list
        setSelectedImages([...selectedImages, imageObj]);
      }
    })
    .catch(error => {
      // Handle errors (excluding user cancellation)
      if (!error.message.includes('User cancelled image selection')) {
        console.error('Error taking photo: ', error);
        Alert.alert(
          'Error',
          'An error occurred while taking a photo. Please try again.',
        );
      }
    });
};


useEffect(() => {
  if (selectedImages.length > 0) {
    setModalVisible(false);
  }
}, [selectedImages]);
  

  const openGallery = () => {
    // setModalVisible(false);
  
    if (selectedImages.length >= 10) {
      Alert.alert(
        'Image Limit Reached',
        'You can only upload a maximum of 10 images.',
      );
      return;
    }
  
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10 - selectedImages.length,
      mediaType: 'photo',
      cropping: true,
    })
      .then(images => {
        const newImages = images.map(image => ({
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        }));
  
        // Filter out duplicates
        const uniqueImages = newImages.filter(
          newImage =>
            !selectedImages.some(selected => selected.uri === newImage.uri)
        );
  
        setSelectedImages([...selectedImages, ...uniqueImages]);
      })
      .catch(error => {
        if (!error.message.includes('User cancelled image selection')) {
          console.error('Error selecting images: ', error);
          Alert.alert(
            'Error',
            'An error occurred while selecting images. Please try again.',
          );
        }
      });
  };
  

  // const removeImage = index => {
  //   const updatedImages = selectedImages.filter((_, i) => i !== index);
  //   setSelectedImages(updatedImages);
  // };

  const removeImage = (index) => {
    const deletedImage = selectedImages.filter((_, i) => i === index);
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  
    if (deletedImage && deletedImage[0] && deletedImage[0].uri) {
      if (deletedImage[0].uri.startsWith('https')) {
        const fileName = deletedImage[0].uri.split('/').pop();
  
        setDeletedImageNames((prevNames) => {
          if (!prevNames.includes(fileName)) {
            const updatedNames = [...prevNames, fileName];
            console.log('Updated deletedImageNames:', updatedNames);
            return updatedNames;
          }
          return prevNames;
        });
      }
    }
  };
  

  const handleSave = () => {
    if (ValidateStyle()) {
      handleSaveNewStyle();
    } else {
      Alert.alert('Already exist!');
      return;
    }
  };

  const ValidateStyle = () => {
    if (allProductStyles && allProductStyles[0]) {
      const styleRecord = allProductStyles.find(
        style =>
          style.styleName.trim().toLowerCase() ===
            productStyle.styleName.trim().toLowerCase() &&
          (productStyle.myItems.some(item => style.colorId === item.colorId) ||
            productStyle.colorId === style.colorId),
      );
      return styleRecord ? false : true;
    } else {
      return true;
    }
  };

  const handleSaveNewStyle = () => {
    if (isSaving) return; // Prevent execution if already saving
    setIsSaving(true);
    let formData = new FormData();

    formData.append('styleId', 0);
    formData.append('styleName', productStyle.styleName);
    formData.append('styleDesc', productStyle.styleDesc);
    formData.append('styleNum', productStyle.styleNum);
    formData.append('colorId', productStyle.colorId);
    formData.append('colorCode', productStyle.colorCode);
    formData.append('price', productStyle.price);
    formData.append('typeId', productStyle.typeId);
    formData.append('sizeGroupId', productStyle.sizeGroupId);
    formData.append('scaleId', productStyle.scaleId);
    formData.append('sizesListReq', productStyle.sizesListReq);
    formData.append('customerLevel', productStyle.customerLevel);
    formData.append('customerLevelPrice', productStyle.customerLevelPrice);
    formData.append('discount', 0);
    formData.append('retailerPrice', productStyle.retailerPrice);
    formData.append('mrp', productStyle.mrp);
    formData.append('myItems', productStyle.myItemsStringify);
    formData.append('categoryId', productStyle.categoryId);
    formData.append('locationId', productStyle.locationId);
    formData.append('linkType', 1);
    if (productStyle.fixDisc === null || productStyle.fixDisc === '') {
      productStyle.fixDisc = 0;
    }
    formData.append('pub_to_jakya', 0,);
    formData.append('fixDisc', productStyle.fixDisc);
    formData.append('companyId', productStyle.companyId);
    formData.append('processId', productStyle.processId);
    formData.append('cedgeStyle', productStyle.cedgeStyle);
    formData.append('compFlag', productStyle.compFlag);
    formData.append('companyName', productStyle.companyName);
    formData.append('closureId', productStyle.closure);
    formData.append('peakId', productStyle.peak);
    formData.append('logoId', productStyle.logo);
    formData.append('decId', productStyle.decoration);
    formData.append('trimId', productStyle.trims);
    formData.append('gsm', productStyle.gsm);
    formData.append('hsn', productStyle.hsn);
    formData.append('gst', productStyle.gst);
    formData.append('uomId', productStyle.uomId); 
    formData.append("statusId",productStyle.statusId)
    formData.append("gstSlotId",productStyle.gstSlotId)
 
    selectedImages.forEach((image, index) => {
      formData.append('files', {
        uri: image.uri,
        type: image.mime,
        name: `image_${index}.jpg`,
      });
    });

    console.log('data before submit ==> ', formData);
    console.log('sizesListReq', productStyle.sizesListReq);

    // return;

    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_NEW_STYLE}`;
    const URL = apiUrl0;

    setIsLoading(true);

    axios
      .post(URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Add Content-Type header
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        Alert.alert('New style created successfully');
        navigation.navigate('ProductsStyles', {reload: 'true'});
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
        setIsSaving(false);
      });
  };

  const handleEditStyle = () => {
    if (isSaving) return; // Prevent execution if already saving
    setIsSaving(true);
    let formData = new FormData();

    // Log before appending data to FormData
    console.log('Appending data to FormData...');
    console.log('styleId', productStyle.styleId);
    console.log('styleName', productStyle.styleName);

    formData.append('styleId', productStyle.styleId);
    formData.append('styleName', productStyle.styleName);
    formData.append('styleDesc', productStyle.styleDesc);
    formData.append('styleNum', productStyle.styleNum);
    formData.append('colorId', productStyle.colorId.toString());
    formData.append('colorCode', productStyle.colorCode);
    formData.append('price', productStyle.price.toString());
    formData.append('typeId', productStyle.typeId.toString());
    formData.append('sizeGroupId', productStyle.sizeGroupId.toString());
    formData.append('scaleId', productStyle.scaleId.toString());
    formData.append('sizesListReq', productStyle.sizesListReq);

    // Additional fields
    formData.append('styleQuality', productStyle.styleQuality || '');
    formData.append('fabricQuality', productStyle.fabricQuality || '');
    formData.append('gsm', productStyle.gsm || '');
    formData.append('customerLevel', productStyle?.customerLevel?.toString());
    formData.append('publishType', productStyle.publishType || '');
    formData.append(
      'customerLevelPrice',
      productStyle.customerLevelPrice.toString() || '0',
    );
    formData.append('discount', (productStyle.discount || 0).toString());
    formData.append('retailerPrice', productStyle.retailerPrice.toString());
    formData.append('mrp', productStyle.mrp.toString());
    formData.append('hsn', productStyle.hsn || '');
    formData.append('gst', productStyle.gst || '');
    formData.append('categoryId', productStyle.categoryId.toString());
    formData.append('locationId', productStyle.locationId.toString());
    formData.append('fixDisc', (productStyle.fixDisc || 0).toString());
    formData.append('companyId', productStyle.companyId.toString());
    formData.append("statusId",productStyle.statusId)
    formData.append('uomId', productStyle.uomId); 
    formData.append("gstSlotId",productStyle.gstSlotId)

    formData.append(
      'cedgeStyleId',
      (productStyle.cedgeStyleId || 0).toString(),
    );
    formData.append(
      'cedgeColorId',
      (productStyle.cedgeColorId || 0).toString(),
    );
    formData.append('cedgeTypeId', (productStyle.cedgeTypeId || 0).toString());
    formData.append(
      'cedgeSizeGroupId',
      (productStyle.cedgeSizeGroupId || 0).toString(),
    );
    formData.append(
      'cedgeScaleId',
      (productStyle.cedgeScaleId || 0).toString(),
    );
    formData.append('pub_to_jakya', productStyle?.pub_to_jakya || 0) ;
    formData.append('pubToJakyaDate', productStyle?.pubToJakyaDate || '');

    formData.append('closureId', productStyle?.closure?.toString());
    formData.append('peakId', productStyle?.peak?.toString());
    formData.append('logoId', productStyle?.logo?.toString());
    formData.append('decId', productStyle?.decoration?.toString());
    formData.append('trimId', productStyle?.trims?.toString());
    formData.append('processId', (productStyle.processId || 0).toString());

    // Debugging the image URLs
    console.log('Image URLs:',deletedImageNames);
    formData.append('imgUrls', [...new Set(deletedImageNames)]);
    formData.append('linkType', 1);

    // Debugging the selected images
    selectedImages.forEach((image, index) => {
      // Check if the image URI starts with "https", indicating it's already uploaded
      if (image.uri.startsWith("https")) {
        console.log("Skipping already uploaded image:", image.uri);
        return; // Skip this image
      }
    
      // Generate a unique name for new images
      const uniqueImageName = `image_${new Date().getTime()}_${index}.jpg`;
    
      // Append new images to FormData
      formData.append('files', {
        uri: image.uri,
        type: image.mime,
        name: uniqueImageName,
      });
    
      console.log("Uploading new image:", image.uri, "with name:", uniqueImageName);
    });
    
    
    // Log the final FormData object
    console.log('FormData being sent:', formData);


    // for (var pair of formData.entries()) {
    //     console.log(pair[0] + ': ' + pair[1]);
    // }

    // API call

    const apiUrl = `${global?.userData?.productURL}${API.EDIT_NEW_STYLE}`;


    setIsLoading(true);
    axios
      .put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('Response:', response.data);
        Alert.alert('Style edited successfully');
        setIsLoading(false);
        setIsSaving(false);
        navigation.navigate('ProductsStyles', {reload: 'true'});
      })
      .catch(error => {
        console.error(
          'Error:',
          error.response ? error.response.data : error.message,
        );
        setIsLoading(false);
        setIsSaving(false);
      });
  };

  const handlebasicinfo = () => {
    navigation.navigate('StyleDetails');
  };
  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: 'white',
          elevation: 5,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../../assets/back_arrow.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#000',
              marginRight: 80,
            }}>
            {productStyle?.styleName ? productStyle?.styleName : 'New Style'}
          </Text>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
        <TouchableOpacity
          onPress={handlebasicinfo}
          style={styles.headbasicinfo}>
          <Text style={{color:'#000',fontWeight:"bold"}}>Basic Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headprductimage}>
          <Text style={{color:'#000',fontWeight:"bold"}}>Product Images</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.uploadImg}
        onPress={() => setModalVisible(true)}>
        <Image
          style={{height: 80, width: 80}}
          source={require('../../../assets/uploadsel.png')}
        />
        <Text style={styles.uploadText}>Upload Product Image</Text>
      </TouchableOpacity>

      <View
        style={{
          marginVertical: 10,
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {/* {selectedImages.map((image, index) => (
          <View key={index} style={{position: 'relative', paddingVertical: 10}}>
            <Image
              source={{uri: image.uri}}
              style={{width: 65, height: 65, marginHorizontal: 5}}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))} */}
          {selectedImages.map((image, index) => (
          <View key={index} style={{position: 'relative', paddingVertical: 10}}>
            <TouchableOpacity onPress={() => openModal(image)}>
              <Image
                source={{uri: image.uri}}
                style={{width: 65, height: 65, marginHorizontal: 5}}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {isModalVisibleImages && (
       <Modal
       transparent={true}
       visible={isModalVisibleImages}
       animationType="fade"
       onRequestClose={closeModal}>
       <View style={styles.modalContainerimages}>
         <TouchableOpacity style={styles.closeButtonimages} onPress={closeModal}>
           <Image
             style={{height: 30, width: 30,tintColor: '#000',}}
             source={require('../../../assets/close.png')}
           />
         </TouchableOpacity>
         {selectedImage && (
           <Image
             source={{uri: selectedImage.uri}}
             style={styles.fullSizeImage}
             resizeMode="contain"
           />
         )}
       </View>
     </Modal>
     
      )}
      {/* 
      <TouchableOpacity
        style={{
          backgroundColor: saveBtn ? '#1F74BA' : 'skyblue',
          padding: 10,
          borderRadius: 5,
          marginTop: 20,
          width: '90%',
          marginHorizontal: 20
        }}
        disabled={!saveBtn}
        onPress={styleId ? handleEditStyle : handleSave}
      >
        <Text style={styles.saveButtonText}>{styleId ? 'Update' : 'Save'}</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={{
          backgroundColor: saveBtn ? colors.color2 : 'skyblue',
          padding: 10,
          borderRadius: 5,
          marginTop: 20,
          width: '90%',
          marginHorizontal: 20,
          opacity: isSaving ? 0.6 : 1,
        }}
        disabled={!saveBtn || isSaving}
        onPress={styleId ? handleEditStyle : handleSaveNewStyle}>
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : styleId ? 'Update' : 'Save'}
        </Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                backgroundColor: colors.color2,
                borderRadius: 10,
                marginHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                paddingVertical: 5,
                width: '100%',
                justifyContent: 'space-between',
                marginBottom: 15,
              }}>
              <Text style={[styles.modalTitle, {flex: 1, textAlign: 'center'}]}>
                Choose an Option
              </Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Image
                  style={{height: 30, width: 30, marginRight: 5}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
              <Text style={styles.buttonText}>Open Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UploadProductImage;

const getStyles = colors =>
  StyleSheet.create({
    menuimg: {
      height: 30,
      width: 30,
      marginHorizontal: 5,
    },
    headbasicinfo: {
      marginTop: 10,
      paddingHorizontal: 50,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderColor: '#000',
      borderWidth: 1,
      paddingVertical: 10,
    },
    headprductimage: {
      backgroundColor: '#ffffff',
      marginTop: 10,
      paddingHorizontal: 50,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      paddingVertical: 10,
      borderColor: '#000',
      borderWidth: 1,
      backgroundColor: colors.color2,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: 0, // Position the button at the top edge of the image
      right: 0, // Align the button to the right edge
      backgroundColor: 'gray',
      borderRadius: 15,
      width: 25,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    modalContainerimages: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // Slightly transparent background
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonimages: {
      position: 'absolute', // Position it relative to the modal
      top: 130, // Adjust for desired distance from the top
      right: 10, // Adjust for desired distance from the right
      zIndex: 10, // Ensure it stays on top of the image
      backgroundColor:"#fff"
    },
    fullSizeImage: {
      width: '90%', // Adjust based on desired size
      height: '80%', // Adjust based on desired size
      borderRadius: 10,
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: 'white',
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'black',
      fontSize: 16,
    },
    fullSizeImage: {
      width: '90%',
      height: '80%',
    },
    uploadimg: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    uploadImg: {
      alignItems: 'center',
      margin: 20,
    },
    uploadText: {
      textAlign: 'center',
      marginVertical: 20,
      fontWeight: 'bold',
      color: '#000',
    },
    modalContainer: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      elevation: 5, // Add elevation for shadow on Android
      top: 10,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      // marginBottom: 20,
      color: '#000',
    },
    modalButton: {
      padding: 15,
      backgroundColor: colors.color2,
      borderRadius: 5,
      marginBottom: 10,
      width: '80%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: '#f44336',
    },
  });

