import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  FlatList,
  BackHandler
} from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { ColorContext } from '../../components/colortheme/colorTheme';
import { useSelector } from 'react-redux';
import CustomCheckBox from '../../components/CheckBox';
import ImagePicker from 'react-native-image-crop-picker';


const CopyProduct = ({route, navigation}) => {
  const selectedCompany = useSelector(state => state.selectedCompany);
  const userId = useSelector(state => state?.loggedInUser?.userId);
  const [companyId, set_companyId] = useState(selectedCompany?.id);
  const {copiedDetails} = route.params; // assuming categoryList is passed in the params
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [kapture_task_flag, setkaptureFlag] = useState(
    selectedCompany?.kapture_task_flag,
  );
  const [prod_additional_field_flag, set_prod_additional_field_flag] = useState(
    selectedCompany?.prod_additional_field_flag,
  );
  const [cedge_flag, set_cedge_flag] = useState(selectedCompany?.cedge_flag);
  const [comp_flag, set_comp_flag] = useState(selectedCompany?.comp_flag);
  const [companyName, setCompanyName] = useState(selectedCompany?.companyName);

  const [styleName, setStyleName] = useState('');
  const [styleDesc, setStyleDesc] = useState('');
  const [retailerPrice, setRetailerPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [gsm, setGsm] = useState(0);
  const [hsn, setHsn] = useState(0);
  const [gst, setGst] = useState(0);
  const [dealerPrice, setDealerPrice] = useState(0);
  const [fixedDiscount, setFixedDiscount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(''); // Category Name
  const [selectedCustomerLevelId, setSelectedCustomerLevelId] = useState(0);
  const [selectedColorIds, setSelectedColorIds] = useState(null)
  ;
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeasonGroup, setSelectedSeasonGroup] = useState(0);

  const [selectedProcessWorkflowId, setSelectedProcessWorkflowId] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
  
  const [selectedUomId, setSelectedUomId] = useState(0);
  const [selectedUom, setSelectedUom] = useState(''); // Initialize as an empty string
  const [selectedScaleId, setSelectedScaleId] = useState(0);
  const [selectedScale, setSelectedScale] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [styleNum, setStyleNum] = useState('');
  const [selectedClosureId, setSelectedClosureId] = useState(0);
  const [selectedPeakId, setSelectedPeakId] = useState(0);
  const [selectedLogoId, setSelectedLogoId] = useState(0);
  const [selectedTrimsId, setSelectedTrimsId] = useState(0);
  const [selectedDecorationId, setSelectedDecorationId] = useState(0);
  const [selectedStatusId, setSelectedStatusId] = useState(0);
  const [selectedCustomerLevel, setSelectedCustomerLevel] = useState(''); // Customer Level
  const [selectedColorNames, setSelectedColorNames] = useState([]);
  const [showScaleTable, setShowScaleTable] = useState(false);
  const [productStyle, setProductStyle] = useState({});

  useEffect(() => {
    if (categoryList?.length > 0 && selectedCategoryId) {
      const category = categoryList?.find(
        item => item.categoryId === selectedCategoryId,
      );
      setSelectedCategory(category ? category.category : ''); // set category name
    }
  }, [selectedCategoryId, categoryList]);
  

  useEffect(() => {
    if (customerLevelList?.length > 0 && selectedCustomerLevelId) {
      const customerLevelType = customerLevelList.find(
        item => item.id === selectedCustomerLevelId,
      );
      setSelectedCustomerLevel(
        customerLevelType ? customerLevelType.customerLevelType : '',
      );
    }
  }, [selectedCustomerLevelId, customerLevelList]);



  // useEffect(() => {
  //   if (copiedDetails) {
  //     // Set the selectedColorNames from copiedDetails
  //     setSelectedColorNames(copiedDetails.selectedColorNames || []);
  //   }
  // }, [copiedDetails]);


  useEffect(() => {
    if (typesList?.length > 0 && selectedTypeId) {
      const type = typesList?.find(item => item.typeId === selectedTypeId);
      if (type) {
        setSelectedType(type.typeName); // Set the selectedType when found
      } else {
        setSelectedType(''); // Clear selectedType if no match is found
      }
    }
  }, [selectedTypeId, typesList]);
  
  
  useEffect(() => {
    if (seasonGroupsList?.length > 0 && selectedSeasonGroupId) {
      const sizegroup = seasonGroupsList?.find(
        item => item?.sizeGroupId === selectedSeasonGroupId,
      );
      setSelectedSeasonGroup(sizegroup ? sizegroup.sizegroup : '');
    }
  }, [selectedSeasonGroupId, seasonGroupsList]);

  useEffect(() => {
    if (selectedClosureId && closureData.length > 0) {
      const found = closureData?.filter(
        item => item?.m_id === selectedClosureId,
      );
      if (found) {
        setSelectedClosure(found[0]?.m_name);
      }
    }
  }, [selectedClosureId, closureData]);

  useEffect(() => {
    if (locationList?.length > 0 && selectedLocationId) {
      const location = categoryList?.find(
        item => item?.locationId === selectedLocationId,
      );
      setSelectedLocation(location ? location.location : ''); 
    }
  }, [selectedLocationId, locationList]);



  //  useEffect(() => {
  //   if (UomList?.length > 0 && selectedUomId) {
  //     const uom = UomList?.find(
  //       item => item?.uomId === selectedUomId,
  //     );
  //     setSelectedUom(uom ? uom.uom : ''); 
  //   }
  // }, [selectedUomId, UomList]);

  // useEffect(() => {
  //   if (scalesList?.length > 0 && selectedScaleId) {
  //     const scale = scalesList?.find(
  //       item => item?.scaleId === selectedScaleId,
  //     );
  //     setSelectedScale(scale ? scale.scale : ''); // set category name
  //   }
  // }, [selectedScaleId, scalesList]);

  useEffect(() => {
    if (selectedScaleId && scalesList.length > 0) {
      const found = scalesList?.filter(
        item => item?.scaleId === selectedScaleId,
      );
      if (found) {
        setSelectedScale(found[0]?.scaleRange);
      }
    }
  }, [selectedScaleId, scalesList]);


  useEffect(() => {
    if (copiedDetails) {
      console.log('Copied Details: ', copiedDetails); // Log copiedDetails to see the data structure

      setStyleName(copiedDetails.styleName || '');
      setStyleDesc(copiedDetails.styleDesc || '');
      setRetailerPrice(copiedDetails.retailerPrice || 0);
      setMrp(copiedDetails.mrp || 0);
      setGsm(copiedDetails.gsm || 0);
      setHsn(copiedDetails.hsn || 0);
      setGst(copiedDetails.gst || 0);
      setDealerPrice(copiedDetails.dealerPrice || 0);
      setCustomerLevelPrice(copiedDetails.customerLevelPrice || 0);

      setFixedDiscount(copiedDetails.fixedDiscount || 0);
      setSelectedCategoryId(copiedDetails.selectedCategoryId || 0);
      setSelectedCategory(copiedDetails.selectedCategory || ''); // set category from copiedDetails
      setSelectedCustomerLevelId(copiedDetails.selectedCustomerLevelId || 0);
      setSelectedSeasonGroupId(copiedDetails.selectedSeasonGroupId || 0);
      setSelectedSeasonGroup(copiedDetails.selectedSeasonGroup || 0);
      setSelectedLocationId(copiedDetails.selectedLocationId || 0);
      setSelectedLocation(copiedDetails.selectedLocation || 0);
      setSelectedUom(copiedDetails.selectedUom || 0);
      setSelectedUomId(copiedDetails.selectedUomId || 0);
 
      setSelectedCustomerLevel(copiedDetails.selectedCustomerLevel || '');
      // setSelectedColorIds(copiedDetails.selectedColorIds || []);
      setColorCode(copiedDetails.colorCode || []);
      setSelectedTypeId(copiedDetails.selectedTypeId || 0);
      setSelectedType(copiedDetails.selectedType ||0)
      setSelectedProcessWorkflowId(
        copiedDetails.selectedProcessWorkflowId || 0,
      );
      setSelectedProcessWorkflow(
        copiedDetails.selectedProcessWorkflow || 0,
      );

      setSelectedLocationId(copiedDetails.selectedLocationId || 0);
      setSelectedScaleId(copiedDetails.selectedScaleId || 0);
      setSelectedScale(copiedDetails.selectedScale || 0);
      setSelectedSizes(copiedDetails.selectedSizes || []);
      // setImageUrls(copiedDetails.imageUrls || []);
      setSelectedClosureId(copiedDetails.selectedClosureId || 0);
      setSelectedClosure(copiedDetails.selectedClosure || 0);
      setSelectedPeakId(copiedDetails.selectedPeakId || 0);
      setSelectedPeak(copiedDetails.selectedPeak || 0);
      setSelectedLogoId(copiedDetails.selectedLogoId || 0);
      setSelectedLogo(copiedDetails.selectedLogo || 0);
      setSelectedTrimsId(copiedDetails.selectedTrimsId || 0);
      setSelectedTrims(copiedDetails.selectedTrims || 0);
      setSelectedDecorationId(copiedDetails.selectedDecorationId || 0);
      setSelectedDecoration(copiedDetails.selectedDecoration || 0);
      setSelectedStatusId(copiedDetails.selectedStatusId || 0);
      setSelectedStatus(copiedDetails.selectedStatus || 0);

      setShowScaleTable(copiedDetails.showScaleTable || false);
    }
  }, [copiedDetails]);

 const handleInputChange = (index, field, value) => {
  setSelectedSizes(prevSizes => {
    const updatedSizes = [...prevSizes];
    updatedSizes[index][field] = field === 'availQty' ? parseInt(value) || 0 : value;
    return updatedSizes;
  });
};

// useEffect(() => {
//   if (scalesList?.length > 0 && selectedScaleId) {
//     const selectedScale = scalesList.find(scale => scale.scaleId === selectedScaleId);
//     setSelectedSizes(
//       selectedScale?.sizes.map(size => ({
//         sizeId: size.id,
//         sizeDesc: size.name,
//         dealerPrice: 0,
//         retailerPrice: 0,
//         mrp: 0,
//         availQty: 0,
//       })) || []
//     );
//     setShowScaleTable(true); // Show the scale table if sizes are available
//   }
// }, [selectedScaleId, scalesList]);



// useEffect(() => {
//   if (copiedDetails) {
//     console.log("Copied Details: ", copiedDetails); // Should contain `imageUrls`
//     console.log("Setting Image URLs: ", copiedDetails.imageUrls); // Ensure this is not undefined or empty
//     setImageUrls(copiedDetails.imageUrls || []);
//   }
// }, [copiedDetails]);


const [showCategoryList, setshowCategoryList] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryModal, setcategoryModal] = useState(false);
  const [mCategoryName, setmCategoryName] = useState('');
  const [mCategoryDesc, setmCategoryDesc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [editShortcutKey, setEditShortcutKey] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseCategoryModal = () => {
    setcategoryModal(false);
  };


  const ValidateNewCategory = async () => {
    if (processing) return;
    setProcessing(true);

    if (mCategoryName.length === 0 || mCategoryDesc.length === 0) {
      Alert.alert(' Please fill all mandatory fields');
      setProcessing(false);
      return;
    }
    const slash = '/';
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_CATEGORY}${mCategoryName}${slash}${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data === true) {
        handleSaveCategoryModal();
      } else {
        Alert.alert(' This name has been used. Please enter a new name');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the Category validity. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveCategoryModal = () => {
    let dummy = 0;
    let formData = new FormData();

    formData.append('categoryId', dummy.toString()); // Ensure that dummy is a string
    formData.append('category', mCategoryName);
    formData.append('categoryDesc', mCategoryDesc);
    formData.append('companyId', companyId);
    formData.append('linkType', 2);
    formData.append('userId', userId);


    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_CATEGORY}`;

    // setIsLoading(true);

    axios
      .post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Add Content-Type header
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // Alert.alert(`Category Created Successfully ${response?.data?.category}`);
        // setSelectedCategory(response?.data?.category)
        const newCategory = {
          categoryId: response?.data?.categoryId, // Assuming this is returned from the API
          category: response?.data?.category, // Assuming this is returned from the API
        };
  
        // Add the new category to the category list
        setCategoryList(prevList => [...prevList, newCategory]);
  
        // Update the selected category after saving
        setSelectedCategoryId(newCategory.categoryId);
        setSelectedCategory(newCategory.category);
  
        setSelectedCategoryId(response?.data?.categoryId);
        getCategoriesList();
        // setIsLoading(false);
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
        // setIsLoading(false);
      });

    setcategoryModal(false);
  };
const handleCategoryDropDown = () => {
  setshowCategoryList(!showCategoryList);
};

const handleSelectCategory = item => {
  setSelectedCategory(item.category);
  setSelectedCategoryId(item.categoryId);
  setshowCategoryList(false);
};


const filtercategories = text => {
  const filtered = categoryList.filter(item =>
    item?.category?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredCategories(filtered);
};
const getCategoriesList = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_CATEGORY_LIST}${companyId}`;
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setCategoryList(response?.data || []);
      setFilteredCategories(response?.data || []);
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

useEffect(() => {
  getCategoriesList();
  getCustomerLevelList();
  getcolorsList();
  getTypesList();
  getSeasonalGroups();
  getProcessWorkFlow();
  getUom();
  getLocations();
  getAllSizesInScale();
  getAllKapture(1);
  getAllKapture(2);
  getAllKapture(3);
  getAllKapture(4);
  getAllKapture(5);
}, [1]);

const toggleCategoryModal = () => {
  setcategoryModal(!categoryModal);
  setmCategoryName('');
  setmCategoryDesc('');
};

const [showCustomerLevelList, setShowCustomerLevelList] = useState(false);
  const [customerLevelList, setCustomerLevelList] = useState([]);
  const [filteredcustomerLevelList, setFilteredCustomerLevelList] = useState(
    [],
  );
  const [customerLevelPrice, setCustomerLevelPrice] = useState(0);
  const [showCustomerLevelPrice, setShowCustomerLevelPrice] = useState(false);

const handleCustomerLevelDropDown = () => {
  setShowCustomerLevelList(!showCustomerLevelList);
};

const handleSelectCustomerLevel = item => {
  setSelectedCustomerLevel(item.customerLevelType);
  setSelectedCustomerLevelId(item.id);
  if (item.id === 0) {
    setShowCustomerLevelPrice(false);
  } else {
    setShowCustomerLevelPrice(true);
  }
  setShowCustomerLevelList(false);
};

const filterCustomerLevels = text => {
  const filtered = customerLevelList.filter(item =>
    item?.customerLevelType?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredCustomerLevelList(filtered);
};

const getCustomerLevelList = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_CUSTOMERLEVEL_LIST}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setCustomerLevelList(
        response?.data.response.customerLevelTypeList || [],
      );
      setFilteredCustomerLevelList(
        response?.data.response.customerLevelTypeList || [],
      );
      setIsLoading(false); // Set loading to false after receiving the response
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false); // Set loading to false in case of error
    });
};



