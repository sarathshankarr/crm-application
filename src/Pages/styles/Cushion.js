import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RadioGroup} from 'react-native-radio-buttons-group';
import ImagePicker from 'react-native-image-crop-picker';
import {useFocusEffect} from '@react-navigation/native';
import {API} from '../../config/apiConfig';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Cushion = ({navigation,route}) => {
  const {costingRequest} = route?.params || {};
  useEffect(() => {
    // Log the data to verify
    console.log(
      'Received costingRequest in NewCosting screen======>:',
      costingRequest,
    );
  }, [costingRequest]);
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;
  const [dataLoaded, setDataLoaded] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [frontBack, setFrontBack] = useState('');
  const [frontBackNumber, setFrontBackNumber] = useState('');
  const [back, setBack] = useState('');
  const [backNumber, setBackNumber] = useState('');
  const [lining, setLining] = useState('');
  const [liningNumber, setLiningNumber] = useState('');
  const [stitching, setStitching] = useState('');
  const [stitchingNumber, setStitchingNumber] = useState('');
  const [finishing, setFinishing] = useState('');
  const [finishingNumber, setFinishingNumber] = useState('');
  const [zip, setZip] = useState('');
  const [zipNumber, setZipNumber] = useState('');
  const [printing, setPrinting] = useState('');
  const [printingNumber, setPrintingNumber] = useState('');
  const [embroiderChenille, setEmbroiderChenille] = useState('');
  const [embroiderChenilleNumber, setEmbroiderChenilleNumber] = useState('');
  const [handWork, setHandWork] = useState('');
  const [handWorkNumber, setHandWorkNumber] = useState('');
  const [fringes, setFringes] = useState('');
  const [fringesNumber, setFringesNumber] = useState('');
  const [pomPom, setPomPom] = useState('');
  const [pomPomNumber, setPomPomNumber] = useState('');
  const [miscellaneous, setMiscellaneous] = useState('');
  const [miscellaneousNumber, setMiscellaneousNumber] = useState('');
  const [extra1, setExtra1] = useState('');
  const [extra1Number, setExtra1Number] = useState('');
  const [extra2, setExtra2] = useState('');
  const [extra2Number, setExtra2Number] = useState('');
  const [subTotal1, setSubTotal1] = useState('');
  const [subTotal1Number, setSubTotal1Number] = useState('');
  const [overheadsAmount, setOverheadsAmount] = useState('');
  const [overheadsNumber, setOverheadsNumber] = useState('');
  const [subTotal2, setSubTotal2] = useState('');
  const [subTotal2Number, setSubTotal2Number] = useState('');
  const [packaging, setPackaging] = useState('');
  const [packagingNumber, setPackagingNumber] = useState('');
  const [testing, setTesting] = useState('');
  const [testingNumber, setTestingNumber] = useState('');
  const [filling, setFilling] = useState('');
  const [fillingNumber, setFillingNumber] = useState('');
  const [transportation, setTransportation] = useState('');
  const [transportationNumber, setTransportationNumber] = useState('');
  const [subTotal3, setSubTotal3] = useState('');
  const [subTotal3Number, setSubTotal3Number] = useState('');
  const [marginAmount, setMarginAmount] = useState('');
  const [marginNumber, setMarginNumber] = useState('');
  const [subTotal4, setSubTotal4] = useState('');
  const [subTotal4Number, setSubTotal4Number] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitPriceNumber, setUnitPriceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [radioButtons, setRadioButtons] = useState([
    {
      id: '1',
      label: 'Bathmat',
      value: 'bathmat',
      labelStyle: styles.radioLabel,
      color: '#1F74BA',
      disabled: false, // Add disabled property
    },
    {
      id: '2',
      label: 'Cushion',
      value: 'cushion',
      labelStyle: styles.radioLabel,
      color: '#1F74BA',
      disabled: false, // Add disabled property
    },
  ]);

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
    setSelectedId('2'); // Ensure "Bathmat" is selected when the screen loads
  }, []);



  useEffect(() => {
    if (!costingRequest || !costingRequest.costingRequest) {
      console.log('costingRequest is undefined or null');
      return;
    }

    const costingRequestData = costingRequest.costingRequest;

    if (!Array.isArray(costingRequestData)) {
      console.log(
        'costingRequest is not an array. Received:',
        costingRequestData,
      );
      return;
    }

    if (costingRequestData.length === 0) {
      console.log('costingRequest array is empty.');
      return;
    }

    const requestData = costingRequestData[0];
    console.log('Processing first item of costingRequest:', requestData);
    setSelectedId(requestData.checkBox?.toString() || '');

    const updatedRadioButtons = radioButtons.map(button => {
      if (button.id === '1') {
        // Disable 'Cushion' if checkBox ID exists
        return {...button, disabled: !!requestData.checkBox};
      }
      return button;
    });

    setRadioButtons(updatedRadioButtons);


    // Populate gallery images if ksImageUrls is available
    if (
      Array.isArray(requestData.ksImageUrls) &&
      requestData.ksImageUrls.length > 0
    ) {
      const galleryImages = requestData.ksImageUrls.map(url => ({
        uri: url, // Make sure this is the correct format for displaying images
      }));
      setGalleryImages(galleryImages); // Assuming setGalleryImages is the setter for the gallery images state
    }

    // Populate other fields as needed
    setSelectedId(requestData.checkBox?.toString() || '');
  setFrontBack(requestData.frontBack?.toString() || '');
  setFrontBackNumber(requestData.frontBackNumber?.toString() || '');
  setBack(requestData.back?.toString() || '');
  setBackNumber(requestData.backNumber?.toString() || '');
  setLining(requestData.lining?.toString() || '');
  setLiningNumber(requestData.liningNumber?.toString() || '');
  setStitching(requestData.stitching?.toString() || '');
  setStitchingNumber(requestData.stitchingNumber?.toString() || '');
  setFinishing(requestData.finishing?.toString() || '');
  setFinishingNumber(requestData.finishingNumber?.toString() || '');
  setZip(requestData.zip?.toString() || '');
  setZipNumber(requestData.zipNumber?.toString() || '');
  setPrinting(requestData.printing?.toString() || '');
  setPrintingNumber(requestData.printingNumber?.toString() || '');
  setEmbroiderChenille(requestData.embroiderChenille?.toString() || '');
  setEmbroiderChenilleNumber(requestData.embroiderChenilleNumber?.toString() || '');
  setHandWork(requestData.handWork?.toString() || '');
  setHandWorkNumber(requestData.handWorkNumber?.toString() || '');
  setFringes(requestData.fringes?.toString() || '');
  setFringesNumber(requestData.fringesNumber?.toString() || '');
  setPomPom(requestData.pomPom?.toString() || '');
  setPomPomNumber(requestData.pomPomNumber?.toString() || '');
  setMiscellaneous(requestData.miscellaneous?.toString() || '');
  setMiscellaneousNumber(requestData.miscellaneousNumber?.toString() || '');
  setExtra1(requestData.extra1?.toString() || '');
  setExtra1Number(requestData.extra1Number?.toString() || '');
  setExtra2(requestData.extra2?.toString() || '');
  setExtra2Number(requestData.extra2Number?.toString() || '');
  setSubTotal1(requestData.subTotal1?.toString() || '');
  setSubTotal1Number(requestData.subTotal1Number?.toString() || '');
  setOverheadsAmount(requestData.overheadsAmount?.toString() || '');
  setOverheadsNumber(requestData.overheadsNumber?.toString() || '');
  setSubTotal2(requestData.subTotal2?.toString() || '');
  setSubTotal2Number(requestData.subTotal2Number?.toString() || '');
  setPackaging(requestData.packaging?.toString() || '');
  setPackagingNumber(requestData.packagingNumber?.toString() || '');
  setTesting(requestData.testing?.toString() || '');
  setTestingNumber(requestData.testingNumber?.toString() || '');
  setFilling(requestData.filling?.toString() || '');
  setFillingNumber(requestData.fillingNumber?.toString() || '');
  setTransportation(requestData.transportation?.toString() || '');
  setTransportationNumber(requestData.transportationNumber?.toString() || '');
  setSubTotal3(requestData.subTotal3?.toString() || '');
  setSubTotal3Number(requestData.subTotal3Number?.toString() || '');
  setMarginAmount(requestData.marginAmount?.toString() || '');
  setMarginNumber(requestData.marginNumber?.toString() || '');
  setSubTotal4(requestData.subTotal4?.toString() || '');
  setSubTotal4Number(requestData.subTotal4Number?.toString() || '');
  setUnitPrice(requestData.unitPrice?.toString() || '');
  setUnitPriceNumber(requestData.unitPriceNumber?.toString() || '');
  setDescription(requestData.description?.toString() || '');


    setDataLoaded(true); // Mark data as loaded
  }, [costingRequest]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      const costId = String(costingRequest?.costingRequest?.[0]?.costId || 0);
      console.log('Selected Cost ID:', costId); // Debugging log
      const createBy = String(
        costingRequest?.costingRequest?.[0]?.createBy || '',
      );
      const createOn = String(
        costingRequest?.costingRequest?.[0]?.createOn || 0,
      );
      const ksImageName = String(
        costingRequest?.costingRequest?.[0]?.ksImageName,
      );
      // Append all form fields to formData
      formData.append('costId', costId);
      formData.append('frontBack', frontBack || '');
      formData.append('frontBackNumber', frontBackNumber || 0);
      formData.append('back', back || '');
      formData.append('backNumber', backNumber || 0);
      formData.append('lining', lining || '');
      formData.append('liningNumber', liningNumber || 0);
      formData.append('stitching', stitching || '');
      formData.append('stitchingNumber', stitchingNumber || 0);
      formData.append('finishing', finishing || '');
      formData.append('finishingNumber', finishingNumber || 0);
      formData.append('zip', zip || '');
      formData.append('zipNumber', zipNumber || 0);
      formData.append('printing', printing || '');
      formData.append('printingNumber', printingNumber || 0);
      formData.append('embroiderChenille', embroiderChenille || '');
      formData.append('embroiderChenilleNumber', embroiderChenilleNumber || 0);
      formData.append('handWork', handWork || '');
      formData.append('handWorkNumber', handWorkNumber || 0);
      formData.append('fringes', fringes || '');
      formData.append('fringesNumber', fringesNumber || 0);
      formData.append('pomPom', pomPom || '');
      formData.append('pomPomNumber', pomPomNumber || 0);
      formData.append('miscellaneous', miscellaneous || '');
      formData.append('miscellaneousNumber', miscellaneousNumber || 0);
      formData.append('extra1', extra1 || '');
      formData.append('extra1Number', extra1Number || 0);
      formData.append('extra2', extra2 || '');
      formData.append('extra2Number', extra2Number || 0);
      formData.append('subTotal1', subTotal1 || '');
      formData.append('subTotal1Number', subTotal1Number || 0);
      formData.append('overheadsAmount', overheadsAmount || '');
      formData.append('overheadsNumber', overheadsNumber || 0);
      formData.append('subTotal2', subTotal2 || '');
      formData.append('subTotal2Number', subTotal2Number || 0);
      formData.append('packaging', packaging || '');
      formData.append('packagingNumber', packagingNumber || 0);
      formData.append('testing', testing || '');
      formData.append('testingNumber', testingNumber || 0);
      formData.append('filling', filling || '');
      formData.append('fillingNumber', fillingNumber || 0);
      formData.append('transportation', transportation || '');
      formData.append('transportationNumber', transportationNumber || 0);
      formData.append('subTotal3', subTotal3 || '');
      formData.append('subTotal3Number', subTotal3Number || 0);
      formData.append('marginAmount', marginAmount || '');
      formData.append('marginNumber', marginNumber || 0);
      formData.append('subTotal4', subTotal4 || '');
      formData.append('subTotal4Number', subTotal4Number || 0);
      formData.append('unitPrice', unitPrice || '');
      formData.append('unitPriceNumber', unitPriceNumber || 0);
      formData.append('sizeNumber', 0);
      formData.append('size', '');
            formData.append('userId', userId);

            formData.append('conversation',  '');

      formData.append('description', description || '');
      formData.append('companyId', companyId || '');
      formData.append('checkBox', selectedId || '');
      formData.append('createOn', createOn);
      formData.append('createBy', createBy);

      // Append gallery images if available
      if (galleryImages && Array.isArray(galleryImages)) {
        galleryImages.forEach((image) => {
          formData.append('files', {
            uri: image.uri,
            type: image.mime,
            name: image.uri.split('/').pop(),
          });
        });
      }
  
      console.log('FormData Preview:', formData);
      // API URL
      const apiUrl0 = `${global?.userData?.productURL}${API.ADD_COSTING}`;
      console.log('Final API URL:', apiUrl0);
  
      // Make the API call
      const response = await axios.post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      console.log('API Response:', response.data);
  
      // Show success message and navigate
      Alert.alert('Success', 'Costing data has been added successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Costing'),
        },
      ]);
    } catch (error) {
      if (error.response) {
        // Handle response error
        console.error('Error Response:', error.response.data);
        Alert.alert('Error', `Failed to add costing data. Server responded with status: ${error.response.status}`);
      } else if (error.request) {
        // Handle no response error
        console.error('Error Request:', error.request);
        Alert.alert('Error', 'No response from the server. Please check the server connection.');
      } else {
        // Handle other errors
        console.error('Error Message:', error.message);
        Alert.alert('Error', `An error occurred: ${error.message}`);
      }
    }
  };
  

  const handleSelect = selectedId => {
    setSelectedId(selectedId);

    const selectedButton = radioButtons.find(btn => btn.id === selectedId);
    if (selectedButton && selectedButton.value === 'bathmat') {
      // Navigate to Cushion.js if "Cushion" is selected
      navigation.navigate('NewCosting');
    }
  };

  const handleGoBack = () => {
    navigation.navigate('Costing');
  };

  const handleImagePicker = () => {
    ImagePicker.openPicker({
      multiple: false, // Only allow single image selection
      mediaType: 'photo',
    })
      .then(image => {
        const selectedImage = {
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        };

        // Update the state with the newly selected image
        setGalleryImages([selectedImage]); // Replace the previous image
      })
      .catch(error => {
        console.error('Error picking image:', error);
      });
  };
  const calculateTotal = () => {
    const total =
      (parseFloat(frontBackNumber) || 0) +
      (parseFloat(backNumber) || 0) +
      (parseFloat(liningNumber) || 0) +
      (parseFloat(stitchingNumber) || 0) +
      (parseFloat(finishingNumber) || 0) +
      (parseFloat(zipNumber) || 0) +
      (parseFloat(printingNumber) || 0) +
      (parseFloat(embroiderChenilleNumber) || 0) +
      (parseFloat(handWorkNumber) || 0) +
      (parseFloat(fringesNumber) || 0) +
      (parseFloat(pomPomNumber) || 0) +
      (parseFloat(miscellaneousNumber) || 0) +
      (parseFloat(extra1Number) || 0) +
      (parseFloat(extra2Number) || 0);

    return total.toFixed(2); // Format to 2 decimal places if needed
  };

  useEffect(() => {
    const total = calculateTotal(); // Call the utility function
    setSubTotal1Number(total); // Update the subtotal
  }, [
    frontBackNumber,
    backNumber,
    liningNumber,
    stitchingNumber,
    finishingNumber,
    zipNumber,
    printingNumber,
    embroiderChenilleNumber,
    handWorkNumber,
    fringesNumber,
    pomPomNumber,
    miscellaneousNumber,
    extra1Number,
    extra2Number,
  ]);

  useEffect(() => {
    const overheadsPercent = parseFloat(overheadsAmount) || 0;
    const subtotal = parseFloat(subTotal1Number) || 0;

    const calculatedOverheads = (subtotal * (overheadsPercent / 100)).toFixed(
      2,
    );
    setOverheadsNumber(calculatedOverheads);
  }, [overheadsAmount, subTotal1Number]);

  useEffect(() => {
    const total = parseFloat(calculateTotal()) || 0; // Reuse calculateTotal function
    const overheads = parseFloat(overheadsNumber) || 0; // Get the calculated overheads

    const subTotal2 = (total + overheads).toFixed(2); // Calculate subTotal2
    setSubTotal2Number(subTotal2); // Update the state
  }, [subTotal1Number, overheadsNumber]); // Re-run on changes to these dependencies

  const calculateSubTotal3 = () => {
    const subTotal2 = parseFloat(subTotal2Number) || 0;
    const packaging = parseFloat(packagingNumber) || 0;
    const testing = parseFloat(testingNumber) || 0;
    const filling = parseFloat(fillingNumber) || 0;
    const transportation = parseFloat(transportationNumber) || 0;

    return (subTotal2 + packaging + testing + filling + transportation).toFixed(
      2,
    );
  };

  useEffect(() => {
    const total = calculateSubTotal3(); // Call the utility function
    setSubTotal3Number(total); // Update the subtotal
  }, [
    subTotal2Number,
    packagingNumber,
    testingNumber,
    fillingNumber,
    transportationNumber,
  ]); // Dependencies for re-calculation

  useEffect(() => {
    const subTotal3 = parseFloat(subTotal3Number) || 0;
    const margin = parseFloat(marginAmount) || 0;

    const calculatedMargin = (subTotal3 * (margin / 100)).toFixed(2);
    setMarginNumber(calculatedMargin);
  }, [subTotal3Number, marginAmount]);

  useEffect(() => {
    const subTotal3NumberValue = parseFloat(subTotal3Number) || 0;
    const marginNumberValue = parseFloat(marginNumber) || 0;

    // Calculate subTotal4 as the sum of subTotal3Number and marginNumber
    const subTotal4 = (subTotal3NumberValue + marginNumberValue).toFixed(2);

    setSubTotal4Number(subTotal4); // Update the state with the new value
  }, [subTotal3Number, marginNumber]); // Recalculate when either subTotal3Number or marginNumber changes

  useEffect(() => {
    const subTotal4 = parseFloat(subTotal4Number) || 0;
    const unitPriceValue = parseFloat(unitPrice) || 0;

    // Calculate unitPriceNumber by dividing subTotal4 by unitPrice
    if (unitPriceValue !== 0) {
      const calculatedUnitPrice = (subTotal4 / unitPriceValue).toFixed(2);
      setUnitPriceNumber(calculatedUnitPrice); // Update the unitPriceNumber
    } else {
      setUnitPriceNumber(''); // Set empty if unitPrice is zero to avoid division by zero
    }
  }, [subTotal4Number, unitPrice]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.Topheader}>
            <View style={styles.leftSection}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}>
                <Image
                  style={styles.backImage}
                  source={require('../../../assets/back_arrow.png')}
                />
              </TouchableOpacity>
              <Text style={styles.headerText}>Costing</Text>
            </View>
            <TouchableOpacity onPress={handleSubmit} style={styles.rightSection}>
              <Text style={styles.addCostingText}>ADD</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.radiobutheader}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={id => handleSelect(id)} // Pass selectedId to handler
              selectedId={selectedId} // Bind selectedId to the group
              containerStyle={styles.radioGroup}
            />
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Size:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Sizes Price"
                  placeholderTextColor="#000"
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Size"
                  placeholderTextColor="#000"
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Front / Back:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Front / Back"
                  placeholderTextColor="#000"
                  value={frontBack}
                  onChangeText={setFrontBack}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={frontBackNumber}
                  onChangeText={setFrontBackNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Back:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Back"
                  placeholderTextColor="#000"
                  value={back}
                  onChangeText={setBack}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={backNumber}
                  onChangeText={setBackNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Lining:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Lining"
                  placeholderTextColor="#000"
                  value={lining}
                  onChangeText={setLining}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={liningNumber}
                  onChangeText={setLiningNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Stitching:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Stitching"
                  placeholderTextColor="#000"
                  value={stitching}
                  onChangeText={setStitching}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={stitchingNumber}
                  onChangeText={setStitchingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Finishing:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Finishing"
                  placeholderTextColor="#000"
                  value={finishing}
                  onChangeText={setFinishing}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={finishingNumber}
                  onChangeText={setFinishingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Zip:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Zip"
                  placeholderTextColor="#000"
                  value={zip}
                  onChangeText={setZip}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={zipNumber}
                  onChangeText={setZipNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Printing:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Printing"
                  placeholderTextColor="#000"
                  value={printing}
                  onChangeText={setPrinting}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={printingNumber}
                  onChangeText={setPrintingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Embroider with Chenille:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Embroider / Chenille"
                  placeholderTextColor="#000"
                  value={embroiderChenille}
                  onChangeText={setEmbroiderChenille}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={embroiderChenilleNumber}
                  onChangeText={setEmbroiderChenilleNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Hand Work:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Hand Work"
                  placeholderTextColor="#000"
                  value={handWork}
                  onChangeText={setHandWork}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={handWorkNumber}
                  onChangeText={setHandWorkNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Fringes</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Fringes"
                  placeholderTextColor="#000"
                  value={fringes}
                  onChangeText={setFringes}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fringesNumber}
                  onChangeText={setFringesNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}> Pom Pom</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Pom Pom"
                  placeholderTextColor="#000"
                  value={pomPom}
                  onChangeText={setPomPom}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={pomPomNumber}
                  onChangeText={setPomPomNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Miscellaneous:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Miscellaneous:"
                  placeholderTextColor="#000"
                  value={miscellaneous}
                  onChangeText={setMiscellaneous}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={miscellaneousNumber}
                  onChangeText={setMiscellaneousNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Extra 1</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Extra 1"
                  placeholderTextColor="#000"
                  value={extra1}
                  onChangeText={setExtra1}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={extra1Number}
                  onChangeText={setExtra1Number}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Extra 2</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Extra 2"
                  placeholderTextColor="#000"
                  value={extra2}
                  onChangeText={setExtra2}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={extra2Number}
                  onChangeText={setExtra2Number}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>SUB TOTAL 1</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="SUB TOTAL 1"
                  placeholderTextColor="#000"
                  value={subTotal1}
                  onChangeText={setSubTotal1}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={subTotal1Number} // Display the calculated subtotal
                  editable={false} // Prevent editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Overheads</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric" // Allow only numeric input
                  value={overheadsAmount}
                  onChangeText={setOverheadsAmount} // Update overhead percentage
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Calculated Overheads"
                  placeholderTextColor="#000"
                  value={overheadsNumber} // Display calculated overheads
                  editable={false} // Make it read-only
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>SUB TOTAL 2</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="SUB TOTAL 2"
                  placeholderTextColor="#000"
                  value={subTotal2}
                  onChangeText={setSubTotal2}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Calculated SubTotal2"
                  placeholderTextColor="#000"
                  value={subTotal2Number} // Display the calculated value
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Packaging</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Packaging"
                  placeholderTextColor="#000"
                  value={packaging}
                  onChangeText={setPackaging}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={packagingNumber}
                  onChangeText={setPackagingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Testing</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Testing"
                  placeholderTextColor="#000"
                  value={testing}
                  onChangeText={setTesting}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={testingNumber}
                  onChangeText={setTestingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Filling</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Filling"
                  placeholderTextColor="#000"
                  value={filling}
                  onChangeText={setFilling}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fillingNumber}
                  onChangeText={setFillingNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Transportation </Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Transportation"
                  placeholderTextColor="#000"
                  value={transportation}
                  onChangeText={setTransportation}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={transportationNumber}
                  onChangeText={setTransportationNumber}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>SUB TOTAL 3</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="SUB TOTAL 3"
                  placeholderTextColor="#000"
                  value={subTotal3}
                  onChangeText={setSubTotal3}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="SUB TOTAL 3"
                  placeholderTextColor="#000"
                  value={subTotal3Number} // Display the calculated value
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Margin</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={marginAmount}
                  onChangeText={setMarginAmount} // Allow user input
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Margin Amount"
                  placeholderTextColor="#000"
                  value={marginNumber} // Display the calculated margin
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>SUB TOTAL 4</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="SUB TOTAL 4"
                  placeholderTextColor="#000"
                  value={subTotal4}
                  onChangeText={setSubTotal4}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={subTotal4Number}
                  onChangeText={setSubTotal4Number}
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Unit Price</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                />
              </View>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={unitPriceNumber}
                  onChangeText={setUnitPriceNumber}
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.descriptionhead}>
            <TextInput
              style={styles.descriptiontxt}
              placeholder="Description"
              placeholderTextColor="#000"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.chooseimghead}>
            <Text style={styles.choosetxt}>Choose Image</Text>
          </TouchableOpacity>
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {galleryImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{uri: image.uri}} style={styles.imagePreview} />
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radiobutheader: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  Topheader: {
    flexDirection: 'row',
    alignItems: 'center', // Vertical alignment for items
    justifyContent: 'space-between', // Space left and right sections
    marginHorizontal: 10,
    marginVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically align back button and "Costing" text
  },
  backButton: {
    marginRight: 10, // Add spacing between back button and "Costing" text
  },
  backImage: {
    height: 25,
    width: 25,
  },
  headerText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#000',
  },
  rightSection: {
    borderWidth: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'lightgray',
  },
  headSize: {
    marginBottom: 10,
    marginHorizontal: 15,
  },
  lengthHead: {
    flex: 2,
    marginRight: 5,
  },
  lengthText: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lengthhead: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  lengthtext: {
    color: '#333',
  },
  descriptionhead: {
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 5,
    paddingVertical: 25,
  },
  descriptiontxt: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#000',
    fontSize: 15,
  },
  chooseimghead: {
    borderWidth: 1,
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#1F74BA',
    alignSelf: 'flex-start',
    marginRight: 15,
    marginTop: 10,
  },
  choosetxt: {
    color: '#fff',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal:10
  },
  imagePreview: {
    width: 70,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
});
export default Cushion;
