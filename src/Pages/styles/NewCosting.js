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

const NewCosting = ({navigation, route}) => {
  const {costingRequest} = route?.params || {};
  const [costId, setCostId] = useState(null); // Initialize costId in the state
  
  useEffect(() => {
    // Get the costId when the component loads
    const id = costingRequest?.costingRequest?.[0]?.costId;
    setCostId(id);
  }, [costingRequest]); // This effect will run when costingRequest changes

  const [isSubmitting, setIsSubmitting] = useState(false);

  const costingRequestData = costingRequest?.costingRequest;

  const [dataLoaded, setDataLoaded] = useState(false);

  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const [selectedId, setSelectedId] = useState(null);
  const [isYarnVisible, setIsYarnVisible] = useState(false);
  const [isAddInputVisible, setIsAddInputVisible] = useState(false);
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [squareFeet, setSquareFeet] = useState(0);
  const [price, setPrice] = useState('');
  const [consumption, setConsumption] = useState('');
  const [material, setMaterial] = useState('');
  const [wastagePercent, setWastagePercent] = useState(''); // Initially empty
  const [yarnPercent, setYarnPercent] = useState('');
  const [dyingPercent, setDyingPercent] = useState(''); // State to track Dying Percent
  const [weavingPercent, setWeavingPercent] = useState('');
  const [pipingPercent, setPipingPercent] = useState('');
  const [yarnRows, setYarnRows] = useState([
    {material: '', price: '', consumption: ''},
  ]);
  const [inputFields, setInputFields] = useState([
    {id: Date.now(), description: '', amnt: '', total: '0.00'},
  ]);
  const [amnt, setAmnt] = useState(0); // Default to 0
  const [overheadsPercent, setOverheadsPercent] = useState(''); // Default to 0%
  const [fridge1, setFridge1] = useState('');
  const [fridge2, setFridge2] = useState('');
  const [fridge1cal, setFridge1cal] = useState('');
  const [fridge5, setFridge5] = useState('');
  const [fridge6, setFridge6] = useState('');
  const [fridge7, setFridge7] = useState('');
  const [freight, setFreight] = useState('');
  const [packing, setPacking] = useState('');
  const [margin, setMargin] = useState('');
  const [description, setDescription] = useState('');
  const [conversation, setConversation] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
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
      if (button.id === '2') {
        // Disable 'Cushion' if checkBox ID exists
        return {...button, disabled: !!requestData.checkBox};
      }
      return button;
    });

    setRadioButtons(updatedRadioButtons);

    // Map through ksMaterials to populate yarnRows
    if (Array.isArray(requestData.ksMaterials)) {
      const updatedYarnRows = requestData.ksMaterials.map(item => ({
        material: item.ksMaterial || '',
        price: item.ksPrice?.toString() || '',
        consumption: item.ksCunsuption?.toString() || '',
      }));
      setYarnRows(updatedYarnRows);
    }

    // Map through totalInputs to populate inputFields
    if (Array.isArray(requestData.totalInputs)) {
      const populatedFields = requestData.totalInputs.map(item => ({
        id: item.ksCostId || Date.now(), // Use ksCostId for a unique ID if available
        description: item.description || '',
        amnt: item.amount?.toString() || '',
        total: (item.amount * (item.unit || 1)).toFixed(2), // Calculate total as amount * unit
      }));
      setInputFields(populatedFields); // Set state with pre-populated values
    }

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
    setLength(requestData.locationLength?.toString() || '');
    setBreadth(requestData.locationBreadth?.toString() || '');
    setSquareFeet(requestData.squareFeet || 0);
    setPrice(requestData.perSqFt?.toString() || '');
    setConsumption(requestData.consumptionTotal?.toString() || '');
    setWastagePercent(requestData.wastagepercent?.toString() || '');
    setYarnPercent(requestData.yarnpercent?.toString() || '');
    setDyingPercent(requestData.dyingpercent?.toString() || '');
    setWeavingPercent(requestData.weavingpercent?.toString() || '');
    setPipingPercent(requestData.pipingpercent?.toString() || '');
    setDescription(requestData.description || '');
    setConversation(requestData.conversation?.toString() || '');
    setFreight(requestData.freight?.toString() || '');
    setPacking(requestData.packing?.toString() || '');
    setMargin(requestData.margin?.toString() || '');
    setOverheadsPercent(requestData.overheadspercent?.toString() || '');
    setFridge1(requestData.f1?.toString() || '');
    setFridge2(requestData.f2?.toString() || '');
    setFridge5(requestData.f3?.toString() || '');
    setFridge6(requestData.f6?.toString() || '');
    setFridge7(requestData.f7?.toString() || '');
    setSelectedId(requestData.checkBox?.toString() || '');

    setDataLoaded(true); // Mark data as loaded
  }, [costingRequest]);

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);

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

  const handleLengthChange = text => {
    setLength(text);
    calculateSquareFeet(text, breadth);
  };

  const handleBreadthChange = text => {
    setBreadth(text);
    calculateSquareFeet(length, text);
  };

  const calculateSquareFeet = (length, breadth) => {
    const len = parseFloat(length) || 0;
    const bre = parseFloat(breadth) || 0;
    const sqFeet = (len * bre) / 929;
    setSquareFeet(sqFeet.toFixed(2));
  };

  const calculateTotal = (price, consumption) => {
    const priceValue = parseFloat(price) || 0;
    const consumptionValue = parseFloat(consumption) || 0;
    return (priceValue * consumptionValue).toFixed(2);
  };

  const calculatePieceWeight = () => {
    const totalConsumption = parseFloat(calculateTotalConsumption()) || 0;
    const squareFeetValue = parseFloat(squareFeet) || 0;
    return (totalConsumption * squareFeetValue).toFixed(2);
  };

  const calculatePieceWeightWithWastage = () => {
    const pieceWeight = parseFloat(calculatePieceWeight()) || 0;
    const wastage = parseFloat(wastagePercent) || 0; // Ensure wastage percent is a number
    return (pieceWeight + pieceWeight * (wastage / 100)).toFixed(2); // Apply percentage calculation
  };

  const calculateYarnPercentWithPieceWeight = () => {
    const totalPercentage = parseFloat(calculateTotalPercentage()) || 0;
    const pieceWeightWithWastage =
      parseFloat(calculatePieceWeightWithWastage()) || 0;
    return (totalPercentage * pieceWeightWithWastage).toFixed(2);
  };
  useEffect(() => {
    const yarnValue = calculateYarnPercentWithPieceWeight();
    setYarnPercent(yarnValue);
  }, [wastagePercent]);

  const calculateDyingPercentWithYarn = () => {
    const pieceWeightWithWastage =
      parseFloat(calculatePieceWeightWithWastage()) || 0;
    const dying = parseFloat(dyingPercent) || 0; // Ensure dying percent is a number
    return (pieceWeightWithWastage * dying).toFixed(2); // Apply percentage calculation
  };
  const calculateWeavingPercent = () => {
    const weaving = parseFloat(weavingPercent) || 0; // Ensure valid number
    const sqFeet = parseFloat(squareFeet) || 0; // Ensure valid number
    return (weaving * sqFeet).toFixed(2); // Perform multiplication and round to 2 decimals
  };

  const calculatePipingPercent = () => {
    const piping = parseFloat(pipingPercent) || 0; // Ensure valid number
    const sqFeet = parseFloat(squareFeet) || 0; // Ensure valid number
    return (piping * sqFeet).toFixed(2); // Perform multiplication and round to 2 decimals
  };

  const handleAddYarn = () => {
    setYarnRows(prevRows => [
      ...prevRows,
      {material: '', price: '', consumption: '', total: '0.00'},
    ]);
  };

  const handleRemoveYarn = index => {
    setYarnRows(prevRows => prevRows.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    setYarnRows(prevRows =>
      prevRows.map((row, i) => {
        if (i === index) {
          const updatedRow = {
            ...row,
            [field]: value, // Update the field
          };
          updatedRow.total = calculateRowTotal(
            updatedRow.price,
            updatedRow.consumption,
          );
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const calculateRowTotal = (price, consumption) => {
    const parsedPrice = parseFloat(price) || 0;
    const parsedConsumption = parseFloat(consumption) || 0;
    return (parsedPrice * parsedConsumption).toFixed(2);
  };

  const calculateTotalPrice = () => {
    return yarnRows
      .reduce(
        (total, row) =>
          total + parseFloat(row.price || 0) * parseFloat(row.consumption || 0),
        0,
      )
      .toFixed(2);
  };

  const calculateTotalConsumption = () => {
    return yarnRows
      .reduce((total, row) => total + parseFloat(row.consumption || 0), 0)
      .toFixed(2);
  };

  const calculateTotalPercentage = () => {
    const totalPrice = parseFloat(calculateTotalPrice()) || 0;
    const totalConsumption = parseFloat(calculateTotalConsumption()) || 0;
    if (totalConsumption === 0) return '0.00'; // Avoid division by zero
    return (totalPrice / totalConsumption).toFixed(2);
  };

  const handleAddInput = () => {
    setInputFields([
      ...inputFields,
      {id: Date.now(), description: '', amnt: '', total: ''}, // Add a unique ID
    ]);
  };

  const handleAmntChange = (id, amntValue) => {
    setInputFields(prevFields =>
      prevFields.map(field =>
        field.id === id
          ? {
              ...field,
              amnt: amntValue, // Update Amnt
              total: (
                parseFloat(amntValue || 0) * parseFloat(squareFeet || 0)
              ).toFixed(2), // Calculate Total
            }
          : field,
      ),
    );
  };

  // Function to handle removing an input field
  const handleRemoveInput = id => {
    setInputFields(inputFields.filter(field => field.id !== id));
  };

  const calculateTotalForAddInput = () => {
    const amntValue = parseFloat(amnt) || 0; // Ensure `amnt` is parsed as a number
    const squareFeetValue = parseFloat(squareFeet) || 0; // Ensure `squareFeet` is parsed as a number
    return (amntValue * squareFeetValue).toFixed(2); // Calculate and format to 2 decimal places
  };

  const calculateTotalSum = () => {
    const yarnPercent = parseFloat(calculateYarnPercentWithPieceWeight()) || 0;
    const dyingPercent = parseFloat(calculateDyingPercentWithYarn()) || 0;
    const weavingPercent = parseFloat(calculateWeavingPercent()) || 0;
    const pipingPercent = parseFloat(calculatePipingPercent()) || 0;

    // Calculate the sum of all input field totals
    const addInputTotal = inputFields.reduce((sum, field) => {
      const amntValue = parseFloat(field.amnt) || 0;
      const squareFeetValue = parseFloat(squareFeet) || 0; // Assuming squareFeet is globally defined
      return sum + amntValue * squareFeetValue;
    }, 0);

    return (
      yarnPercent +
      dyingPercent +
      weavingPercent +
      pipingPercent +
      addInputTotal
    ).toFixed(2);
  };

  const calculateOverheadsValue = () => {
    const totalSum = parseFloat(calculateTotalSum()) || 0; // Total calculated value
    const overheadPercentValue = parseFloat(overheadsPercent);
    if (isNaN(overheadPercentValue)) {
      return '0.00'; // Return '0.00' if overheadPercent is invalid
    }
    const overheadsValue = (overheadPercentValue / 100) * totalSum;
    return overheadsValue.toFixed(2); // Format to 2 decimal places
  };

  const calculateAllTotal = () => {
    const totalSum = parseFloat(calculateTotalSum()) || 0;
    const overheadsValue = parseFloat(calculateOverheadsValue()) || 0;
    const allTotal = totalSum + overheadsValue;

    return allTotal.toFixed(2); // Format to 2 decimal places
  };

  const calculateINRPerSqFt = () => {
    const allTotal = parseFloat(calculateAllTotal()) || 0;

    const squareFeetValue = parseFloat(squareFeet) || 0;
    if (squareFeetValue === 0) {
      return '0.00'; // Return 0 if squareFeet is 0
    }
    const inrPerSqFt = allTotal / squareFeetValue;

    return inrPerSqFt.toFixed(2); // Format to 2 decimal places
  };

  const calculateFridge1cal = () => {
    const fridge1Value = parseFloat(fridge1) || 0;
    const fridge2Value = parseFloat(fridge2) || 0;

    // Calculate fridge1cal by multiplying fridge1 and fridge2
    const calculatedValue = fridge1Value * fridge2Value;

    // Update fridge1cal state
    setFridge1cal(calculatedValue.toFixed(2)); // Format to 2 decimal places
  };

  // Call calculateFridge1cal when either fridge1 or fridge2 changes
  React.useEffect(() => {
    calculateFridge1cal();
  }, [fridge1, fridge2]);

  const calculateFridge5 = () => {
    const totalConsumption = parseFloat(calculateTotalConsumption()) || 0;
    const calculatedFridge5 =
      totalConsumption === 0 ? 0 : parseFloat(fridge1cal) / totalConsumption;
    setFridge5(calculatedFridge5.toFixed(2)); // Update fridge5
  };

  useEffect(() => {
    calculateFridge5();
  }, [fridge1cal, yarnRows]);

  const calculateFreight = () => {
    const fridge7Value = parseFloat(fridge7) || 0;
    const squareFeetValue = parseFloat(squareFeet) || 0;

    const calculatedFreight = fridge7Value * squareFeetValue;
    setFreight(calculatedFreight.toFixed(2)); // Format to 2 decimal places
  };

  // Use effect to calculate freight whenever fridge7 or squareFeet changes
  useEffect(() => {
    calculateFreight();
  }, [fridge7, squareFeet]);

  const calculateTotalCost = () => {
    const inrPerSqFt = parseFloat(calculateINRPerSqFt()) || 0;
    const squareFeetValue = parseFloat(squareFeet) || 0;
    const packingValue = parseFloat(packing) || 0;
    const freightValue = parseFloat(freight) || 0;

    // Calculate total cost including packing and freight
    const totalCost =
      inrPerSqFt * squareFeetValue + packingValue + freightValue;
    return totalCost.toFixed(2); // Format to 2 decimal places
  };

  const calculateFOB = () => {
    const totalCost = parseFloat(calculateTotalCost()) || 0;

    if (!margin || !conversation) {
      return '0.00'; // Return 0 if either margin or conversation is missing
    }

    const marginValue = parseFloat(margin) || 0; // User-entered margin
    const conversationValue = parseFloat(conversation) || 1; // Default to 1 if not provided

    if (conversationValue === 0) {
      return '0.00'; // Prevent division by zero
    }

    const marginAsDecimal = marginValue / 100;

    const fobValue =
      (totalCost + totalCost * marginAsDecimal) / conversationValue;
    return fobValue.toFixed(2); // Format to 2 decimal places
  };
  const calculatePerSqFt = () => {
    const fobValue = parseFloat(calculateFOB()) || 0;
    const squareFeetValue = parseFloat(squareFeet) || 0;

    if (squareFeetValue === 0) {
      return '0.00'; // Prevent division by zero
    }

    const perSqFtValue = fobValue / squareFeetValue;
    return perSqFtValue.toFixed(2); // Format to 2 decimal places
  };

  const calculatePerSqMtr = () => {
    const perSqFtValue = parseFloat(calculatePerSqFt()) || 0;
    const perSqMtrValue = perSqFtValue * 10.76; // Convert to per square meter
    return perSqMtrValue.toFixed(2); // Format to 2 decimal places
  };

  const calculatePerKg = () => {
    const perSqFtValue = parseFloat(calculatePerSqFt()) || 0;
    const perKgValue = perSqFtValue * 6;

    return perKgValue.toFixed(2); // Format to 2 decimal places
  };

  const handleGoBack = () => {
    navigation.goBack();
  };
  useFocusEffect(
    React.useCallback(() => {
      // Reset to "Bathmat" every time the screen is focused (when coming back)
      setSelectedId('1');
    }, []),
  );

  const handleSelect = selectedId => {
    setSelectedId(selectedId);

    const selectedButton = radioButtons.find(btn => btn.id === selectedId);
    if (selectedButton && selectedButton.value === 'cushion') {
      // Navigate to Cushion.js if "Cushion" is selected
      navigation.navigate('Cushion');
    }
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

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple clicks

    setIsSubmitting(true);
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
        costingRequest?.costingRequest?.[0]?.ksImageName ||'',
      );
      console.log('ksImageName:', ksImageName);
      
      // Append individual fields
      formData.append('costId', costId);
      formData.append('locationLength', length || '');
      formData.append('locationBreadth', breadth || '');
      formData.append('squareFeet', squareFeet || '');
      formData.append('quality', calculateTotalConsumption() || '');
      formData.append('pieceweight', calculatePieceWeight() || '');
      formData.append('wastagepercent', wastagePercent || '');
      formData.append('wastage', calculatePieceWeightWithWastage() || '');
      formData.append(
        'yarnpercent',
        calculateYarnPercentWithPieceWeight() || '',
      );
      formData.append('yarn', calculateYarnPercentWithPieceWeight() || '');
      formData.append('dyingpercent', dyingPercent || '');
      formData.append('dying', calculateDyingPercentWithYarn() || '');
      formData.append('weavingpercent', weavingPercent || '');
      formData.append('weaving', calculateWeavingPercent() || '');
      formData.append('pipingpercent', pipingPercent || '');
      formData.append('piping', calculatePipingPercent() || '');
      formData.append('total', calculateTotalSum() || '');
      formData.append('f1', fridge1 || '');
      formData.append('f2', fridge2 || '');
      formData.append('f3', fridge1cal || '');
      formData.append('f4', calculateTotalConsumption() || '');
      formData.append('f5', fridge5 || '');
      formData.append('f6', fridge6 || '');
      formData.append('f7', fridge7 || '');
      formData.append('overheadspercent', overheadsPercent || '');
      formData.append('overheads', calculateOverheadsValue() || '');
      formData.append('grandTotal', calculateAllTotal() || '');
      formData.append('inrpersqft', calculateINRPerSqFt() || '');
      formData.append('packing', packing || '');
      formData.append('freight', freight || '');
      formData.append('totalvalue', calculateTotalCost() || '');
      formData.append('margin', margin || '');
      formData.append('FOB', calculateFOB() || '');
      formData.append('perSqFt', calculatePerSqFt() || '');
      formData.append('sumone', calculatePerSqMtr() || '');
      formData.append('sumtwo', calculatePerKg() || '');

      formData.append('createOn', createOn);
      formData.append('createBy', createBy);
      formData.append('checkBox', selectedId || '');

      formData.append('companyId', companyId || '');
      formData.append('conversation', conversation || 0);
      formData.append('userId', userId);
      console.log('ksImageName:', ksImageName); // Debugging log
      if (ksImageName) {
        formData.append('ksImageName', ksImageName);
      } else {
        console.warn('ksImageName is empty or null.');
      }

      const formattedInputFields = inputFields.map(field => ({
        description: field.description || '', // Use a default empty string if description is not set.
        amount: parseFloat(field.amnt || 0), // Parse `amnt` as a number for `amount`.
        unit: parseFloat(field.total || 0), // Parse `total` as a number for `unit`.
        // Remove ksCompanyId
      }));

      // Append `totalInputs` to FormData as a stringified JSON array.
      if (formattedInputFields.length > 0) {
        formData.append('totalInputs', JSON.stringify(formattedInputFields));
      }

      const formattedYarnRows = yarnRows.map(row => ({
        ksMaterial: row.material || '', // Default to empty string if not set
        ksPrice: parseFloat(row.price || 0), // Ensure price is a number
        ksCunsuption: parseFloat(row.consumption || 0), // Ensure consumption is a number
        totalPrice: calculateTotal(row.price, row.consumption) || 0,
      }));

      if (formattedYarnRows.length > 0) {
        formData.append('ksMaterials', JSON.stringify(formattedYarnRows));
      }

      formData.append('description', description || '');

      // if (galleryImages && Array.isArray(galleryImages)) {
      //   galleryImages.forEach(image => {
      //     formData.append('files', {
      //       uri: image.uri,
      //       type: image.mime,
      //       name: image.uri.split('/').pop(),
      //     });
      //   });
      // }
      
      if (galleryImages && Array.isArray(galleryImages)) {
        galleryImages.forEach(image => {
          formData.append('files', {
            uri: image.uri,
            type: image.mime || 'application/octet-stream', // Default content-type if mime is not present
            name: image.uri.split('/').pop(),
          });
        });
      }
      console.log('FormData Preview:', formData);

      const apiUrl0 = `${global?.userData?.productURL}${API.ADD_COSTING}`;
      console.log('Final API URL:', apiUrl0);

      // API call
      const response = await axios.post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
        timeout: 30000, // Set a timeout of 30 seconds
      });

      console.log('API Response:', response.data);
      Alert.alert('Success', 'Costing data has been added successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Costing'), // Navigate to Costing screen
        },
      ]);
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert('Error', 'Failed to add costing data. Please try again.');
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission
    }
  };

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
              <Text style={styles.headerText}>
          {costId === 0 || !costId ? 'New Costing' : ` ${costId}`}
        </Text>
            </View>
            <TouchableOpacity
              onPress={!isSubmitting ? handleSubmit : null} // Prevent multiple submissions
              disabled={isSubmitting} // Disable button when submitting
              style={[
                styles.rightSection,
                {opacity: isSubmitting ? 0.5 : 1}, // Dim button when disabled
              ]}>
              <Text style={styles.addCostingText}>
          {isSubmitting ? 'Submitting...' : costId === 0 || !costId ? 'Add' : 'Save'}
        </Text>
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
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={length}
                  onChangeText={handleLengthChange}
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={breadth}
                  onChangeText={handleBreadthChange}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSquare}>
            <Text style={styles.labelSquare}>Square Feet:</Text>
            <View style={styles.inputContainerSquare}>
              <View style={styles.lengthheadSquare}>
                <TextInput
                  style={styles.lengthtextSquare}
                  value={squareFeet.toString()}
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headQuality}>
            <Text style={styles.labelQuality}>Quality:</Text>
            <View style={styles.inputContainerQuality}>
              <View style={styles.lengthheadQuality}>
                <TextInput
                  style={styles.lengthtextQuality}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={calculateTotalConsumption()} // Dynamically compute the total consumption
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
          </View>
          <View style={styles.yarnhead}>
            <View style={styles.yarnHeaderContainer}>
              <Text style={styles.yarntxt}>YARN CALCULATION</Text>
              <TouchableOpacity
                onPress={handleAddYarn}
                style={styles.addyarnbtn}>
                <Text>Add Yarn</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.yarnheaders}>
              <Text style={styles.yarnHeaderTextAction}>Action</Text>
              <Text style={styles.yarnHeaderTextMaterial}>Material</Text>
              <Text style={styles.yarnHeaderTextPrice}>Price</Text>
              <Text style={styles.yarnHeaderTextConsumption}>Consumption</Text>
            </View>
            {yarnRows.map((row, index) => (
              <View key={index} style={styles.yarnRow}>
                <TouchableOpacity onPress={() => handleRemoveYarn(index)}>
                  <Image
                    style={styles.buttonIcon}
                    source={require('../../../assets/del.png')}
                  />
                </TouchableOpacity>
                <View style={styles.Materialhead}>
                  <TextInput
                    style={styles.Materialtext}
                    placeholder="Material"
                    placeholderTextColor="#000"
                    value={row.material}
                    onChangeText={text =>
                      handleInputChange(index, 'material', text)
                    }
                  />
                </View>
                <View style={styles.Pricehead}>
                  <TextInput
                    style={styles.Pricetext}
                    placeholder="0"
                    placeholderTextColor="#000"
                    keyboardType="decimal-pad" // Allows decimals
                    value={row.price.toString()}
                    onChangeText={text =>
                      handleInputChange(
                        index,
                        'price',
                        text.replace(/[^0-9.]/g, ''),
                      )
                    }
                  />
                </View>
                <View style={styles.Consumptionhead}>
                  <TextInput
                    style={styles.Consumptiontext}
                    placeholder="0"
                    placeholderTextColor="#000"
                    keyboardType="decimal-pad" // Allows decimals
                    value={row.consumption.toString()}
                    onChangeText={text =>
                      handleInputChange(
                        index,
                        'consumption',
                        text.replace(/[^0-9.]/g, ''),
                      )
                    }
                  />
                </View>
                <View style={styles.pricemultiplyConsumptiontotalhead}>
                  <TextInput
                    style={styles.pricemultiplyConsumptiontotal}
                    placeholder="0.00"
                    placeholderTextColor="#000"
                    value={(
                      parseFloat(row.price) * parseFloat(row.consumption) || 0
                    ).toFixed(2)}
                    editable={false}
                  />
                </View>
              </View>
            ))}

            <View style={styles.yarnFooter}>
              <View>
                <Text style={styles.totalText}>Total : </Text>
              </View>

              <View>
                <TextInput
                  style={styles.totalPricetext}
                  placeholder="Total Consumption"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={calculateTotalConsumption()} // Dynamically compute the total consumption
                  editable={false} // Prevent manual editing
                />
              </View>
              <View>
                <TextInput
                  style={styles.totalPricetext}
                  placeholder="Total Price"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={calculateTotalPrice()} // Dynamically compute the total price
                  editable={false} // Prevent manual editing
                />
              </View>
              <View>
                <TextInput
                  style={styles.totalPricetext1}
                  placeholder="0.00"
                  placeholderTextColor="#000"
                  value={calculateTotalPercentage()} // Dynamically update the percentage
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
          </View>

          <View style={styles.headSquare}>
            <Text style={styles.labelSquare}>Piece Weight:</Text>
            <View style={styles.inputContainerSquare}>
              <View style={styles.lengthheadSquare}>
                <TextInput
                  style={styles.lengthtextSquare}
                  placeholder="Piece Weight"
                  placeholderTextColor="#000"
                  value={calculatePieceWeight()} // Dynamically calculate and display Piece Weight
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>PC WT w/Wastage:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={wastagePercent}
                  onChangeText={text => setWastagePercent(text)} // Update wastage percent
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Wastage Percent 0.00" // Default value before wastage percent is entered
                  placeholderTextColor="#000"
                  value={
                    wastagePercent ? calculatePieceWeightWithWastage() : '0.00'
                  } // Show result after wastagePercent is entered
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Yarn:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadyarn}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Yarn Percent"
                  placeholderTextColor="#000"
                  value={calculateTotalPercentage()} // Dynamically update the percentage
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Yarn Percent * "
                  placeholderTextColor="#000"
                  value={
                    yarnPercent ? calculateYarnPercentWithPieceWeight() : '0.00'
                  } // Display result after yarnPercent is entered
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Dying:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric" // Ensure numeric input
                  value={dyingPercent}
                  onChangeText={text => setDyingPercent(text)} // Update state with entered value
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="0.00" // Default value before any calculation is entered
                  placeholderTextColor="#000"
                  value={
                    dyingPercent ? calculateDyingPercentWithYarn() : '0.00'
                  } // Show result after Dying Percent is entered
                  editable={false} // Make it read-only
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <Text style={styles.label}>Weaving:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={weavingPercent} // Show the current value of Weaving Percent
                  onChangeText={text => setWeavingPercent(text)} // Update the Weaving Percent value
                  keyboardType="numeric" // Ensure numeric input for percentage
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Weaving Percent 0"
                  placeholderTextColor="#000"
                  value={weavingPercent ? calculateWeavingPercent() : '0.00'} // Show result after calculation
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <View style={styles.Pipinghead}>
              <Text style={styles.label}>Piping:</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={pipingPercent} // Show the current value of Piping Percent
                  onChangeText={text => setPipingPercent(text)} // Update the Piping Percent value
                  keyboardType="numeric" // Ensure numeric input for percentage
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Piping Percent 0"
                  placeholderTextColor="#000"
                  value={pipingPercent ? calculatePipingPercent() : '0.00'} // Show result after calculation
                  editable={false}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddInput}
            style={styles.addinputhead}>
            <Text>Add Input</Text>
          </TouchableOpacity>
          {inputFields.map(field => (
            <View key={field.id} style={styles.headSizeadd}>
              <View style={styles.inputContainer}>
                <View style={styles.lengthHead}>
                  <TextInput
                    style={styles.lengthText}
                    placeholder="Description"
                    placeholderTextColor="#000"
                    value={field.description}
                    onChangeText={text =>
                      setInputFields(prevFields =>
                        prevFields.map(f =>
                          f.id === field.id ? {...f, description: text} : f,
                        ),
                      )
                    }
                  />
                </View>
                <View style={styles.DescriptionInput1}>
                  <TextInput
                    style={styles.breadthText}
                    placeholder="Amnt"
                    placeholderTextColor="#000"
                    value={field.amnt}
                    onChangeText={text => handleAmntChange(field.id, text)} // Update Amnt and Total
                  />
                </View>
                <View style={styles.DescriptionInput2}>
                  <TextInput
                    style={styles.breadthText}
                    placeholder="Total"
                    placeholderTextColor="#000"
                    value={field.total} // Display the dynamically calculated Total
                    editable={false} // Prevent manual editing
                  />
                </View>
                <TouchableOpacity onPress={() => handleRemoveInput(field.id)}>
                  <Image
                    style={styles.buttonIcon}
                    source={require('../../../assets/del.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.headSquare}>
            <Text style={styles.labelSquare}>Total:</Text>
            <View style={styles.inputContainerSquare}>
              <View style={styles.lengthheadSquare}>
                <TextInput
                  style={styles.lengthtextSquare}
                  placeholder="total0.00"
                  placeholderTextColor="#000"
                  value={calculateTotalSum()} // Dynamically calculate and display total
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSize}>
            <View style={styles.Pipinghead}>
              <Text style={styles.label}>Overheads:</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthhead}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={overheadsPercent} // Display the current percentage value
                  onChangeText={text => setOverheadsPercent(text)} // Update the state on user input
                />
              </View>
              <View style={styles.Breadthhead}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Overheads Percent 0"
                  placeholderTextColor="#000"
                  value={calculateOverheadsValue()} // Display the dynamically calculated overheads value
                  editable={false} // Prevent user editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSquare}>
            <Text style={styles.labelSquare}>Total:</Text>
            <View style={styles.inputContainerSquare}>
              <View style={styles.lengthheadSquare}>
                <TextInput
                  style={styles.lengthtextSquare}
                  placeholder="All Total"
                  placeholderTextColor="#000"
                  value={calculateAllTotal()} // Dynamically calculate and display all total
                  editable={false} // Prevent user editing
                />
              </View>
            </View>
          </View>
          <View style={styles.headSquare}>
            <Text style={styles.labelSquare}>inr per sq ft:</Text>
            <View style={styles.inputContainerSquare}>
              <View style={styles.lengthheadSquare}>
                <TextInput
                  style={styles.lengthtextSquare}
                  placeholder="INR per sq ft"
                  placeholderTextColor="#000"
                  value={calculateINRPerSqFt()} // Display calculated INR per sq ft
                  editable={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.headSizefridge}>
            <View style={styles.Pipingheadfridge}>
              <Text style={styles.label}>FREIGHT CALCULATION:</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fridge1} // Bind the fridge1 value to state
                  onChangeText={setFridge1} // Update fridge1 state on input change
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fridge2} // Bind the fridge2 value to state
                  onChangeText={setFridge2} // Update fridge2 state on input change
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="fridge1cal"
                  placeholderTextColor="#000"
                  value={fridge1cal} // Dynamically display the calculated fridge1cal
                  editable={false} // Prevent manual editing of the result
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.totalPricetext}
                  placeholder="Total Consumption"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={calculateTotalConsumption()} // Dynamically compute the total consumption
                  editable={false} // Prevent manual editing
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="fridge5"
                  placeholderTextColor="#000"
                  value={fridge5} // Display the calculated fridge5
                  editable={false} // Prevent manual editing of the result
                />
              </View>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fridge6}
                  onChangeText={setFridge6}
                />
              </View>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="0"
                  placeholderTextColor="#000"
                  value={fridge7} // Bind fridge7 value to state
                  onChangeText={setFridge7} // Update fridge7 state on input change
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Conversation"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={conversation}
                  onChangeText={setConversation} // Update conversation value
                />
              </View>
            </View>
          </View>
          <View style={styles.headSizefridge}>
            <View style={styles.headercal}>
              <Text>L</Text>
              <Text>B</Text>
              <Text>sq ft</Text>
              <Text>price/sq ft</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.lengthtext}
                  placeholder="Length"
                  placeholderTextColor="#000"
                  value={length}
                  onChangeText={handleLengthChange}
                  editable={false}
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Breadth"
                  placeholderTextColor="#000"
                  value={breadth}
                  editable={false}
                  onChangeText={handleBreadthChange}
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  value={squareFeet.toString()}
                  editable={false}
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="INR per sq ft"
                  placeholderTextColor="#000"
                  value={calculateINRPerSqFt()} // Display calculated INR per sq ft
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.headercal1}>
              <Text>packing</Text>
              <Text>freight</Text>
              <Text>total</Text>
              <Text>margin</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="packing"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={packing}
                  onChangeText={setPacking} // Update packing value
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="freight"
                  placeholderTextColor="#000"
                  value={freight} // Dynamically display the calculated freight
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="Total Cost"
                  placeholderTextColor="#000"
                  value={calculateTotalCost()} // Display calculated total cost
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.lengthheadfridge}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="margin"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={margin}
                  onChangeText={setMargin} // Update margin value
                />
              </View>
            </View>
            <View style={styles.headercal2}>
              <Text>FOB</Text>
              <Text>per sq ft</Text>
              <Text>per sq mtr</Text>
              <Text>per kg</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="FOB"
                  placeholderTextColor="#000"
                  value={calculateFOB()} // Display calculated FOB
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="per sq ft"
                  placeholderTextColor="#000"
                  value={calculatePerSqFt()} // Display calculated "per sq ft" value
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="per sq mtr"
                  placeholderTextColor="#000"
                  value={calculatePerSqMtr()} // Display calculated "per sq mtr" value
                  editable={false} // Prevent manual editing
                />
              </View>
              <View style={styles.lengthheadfridgenoneditable}>
                <TextInput
                  style={styles.Breadthtext}
                  placeholder="per kg"
                  placeholderTextColor="#000"
                  value={calculatePerKg()} // Display calculated "per kg" value
                  editable={false} // Prevent manual editing
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
  headSizeadd: {
    marginHorizontal: 10,
    marginVertical: 10,
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
  DescriptionInput1: {
    flex: 1,
    marginRight: 5,
  },
  DescriptionInput2: {
    flex: 1,
    marginRight: 5,
  },
  breadthText: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },
  Pipinghead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addinputhead: {
    borderWidth: 1,
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#1F74BA',
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: 10,
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
  lengthheadyarn: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '##f0f0f0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  Breadthhead: {
    flex: 1,
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
  Breadthtext: {
    color: '#333',
  },
  headSquare: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  labelSquare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  inputContainerSquare: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lengthheadSquare: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  lengthtextSquare: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headQuality: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  labelQuality: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  inputContainerQuality: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lengthheadQuality: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  lengthtextQuality: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yarnhead: {
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
  },
  yarntxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F74BA',
    marginVertical: 10,
    paddingVertical: 5,
  },
  yarnheaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  addyarnbtn: {
    backgroundColor: '#1F74BA',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 5,
  },
  Materialhead: {
    flex: 1,
    marginRight: 10,
    marginLeft: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  Materialtext: {
    color: '#333',
  },
  Pricehead: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  Pricetext: {
    color: '#333',
  },
  totalPricetext: {
    marginHorizontal: 8,
  },
  totalPricetext1: {
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  Consumptionhead: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  Consumptiontext: {
    color: '#333',
  },

  addButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#1F74BA',
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  pricemultiplyConsumptiontotalhead: {
    elevation: 1,
    marginLeft: 10,
    flex: 0.8,
  },
  radioLabel: {
    color: '#000',
  },
  yarnHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yarnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  yarnFooter: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  totalText: {
    marginLeft: 6,
  },
  yarnHeaderTextAction: {
    flex: 0.5,
  },
  yarnHeaderTextMaterial: {
    flex: 0.9,
  },
  yarnHeaderTextPrice: {
    flex: 1,
  },
  yarnHeaderTextConsumption: {
    flex: 1.5,
  },
  Descriptioninput1: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  Descriptioninpuut2: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    marginLeft: 5,
  },
  headSizefridge: {
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    padding: 5,
    borderRadius: 5,
    borderColor: 'gray',
  },
  headercal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  headercal1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  headercal2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  Pipingheadfridge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lengthheadfridge: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    marginVertical: 5,
  },
  lengthheadfridgenoneditable: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    marginVertical: 5,
    backgroundColor: '#ddd',
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
    marginHorizontal: 10,
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

export default NewCosting;