const [editColor, setEditColor] = useState(true);
const [showColorList, setShowColorList] = useState(false);
const [colorList, setColorList] = useState([]);
const [filteredColorList, setFilteredColorList] = useState([]);
const [selectedColor, setSelectedColor] = useState('');
const [selectedColorId, setSelectedColorId] = useState(0);
const [colorCode, setColorCode] = useState('');
const [mColorCode, setmColorCode] = useState('');
const [colorModal, setColorModal] = useState(false);
const [mColorName, setmColorName] = useState('');
const [mColorDesc, setmColorDesc] = useState('');
const [isSelectAll, setIsSelectAll] = useState(false);

const handleColorDropDown = () => {
  setShowColorList(!showColorList);
};

// useEffect(() => {
//   // Update color codes when selectedColorIds changes
//   if (selectedColorIds && selectedColorIds.length > 0) {
//     const selectedCodes = selectedColorIds
//       .map(id => {
//         const found = colorList.find(item => item.colorId === id);
//         return found ? found.colorCode : null; // Return color code if found
//       })
//       .filter(Boolean); // Remove null values

//     setColorCode(selectedCodes); // Join all selected color codes
//   } else {
//     setColorCode(''); // Reset when no color is selected
//   }
// }, [selectedColorIds, colorList]);

useEffect(() => {
  if (selectedColorIds && colorList.length > 0) {
    const found = colorList.find(item => item.colorId === selectedColorIds);
    if (found) {
      setColorCode(found.colorCode); // Set the color code for the selected color
    }
  } else {
    setColorCode(''); // Reset when no color is selected
  }
}, [selectedColorIds, colorList]); // Track selectedColorId and colorList

// useEffect(() => {
//   if (selectedColorId && colorList.length > 0) {
//     const found = colorList?.find(item => item.colorId === selectedColorId);

//     if (found) {
//       setSelectedColor(found?.colorName); // Update selected color name
//       setColorCode(found?.colorCode);    // Update color code

//       // Add selectedColorId only if it's not already unselected
//       setSelectedColorIds(prevSelectedColorIds => {
//         return prevSelectedColorIds.includes(selectedColorId)
//           ? prevSelectedColorIds // Keep as is if already in the list
//           : [...prevSelectedColorIds, selectedColorId]; // Add if not present
//       });
//     }
//   }
// }, [selectedColorId, colorList]); // Track selectedColorId and colorList

useEffect(() => {
  if (selectedColorId && colorList.length > 0) {
    const found = colorList?.find(item => item.colorId === selectedColorId);

    if (found) {
      setSelectedColor(found?.colorName); // Update selected color name
      setColorCode(found?.colorCode);    // Update color code
    }
  }
}, [selectedColorId, colorList]); // Track selectedColorId and colorList


// const handleSelectColor = item => {
//   setSelectedColorIds(prevSelectedColorIds => {
//     if (!prevSelectedColorIds.includes(item.colorId)) {
//       // Add the color if not already selected
//       return [...prevSelectedColorIds, item.colorId];
//     } else {
//       // Remove the color if already selected
//       return prevSelectedColorIds.filter(id => id !== item.colorId);
//     }
//   });
// };

// const handleSelectColor = item => {
//   setSelectedColorIds([item.colorId]); // Store only the selected color ID
//   setSelectedColor(item.colorName); // Store the selected color name
//   setSelectedColorNames([item.colorName]); // Ensure selected color names update
//   setColorCode(item.colorCode); // Store the selected color code
//   setShowColorList(false); // Close the dropdown after selection
// };

const handleSelectColor = item => {
  setSelectedColorIds(item.colorId); // Store the selected color ID as a single value (not in an array)
  setSelectedColor(item.colorName); // Store the selected color name
  setSelectedColorNames(item.colorName); // Ensure selected color names update
  setColorCode(item.colorCode); // Store the selected color code
  setShowColorList(false); // Close the dropdown after selection
};

const getcolorsList = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_COLOR_LIST}${companyId}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setColorList(response?.data.response.colorList || []);
      setFilteredColorList(response?.data.response.colorList || []);
      setIsLoading(false); // Set loading to false after receiving the response
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false); // Set loading to false in case of error
    });
};

const toggleColorModal = () => {
  setColorModal(!colorModal);
  setmColorName('');
  setmColorDesc('');
  setmColorCode('');
};

const handleCloseColorModal = () => {
  setColorModal(false);
};

const handleSaveColorModal = () => {
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_COLOR}`;
  // setIsLoading(true);

  const requestData = {
    colorId: null,
    colorName: mColorName,
    colorDesc: mColorDesc,
    colorCode: mColorCode,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // Alert.alert(`Color Created Successfully : ${response?.data?.response?.colorList[0]?.colorName}`);
      setSelectedColorId(response?.data?.response?.colorList[0]?.colorId);
      setSelectedColor(response?.data?.response?.colorList[0]?.colorName);
      getcolorsList();
      setIsLoading(false);
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

  setColorModal(false);
};

const ValidateNewColor = async () => {
  if (processing) return;
  setProcessing(true);

  if (mColorName.length === 0 || mColorDesc.length === 0) {
    Alert.alert(' Please fill all mandatory fields');
    setProcessing(false);
    return;
  }
  const trimmedColor = mColorName.trim().toLowerCase();
  const modifiedColor = trimmedColor.split('/').join('*');

  const slash = '/';
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_COLOR}${modifiedColor}${slash}${companyId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (response?.data?.isValid === true) {
      handleSaveColorModal();
    } else {
      Alert.alert(' This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Color validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};
const filterColors = text => {
  const filtered = colorList.filter(item =>
    item?.colorName?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredColorList(filtered);
};

const handleSelectAll = () => {
  if (isSelectAll) {
    setSelectedColorIds([]);
    setIsSelectAll(false);
  } else {
    const allIds = filteredColorList.map(item => item.colorId);
    setSelectedColorIds(allIds);
    setIsSelectAll(true);
  }
};

const [showTypesList, setShowTypesList] = useState(false);
  const [typesList, setTypesList] = useState([]);
  const [filteredTypesList, setFilteredTypesList] = useState([]);
  const [mTypeName, setmTypeName] = useState('');
  const [mTypeDesc, setmTypeDesc] = useState('');
  const [typesModal, setTypesModal] = useState(false);


const handleTypesDropDown = () => {
  setShowTypesList(!showTypesList);
};

const handleSelectType = item => {
  console.log("item.typeName",item.typeName)
  setSelectedType(item.typeName);
  setSelectedTypeId(item.typeId);
  setShowTypesList(false);
};

const filterTypes = text => {
  const filtered = typesList.filter(item =>
    item?.typeName?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredTypesList(filtered);
};

const getTypesList = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_TYPES_LIST}${companyId}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setTypesList(response?.data.response.typeList || []);
      setFilteredTypesList(response?.data.response.typeList || []);
      setIsLoading(false); // Set loading to false after receiving the response
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false); // Set loading to false in case of error
    });
};

const toggleTypesModal = () => {
  setTypesModal(!typesModal);
};

const handleCloseTypesModal = () => {
  setTypesModal(false);
};

const ValidateNewType = async () => {
  if (processing) return;
  setProcessing(true);

  if (mTypeName.length === 0 || mTypeDesc.length === 0) {
    Alert.alert(' Please fill all mandatory fields');
    setProcessing(false);
    return;
  }

  const slash = '/';
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_TYPE}${mTypeName}${slash}${companyId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (response?.data === true) {
      handleSaveTypesModal();
    } else {
      Alert.alert(' This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Type validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};

const handleSaveTypesModal = () => {
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_TYPE}`;

  // setIsLoading(true);

  const requestData = {
    typeId: null,
    typeName: mTypeName,
    typeDesc: mTypeDesc,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      const newType = {
        typeId: response?.data?.response?.typeList[0]?.typeId,
        typeName: response?.data?.response?.typeList[0]?.typeName,
      };

      setTypesList(prevList => [...prevList, newType]);

      // Update the selected type after saving
      setSelectedTypeId(newType.typeId);
      setSelectedType(newType.typeName);

      // Alert.alert(`Type Created Successfully : ${response?.data?.response?.typeList[0]?.typeName}`);
      setSelectedTypeId(response?.data?.response?.typeList[0]?.typeId);
      setSelectedType(response?.data?.response?.typeList[0]?.typeName);
      getTypesList();
      setIsLoading(false);
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
  setTypesModal(false);
};


const [showSeasonGroupsList, setShowSeasonGroupsList] = useState(false);
const [seasonGroupsList, setSeasonGroupsList] = useState([]);
const [filteredSeasonGroupsList, setFilteredSeasonGroupsList] = useState([]);

const [showModalSeasonGroupsList, setShowModalSeasonGroupsList] =
useState(false);
const [filteredModalSeasonGroupsList, setFilteredModalSeasonGroupsList] =
useState([]);
const [selectedModalSeasonGroup, setSelectedModalSeasonGroup] = useState('');
const [selectedModalSeasonGroupId, setSelectedModalSeasonGroupId] =
useState(0);
const [selectedSeasonGroupId, setSelectedSeasonGroupId] = useState(0);
const [seasonGroupsModal, setSeasonGroupsModal] = useState(false);

const [mSeasonGroupName, setmSeasonGroupName] = useState('');
const [mSeasonGroupDesc, setmSeasonGroupDesc] = useState('');

const getSeasonalGroups = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_SEASONGROUP_LIST}${companyId}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setSeasonGroupsList(response?.data.response.sizeGroupList || []);
      setFilteredSeasonGroupsList(
        response?.data.response.sizeGroupList || [],
      );
      setFilteredModalSeasonGroupsList(
        response?.data.response.sizeGroupList || [],
      );
      setIsLoading(false); // Set loading to false after receiving the response
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false); // Set loading to false in case of error
    });
};
const handleSeasonGroupsDropDown = () => {
  setShowSeasonGroupsList(!showSeasonGroupsList);

};

const handleSelectSeasonGroup = item => {
  setSelectedSeasonGroup(item.sizeGroup);
  setSelectedSeasonGroupId(item.sizeGroupId);
  setShowSeasonGroupsList(false);
  setSelectedScale(null);
  setSelectedScaleId(null);
  setSelectedSizes([]);
  setShowScaleTable(false);
};



