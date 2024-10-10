import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API } from '../../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const UploadProductImage = ({ route }) => {
  const [productStyle, setProductStyle] = useState({});
  const [allProductStyles, setAllProductStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveBtn, setSaveBtn] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // State to hold selected images
  const [styleId, setStyleId] = useState(0);

  const navigation = useNavigation();


  const selectedCompany = useSelector(state => state.selectedCompany);
  const companyId = selectedCompany?.id;



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
    const styleDetails = route?.params?.productStyle || route?.params?.styleDetails;
    if (styleDetails) {
      setProductStyle(styleDetails);

      if (styleDetails?.imageUrls && styleDetails?.imageUrls.length > 0 && selectedImages?.length === 0) {
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
        setAllProductStyles(response?.data.response.customerLevelTypeList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const selectImages = () => {
    if (selectedImages.length >= 10) {
      Alert.alert('Image Limit Reached', 'You can only upload a maximum of 10 images.');
      return;
    }

    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10 - selectedImages.length,
      mediaType: 'photo',
      cropping: true, // Enable cropping
    })
      .then(images => {
        const imageArray = images.map(image => ({
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        }));

        if (selectedImages.length + imageArray.length > 10) {
          Alert.alert('Image Limit Exceeded', 'You can only upload a maximum of 10 images.');
        } else {
          setSelectedImages([...selectedImages, ...imageArray]);
        }
      })
      .catch(error => {
        if (error.message.includes('User cancelled image selection')) {
        } else {
          console.error('Error selecting images: ', error);
          Alert.alert('Error', 'An error occurred while selecting images. Please try again.');
        }
      });
  };



  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  const handleSave = () => {

    if (ValidateStyle()) {
      handleSaveNewStyle();
    } else {
      Alert.alert("Already exist!");
      return;
    }

  };

  const ValidateStyle = () => {
    if (allProductStyles && allProductStyles[0]) {
      const styleRecord = allProductStyles.find(
        (style) =>
          style.styleName.trim().toLowerCase() ===
          productStyle.styleName.trim().toLowerCase() &&
          (productStyle.myItems.some(
            (item) => style.colorId === item.colorId
          ) ||
            productStyle.colorId === style.colorId)
      );
      return styleRecord ? false : true;
    } else {
      return true;
    }
  };

  const handleSaveNewStyle = () => {
    let formData = new FormData();


    formData.append("styleId", 0);
    formData.append("styleName", productStyle.styleName);
    formData.append("styleDesc", productStyle.styleDesc);
    formData.append("styleNum", productStyle.styleNum);
    formData.append("colorId", productStyle.colorId);
    formData.append("colorCode", productStyle.colorCode);
    formData.append("price", productStyle.price);
    formData.append("typeId", productStyle.typeId);
    formData.append("sizeGroupId", productStyle.sizeGroupId);
    formData.append("scaleId", productStyle.scaleId);
    formData.append("sizesListReq", productStyle.sizesListReq);
    formData.append("customerLevel", productStyle.customerLevel);
    formData.append("customerLevelPrice", productStyle.customerLevelPrice);
    formData.append("discount", 0);
    formData.append("retailerPrice", productStyle.retailerPrice);
    formData.append("mrp", productStyle.mrp);
    formData.append("myItems", productStyle.myItemsStringify);
    formData.append("categoryId", productStyle.categoryId);
    formData.append("locationId", productStyle.locationId);
    if (productStyle.fixDisc === null || productStyle.fixDisc === '') {
      productStyle.fixDisc = 0;
    }
    formData.append("fixDisc", productStyle.fixDisc);
    formData.append("companyId", productStyle.companyId);
    formData.append("processId", productStyle.processId);
    formData.append("cedgeStyle", productStyle.cedgeStyle);
    formData.append("compFlag", productStyle.compFlag);
    formData.append("companyName", productStyle.companyName);
    formData.append("closureId", productStyle.closure);
    formData.append("peakId", productStyle.peak);
    formData.append("logoId", productStyle.logo);
    formData.append("decId", productStyle.decoration);
    formData.append("trimId", productStyle.trims);
    formData.append("gsm", productStyle.gsm);
    formData.append("hsn", productStyle.hsn);

    selectedImages.forEach((image, index) => {
      formData.append('files', {
        uri: image.uri,
        type: image.mime,
        name: `image_${index}.jpg`,
      });
    });

    // console.log("data before submit ==> ", formData)
    // return;

    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_NEW_STYLE}`;
    const URL = apiUrl0

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
        navigation.navigate('ProductsStyles', { reload: "true" });
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };



  const handleEditStyle = () => {
    let formData = new FormData();

    // Append fields to FormData
    formData.append("styleId", productStyle.styleId);
    formData.append("styleName", productStyle.styleName);
    formData.append("styleDesc", productStyle.styleDesc);
    formData.append("styleNum", productStyle.styleNum);
    formData.append("colorId", productStyle.colorId.toString());
    formData.append("colorCode", productStyle.colorCode);
    formData.append("price", productStyle.price.toString());
    formData.append("typeId", productStyle.typeId.toString());
    formData.append("sizeGroupId", productStyle.sizeGroupId.toString());
    formData.append("scaleId", productStyle.scaleId.toString());

    // Change sizeList to sizesListReq
    formData.append("sizesListReq", productStyle.sizesListReq);

    formData.append("styleQuality", productStyle.styleQuality || '');
    formData.append("fabricQuality", productStyle.fabricQuality || '');
    // formData.append("gst", productStyle.gst.toString() || '');
    formData.append("gsm", productStyle.gsm || '');
    formData.append("customerLevel", productStyle?.customerLevel?.toString());
    formData.append("publishType", productStyle.publishType || '');
    formData.append("customerLevelPrice", productStyle.customerLevelPrice.toString() || '0');
    formData.append("discount", (productStyle.discount || 0).toString());
    formData.append("retailerPrice", productStyle.retailerPrice.toString());
    formData.append("mrp", productStyle.mrp.toString());
    formData.append("hsn", productStyle.hsn || '');
    formData.append("categoryId", productStyle.categoryId.toString());
    formData.append("locationId", productStyle.locationId.toString());
    formData.append("fixDisc", (productStyle.fixDisc || 0).toString());
    formData.append("companyId", productStyle.companyId.toString());
    formData.append("cedgeStyleId", (productStyle.cedgeStyleId || 0).toString());
    formData.append("cedgeColorId", (productStyle.cedgeColorId || 0).toString());
    formData.append("cedgeTypeId", (productStyle.cedgeTypeId || 0).toString());
    formData.append("cedgeSizeGroupId", (productStyle.cedgeSizeGroupId || 0).toString());
    formData.append("cedgeScaleId", (productStyle.cedgeScaleId || 0).toString());
    formData.append("pub_to_jakya", (productStyle.pub_to_jakya || 0)?.toString());
    formData.append("styleNum", (productStyle?.styleNum || 0).toString());
    formData.append("closureId", productStyle?.closure?.toString());
    formData.append("peakId", productStyle?.peak?.toString());
    formData.append("logoId", productStyle?.logo?.toString());
    formData.append("decId", productStyle?.decoration?.toString());
    formData.append("trimId", productStyle?.trims?.toString());
    formData.append("processId", (productStyle.processId || 0).toString());
    // formData.append("linkType",0);


    // selectedImages.forEach((image, index) => {
    //   formData.append('files', {
    //     uri: image.uri,
    //     type: image.mime,
    //     name: `image_${index}.jpg`,
    //   });
    // });

    // formData.append("imgUrls", JSON.stringify([])

    formData.append("imgUrls", productStyle.imageUrls);
    // Append image files
    selectedImages?.forEach((image, index) => {
      if (image.uri && image.mime) {
        formData.append('files', {
          uri: image.uri,
          type: image.mime,
          name: `image_${index}.jpg`,
        });
      }
    });

    // Log FormData contents in a readable format
    // const formDataObject = {};
    // formData.forEach((value, key) => {
    //   if (Array.isArray(value)) {
    //     formDataObject[key] = value.map(item => (typeof item === 'object' ? JSON.stringify(item) : item));
    //   } else {
    //     formDataObject[key] = value;
    //   }
    // });

    // URL for API
    const apiUrl = 'https://crm.codeverse.co/erpportal/api/style/editstyle';
    setIsLoading(true);
    axios
      .put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        Alert.alert('Style edited successfully');
        setIsLoading(false);
        navigation.navigate('ProductsStyles', { reload: "true" });
      })
      .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
        setIsLoading(false);
      });
  };

  return (
    <View>

      <TouchableOpacity style={styles.uploadimg} onPress={selectImages}>
        <Image style={{ height: 80, width: 80 }} source={require('../../../assets/uploadsel.png')} />

        <Text
          style={{ textAlign: 'center', marginVertical: 20, fontWeight: 'bold', color: "#000" }}
        >
          Upload Product Image
        </Text>
      </TouchableOpacity>

      <View style={{ marginVertical: 10, flexWrap: "wrap", flexDirection: "row", justifyContent: "space-evenly" }}>
        {selectedImages.map((image, index) => (
          <View key={index} style={{ position: 'relative', paddingVertical: 10 }}>

            <Image
              source={{ uri: image.uri }}
              style={{ width: 65, height: 65, marginHorizontal: 5 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

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
      </TouchableOpacity>

    </View>
  );
};

export default UploadProductImage;

const styles = StyleSheet.create({
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
  uploadimg: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  }
});