const filterSeasonGroups = text => {
  const filtered = seasonGroupsList.filter(item =>
    item?.sizeGroup?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredSeasonGroupsList(filtered);
};
const handleModalSeasonGroupsDropDown = () => {
  setShowModalSeasonGroupsList(!showModalSeasonGroupsList);
};

const handleModalSelectSeasonGroup = item => {
  setSelectedModalSeasonGroup(item.sizeGroup);
  setSelectedModalSeasonGroupId(item.sizeGroupId);
  setShowModalSeasonGroupsList(false);
};

const filterModalSeasonGroups = text => {
  const filtered = seasonGroupsList.filter(item =>
    item?.sizeGroup?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredModalSeasonGroupsList(filtered);
};

const toggleSeasonGroupsModal = () => {
  setSeasonGroupsModal(!seasonGroupsModal);
  setmSeasonGroupName('');
  setmSeasonGroupDesc('');
};

const handleCloseSeasonGroupsModal = () => {
  setSeasonGroupsModal(false);
};

const handleSaveSeasonGroupsModal = () => {
  setIsLoading(true);
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_SEASON_GROUP}`;
  const requestData = {
    sizeGroupId: null,
    sizeGroup: mSeasonGroupName,
    sizeGroupDesc: mSeasonGroupDesc,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // Alert.alert(`Type Created Successfully : ${response?.data?.response?.sizeGroupList[0]?.sizeGroup}`);
      setSelectedSeasonGroup(
        response?.data?.response?.sizeGroupList[0]?.sizeGroup,
      );
      setSelectedSeasonGroupId(
        response?.data?.response?.sizeGroupList[0]?.sizeGroupId,
      );
      getSeasonalGroups();
      setIsLoading(false);
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

  setSeasonGroupsModal(false);
};

const ValidateSeasonGroup = async () => {
  if (processing) return;
  setProcessing(true);

  if (mSeasonGroupName.length === 0 || mSeasonGroupDesc.length === 0) {
    Alert.alert(' Please fill all mandatory fields');
    setProcessing(false);
    return;
  }
  const slash = '/';
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_SEASON_GROUP}${mSeasonGroupName}${slash}${companyId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (response.data === true) {
      handleSaveSeasonGroupsModal();
    } else {
      Alert.alert(' This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Category validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};

const handleSaveNewSizesToSeasonGroup = async () => {
  if (processing) return;
  setProcessing(true);

  // setIsLoading(true);
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_NEW_SCALE}`;
  const requestData = {
    sizeGroupId: selectedModalSeasonGroupId,
    combineSizeId: selectedModalSizeInSeasonListIds.join(','),
    companyId: companyId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // Alert.alert(`Sizes Created Successfully`);
      getScales();
      setSelectedScaleId(0);
      setSelectedScale('');
      setShowScaleTable(false);
      // setSelectedScaleId(response?.data?.response?.scaleAddRequest[0]?.scaleId);
      // const item={
      //   scaleRange:response?.data?.response?.scaleAddRequest[0]?.combineSizeId,
      // }
      // handleChangeScale(item);
      // setShowScaleTable(true);

      // setSelectedScaleId(response?.data?.response?.scaleAddRequest[0]?.scaleId);
      setProcessing(false);

      setIsLoading(false);
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
      setProcessing(false);
    });
  toggleScalesModal(false);
};

const handleSelectallSizesInScales = item => {
  if (selectedModalSizeInSeasonListIds.includes(item.id)) {
    setSelectedModalSizeInSeasonListIds(
      selectedModalSizeInSeasonListIds.filter(id => id !== item.id),
    );
  } else {
    setSelectedModalSizeInSeasonListIds([
      ...selectedModalSizeInSeasonListIds,
      item.id,
    ]);
  }
};


const [showClosure, setShowClosure] = useState(false);
const [showPeak, setShowPeak] = useState(false);
const [showLogo, setShowLogo] = useState(false);
const [showDecoration, setShowDecoration] = useState(false);
const [showTrims, setShowTrims] = useState(false);

// State to store the fetched data for each category
const [closureData, setClosureData] = useState([]);
const [peakData, setPeakData] = useState([]);
const [logoData, setLogoData] = useState([]);
const [decorationData, setDecorationData] = useState([]);
const [trimsData, setTrimsData] = useState([]);

// State for search filters
const [searchClosure, setSearchClosure] = useState('');
const [searchPeak, setSearchPeak] = useState('');
const [searchLogo, setSearchLogo] = useState('');
const [searchDecoration, setSearchDecoration] = useState('');
const [searchTrims, setSearchTrims] = useState('');

// State for selected items
const [selectedClosure, setSelectedClosure] = useState('');
const [selectedPeak, setSelectedPeak] = useState('');
const [selectedLogo, setSelectedLogo] = useState('');
const [selectedDecoration, setSelectedDecoration] = useState('');
const [selectedTrims, setSelectedTrims] = useState('');

const [isKaptureLoading, setIsKapturLoading] = useState(false);

// Modal visibility states
const [closureModal, setClosureModal] = useState(false);
const [peakModal, setPeakModal] = useState(false);
const [logoModal, setLogoModal] = useState(false);
const [decorationModal, setDecorationModal] = useState(false);
const [trimsModal, setTrimsModal] = useState(false);

// State for storing the entered names in modals
const [closureName, setClosureName] = useState('');
const [peakName, setPeakName] = useState('');
const [logoName, setLogoName] = useState('');
const [decorationName, setDecorationName] = useState('');
const [trimsName, setTrimsName] = useState('');

const toggleClosure = () => {
  setShowClosure(!showClosure);
};
const togglePeak = () => {
  setShowPeak(!showPeak);
};

const toggleLogo = () => {
  setShowLogo(!showLogo);
};

const toggleDecoration = () => {
  setShowDecoration(!showDecoration);
};

const toggleTrims = () => {
  setShowTrims(!showTrims);
};

// Filter data based on search input
const filterData = (data, search) => {
  return data.filter(item =>
    item.m_name.toLowerCase().includes(search.toLowerCase()),
  );
};

// Filtered data for each category
const filteredClosureData = filterData(closureData, searchClosure);
const filteredPeakData = filterData(peakData, searchPeak);
const filteredLogoData = filterData(logoData, searchLogo);
const filteredDecorationData = filterData(decorationData, searchDecoration);
const filteredTrimsData = filterData(trimsData, searchTrims);

const toggleClosureModal = () => {
  setClosureModal(!closureModal);
};

const togglePeakModal = () => {
  setPeakModal(!peakModal);
};

const toggleLogoModal = () => {
  setLogoModal(!logoModal);
};

const toggleDecorationModal = () => {
  setDecorationModal(!decorationModal);
};

const toggleTrimsModal = () => {
  setTrimsModal(!trimsModal);
};

const ValidateAllKapture = async (flag, typeName, name) => {
  if (processing) return;

  if (!name) {
    Alert.alert('Please enter a name');
    return;
  }

  setProcessing(true);
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_KAPTURE}/${name}/${companyId}/${flag}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });

    if (response?.data === true) {
      // Close the modal after successful validation
      if (flag === 1) {
        setClosureModal(false);
        setClosureName('');
        getAllKapture(1); // Refresh data
      } else if (flag === 2) {
        setPeakModal(false);
        setPeakName('');
        getAllKapture(2);
      } else if (flag === 3) {
        setLogoModal(false);
        setLogoName('');
        getAllKapture(3);
      } else if (flag === 4) {
        setDecorationModal(false);
        setDecorationName('');
        getAllKapture(4);
      } else if (flag === 5) {
        setTrimsModal(false);
        setTrimsName('');
        getAllKapture(5);
      }
      handleSaveKaptureModal(flag, name);
    } else {
      Alert.alert(
        'crm.codeverse.co says',
        'This name hasbeen used,please enter a new name',
      );
    }
  } catch (error) {
    console.error('Error validating:', error);
    Alert.alert('An error occurred during validation');
  } finally {
    setProcessing(false);
  }
};



const getAllKapture = flagValue => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_KAPTURE}/${flagValue}/${companyId}`;

  setIsKapturLoading(true); // Start loading

  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // Update the appropriate state based on the flag
      if (flagValue === 1) {
        setClosureData(response.data);
      } else if (flagValue === 2) {
        setPeakData(response.data);
      } else if (flagValue === 3) {
        setLogoData(response.data);
      } else if (flagValue === 4) {
        setDecorationData(response.data);
      } else if (flagValue === 5) {
        setTrimsData(response.data);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      setIsKapturLoading(false); // End loading
    });
};
useEffect(() => {
  if (selectedClosureId && closureData.length > 0) {
    const found = closureData?.filter(
      item => item.m_id === selectedClosureId,
    );
    if (found) {
      setSelectedClosure(found[0]?.m_name);
    }
    console.log("selectclosure======>",selectedColorId,found)
  }
}, [selectedClosureId, closureData]);

useEffect(() => {
  if (selectedPeakId && peakData.length > 0) {
    const found = peakData?.filter(item => item.m_id === selectedPeakId);
    if (found) {
      setSelectedPeak(found[0]?.m_name);
    }
  }
}, [selectedPeakId, peakData]);

useEffect(() => {
  if (selectedLogoId && logoData.length > 0) {
    const found = logoData?.filter(item => item.m_id === selectedLogoId);
    if (found) {
      setSelectedLogo(found[0]?.m_name);
    }
  }
}, [selectedLogoId, logoData]);

useEffect(() => {
  if (selectedDecorationId && decorationData.length > 0) {
    const found = decorationData?.filter(
      item => item.m_id === selectedDecorationId,
    );
    if (found) {
      setSelectedDecoration(found[0]?.m_name);
    }
  }
}, [selectedDecorationId, decorationData]);

useEffect(() => {
  if (selectedTrimsId && trimsData.length > 0) {
    const found = trimsData?.filter(item => item.m_id === selectedTrimsId);
    if (found) {
      setSelectedTrims(found[0]?.m_name);
    }
  }
}, [selectedTrimsId, trimsData]);

const handleSaveKaptureModal = async (flag, name) => {
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_KAPTURE}`;

  let typeName = '';
  let mName = '';

  if (flag === 1) {
    typeName = 'Closure';
    mName = closureName;
  } else if (flag === 2) {
    typeName = 'Peak';
    mName = peakName;
  } else if (flag === 3) {
    typeName = 'Logo';
    mName = logoName;
  } else if (flag === 4) {
    typeName = 'Decoration';
    mName = decorationName;
  } else if (flag === 5) {
    typeName = 'Trim';
    mName = trimsName;
  } else {
    console.error('Invalid flag value:', flag);
    Alert.alert('Error', 'Invalid flag value');
    return;
  }

  const requestData = {
    m_id: null,
    m_name: mName,
    m_flag: flag, // This might need to be dynamically set based on the flag
    m_comany_id: companyId,
    userId: userId,
  };

  try {
    const response = await axios.post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (flag === 1) {
      setSelectedClosureId(response?.data?.m_id);
    } else if (flag === 2) {
      setSelectedPeakId(response?.data?.m_id);
    } else if (flag === 3) {
      setSelectedLogoId(response?.data?.m_id);
    } else if (flag === 4) {
      setSelectedDecorationId(response?.data?.m_id);
    } else if (flag === 5) {
      setSelectedTrimsId(response?.data?.m_id);
    }

    // Alert.alert('Success', `${typeName} saved successfully!`);
    getAllKapture(1);
    getAllKapture(2);
    getAllKapture(3);
    getAllKapture(4);
    getAllKapture(5);
  } catch (error) {
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
  }
};

const [showProcessWorkflowList, setShowProcessWorkflowList] = useState(false);
const [processWorkflowList, setProcessWorkflowList] = useState([]);
const [filteredProcessWorkflowList, setFilteredProcessWorkflowList] =
  useState([]);
const [selectedProcessWorkflow, setSelectedProcessWorkflow] = useState('');



const getProcessWorkFlow = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_PROCESSWORKFLOW_LIST}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setProcessWorkflowList(response?.data || []);
      setFilteredProcessWorkflowList(response?.data || []);
      setIsLoading(false); // Set loading to false after receiving the response
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false); // Set loading to false in case of error
    });
};

const handleProcessWorkflowDropDown = () => {
  setShowProcessWorkflowList(!showProcessWorkflowList);
};

const handleSelectProcessWorkflow = item => {
  setSelectedProcessWorkflow(item.configName);
  setSelectedProcessWorkflowId(item.id);
  setShowProcessWorkflowList(false);
};

const filterProcessWorkflow = text => {
  const filtered = processWorkflowList.filter(item =>
    item?.configName?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredProcessWorkflowList(filtered);
};

const [showLocationList, setShowLocationList] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [filteredLocationList, setFilteredLocationList] = useState([]);


const handleLocationDropDown = () => {
  setShowLocationList(!showLocationList);
};

const handleSelectLocation = item => {
  setSelectedLocation(item.locationName);
  setSelectedLocationId(item.locationId);
  setShowLocationList(false);
};

const filterLocation = text => {
  const filtered = locationList.filter(item =>
    item?.locationName?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredLocationList(filtered);
};

const getLocations = () => {
  console.log('comp_flag', comp_flag);
  if (comp_flag === 0) {
    const apiUrl0 = `${global?.userData?.productURL}${API.GET_LOCATION_C0_LIST}`;
    setIsLoading(true);
    const requestData = {
      styleName: '',
      companyId: companyId,
    };
    axios
      .post(apiUrl0, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log(
          'response?.data?.locationList',
          response?.data?.locationList,
        );
        setLocationList(response?.data?.locationList || []);
        setFilteredLocationList(response?.data?.locationList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  } else if (comp_flag === 1) {
    const apiUrl1 = `${global?.userData?.productURL}${API.GET_LOCATION_C1_LIST}${companyId}`;
    setIsLoading(true);
    axios
      .get(apiUrl1, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const locationList = response?.data?.response?.locationList || [];

        const filteredLocationList = locationList?.filter(
          c => c.customerType === 2 && c.customerId === companyId,
        );

        setLocationList(filteredLocationList);
        setFilteredLocationList(filteredLocationList);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false); // Set loading to false in case of error
      });
  }
};

useEffect(() => {
  if (selectedLocationId && locationList.length > 0) {
    const found = locationList?.filter(
      item => item.locationId === selectedLocationId,
    );
    if (found) {
      setSelectedLocation(found[0]?.locationName);
    }
  }
}, [selectedLocationId, locationList]);


useEffect(() => {
  if (UomList.length > 0 && selectedUomId) {
    const uom = UomList.find(item => item.uomId === selectedUomId);
    if (uom) {
      setSelectedUom(uom.uomName);
    } else {
      setSelectedUom(null); // Reset if the selected UOM is not found
    }
  }
}, [UomList, selectedUomId]);


const [showUomList, setShowUomList] = useState(false);
const [UomList, setUomList] = useState([]);
const [filteredUomList, setFilteredUomList] = useState([]);
const [UomModal, setUomModal] = useState(false);
const [mUomName, setmUomName] = useState('');
const [mUomDesc, setUomDesc] = useState('');

const handUomDropDown = () => {
  setShowUomList(!showUomList);
};

const handleSelectUom = item => {
  console.log('Selected UOM:', item); // Log the selected item to check
  if (item) {
    setSelectedUom(item.uomName); // Update the state with the selected UOM name
    setSelectedUomId(item.uomId); // Update the state with the selected UOM ID
  } else {
    console.warn('Selected UOM item is undefined');
  }
  setShowUomList(false); // Close the dropdown
};
const filterUom = text => {
  console.log('Filtered UOM List:', filteredUomList); // Log filtered list to check its contents
  const filtered = UomList.filter(item =>
    item?.uomName?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredUomList(filtered);
};

const handleCloseUomModal = () => {
  setUomModal(false);
};
const toggleSeasonUomModal = () => {
  setUomModal(!UomModal);
  setmUomName('');
  setUomDesc('');
};

useEffect(() => {
  console.log('selectedUom changed to:', selectedUom);
}, [selectedUom]);

const getUom = () => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_UOM}/${companyId}`;
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      console.log('API Response:', response.data);
      setUomList(response?.data?.response.uomtypeList || []);
      setFilteredUomList(response?.data?.response.uomtypeList || []);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};

const handleSaveUomModal = () => {
  setIsLoading(true);
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_UOM}`;
  const requestData = {
    uomId: null,
    uomName: mUomName,
    uomDescription: mUomDesc,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // Alert.alert(`Type Created Successfully : ${response?.data?.response?.sizeGroupList[0]?.sizeGroup}`);
      setSelectedUom(
        response?.data?.response?.uomtypeList[0]?.uomName,
      );
      setSelectedUomId(
        response?.data?.response?.uomtypeList[0]?.uomId,
      );
      getUom();
      setIsLoading(false);
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

  setUomModal(false);
};

const ValidateUom = async () => {
  if (processing) return;
  setProcessing(true);

  if (mUomName.length === 0 || mUomDesc.length === 0) {
    Alert.alert(' Please fill all mandatory fields');
    setProcessing(false);
    return;
  }
  const slash = '/';
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_UOM}${mUomName}${slash}${companyId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (response.data === true) {
      handleSaveUomModal();
    } else {
      Alert.alert(' This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Category validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};



const [showScalesList, setShowScalesList] = useState(false);
const [scalesList, setScalesList] = useState([]);
const [filteredScalesList, setFilteredScalesList] = useState([]);

const [allSizesInScales, setAllSizesInScales] = useState([]);
const [scalesModal, setScalesModal] = useState(false);
const [mSize, setmSize] = useState('');
const [mSizeDesc, setmSizeDesc] = useState('');

const [selectedModalSizeInSeasonListIds,setSelectedModalSizeInSeasonListIds] = useState([]);
const handleScalesDropDown = () => {
  setShowScalesList(!showScalesList);
  getAllSizesInScale ()
  getScales()
};

// const handleSelectScale = item => {
//   setSelectedScale(item?.scaleRange);
//   setSelectedScaleId(item?.scaleId);
//   setSelectedSizes([]);

//   handleChangeScale(item);

//   setShowScaleTable(true);

//   setShowScalesList(false);
// };

const handleSelectScale = async (item) => {
  // If the selected scale is the same, do nothing
  if (item?.scaleId === selectedScaleId) {
      console.log('Same scale selected, keeping table open');
      return;
  }

  setSelectedScale(item?.scaleRange);
  setSelectedScaleId(item?.scaleId); // Asynchronous update
  setSelectedSizes([]);

  console.log('Selected Scale ID:', item?.scaleId);

  // Directly pass item.scaleId instead of selectedScaleId
  await handleChangeScale(item?.scaleId, item?.scaleRange);

  setShowScaleTable(true);
  setShowScalesList(false);
};

const filterScales = text => {
  const filtered = scalesList.filter(item =>
    item?.scale?.toUpperCase().includes(text?.toUpperCase()),
  );
  setFilteredScalesList(filtered);
};


const getScalesBySizeId = async (scaleId) => {
  const apiUrl = `${global?.userData?.productURL}${API.GET_SIZES_BY_SCALE_ID}/${selectedSeasonGroupId}/${scaleId}/getSizesByScaleId`;
  console.log("API URL:", apiUrl);

  try {
      const response = await axios.get(apiUrl, {
          headers: {
              Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
      });

      console.log("API Response:", response.data);

      if (response?.data?.response?.sizesList && Array.isArray(response.data.response.sizesList)) {
          return response.data.response.sizesList;
      } else {
          console.error('No valid sizes list found in the response');
          return [];
      }
  } catch (error) {
      console.error('Error in API call:', error);
      return [];
  }
};

const handleChangeScale = async (scaleId, scaleRange) => {
console.log("Before fetching sizes...");

// Fetch sizes from API
const fetchedSizes = await getScalesBySizeId(scaleId);
console.log("Fetched sizes:", fetchedSizes);

console.log("After fetching sizes...");

if (fetchedSizes && fetchedSizes.length > 0) {
    // Convert API response to desired format
    const newSizes = fetchedSizes.map(sizeFromApi => ({
        sizeId: sizeFromApi?.sizeId,
        sizeDesc: sizeFromApi?.sizeDesc,
        dealerPrice: 0,
        retailerPrice: 0,
        mrp: 0,
        availQty: 0,
        gsCode: null,
        gscodeMapId: null,
        j_item_id: null,
        article_no: null,
    }));

    // First, update selected sizes
    setSelectedSizes(newSizes);

    // Ensure `intialupdateAllItems` is called after state updates
    setTimeout(() => {
        intialupdateAllItems(dealerPrice, retailerPrice, mrp, newSizes);
    }, 50);

    setShowScalesList(false);
} else {
    console.log("No sizes found for scaleId:", scaleId);
}
};

// const handleChangeScale = item => {
//   const sizes = item?.scaleRange.split(',').map(size => size.trim());

//   const newSizes = sizes?.map((size, index) => ({
//     sizeId: index + 1,
//     sizeDesc: size,
//     dealerPrice: 0,
//     retailerPrice: 0,
//     mrp: 0,
//     availQty: 0,
//     gsCode: null,
//     gscodeMapId: null,
//     j_item_id: null,
//     article_no: null,
//   }));

//   // Update selectedSizes and then update all items
//   setSelectedSizes(newSizes);
//   setShowScalesList(false);

//   // Use a callback to ensure the state update is applied before updating all items
//   setSelectedSizes(prevSelectedSizes => {
//     intialupdateAllItems(dealerPrice, retailerPrice, mrp, prevSelectedSizes);
//     return [...prevSelectedSizes, ...newSizes];
//   });
// };

const getScales = () => {
  const text = '/scalesBysizegroupId';
  const apiUrl = `${global?.userData?.productURL}${API.GET_SCALES}${selectedSeasonGroupId}${text}`;
  // setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setScalesList(response?.data?.response.scaleList || []);
      setFilteredScalesList(response?.data?.response.scaleList || []);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};
const getAllSizesInScale = () => {
  const apiUrl = `${global?.userData?.productURL}${API.ALL_SIZES_IN_SCALE}/${companyId}`;
  setIsLoading(true);
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setAllSizesInScales(response?.data?.response.sizeList || []);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};

const handleEditSizeList = sizeList => {
  const filteredList = sizeList.map(item => ({
    sizeId: item.sizeId,
    gsCode: item.gsCode,
    availQty: item.availQty,
    gscodeMapId: item.gscodeMapId,
    sizeDesc: item.sizeDesc,
    dealerPrice: item.dealerPrice,
    retailerPrice: item.retailerPrice,
    mrp: item.mrp,
    j_item_id: item.j_item_id,
    article_no: item.article_no,
  }));

  setSelectedSizes(filteredList);
};

const toggleScalesModal = () => {
  setScalesModal(!scalesModal);
  setmSize('');
  setSelectedModalSizeInSeasonListIds([]);
  setSelectedModalSeasonGroupId(0);
  setSelectedModalSeasonGroup('');
};

const handleCloseScalesModal = () => {
  setScalesModal(false);
};

const handleSaveScalesModal = () => {
  // setIsLoading(true);
  const apiUrl0 = `${global?.userData?.productURL}${API.ADD_SCALE}`;
  const requestData = {
    id: null,
    size: mSize,
    sizeDesc: mSize,
    companyId: companyId,
    linkType: 2,
    userId: userId,
  };

  axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      setTimeout(() => {
        Alert.alert('Size Created Successfully'); // This will effectively close the alert
      }, 5000);
      setSelectedScale(response?.data?.response?.sizeList[0]?.size);
      setSelectedScaleId(response?.data?.response?.sizeList[0]?.scaleId);
      setIsLoading(false);
      getAllSizesInScale();
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
  // setScalesModal(false);
};

const ValidateNewScale = async () => {
  if (processing) return;
  setProcessing(true);

  if (mSize.length === 0) {
    Alert.alert(' Please fill all mandatory fields');
    setProcessing(false);
    return;
  }
  const slash = '/';
  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_SCALE}${mSize}${slash}${companyId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });
    if (response.data === true) {
      handleSaveScalesModal();
    } else {
      Alert.alert(' This name has been used. Please enter a new name');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      'There was a problem checking the Scale size validity. Please try again.',
    );
  } finally {
    setProcessing(false);
  }
};

const [selectedStatus, setSelectedStatus] = useState('Active'); // Default is 'Active'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const statusOptions = [
    { label: 'Active', value: 0 },
    { label: 'Inactive', value: 1 },
  ];

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleSelectStatus = (status) => {
    // Update selectedStatus with the label and selectedStatusId with the value
    setSelectedStatus(status.label); 
    setSelectedStatusId(status.value); 
    setShowStatusDropdown(false);
};

const intialupdateAllItems = (dealerPrice, retailerPrice, mrp, sizes) => {
  const updatedSizes = sizes.map(item => ({
    ...item,
    dealerPrice: Number(dealerPrice) ? Number(dealerPrice) : 0,
    retailerPrice: Number(retailerPrice) ? Number(retailerPrice) : 0,
    mrp: mrp ? Number(mrp) : 0,
    availQty: 0,
  }));
  setSelectedSizes(updatedSizes);
};


const updateAllItems = (field, value) => {
  const updatedSizes = selectedSizes.map(item => ({
    ...item,
    [field]: Number(value),
  }));
  setSelectedSizes(updatedSizes);
};

const [selectedImages, setSelectedImages] = useState([]); // State to hold selected images
const [isModalVisible, setModalVisible] = useState(false);
const [isModalVisibleImages, setIsModalVisibleImages] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [deletedImageNames, setDeletedImageNames] = useState([]);

const openModal = (image) => {
  setSelectedImage(image);
  setIsModalVisibleImages(true);
};

const closeModal = () => {
  setIsModalVisibleImages(false);
  setSelectedImage(null);
};

// useEffect(() => {
//   const styleDetails =
//     route?.params?.copiedDetails ;
//   if (styleDetails) {
//     setProductStyle(styleDetails);

//     if (
//       styleDetails?.imageUrls &&
//       styleDetails?.imageUrls.length > 0 &&
//       selectedImages?.length === 0
//     ) {
//       const imageArray = styleDetails.imageUrls.map((url, index) => ({
//         uri: url,
//         width: 100,
//         height: 100,
//         mime: 'image/jpeg',
//         name: `image_${index}.jpg`,
//       }));
//       setSelectedImages(imageArray);
//     }

//     setStyleId(styleDetails?.styleId || 0);
//   }

//   getStyleList();
// }, [route]);
const [allProductStyles, setAllProductStyles] = useState([]);

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
const [previouslySelectedImages, setPreviouslySelectedImages] = useState([]);

const openCamera = async () => {
  setModalVisible(false);

  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  ImagePicker.openCamera({
    cropping: true,
    mediaType: 'photo',
    compressImageQuality: 0.8,
  })
    .then(image => {
      const imageObj = {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
        name: `style_${copiedProductsList.length}_image_${selectedImages.length + 1}.jpg`, // Unique naming per product
      };

      console.log('Captured Image:', imageObj);

      setSelectedImages(prevImages => [...prevImages, imageObj]); // Preserve previous images
    })
    .catch(error => {
      if (!error.message.includes('User cancelled image selection')) {
        console.error('Error taking photo: ', error);
        Alert.alert('Error', 'An error occurred while taking a photo. Please try again.');
      }
    });
};


const openGallery = () => {
  setModalVisible(false);

  ImagePicker.openPicker({
    multiple: true,
    maxFiles: 10 - selectedImages.length,
    mediaType: 'photo',
    cropping: true,
  })
    .then(images => {
      const productIndex = copiedProductsList.length; // Ensure correct product index

      const newImages = images.map((image, index) => ({
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
        name: `style_${productIndex}_image_${selectedImages.length + index + 1}.jpg`, // Ensure unique naming per product
      }));

      console.log('Selected Images:', newImages);

      setSelectedImages(prevImages => {
        const uniqueImages = newImages.filter(
          newImage => !prevImages.some(selected => selected.uri === newImage.uri)
        );
        return [...prevImages, ...uniqueImages]; // Merge previous & new images
      });
    })
    .catch(error => {
      if (!error.message.includes('User cancelled image selection')) {
        console.error('Error selecting images: ', error);
        Alert.alert('Error', 'An error occurred while selecting images. Please try again.');
      }
    });
};


const removeImage = (index) => {
  const deletedImage = selectedImages[index]; // Directly access the image at the specified index
  const updatedImages = selectedImages.filter((_, i) => i !== index); // Remove image at the index

  setSelectedImages(updatedImages);

  // Check if the deleted image is from a remote source (URL) or local storage (URI starts with 'file://')
  if (deletedImage && deletedImage.uri) {
    const fileName = deletedImage.uri.split('/').pop();

    // If the deleted image is remote (starts with 'https'), add it to the deletedImageNames array
    if (deletedImage.uri.startsWith('https')) {
      setDeletedImageNames((prevNames) => {
        // Avoid duplicating names in the deletedImageNames array
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


const [nextButtonSave, setNextButtonSave] = useState(false);
const [isProductAdded, setIsProductAdded] = useState(false);

useEffect(() => {
  // Check the conditions only if the product has not been added yet
  if (!isProductAdded) {
    if (
      selectedCategoryId &&
      styleName.length > 0 &&
      styleDesc.length > 0 &&
      dealerPrice > 0 &&
      selectedColorIds &&
      selectedTypeId &&
      selectedSeasonGroupId &&
      (cedge_flag === 0 || selectedProcessWorkflowId) &&
      selectedLocationId &&
      selectedScaleId
    ) {
      setNextButtonSave(true);
    } else {
      setNextButtonSave(false);
    }
  }
}, [
  selectedCategoryId,
  styleName,
  styleDesc,
  dealerPrice,
  selectedColorIds,
  selectedTypeId,
  selectedSeasonGroupId,
  selectedProcessWorkflowId,
  selectedLocationId,
  selectedScaleId,
  isProductAdded, // Include this dependency to control when the conditions should be checked
]);
const [nextButton, setNextButton] = useState(false);


useEffect(() => {
  // If all the conditions are met, enable the next button
  if (
    selectedCategoryId &&
    styleName.length > 0 &&
    styleDesc.length > 0 &&
    dealerPrice > 0 &&
    selectedColorIds  &&
    selectedTypeId &&
    selectedSeasonGroupId &&
    (cedge_flag === 0 || selectedProcessWorkflowId) &&
    selectedLocationId &&
    selectedScaleId
  ) {
    setNextButton(true);
  } else {
    setNextButton(false); // If any condition is not met, keep the button disabled
  }
}, [
  selectedCategoryId,
  styleName,
  styleDesc,
  dealerPrice,
  selectedColorIds,
  selectedTypeId,
  selectedSeasonGroupId,
  selectedProcessWorkflowId,
  selectedLocationId,
  selectedScaleId,
]);


const ValidateStyleName = async () => {
  if (processing) return;
  setProcessing(true);

  // Find the selected color details based on the selectedColorId
  const selectedColor = colorList.find(color => color.colorId === selectedColorIds);

  // Ensure a color is selected
  if (!selectedColor) {
    Alert.alert('Error', 'Please select a valid color.');
    setProcessing(false);
    return;
  }

  // Create a new FormData instance
  const formData = new FormData();
  formData.append('styleName', styleName);
  formData.append('companyId', companyId); // Ensure this is the correct type (string or number)
  
  // Append the selected color as an object (or a JSON string if required by the backend)
  formData.append('myItems', JSON.stringify([{
    colorId: selectedColor.colorId,
    colorName: selectedColor.colorName,
  }])); // Wrap the color in an array, assuming the backend expects an array

  console.log('Request Body:', formData); // FormData cannot be stringified directly
  console.log('Request Headers:', {
    Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  });

  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_NAME_COLOR}`;

  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });

    console.log('Response Data:', response?.data);

    if (response?.data === true) {
      handleAddProduct(); // Proceed with adding product if validation passes
    } else {
      Alert.alert(
        'crm.codeverse.co.says',
        'A style with this style name and color name combination already exists. Please check.'
      );
    }
  } catch (error) {
    console.error('Error:', error);
    console.error('Full Error Object:', error);

    if (error.response) {
      console.error('Response Error:', error.response.data);
      Alert.alert('Error', `Validation failed: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Error:', error);
      Alert.alert('Error', 'There was a problem validating the style. Please try again.');
    }
  } finally {
    setProcessing(false);
  }
};

const ValidateStyleNameSave = async () => {
  if (processing) return;
  setProcessing(true);


  // Create a new FormData instance
  const formData = new FormData();
  formData.append('styleName', styleName);
  formData.append('companyId', companyId); // Ensure this is the correct type (string or number)
  
  // Append the selected color as an object (or a JSON string if required by the backend)
  formData.append('myItems', JSON.stringify([{
    colorId: selectedColor.colorId,
    colorName: selectedColor.colorName,
  }])); // Wrap the color in an array, assuming the backend expects an array

  console.log('Request Body:', formData); // FormData cannot be stringified directly
  console.log('Request Headers:', {
    Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  });

  const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_NAME_COLOR}`;

  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });

    console.log('Response Data:', response?.data);

    if (response?.data === true) {
      handleSave(); // Proceed with adding product if validation passes
    } else {
      Alert.alert(
        'crm.codeverse.co.says',
        'A style with this style name and color name combination already exists. Please check.'
      );
    }
  } catch (error) {
    console.error('Error:', error);
    console.error('Full Error Object:', error);

    if (error.response) {
      console.error('Response Error:', error.response.data);
      Alert.alert('Error', `Validation failed: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Error:', error);
      Alert.alert('Error', 'There was a problem validating the style. Please try again.');
    }
  } finally {
    setProcessing(false);
  }
};

const handleAddProduct = () => {
  const isDuplicate = copiedProductsList?.some(product => 
    product.styleName === styleName &&
    product.selectedColorIds === selectedColorIds
  );

  if (isDuplicate) {
    Alert.alert(
      'crm.codeverse.co.says',
      'A style with this style name and color combination already exists. Please check.'
    );
    return;
  }

  const clonedSizesList = selectedSizes.map(size => ({
    ...size,
    gscodeMapId: null, 
  }));

  const imageUrls = selectedImages.map(image => image.uri);
  const filesIndex = copiedProductsList.length; // Use the length of copied products to determine index

  const newProduct = {
    styleName,
    styleDesc,
    retailerPrice,
    mrp,
    gsm,
    c_hsn: hsn,
    gst,
    price: dealerPrice,
    fixDisc: fixedDiscount,
    categoryId: selectedCategoryId,
    selectedCategory,
    sizeGroupId: selectedSeasonGroupId,
    locationId: selectedLocationId,
    colorId: selectedColorIds,
    colorCode,
    typeId: selectedTypeId,
    processId: selectedProcessWorkflowId,
    cedgeStyle: cedge_flag,
    compFlag: comp_flag,
    companyName,
    selectedProcessWorkflow,
    scaleId: selectedScaleId,
    selectedScale,
    sizesListReq: clonedSizesList,
    discount: 0,
    linkType: 1,
    pub_to_jakya: 0,
    companyId,
    closureId: selectedClosureId,
    peakId: selectedPeakId,
    logoId: selectedLogoId,
    trimId: selectedTrims,
    decId: selectedDecorationId,
    uomId: selectedUomId,
    selectedUom,
    imageUrls,
    statusId: selectedStatusId,
    selectedCustomerLevel,
    selectedLocation,
    selectedSeasonGroup,
    selectedColor,
    ...(showCustomerLevelPrice && { customerLevelPrice }),
    filesIndex,
  };

  setCopiedProductsList(prevList => [...prevList, newProduct]);

  // Preserve previously selected images
  setPreviouslySelectedImages(prev => [...prev, ...selectedImages]);

  setStyleName("");
  setSelectedColorNames([]);
  setSelectedColorIds(null);
  setColorCode("");
  setSelectedImages([]);  
  setNextButton(false);  // Disable "Add"
  setIsProductAdded(true);  // Mark that the product has been added
  setNextButtonSave(true);   // Keep the "Save" button enabled
};




const [copiedProductsList, setCopiedProductsList] = useState([]);

const handleSave = async () => {



  if (styleName) {
    // Now check if any of the other required fields are missing
    if (!styleDesc) {
      Alert.alert('crm.codeverse.co.says', 'Style Description is mandatory. Please enter style description to proceed.');
      return;
    }

    if (!dealerPrice || dealerPrice <= 0) {
      Alert.alert('crm.codeverse.co.says', 'Dealer Price is mandatory. Please enter dealer price to proceed.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('crm.codeverse.co.says', 'Category is mandatory. Please select a category to proceed.');
      return;
    }

    if (!selectedColorIds) {
      Alert.alert('crm.codeverse.co.says', 'Color is mandatory. Please select a color to proceed.');
      return;
    }

    if (!selectedTypeId) {
      Alert.alert('crm.codeverse.co.says', 'Type is mandatory. Please select a type to proceed.');
      return;
    }

    if (!selectedSeasonGroupId) {
      Alert.alert('crm.codeverse.co.says', 'Season Group is mandatory. Please select a season group to proceed.');
      return;
    }

    if (!(cedge_flag === 0 || selectedProcessWorkflowId)) {
      Alert.alert('crm.codeverse.co.says', 'Process Workflow is mandatory. Please select a process workflow or set cedge flag to 0.');
      return;
    }

    if (!selectedLocationId) {
      Alert.alert('crm.codeverse.co.says', 'Location is mandatory. Please select a location to proceed.');
      return;
    }

    if (!selectedScaleId) {
      Alert.alert('crm.codeverse.co.says', 'Scale is mandatory. Please select a scale to proceed.');
      return;
    }
    if (!selectedStatus) {
      Alert.alert('crm.codeverse.co.says', 'Status is mandatory. Please select a status to proceed.');
      return;
    }
  }


  const clonedSizesList = selectedSizes.map(size => ({
    ...size,
    gscodeMapId: null, 
  }));

  const allImages = [...(previouslySelectedImages || []), ...selectedImages];
  const imageUrls = allImages.map(image => image.uri);
  const productIndex = copiedProductsList.length;  // Ensure we use correct product index

  const copiedDetails = {
    styleName,
    styleDesc,
    retailerPrice,
    mrp,
    gsm,
    c_hsn: hsn,
    gst,
    price: dealerPrice,
    fixDisc: fixedDiscount,
    categoryId: selectedCategoryId,
    selectedCategory,
    sizeGroupId: selectedSeasonGroupId,
    locationId: selectedLocationId,
    colorId: selectedColorIds,
    colorCode,
    typeId: selectedTypeId,
    processId: selectedProcessWorkflowId,
    cedgeStyle: cedge_flag,
    compFlag: comp_flag,
    companyName,
    selectedProcessWorkflow,
    scaleId: selectedScaleId,
    selectedScale,
    sizesListReq: clonedSizesList,
    discount: 0,
    linkType: 1,
    pub_to_jakya: 0,
    companyId,
    closureId: selectedClosureId,
    peakId: selectedPeakId,
    logoId: selectedLogoId,
    trimId: selectedTrims,
    decId: selectedDecorationId,
    uomId: selectedUomId,
    selectedUom,
    imageUrls,
    statusId: selectedStatusId,
    selectedCustomerLevel,
    selectedLocation,
    selectedSeasonGroup,
    selectedColor,
    ...(showCustomerLevelPrice && { customerLevelPrice }),
    filesIndex: productIndex,
  };

  try {
    let styleData = styleName ? [copiedDetails, ...copiedProductsList] : copiedProductsList;

    const formData = new FormData();
    formData.append('styleDataList', JSON.stringify(styleData));

    allImages.forEach((image, index) => {
      const imageFile = {
        uri: image.uri,
        name: image.name,  
        type: image.mime || 'image/jpeg',
      };
      formData.append('files', imageFile);
      console.log(`Appending Image:`, imageFile);
    });

    console.log("Form Data: ", formData);


    const apiUrl = `${global?.userData?.productURL}${API.ADD_COPY_STYLE}`;
    
    setIsLoading(true);

    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    });

    if (response.status === 200) {
      Alert.alert('Saved!', 'Style Added.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ProductsStyles'), // Navigate to ProductsStyles screen
        },
      ]);
      console.log('Updated Details:', response.data);
    }
    else {
      Alert.alert('Error', 'There was an issue saving the product details.');
    }

    setIsLoading(false);
  } catch (error) {
    console.error('Save Error:', error);
    Alert.alert('Error', 'An error occurred while saving the product details. Please try again.');
    setIsLoading(false);
  }
};

const handleGoBack = () => {
  Alert.alert(
    'crm.codeverse.co says',
    'Are you sure you want to discard the changes?',
    [
      {
        text: 'Cancel', 
        onPress: () => null,
      },
      {
        text: 'Discard', 
        onPress: () => navigation.goBack(),
      },
    ],
    { cancelable: false }
  );
  return true; 
};
useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', handleGoBack);
  return () => backHandler.remove();
}, []);
  return (
    <View style={styles.container}>
        <View style={styles. headerback}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={{height: 25, width: 25,marginLeft:10}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
    <Text style={{color:"#000",fontWeight:"bold",fontSize:20}}>Create New Style</Text>
    <TouchableOpacity
          style={{
            backgroundColor: nextButtonSave ?  colors.color2 : 'skyblue',
            borderRadius: 5,
        paddingVertical:10,
          paddingHorizontal:10,
            marginHorizontal: 20,
            marginVertical:5
          }}
          onPress={ValidateStyleNameSave}
          disabled={!nextButtonSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
   
    <ScrollView style={styles.container}>
     
      <View style={styles.field}>
      <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Category *</Text>
      </View>
    
      <View style={styles.container1}>
    <View style={styles.container2}>
      <TouchableOpacity
        style={styles.container3}
        onPress={handleCategoryDropDown}>
         <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedCategory?.length > 0 ? selectedCategory : 'Select'}
                  </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{ width: 20, height: 20 }}
        />
      </TouchableOpacity>
    </View>
    <View style={styles.container4}>
      <TouchableOpacity
        onPress={toggleCategoryModal}
        style={styles.plusButton}>
        <Image
          style={{
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          source={require('../../../assets/plus.png')}
        />
      </TouchableOpacity>
    </View>
  </View>
  {showCategoryList && (
    <View
      style={{
        elevation: 5,
        height: 300,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        borderColor: 'lightgray',
        borderWidth: 1,
        marginTop: 5,
      }}>
      <TextInput
        style={{
          marginTop: 10,
          borderRadius: 10,
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginHorizontal: 10,
          paddingLeft: 10,
          marginBottom: 10,
          color: '#000000',
        }}
        placeholderTextColor="#000"
        placeholder="Search"
        onChangeText={filtercategories}
      />
      {filteredCategories.length === 0 && !isLoading ? (
        <Text style={styles.noCategoriesText}>
          Sorry, no results found!
        </Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredCategories?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: '90%',
                height: 40,
                borderBottomWidth: 0.5,
                borderColor: '#8e8e8e',
              }}
              onPress={() => handleSelectCategory(item)}>
              <Text style={styles.itemcattxt}>{item?.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}


<Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Style Name *</Text>
  <View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    value={styleName}
    onChangeText={setStyleName}
  />
 </View>

 <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Style Description *</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={styleDesc}
          onChangeText={setStyleDesc}
        />
      </View>
      <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'Dealer Price'}
            </Text>
      <View style={styles.inputContainer}>
              <TextInput
                style={styles.txtinput}
                placeholder="Dealer Price *"
                placeholderTextColor="#000"
                value={dealerPrice > 0 ? dealerPrice.toString() : ''}
                onChangeText={text => {
                  setDealerPrice(text);
                  updateAllItems('dealerPrice', text);
                }}
              />
            </View>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'Retailer Price '}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.txtinput}
                placeholder="Retailer Price "
                placeholderTextColor="#000"
                value={retailerPrice > 0 ? retailerPrice.toString() : ''}
                onChangeText={text => {
                  setRetailerPrice(text);
                  updateAllItems('retailerPrice', text);
                }}
              />
            </View>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'MRP '}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.txtinput}
                placeholder="MRP"
                placeholderTextColor="#000"
                value={mrp > 0 ? mrp.toString() : ''}
                onChangeText={text => {
                  setMrp(text);
                  updateAllItems('mrp', text);
                }}
              />
            </View>

            <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Fixed Discount</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={fixedDiscount.toString()} // Convert the number to a string
          onChangeText={text => setFixedDiscount(Number(text))} // Convert input to number
        />
      </View>

      <Text style={styles.headerTxt}>{'Customer Level '}</Text>

<View style={{flexDirection: 'row', marginTop: 13}}>
  <TouchableOpacity
    style={{
      width: '90%',
      height: 37,
      borderRadius: 10,
      borderWidth: 0.5,
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 15,
      paddingRight: 15,
      marginHorizontal: 20,
    }}
    onPress={handleCustomerLevelDropDown}>
   <Text style={{fontWeight: '600', color: '#000'}}>
                  {selectedCustomerLevel ? selectedCustomerLevel : 'Select'}
                </Text>

    <Image
      source={require('../../../assets/dropdown.png')}
      style={{width: 20, height: 20}}
    />
  </TouchableOpacity>
</View>
{showCustomerLevelList && (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterCustomerLevels}
    />

    {filteredcustomerLevelList.length === 0 && !isLoading ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredcustomerLevelList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectCustomerLevel(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.customerLevelType}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}
 {showCustomerLevelPrice && (
              <>
                <Text
                  style={{
                    marginHorizontal: 20,
                    marginVertical: 3,
                    color: '#000',
                  }}>
                  {'Customer Level Price '}
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.txtinput}
                    placeholder="Customer Level Price "
                    placeholderTextColor="#000"
                    value={
                      customerLevelPrice > 0
                        ? customerLevelPrice.toString()
                        : ''
                    }
                    onChangeText={text => setCustomerLevelPrice(text)}
                  />
                </View>
              </>
            )}
            <Text style={styles.headerTxt}>{'Color *'}</Text>

            <View style={styles.container1}>
              <View style={styles.container2}>
                <TouchableOpacity
                  style={[
                    styles.container3,
                    {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
                  ]}
                  onPress={handleColorDropDown}>
             {/* <Text style={{fontWeight: '600', color: '#000'}}>
  {selectedColorIds.length > 0
    ? filteredColorList
        .filter(color => selectedColorIds.includes(color.colorId))
        .map(color => color.colorName)
        .join(', ')
    : 'Select'}
</Text> */}
<Text style={{ fontWeight: '600', color: '#000' }}>
  {selectedColorIds
    ? (filteredColorList.find(color => color.colorId === selectedColorIds) || {}).colorName || 'Select'
    : 'Select'}
</Text>

                    {/* <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedColor ? selectedColor : 'Select'}
                  </Text> */}
                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.container4}>
                <TouchableOpacity
                  onPress={toggleColorModal}
                  style={styles.plusButton}>
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    source={require('../../../assets/plus.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showColorList && editColor && (
              <View
                style={{
                  elevation: 5,
                  height: 300,
                  alignSelf: 'center',
                  width: '90%',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
                  borderWidth: 1,
                  marginTop: 5,
                }}>
                {/* <View>
                  <TouchableOpacity
                    onPress={handleSelectAll}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      margin: 10,
                    }}>
                    <CustomCheckBox
                      isChecked={isSelectAll}
                      onToggle={handleSelectAll}
                    />
                    <Text style={{color: '#000', marginLeft: 10}}>
                      Select All
                    </Text>
                  </TouchableOpacity>
                </View> */}
                <TextInput
                  style={{
                    marginTop: 10,
                    borderRadius: 10,
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginHorizontal: 10,
                    paddingLeft: 10,
                    marginBottom: 10,
                    color: '#000000',
                  }}
                  placeholderTextColor="#000"
                  placeholder="Search"
                  onChangeText={filterColors}
                />
                {filteredColorList?.length === 0 ||
                (filteredColorList?.length === 1 &&
                  !filteredColorList[0] &&
                  !isLoading) ? (
                  <Text style={styles.noCategoriesText}>
                    Sorry, no results found!
                  </Text>
                ) : (
                  <ScrollView nestedScrollEnabled={true}>
                  {filteredColorList?.map((item, index) => (
  <TouchableOpacity
    key={index}
    style={{
      width: '100%',
      height: 50,
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#8e8e8e',
    }}
    onPress={() => handleSelectColor(item)}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
      }}>
      {/* <CustomCheckBox
        isChecked={selectedColorIds(item.colorId)}  // Automatically check/uncheck based on selection
        onToggle={() => handleSelectColor(item)}
      /> */}
      <CustomCheckBox
  isChecked={selectedColorIds === item.colorId}  // Check if the current color is the selected one
  onToggle={() => handleSelectColor(item)}      // Handle selection/deselection
/>

      <Text
        style={{
          fontWeight: '600',
          color: '#000',
          marginLeft: 10,
        }}>
        {item.colorName}
      </Text>
    </View>
  </TouchableOpacity>
))}

                  </ScrollView>
                )}
              </View>
            )}
      

    
      <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Color Code</Text>
      <View style={styles.inputContainer}>
              <TextInput
                style={styles.txtinput}
                placeholder="Color Code"
                placeholderTextColor="#000"
                editable={false}
                value={colorCode}
                onChangeText={text => setColorCode(text)}
              />
            </View>
     

            <Text style={styles.headerTxt}>{'Types *'}</Text>

<View style={styles.container1}>
  <View style={styles.container2}>
    <TouchableOpacity
      style={styles.container3}
      onPress={handleTypesDropDown}>
      <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedType }
                  </Text>


      <Image
        source={require('../../../assets/dropdown.png')}
        style={{width: 20, height: 20}}
      />
    </TouchableOpacity>
  </View>
  <View style={styles.container4}>
    <TouchableOpacity
      onPress={toggleTypesModal}
      style={styles.plusButton}>
      <Image
        style={{
          height: 30,
          width: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        source={require('../../../assets/plus.png')}
      />
    </TouchableOpacity>
  </View>
</View>
{showTypesList && (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterTypes}
    />

    {filteredTypesList.length === 0 ||
    (filteredTypesList?.length === 1 &&
      !filteredTypesList[0] &&
      !isLoading) ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredTypesList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectType(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.typeName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}

<Text style={styles.headerTxt}>{'Season Groups *'}</Text>

<View style={styles.container1}>
  <View style={styles.container2}>
    <TouchableOpacity
      style={[
        styles.container3,
        {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
      ]}
      onPress={handleSeasonGroupsDropDown}>
      <Text style={{fontWeight: '600', color: '#000'}}>
        {selectedSeasonGroup ? selectedSeasonGroup : 'Select'}
      </Text>

      <Image
        source={require('../../../assets/dropdown.png')}
        style={{width: 20, height: 20}}
      />
    </TouchableOpacity>
  </View>
  <View style={styles.container4}>
    <TouchableOpacity
      onPress={toggleSeasonGroupsModal}
      style={styles.plusButton}>
      <Image
        style={{
          height: 30,
          width: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        source={require('../../../assets/plus.png')}
      />
    </TouchableOpacity>
  </View>
</View>
{showSeasonGroupsList &&   (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterSeasonGroups}
    />

    {filteredSeasonGroupsList.length === 0 ||
    (filteredSeasonGroupsList?.length === 1 &&
      !filteredSeasonGroupsList[0] &&
      !isLoading) ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredSeasonGroupsList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectSeasonGroup(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.sizeGroup}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}
        
      <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>GSM</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={gsm.toString()} 
          onChangeText={text => setGsm(Number(text))} 
        />
      </View>
    
      <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>Hsn</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={hsn.toString()} 
          onChangeText={text => setHsn(Number(text))} 
        />
      </View>
      
      <Text style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>GST</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={gst.toString()} 
          onChangeText={text => setGst(Number(text))} 
        />
      </View>

       {/* Closure Dropdown */}
       {prod_additional_field_flag === 1 && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.headerTxt}>{'Closure'}</Text>
                <View style={styles.container1}>
                  <View style={styles.container2}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={toggleClosure}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedClosureId ? selectedClosure : 'Select'}
                      </Text>
                      <Image
                        style={{width: 20, height: 20}}
                        source={require('../../../assets/dropdown.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container4}>
                    <TouchableOpacity
                      onPress={toggleClosureModal}
                      style={styles.plusButton}>
                      <Image
                        style={styles.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {showClosure && (
                  <View style={styles.dropdownContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchClosure}
                      onChangeText={setSearchClosure}
                    />
                    <ScrollView nestedScrollEnabled={true}>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredClosureData.length === 0 &&
                        !isKaptureLoading ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredClosureData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedClosure(item.m_name); // Set selected value
                              setSelectedClosureId(item.m_id);
                              setShowClosure(false); // Close dropdown
                            }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.m_name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Peak Dropdown */}
            {prod_additional_field_flag === 1 && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.headerTxt}>{'Peak'}</Text>
                <View style={styles.container1}>
                  <View style={styles.container2}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={togglePeak}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedPeakId ? selectedPeak : 'Select'}
                      </Text>
                      <Image
                        style={{width: 20, height: 20}}
                        source={require('../../../assets/dropdown.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container4}>
                    <TouchableOpacity
                      onPress={togglePeakModal}
                      style={styles.plusButton}>
                      <Image
                        style={styles.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showPeak && (
                  <View style={styles.dropdownContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchPeak}
                      onChangeText={setSearchPeak}
                    />
                    <ScrollView nestedScrollEnabled={true}>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredPeakData.length === 0 && !isKaptureLoading ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredPeakData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedPeak(item.m_name); // Set selected value
                              setSelectedPeakId(item.m_id);
                              setShowPeak(false); // Close dropdown
                            }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.m_name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Logo Dropdown */}
            {prod_additional_field_flag === 1 && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.headerTxt}>{'Logo'}</Text>
                <View style={styles.container1}>
                  <View style={styles.container2}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={toggleLogo}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedLogoId ? selectedLogo : 'Select'}
                      </Text>
                      <Image
                        style={{width: 20, height: 20}}
                        source={require('../../../assets/dropdown.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container4}>
                    <TouchableOpacity
                      onPress={toggleLogoModal}
                      style={styles.plusButton}>
                      <Image
                        style={styles.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showLogo && (
                  <View style={styles.dropdownContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchLogo}
                      onChangeText={setSearchLogo}
                    />
                    <ScrollView>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredLogoData.length === 0 && !isKaptureLoading ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredLogoData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedLogo(item.m_name); // Set selected value
                              setSelectedLogoId(item.m_id);
                              setShowLogo(false); // Close dropdown
                            }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.m_name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
            {/* Decoration Dropdown */}
            {prod_additional_field_flag === 1 && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.headerTxt}>{'Decoration'}</Text>
                <View style={styles.container1}>
                  <View style={styles.container2}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={toggleDecoration}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedDecorationId ? selectedDecoration : 'Select'}
                      </Text>
                      <Image
                        style={{width: 20, height: 20}}
                        source={require('../../../assets/dropdown.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container4}>
                    <TouchableOpacity
                      onPress={toggleDecorationModal}
                      style={styles.plusButton}>
                      <Image
                        style={styles.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showDecoration && (
                  <View style={styles.dropdownContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchDecoration}
                      onChangeText={setSearchDecoration}
                    />
                    <ScrollView>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredDecorationData.length === 0 &&
                        !isKaptureLoading ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredDecorationData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedDecoration(item.m_name); // Set selected value
                              setSelectedDecorationId(item.m_id);
                              setShowDecoration(false); // Close dropdown
                            }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.m_name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
            {/* Trims Dropdown */}
            {prod_additional_field_flag === 1 && (
              <View style={styles.dropdownContainer}>
                <Text style={styles.headerTxt}>{'Trims'}</Text>
                <View style={styles.container1}>
                  <View style={styles.container2}>
                    <TouchableOpacity
                      style={{
                        width: '90%',
                        height: 37,
                        borderRadius: 10,
                        borderWidth: 0.5,
                        alignSelf: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingLeft: 15,
                        paddingRight: 15,
                        marginHorizontal: 20,
                      }}
                      onPress={toggleTrims}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedTrimsId ? selectedTrims : 'Select'}
                      </Text>
                      <Image
                        style={{width: 20, height: 20}}
                        source={require('../../../assets/dropdown.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container4}>
                    <TouchableOpacity
                      onPress={toggleTrimsModal}
                      style={styles.plusButton}>
                      <Image
                        style={styles.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showTrims && (
                  <View style={styles.dropdownContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchTrims}
                      onChangeText={setSearchTrims}
                    />
                    <ScrollView>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredTrimsData.length === 0 &&
                        !isKaptureLoading ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredTrimsData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedTrims(item.m_name); // Set selected value
                              setSelectedTrimsId(item.m_id);
                              setShowTrims(false); // Close dropdown
                            }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.m_name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

{cedge_flag === 1 && (
              <Text style={styles.headerTxt}>{'Process Work Flow *'}</Text>
            )}
{cedge_flag === 1 && (
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <TouchableOpacity
                  style={{
                    width: '90%',
                    height: 50,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 15,
                    paddingRight: 15,
                    marginHorizontal: 20,
                  }}
                  onPress={handleProcessWorkflowDropDown}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedProcessWorkflow
                      ? selectedProcessWorkflow
                      : 'Select'}
                  </Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
            )}
            {showProcessWorkflowList &&  (
              <View
                style={{
                  elevation: 5,
                  height: 300,
                  alignSelf: 'center',
                  width: '90%',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                }}>
                <TextInput
                  style={{
                    marginTop: 10,
                    borderRadius: 10,
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginHorizontal: 10,
                    paddingLeft: 10,
                    marginBottom: 10,
                    color: '#000000',
                  }}
                  placeholderTextColor="#000"
                  placeholder="Search"
                  onChangeText={filterProcessWorkflow}
                />

                {filteredProcessWorkflowList.length === 0 && !isLoading ? (
                  <Text style={styles.noCategoriesText}>
                    Sorry, no results found!
                  </Text>
                ) : (
                  <ScrollView nestedScrollEnabled={true}>
                    {filteredProcessWorkflowList?.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          width: '100%',
                          height: 50,
                          justifyContent: 'center',
                          borderBottomWidth: 0.5,
                          borderColor: '#8e8e8e',
                        }}
                        onPress={() => handleSelectProcessWorkflow(item)}>
                        <Text
                          style={{
                            fontWeight: '600',
                            marginHorizontal: 15,
                            color: '#000',
                          }}>
                          {item?.configName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
            <Text style={styles.headerTxt}>{'UOM (Unit of Measure) '}</Text>

<View style={styles.container1}>
              <View style={styles.container2}>
              <TouchableOpacity
  style={[
    styles.container3,
    { backgroundColor: editColor ? '#fff' : '#f1e8e6' },
  ]}
  onPress={handUomDropDown}>
  <Text style={{ fontWeight: '600', color: '#000' }}>
    {selectedUom ? selectedUom : 'Select'}
  </Text>
  <Image
    source={require('../../../assets/dropdown.png')}
    style={{ width: 20, height: 20 }}
  />
</TouchableOpacity>
              </View>
              <View style={styles.container4}>
                <TouchableOpacity
                  onPress={toggleSeasonUomModal}
                  style={styles.plusButton}>
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    source={require('../../../assets/plus.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
{showUomList  && (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterUom}
    />

    {filteredUomList.length === 0 && !isLoading ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredUomList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectUom(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.uomName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}

<Text style={styles.headerTxt}>{'Location *'}</Text>

<View style={{flexDirection: 'row', marginTop: 10}}>
  <TouchableOpacity
    style={{
      width: '90%',
      height: 37,
      borderRadius: 10,
      borderWidth: 0.5,
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 15,
      paddingRight: 15,
      marginHorizontal: 20,
      backgroundColor: editColor ? '#fff' : '#f1e8e6',
    }}
    onPress={handleLocationDropDown}>
    <Text style={{fontWeight: '600', color: '#000'}}>
      {selectedLocation ? selectedLocation : 'Select'}
    </Text>

    <Image
      source={require('../../../assets/dropdown.png')}
      style={{width: 20, height: 20}}
    />
  </TouchableOpacity>
</View>
{showLocationList &&   (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterLocation}
    />

    {filteredLocationList.length === 0 && !isLoading ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredLocationList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectLocation(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.locationName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}
      
      <Text style={styles.headerTxt}>{'Scales *'}</Text>

<View style={styles.container1}>
  <View style={styles.container2}>
    <TouchableOpacity
      style={[
        styles.container3,
        {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
      ]}
      onPress={handleScalesDropDown}>
      <Text style={{fontWeight: '600', color: '#000'}}>
        {selectedScale ? selectedScale : 'Select'}
      </Text>
      <Image
        source={require('../../../assets/dropdown.png')}
        style={{width: 20, height: 20}}
      />
    </TouchableOpacity>
  </View>
  <View style={styles.container4}>
    <TouchableOpacity
      onPress={toggleScalesModal}
      style={styles.plusButton}>
      <Image
        style={{
          height: 30,
          width: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        source={require('../../../assets/plus.png')}
      />
    </TouchableOpacity>
  </View>
</View>
{showScalesList  && (
  <View
    style={{
      elevation: 5,
      height: 300,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
    }}>
    <TextInput
      style={{
        marginTop: 10,
        borderRadius: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 10,
        paddingLeft: 10,
        marginBottom: 10,
        color: '#000000',
      }}
      placeholderTextColor="#000"
      placeholder="Search"
      onChangeText={filterScales}
    />

    {filteredScalesList.length === 0 && !isLoading ? (
      <Text style={styles.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredScalesList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectScale(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.scaleRange}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}      
  
  <Text style={styles.headerTxt}>{'Status'}</Text>
             <View style={styles.container1}>
      <View style={styles.container2}>
        <TouchableOpacity
          style={styles.container3}
          onPress={toggleStatusDropdown}
        >
          <Text style={{ fontWeight: '600', color: '#000' }}>
            {selectedStatus} 
          </Text>
          <Image
            source={require('../../../assets/dropdown.png')}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        {showStatusDropdown && (
          <View style={styles.dropdownContainersstatus}>
            {statusOptions.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleSelectStatus(status)}
              >
                <Text style={styles.dropdownText}>{status.label}</Text> 
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
      {showScaleTable && (
              <View style={styles.container}>
                <View style={styles.header}>
                  <View style={styles.headerCell1}>
                    <Text style={styles.headerText}>Id</Text>
                  </View>
                  <View style={styles.headerCell2}>
                    <Text style={styles.headerText}>Size</Text>
                  </View>
                  <View style={styles.headerCell3}>
                    <Text style={styles.headerText}>Dealer Price</Text>
                  </View>
                  <View style={styles.headerCell4}>
                    <Text style={styles.headerText}>Retailer Price</Text>
                  </View>
                  <View style={styles.headerCell5}>
                    <Text style={styles.headerText}>MRP</Text>
                  </View>
                  <View style={styles.headerCell6}>
                    <Text style={styles.headerText}>Available Quantity</Text>
                  </View>
                </View>

                <ScrollView>
                  {selectedSizes.map((item, index) => (
                    
                    <View key={index} style={styles.row}>
                      <View style={styles.cell1}>
                        <Text style={styles.cellText}>{item?.sizeId}</Text>
                      </View>
                      <View style={styles.cell2}>
                        <Text style={styles.cellText}>{item?.sizeDesc}</Text>
                      </View>
                      <View style={styles.cell}>
                        <TextInput
                            style={styles.input}
                          keyboardType="numeric"
                          value={item?.dealerPrice.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'dealerPrice', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={styles.cell}>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={item?.retailerPrice.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'retailerPrice', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={styles.cell}>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={item.mrp.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'mrp', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={styles.cell}>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={item.availQty.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'availQty', text)
                          }
                        
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}


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

<Modal
              animationType="fade"
              transparent={true}
              visible={categoryModal && editShortcutKey}
              onRequestClose={() => {
                toggleCategoryModal();
              }}>
              <View style={styles.modalContainerr}>
                <View style={styles.modalContentt}>
                  <View
                    style={{
                      backgroundColor:   colors.color2,
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
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New Category'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseCategoryModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Category Name * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmCategoryName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Category Description * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmCategoryDesc(text)}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    // style={[style.saveButton, processing && { opacity: 0.5 }]}
                    onPress={ValidateNewCategory}
                    disabled={processing}>
                    <Text style={styles.saveButtonText}>
                      {processing ? 'Processing...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={colorModal && editShortcutKey}
              onRequestClose={() => {
                toggleColorModal();
              }}>
              <View style={styles.modalContainerr}>
                <View style={styles.modalContentt}>
                  <View
                    style={{
                      backgroundColor:   colors.color2,
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
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New Color'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseColorModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Color Name * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Color Description * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorDesc(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Color Code '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorCode(text)}
                  />
                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[styles.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateNewColor}
                    disabled={processing}>
                    <Text style={styles.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={typesModal }
              onRequestClose={() => {
                toggleTypesModal();
              }}>
              <View style={styles.modalContainerr}>
                <View style={styles.modalContentt}>
                  <View
                    style={{
                      backgroundColor:   colors.color2,
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
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New Type'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseTypesModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Type Name * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmTypeName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Type Description * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmTypeDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[styles.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateNewType}
                    disabled={processing}>
                    <Text style={styles.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={seasonGroupsModal && editShortcutKey}
              onRequestClose={() => {
                toggleSeasonGroupsModal();
              }}>
              <View style={styles.modalContainerr}>
                <View style={styles.modalContentt}>
                  <View
                    style={{
                      backgroundColor:   colors.color2,
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
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New Season Group'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseSeasonGroupsModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Season Group Name * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSeasonGroupName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Season Group Description * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSeasonGroupDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[styles.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateSeasonGroup}
                    disabled={processing}>
                    <Text style={styles.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

              {/* Closure Modal */}
              <Modal
              animationType="fade"
              transparent={true}
              visible={closureModal && editShortcutKey}
              onRequestClose={toggleClosureModal}>
              <ScrollView>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View style={styles.modalHeader}>
                      <Text
                        style={[
                          styles.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Closure'}
                      </Text>
                      <TouchableOpacity onPress={toggleClosureModal}>
                        <Image
                          style={styles.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalLabel}>Closure Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Closure Name"
                      placeholderTextColor="#000"
                      value={closureName}
                      onChangeText={setClosureName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      disabled={processing}
                      onPress={() =>
                        ValidateAllKapture(1, 'Closure', closureName)
                      }>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            {/* Peak Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={peakModal && editShortcutKey}
              onRequestClose={togglePeakModal}>
              <ScrollView>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View style={styles.modalHeader}>
                      <Text
                        style={[
                          styles.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Peak'}
                      </Text>
                      <TouchableOpacity onPress={togglePeakModal}>
                        <Image
                          style={styles.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalLabel}>Peak Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Peak Name"
                      placeholderTextColor="#000"
                      value={peakName}
                      onChangeText={setPeakName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      onPress={() => ValidateAllKapture(2, 'Peak', peakName)}
                      disabled={processing}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            {/* Logo Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={logoModal && editShortcutKey}
              onRequestClose={toggleLogoModal}>
              <ScrollView>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View style={styles.modalHeader}>
                      <Text
                        style={[
                          styles.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Logo'}
                      </Text>
                      <TouchableOpacity onPress={toggleLogoModal}>
                        <Image
                          style={styles.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalLabel}>Logo Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Logo Name"
                      placeholderTextColor="#000"
                      value={logoName}
                      onChangeText={setLogoName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      onPress={() => ValidateAllKapture(3, 'Logo', logoName)}
                      disabled={processing}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            {/* Decoration Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={decorationModal && editShortcutKey}
              onRequestClose={toggleDecorationModal}>
              <ScrollView>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View style={styles.modalHeader}>
                      <Text
                        style={[
                          styles.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Decoration'}
                      </Text>
                      <TouchableOpacity onPress={toggleDecorationModal}>
                        <Image
                          style={styles.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalLabel}>Decoration Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Decoration Name"
                      placeholderTextColor="#000"
                      value={decorationName}
                      onChangeText={setDecorationName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      onPress={() =>
                        ValidateAllKapture(4, 'Decoration', decorationName)
                      }
                      disabled={processing}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            {/* Trims Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={trimsModal && editShortcutKey}
              onRequestClose={toggleTrimsModal}>
              <ScrollView>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Add New Trims</Text>
                      <TouchableOpacity onPress={toggleTrimsModal}>
                        <Image
                          style={styles.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {' '}
                      {'Trims Name *'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Trims Name"
                      placeholderTextColor="#000"
                      value={trimsName}
                      onChangeText={setTrimsName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      disabled={processing}
                      onPress={() => ValidateAllKapture(5, 'Trim', trimsName)}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={scalesModal && editShortcutKey}
              onRequestClose={() => {
                toggleScalesModal();
              }}>
              <ScrollView style={{}}>
                <View style={styles.modalContainerr1}>
                  <View style={styles.modalContentt}>
                    <View
                      style={{
                        backgroundColor:   colors.color2,
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
                      <Text
                        style={[
                          styles.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {'Add New Scale'}
                      </Text>
                      <TouchableOpacity
                        onPress={handleCloseScalesModal}
                        style={{alignSelf: 'flex-end'}}>
                        <Image
                          style={{height: 30, width: 30, marginRight: 5}}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={{fontWeight: 'bold', color: '#000'}}>
                      {'Size * '}
                    </Text>
                    <TextInput
                      style={[styles.input, {color: '#000'}]}
                      placeholder=""
                      placeholderTextColor="#000"
                      onChangeText={text => setmSize(text)}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      onPress={ValidateNewScale}
                      disabled={processing}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.headerTxt, {textAlign: 'left'}]}>
                      {'Season Group *'}
                    </Text>

                    <View style={{flexDirection: 'row', marginTop: 13}}>
                      <TouchableOpacity
                        style={{
                          width: '90%',
                          height: 37,
                          borderRadius: 10,
                          borderWidth: 0.5,
                          alignSelf: 'center',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingLeft: 15,
                          paddingRight: 15,
                          marginHorizontal: 20,
                        }}
                        onPress={handleModalSeasonGroupsDropDown}>
                        <Text style={{fontWeight: '600', color: '#000'}}>
                          {selectedModalSeasonGroup
                            ? selectedModalSeasonGroup
                            : 'Select'}
                        </Text>

                        <Image
                          source={require('../../../assets/dropdown.png')}
                          style={{width: 20, height: 20}}
                        />
                      </TouchableOpacity>
                    </View>
                    {showModalSeasonGroupsList && (
                      <View
                        style={{
                          elevation: 5,
                          height: 300,
                          alignSelf: 'center',
                          width: '90%',
                          backgroundColor: '#fff',
                          borderRadius: 10,
                        }}>
                        <TextInput
                          style={{
                            marginTop: 10,
                            borderRadius: 10,
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            marginHorizontal: 10,
                            paddingLeft: 10,
                            marginBottom: 10,
                            color: '#000000',
                          }}
                          placeholderTextColor="#000"
                          placeholder="Search"
                          onChangeText={filterModalSeasonGroups}
                        />

                        {filteredModalSeasonGroupsList.length === 0 ||
                        (filteredModalSeasonGroupsList?.length === 1 &&
                          !filteredModalSeasonGroupsList[0] &&
                          !isLoading) ? (
                          <Text style={style.noCategoriesText}>
                            Sorry, no results found!
                          </Text>
                        ) : (
                          <ScrollView nestedScrollEnabled={true}>
                            {filteredModalSeasonGroupsList?.map(
                              (item, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={{
                                    width: '100%',
                                    height: 50,
                                    justifyContent: 'center',
                                    borderBottomWidth: 0.5,
                                    borderColor: '#8e8e8e',
                                  }}
                                  onPress={() =>
                                    handleModalSelectSeasonGroup(item)
                                  }>
                                  <Text
                                    style={{
                                      fontWeight: '600',
                                      marginHorizontal: 15,
                                      color: '#000',
                                    }}>
                                    {item?.sizeGroup}
                                  </Text>
                                </TouchableOpacity>
                              ),
                            )}
                          </ScrollView>
                        )}
                      </View>
                    )}

                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginTop: 10,
                        color: '#000',
                      }}>
                      {'Sizes :'}
                    </Text>

                    <View style={{height: 180, width: '90%', marginTop: 10}}>
                      {allSizesInScales.length === 0 ||
                      (allSizesInScales?.length === 1 &&
                        !allSizesInScales[0] &&
                        !isLoading) ? (
                        <Text style={styles.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        <ScrollView nestedScrollEnabled={true}>
                          {allSizesInScales?.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              style={{
                                width: '100%',
                                height: 50,
                                borderBottomWidth: 0.5,
                                borderColor: '#8e8e8e',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginHorizontal: 10,
                              }}
                              onPress={() =>
                                handleSelectallSizesInScales(item)
                              }>
                              <CustomCheckBox
                                isChecked={selectedModalSizeInSeasonListIds.includes(
                                  item.id,
                                )}
                                onToggle={() =>
                                  handleSelectallSizesInScales(item)
                                }
                              />
                              <Text
                                style={{
                                  fontWeight: '600',
                                  marginHorizontal: 15,
                                  color: '#000',
                                }}>
                                {item.size}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[styles.saveButton, processing && {opacity: 0.5}]}
                      onPress={handleSaveNewSizesToSeasonGroup}
                      disabled={processing}>
                      <Text style={styles.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={UomModal && editShortcutKey}
              onRequestClose={() => {
                toggleSeasonUomModal();
              }}>
              <View style={styles.modalContainerr}>
                <View style={styles.modalContentt}>
                  <View
                    style={{
                      backgroundColor:   colors.color2,
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
                    <Text
                      style={[
                        styles.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New UOM'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseUomModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'UOM Name * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmUomName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'UOM Description * '}
                  </Text>
                  <TextInput
                    style={[styles.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setUomDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[styles.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateUom}
                    disabled={processing}>
                    <Text style={styles.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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

      <View style={styles.buttonContainer}>
  {/* <Button title="Add" onPress={handleAddProduct} /> */}

  <TouchableOpacity
              style={{
                backgroundColor: nextButton ?  colors.color2 : 'skyblue',
                padding: 10,
                borderRadius: 5,
                marginTop: 20,
                width: '90%',
                marginHorizontal: 20,
              }}
              onPress={ValidateStyleName}
              disabled={!nextButton}>
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
</View>


      {copiedProductsList.length === 0 ? (
        // <Text style={styles.noProductsText}>No products added yet.</Text>
        null
      ) : (
        copiedProductsList.map((item, index) => (
          <View key={index} style={styles.productContainer}>
            <Text style={styles.productHeader}>Product {index + 1}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedCategory}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Style Name:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.styleName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Style Description:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.styleDesc}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dealer Price:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.price}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Retailer Price:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.retailerPrice}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>MRP:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.mrp}</Text>
            </View>
            {/* <View style={styles.row}>
              <Text style={styles.label}>Cor. Rate:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.corRate}</Text>
            </View> */}
            <View style={styles.row}>
              <Text style={styles.label}>Fixed Discount:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.fixDisc}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Customer Level:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedCustomerLevel}</Text>
            </View>

      {item.customerLevelPrice && ( // Check if customerLevelPrice exists
        <View style={styles.row}>
          <Text style={styles.label}>Customer Level Price:</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{item.customerLevelPrice}</Text>
        </View>
      )}
            <View style={styles.row}>
              <Text style={styles.label}>GSM:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.gsm}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>HSN:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.c_hsn}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GST:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.gst}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>UOM (Unit of Measure)</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedUom}</Text>
            </View>
            {prod_additional_field_flag === 1 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Closure:</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{item.selectedClosure}</Text>
                </View>
            )}
                        {prod_additional_field_flag === 1 && (

                <View style={styles.row}>
                  <Text style={styles.label}>Peak:</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{item.selectedPeak}</Text>
                </View>
                        )}
               {prod_additional_field_flag === 1 && (

                <View style={styles.row}>
                  <Text style={styles.label}>Logo:</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{item.selectedLogo}</Text>
                </View>
                                    )}
                   {prod_additional_field_flag === 1 && (
                       
                <View style={styles.row}>
                  <Text style={styles.label}>Trims:</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{item.selectedTrims}</Text>
                </View>
                   )}
                 {prod_additional_field_flag === 1 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Decoration:</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{item.selectedDecoration}</Text>
                </View>
                 )}
           
            {cedge_flag ===1 &&(
            <View style={styles.row}>
              <Text style={styles.label}>Process Workflow:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedProcessWorkflow}</Text>
            </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Season Group:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedSeasonGroup}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedLocation}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Scale:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedScale}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Sizes:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.sizesListReq?.map(size => size.sizeDesc).join(", ")}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Colors:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.selectedColorNames}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Color Codes:</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.colorCode}</Text>
            </View>
            {item.sizesListReq?.map((item, index) => (
  <View key={index} style={styles.row}>
    <View style={styles.cell1}>
    <Text style={styles.cellText}>{index + 1}</Text>                     
    </View>
    <View style={styles.cell2}>
      <Text style={styles.cellText}>{item?.sizeDesc}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{item?.dealerPrice}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{item?.retailerPrice}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{item.mrp}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{item.availQty}</Text>
    </View>
  </View>
))}

<View style={{ flexDirection: 'row', flexWrap: 'wrap',}}>     
            {item.imageUrls.length > 0 ? (
              item.imageUrls.map((url, imgIndex) => (
                <Image key={imgIndex} source={{ uri: url }} style={styles.productImage} />
              ))
            ) : (
              <Text style={styles.productText}>No images available.</Text>
            )}
            </View>
          </View>
        ))
      )}


    </ScrollView>
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
  container: {
    flex:1,
  },

 headerback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    justifyContent:"space-between"
  },
  buttonContainer: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerCell1: {
    flex: 0.5,
    alignItems: 'center',
  },
  headerCell2: {
    flex: 1,
    alignItems: 'center',
  },
  headerCell3: {
    flex: 1,
    alignItems: 'center',
  },
  headerCell4: {
    flex: 1,
    alignItems: 'center',
  },
  headerCell5: {
    flex: 1,
    alignItems: 'center',
  },
  headerCell6: {
    flex: 1.3,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  cell1: {
    flex: 0.5,
    justifyContent: 'center',
  },
  cell2: {
    flex: 0.8,
    justifyContent: 'center',
  },
  cellText: {
    color: '#000',
    textAlign: 'center',
  },
  container1: {
    flexDirection: 'row',
    // marginTop: 20,
    alignItems: 'center',
    width: '90%',
  },
  container2: {
    justifyContent: 'flex-start',
    width: '95%',
  },
  container4: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '10%',
  },
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemcattxt: {
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#000',
  },
  headerTxt: {
    marginHorizontal: 20,
    marginVertical: 3,
    color: '#000',
  },
  container3: {
    width: '90%',
    height: 37,
    borderRadius: 10,
    borderWidth: 0.5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainerr1: {
    flex: 1,
    alignItems: 'center',
    marginTop: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentt: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Add elevation for shadow on Android
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: 20,
    color: '#000',
  },
  modalLabel: {
    color: '#000',
  },
  saveButton: {
    backgroundColor:   colors.color2,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth:1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 5,
    width: '97%',
    color: 'black',
    ...(Platform.OS === 'ios' && {paddingVertical: 7}),
  },
  inputContainer: {
    // borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 3,
    marginTop: 3,
  },
  txtinput: {
    borderWidth: 1,
    borderColor: 'gray',
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000000',
    ...(Platform.OS === 'ios' && {marginVertical: 7}),
  },
  dropdownContent: {
    elevation: 5,
    height: 300,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
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
  dropdownButton: {
    width: '90%',
    height: 37,
    borderRadius: 10,
    borderWidth: 0.5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    marginHorizontal: 20,
  },
  
  dropdownContainersstatus: {
    elevation: 5,
    height: 100,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: 'lightgray',
    borderWidth: 1,
    marginTop: 5,
  },
  dropdownText: {
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#000',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  plusIcon: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // tintColor:'#1F74BA',
  },
  modalHeader: {
    backgroundColor:   colors.color2,
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
  closeIcon: {
    height: 30,
    width: 30,
    marginRight: 5,
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
  productContainer: {
    padding: 10,
    borderBottomWidth: 1,
    marginVertical: 5,
  },
  productHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    width: 150,
    color: '#000',
    marginLeft: 10,
  },
  colon: {
    width: 15,
    color: '#000',
    marginVertical: 5,
  },
  value: {
    flex: 1,
    color: '#000',
    marginRight: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    marginVertical: 5,
    marginHorizontal:10
  },
  productText: {
    color: '#000',
    marginVertical: 5,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#000',
    marginTop: 20,
  },
  headprductimage: {
    marginTop: 10,
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
  },
});


export default CopyProduct;
