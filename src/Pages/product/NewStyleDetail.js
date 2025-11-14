import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import CustomCheckBox from '../../components/CheckBox';
import { ColorContext } from '../../components/colortheme/colorTheme';
import { TextInput } from 'react-native-paper';

const NewStyleDetail = ({route}) => {
  const navigation = useNavigation();

const deletedSizeIds = new Set();
const existingSizeIds = new Set();


 
  const selectedCompany = useSelector(state => state.selectedCompany);

 const { productSetup } = selectedCompany;

  // Different variable names
  const [corRateField, setCorRateField] = useState({
    isVisible: productSetup?.corRateVisible,
    label: productSetup?.corRateLabel,
  });

  const [dealerPriceField, setDealerPriceField] = useState({
    isVisible: productSetup?.dealerPriceVisible,
    label: productSetup?.dealerPriceLabel,
  });

  const [retailerPriceField, setRetailerPriceField] = useState({
    isVisible: productSetup?.retailerPriceVisible,
    label: productSetup?.retailerPriceLabel,
  });

  const [mrpField, setMrpField] = useState({
    isVisible: productSetup?.mrpVisible,
    label: productSetup?.mrpLabel,
  });

  // console.log("slecetd company in new style detail==>",selectedCompany)
  const userId = useSelector(state => state?.loggedInUser?.userId);
  const styleDetails = route?.params?.Style;
  const { colors } = useContext(ColorContext);
  const style = getStyles(colors);

  // const userData=useSelector(state=>state.loggedInUser);
  // const userId=userData?.userId;

  const [imageUrls, setImageUrls] = useState([]);

  const [companyId, set_companyId] = useState(selectedCompany?.id);
  const [cedge_flag, set_cedge_flag] = useState(selectedCompany?.cedge_flag);
  const [comp_flag, set_comp_flag] = useState(selectedCompany?.comp_flag);
  const [companyName, setCompanyName] = useState(selectedCompany?.companyName);
  const [kapture_task_flag, setkaptureFlag] = useState(
    selectedCompany?.kapture_task_flag,
  );

  const [prod_additional_field_flag, set_prod_additional_field_flag] = useState(
    selectedCompany?.prod_additional_field_flag,
  );
  

  // const companyId = selectedCompany?.id;
  // const cedge_flag = selectedCompany?.cedge_flag;
  // const comp_flag = selectedCompany?.comp_flag;

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

  const [selectedClosureId, setSelectedClosureId] = useState(0);
  const [selectedPeakId, setSelectedPeakId] = useState(0);
  const [selectedLogoId, setSelectedLogoId] = useState(0);
  const [selectedDecorationId, setSelectedDecorationId] = useState(0);
  const [selectedTrimsId, setSelectedTrimsId] = useState(0); // Loading state

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

  const [showCategoryList, setshowCategoryList] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  const [showCustomerLevelList, setShowCustomerLevelList] = useState(false);
  const [customerLevelList, setCustomerLevelList] = useState([]);
  const [filteredcustomerLevelList, setFilteredCustomerLevelList] = useState(
    [],
  );
  const [selectedCustomerLevel, setSelectedCustomerLevel] = useState('');
  const [selectedCustomerLevelId, setSelectedCustomerLevelId] = useState(-1);

  const [showColorList, setShowColorList] = useState(false);
  const [colorList, setColorList] = useState([]);
  const [filteredColorList, setFilteredColorList] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(0);

  const [showTypesList, setShowTypesList] = useState(false);
  const [typesList, setTypesList] = useState([]);
  const [filteredTypesList, setFilteredTypesList] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState(0);


  const [industryTypesList, setIndustryTypesList] = useState([]);
  const [selectedIndustryTypeId, setSelectedIndustryTypeId] = useState(0); 
  const [selectedIndustry, setSelectedIndustry] = useState('');  
  const [hasSizes, setHasSizes] = useState(true);  

  const [showSeasonGroupsList, setShowSeasonGroupsList] = useState(false);
  const [seasonGroupsList, setSeasonGroupsList] = useState([]);
  const [filteredSeasonGroupsList, setFilteredSeasonGroupsList] = useState([]);
  const [selectedSeasonGroup, setSelectedSeasonGroup] = useState('');
  const [selectedSeasonGroupId, setSelectedSeasonGroupId] = useState(0);

  const [showModalSeasonGroupsList, setShowModalSeasonGroupsList] =
    useState(false);
  const [filteredModalSeasonGroupsList, setFilteredModalSeasonGroupsList] =
    useState([]);
  const [selectedModalSeasonGroup, setSelectedModalSeasonGroup] = useState('');
  const [selectedModalSeasonGroupId, setSelectedModalSeasonGroupId] =
    useState(0);

  const [
    selectedModalSizeInSeasonListIds,
    setSelectedModalSizeInSeasonListIds,
  ] = useState([]);

  const [
    selectedSizesInModal,
    setSelectedSizesInModal,
  ] = useState([]);

  const [showProcessWorkflowList, setShowProcessWorkflowList] = useState(false);
  const [processWorkflowList, setProcessWorkflowList] = useState([]);
  const [filteredProcessWorkflowList, setFilteredProcessWorkflowList] =
    useState([]);
  const [selectedProcessWorkflow, setSelectedProcessWorkflow] = useState('');
  const [selectedProcessWorkflowId, setSelectedProcessWorkflowId] = useState(0);

  const [showLocationList, setShowLocationList] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [filteredLocationList, setFilteredLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState(0);

  const [showUomList, setShowUomList] = useState(false);
  const [UomList, setUomList] = useState([]);
  const [filteredUomList, setFilteredUomList] = useState([]);
  const [selectedUom, setSelectedUom] = useState('');
  const [selectedUomId, setSelectedUomId] = useState(0);

  const [showSlotList, setShowSlotList] = useState(false);
  const [SlotList, setSlotList] = useState([]);
  const [filteredSlotList, setFilteredSlotList] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(0);


  const [showScalesList, setShowScalesList] = useState(false);
  const [scalesList, setScalesList] = useState([]);
  const [filteredScalesList, setFilteredScalesList] = useState([]);
  const [selectedScale, setSelectedScale] = useState('');
  const [selectedScaleId, setSelectedScaleId] = useState(0);

  const [categoryModal, setcategoryModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);
  const [typesModal, setTypesModal] = useState(false);
  const [seasonGroupsModal, setSeasonGroupsModal] = useState(false);
  const [UomModal, setUomModal] = useState(false);
  const [SlotModal, setSlotModal] = useState(false);
  const [scalesModal, setScalesModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [allSizesInScales, setAllSizesInScales] = useState([]);

  const [nextButton, setNextButton] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState([]);

  const [styleId, setStyleId] = useState(0);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const [styleName, setStyleName] = useState('');
  const [styleDesc, setStyleDesc] = useState('');
  const [dealerPrice, setDealerPrice] = useState(null);
  const [retailerPrice, setRetailerPrice] = useState(null);
  const [corRate, setCorRate] = useState(null);
  const [mrp, setMrp] = useState(null);
  const [fixedDiscount, setfixedDiscount] = useState(0);
  const [colorCode, setColorCode] = useState('');

  // const [styleQuantity, setStyleQuantity]=useState('');
  const [fabricQuanlity, setFabricQuanlity]=useState('');
  const [showFabricQuality, setShowFabricQuality]=useState(false)
  const [availableQuantity, setAvailableQuantity]=useState('');
  const [quantityLimit, setQuantityLimit]=useState('');


  const [styleNum, setStyleNum] = useState(0);

  const [gsm, setGsm] = useState('');
  const [hsn, setHsn] = useState('');

  const [gst, setGst] = useState('');

  // const [clousures, setClousures]=useState('');
  // const [peak, setPeak]=useState('');
  // const [logo, setlogo]=useState('');
  // const [decoration, setDecoration]=useState('');
  // const [trims, setTrims]=useState('');

  const [customerLevelPrice, setCustomerLevelPrice] = useState(0);
  const [showCustomerLevelPrice, setShowCustomerLevelPrice] = useState(false);

  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showScaleTable, setShowScaleTable] = useState(false);

  const [mCategoryName, setmCategoryName] = useState('');
  const [mCategoryDesc, setmCategoryDesc] = useState('');

  const [mColorName, setmColorName] = useState('');
  const [mColorDesc, setmColorDesc] = useState('');
  const [mColorCode, setmColorCode] = useState('');

  const [mTypeName, setmTypeName] = useState('');
  const [mTypeDesc, setmTypeDesc] = useState('');

  const [mSeasonGroupName, setmSeasonGroupName] = useState('');
  const [mSeasonGroupDesc, setmSeasonGroupDesc] = useState('');

  const [mUomName, setmUomName] = useState('');
  const [mUomDesc, setUomDesc] = useState('');

  const [mSlotName, setmSlotName] = useState('');
  const [mSlotAmoutLess, setSlotAmoutLess] = useState('');
  const [mSlotAmoutGrater, setSlotAmoutGrater] = useState('');
  const [mSlotPercentageLess, setSlotPercentageLess] = useState('');
  const [mSlotPercentageGrater, setSlotPercentageGrater] = useState('');

  const [mSize, setmSize] = useState('');
  const [mSizeDesc, setmSizeDesc] = useState('');
  // const [colorsArray, setColorsArray] = useState([]);

  const [editColor, setEditColor] = useState(true);
  const [editSeasonGroup, setEditSeasonGroup] = useState(true);
  const [editLocation, setEditLocation] = useState(true);
  const [editUom, setEditUom] = useState(true);
  const [editScale, setEditScale] = useState(true);
  const [editStyleName, seteditStyleName] = useState(true);
  const [editAvailQty, seteditAvailQty] = useState(true);
  const [editShortcutKey, setEditShortcutKey] = useState(true);
  const [editProcessWF, seteditProcessWF] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('Active'); // Default is 'Active'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(0);
  
  const statusOptions = [
    { label: 'Active', value: 0 },
    { label: 'Inactive', value: 1 },
  ];

  // assetsMap.js

  const industryIcons = {
  "apparels.png": require("../../../assets/apparels.png"),
  "home-textiles.png": require("../../../assets/home-textiles.png"),
  "shoes.png": require("../../../assets/shoes.png"),
  "bags.png": require("../../../assets/bags.png"),
  "jewellery.png": require("../../../assets/jewellery.png"),
  "machine&tools.png": require("../../../assets/machine&tools.png"),
  "default.png": require("../../../assets/default.png"),
};

const fabricQualityIndustryIcons= [
  "apparels.png", "home-textiles.png" ,"shoes.png","bags.png"
]


  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleSelectStatus = (status) => {
    // Update selectedStatus with the label and selectedStatusId with the value
    setSelectedStatus(status.label); 
    setSelectedStatusId(status.value); 
    setShowStatusDropdown(false);
};



  useEffect(() => {
    getCategoriesList();
    getCustomerLevelList();
    getcolorsList();
    getTypesList();
    getSeasonalGroups();
    getProcessWorkFlow();
    getLocations();
    getUom();
    getGstSlot();
    getAllSizesInScale();
    getAllKapture(1);
    getAllKapture(2);
    getAllKapture(3);
    getAllKapture(4);
    getAllKapture(5);
    getAllIndustryTypes()
  }, [companyId]);

  const handleCopy = () => {
    const selectedColorNames = colorList
      .filter(color => selectedColorIds.includes(color.colorId))
      .map(item => item.colorName);  // Extracting the color names
  
    const copiedDetails = {
      selectedCategory,
      selectedCustomerLevel,
      styleName,
      styleDesc,
      retailerPrice,
      corRate,
      mrp,
      gsm,
      hsn,
      gst,
      dealerPrice,
      fixedDiscount,
      customerLevelPrice,
      selectedCategoryId,
      selectedCustomerLevelId,
      colorCode,
      selectedColor,
      selectedColorId,
      selectedColorIds,
      selectedTypeId,
      selectedType,
      selectedProcessWorkflowId,
      selectedProcessWorkflow,
      selectedLocationId,
      selectedLocation,
      selectedUomId,
      selectedUom,
      selectedSlot,
      selectedSlotId,
      selectedScaleId,
      showScaleTable,
      selectedScale,
      selectedSizes,
      imageUrls,
      styleId,
      styleNum,
      selectedClosureId,
      selectedClosure,
      selectedPeakId,
      selectedPeak,
      selectedLogoId,
      selectedLogo,
      selectedTrimsId,
      selectedTrims,
      selectedDecorationId,
      selectedDecoration,
      selectedStatusId,
      selectedStatus,
      selectedColorNames: selectedColorNames,  // Passing color names here
      selectedSeasonGroup,
      selectedSeasonGroupId,
      
    };
  
    console.log('Copied Details newdetail screen:', copiedDetails);
  
    // Navigate to CopyProduct screen with the copied details
    navigation.navigate('CopyProduct', { copiedDetails });
  };
  
  useEffect(() => {
  if (!hasSizes) {
    const newRow = [{
      sizeId: null,
      sizeDesc: '',
      dealerPrice: 0,
      retailerPrice: 0,
      mrp: 0,
      corRate: 0,
      availQty: Number(availableQuantity) || 0,
      quantityLimit: Number(quantityLimit) || 0,
    }];
    setSelectedSizes(newRow);
  }
}, [availableQuantity, quantityLimit, hasSizes]);

  
  
  useEffect(() => {
    if (route.params && route?.params?.Style) {
      const styleDetails = route?.params?.Style;

      console.log('Style Details ==> ', styleDetails);

      if (styleDetails?.priceList) {
        setPriceListData(styleDetails.priceList);
      }

      if (styleDetails.categoryId) {
        setSelectedCategoryId(styleDetails?.categoryId);
      }
      if (styleDetails?.styleName) {
        setStyleName(styleDetails?.styleName);
        seteditStyleName(false);
        setEditShortcutKey(false);
      }
      if (styleDetails?.styleDesc) {
        setStyleDesc(styleDetails?.styleDesc);
      }
      if (styleDetails?.retailerPrice) {
        setRetailerPrice(styleDetails?.retailerPrice);
      }
      if (styleDetails?.corRate) {
        setCorRate(styleDetails?.corRate);
      }
      if (styleDetails?.mrp) {
        setMrp(styleDetails?.mrp);
      }
      if (styleDetails?.price) {
        setDealerPrice(styleDetails?.price);
      }
      if (styleDetails?.fixDisc) {
        setfixedDiscount(styleDetails?.fixDisc);
      }

      if (styleDetails?.customerLevel) {
        setSelectedCustomerLevelId(Number(styleDetails?.customerLevel));
      }

      if (styleDetails?.colorId) {
        setSelectedColorIds([styleDetails?.colorId]);
        setEditColor(false);
      }

      if (styleDetails?.customerLevelPrice) {
        setCustomerLevelPrice(styleDetails?.customerLevelPrice);
        setShowCustomerLevelPrice(true);
      }

      if (styleDetails?.c_hsn) {
        setHsn(styleDetails?.c_hsn);
      }

      if (styleDetails?.gst) {
        setGst(styleDetails?.gst.toString());
        console.log('styleDetails.gst==========>', styleDetails.gst);
      }

      if (styleDetails?.gsm) {
        setGsm(styleDetails?.gsm);
      }
      if (styleDetails?.sizeGroupId) {
        setSelectedSeasonGroupId(styleDetails?.sizeGroupId);
        setEditSeasonGroup(false);
      }
      if (styleDetails?.typeId) {
        setSelectedTypeId(styleDetails?.typeId);
      }
      if (styleDetails?.processId) {
        // console.log("SEtted PWF ID ===> ")
        setSelectedProcessWorkflowId(styleDetails?.processId);
        seteditProcessWF(false);
      }
      if (styleDetails?.locationId) {
        setSelectedLocationId(styleDetails?.locationId);
        setEditLocation(false);
      }
      if (styleDetails?.uomId) {
        setSelectedUomId(styleDetails?.uomId);
      }
      if (styleDetails?.gstSlotId) {
        setSelectedSlotId(styleDetails?.gstSlotId);
      }
      if (styleDetails?.scaleId) {
        setSelectedScaleId(styleDetails?.scaleId);
        setEditScale(false);
      }

      if (styleDetails?.sizeList) {
        setShowScaleTable(true);
        // setSelectedSizes(styleDetails?.sizeList);
        handleEditSizeList(styleDetails?.sizeList);
        seteditAvailQty(false);
      }
      if (styleDetails?.imageUrls) {
        setImageUrls(styleDetails.imageUrls);
      }
      if (styleDetails?.styleId) {
        setStyleId(styleDetails.styleId);
      }
      if (styleDetails?.styleNum) {
        setStyleNum(styleDetails?.styleNum);
      }
      if (styleDetails?.closureId) {
        setSelectedClosureId(styleDetails?.closureId);
      }
      if (styleDetails?.peakId) {
        setSelectedPeakId(styleDetails?.peakId);
      }
      if (styleDetails?.logoId) {
        setSelectedLogoId(styleDetails?.logoId);
      }
      if (styleDetails?.trimId) {
        setSelectedTrimsId(styleDetails?.trimId);
      }
      if (styleDetails?.decId) {
        setSelectedDecorationId(styleDetails?.decId);
      }
      if (styleDetails?.statusId) {
        setSelectedStatusId(styleDetails?.statusId);
        console.log("check====>>>>>",styleDetails?.statusId ,statusOptions[styleDetails?.statusId],typeof styleDetails?.statusId)
        setSelectedStatus(statusOptions[styleDetails?.statusId].label); 
      }
      
    }
  }, []);

  // useEffect(() => {
  //   if (selectedCategory.length > 0 && styleName.length > 0 && styleDesc.length > 0 && dealerPrice > 0 && selectedCustomerLevel?.length > 0 && selectedColorIds.length > 0 && selectedType.length > 0 && selectedSeasonGroup.length > 0 && (cedge_flag === 0 || selectedProcessWorkflow.length > 0) && selectedLocation.length > 0 && selectedScale.length > 0) {
  //     setNextButton(true);
  //   }
  // }, [selectedCategoryId, styleName, styleDesc, dealerPrice, selectedCustomerLevelId, selectedColorIds, selectedTypeId, selectedSeasonGroupId, selectedProcessWorkflowId, selectedLocationId, selectedScaleId])

  useEffect(() => {
    console.log(
      selectedCategoryId,
      styleName?.length,
      styleDesc?.length,
      dealerPrice,
      selectedColorIds?.length,
      selectedTypeId,
      selectedColorId,
      // selectedSeasonGroupId,
      // selectedSeasonGroup,
      selectedProcessWorkflowId,
      selectedLocationId,
      // selectedScaleId,
    );
    // if (selectedCategory.length > 0 && styleName.length > 0 && styleDesc.length > 0 && dealerPrice > 0 && selectedCustomerLevel?.length > 0 && selectedColorIds.length > 0 && selectedType.length > 0 && selectedSeasonGroup.length > 0 && (cedge_flag === 0 || selectedProcessWorkflow.length > 0) && selectedLocation.length > 0 && selectedScale.length > 0) {
    if (
      selectedCategoryId &&
      styleName.length > 0 &&
      styleDesc.length > 0 &&
      dealerPrice > 0 &&
      selectedColorIds.length > 0 &&
      selectedTypeId &&
      // selectedSeasonGroupId &&
      // (cedge_flag === 0 || selectedProcessWorkflowId) &&
      selectedLocationId &&
      selectedSizes.length > 0
      // selectedScaleId
    ) {
      setNextButton(true);
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

  useEffect(() => {
    if (selectedClosureId && closureData.length > 0) {
      const found = closureData?.filter(
        item => item.m_id === selectedClosureId,
      );
      if (found) {
        setSelectedClosure(found[0]?.m_name);
      }
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

  useEffect(() => {
    if (selectedCategoryId && categoryList.length > 0) {
      const found = categoryList?.filter(
        item => item.categoryId === selectedCategoryId,
      );
      if (found) {
        setSelectedCategory(found[0]?.category);
      }
    }
  }, [selectedCategoryId, categoryList]);

  useEffect(() => {
    if (selectedCustomerLevelId >= 0 && customerLevelList.length > 0) {
      const found = customerLevelList?.filter(
        item => item.id === selectedCustomerLevelId,
      );
      if (found) {
        setSelectedCustomerLevel(found[0]?.customerLevelType);
      }
    }
  }, [selectedCustomerLevelId, customerLevelList]);

 
// useEffect(() => {
//   // Update color code when new color is added to selectedColorIds
//   if (selectedColorIds && selectedColorIds.length > 0) {
//     const lastSelectedColorId = selectedColorIds[selectedColorIds.length - 1];
//     const found = colorList.find(item => item.colorId === lastSelectedColorId);

//     if (found) {
//       setColorCode(found.colorCode); // Update color code based on last selected color
//     }
//   } else {
//     setColorCode(''); // Reset when no color is selected
//   }
// }, [selectedColorIds, colorList]); // Dependencies: selectedColorIds and colorList
  
useEffect(() => {
  // Update color codes when selectedColorIds changes
  if (selectedColorIds && selectedColorIds.length > 0) {
    const selectedCodes = selectedColorIds
      .map(id => {
        const found = colorList.find(item => item.colorId === id);
        return found ? found.colorCode : null; // Return color code if found
      })
      .filter(Boolean); // Remove null values

    setColorCode(selectedCodes.join(', ')); // Join all selected color codes
  } else {
    setColorCode(''); // Reset when no color is selected
  }
}, [selectedColorIds, colorList]);

  // useEffect(() => {
  //   if (selectedColorId && colorList.length > 0) {
  //     const found = colorList?.filter((item) => item.colorId === selectedColorId);
  //     if (found) {
  //       setSelectedColor(found[0]?.colorName)
  //     }
  //   }

  // }, [selectedColorIds, colorList])

  // useEffect(() => {
  //   if (selectedSeasonGroupId && seasonGroupsList.length > 0) {
  //     const found = seasonGroupsList?.filter(
  //       item => item.sizeGroupId === selectedSeasonGroupId,
  //     );
  //     if (found) {
  //       setSelectedSeasonGroup(found[0]?.sizeGroup);
  //     }
  //     getScales();
  //   }
  // }, [selectedSeasonGroupId, seasonGroupsList]);

  useEffect(() => {
    if (selectedTypeId && typesList.length > 0) {
      const found = typesList?.filter(item => item.typeId === selectedTypeId);
      if (found) {
        setSelectedType(found[0]?.typeName);
      }
    }
  }, [selectedTypeId, typesList]);

 

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
    if (selectedUomId && UomList.length > 0) {
      const found = UomList?.filter(
        item => item.uomId === selectedUomId,
      );
      if (found) {
        setSelectedUom(found[0]?.uomName);
      }
    }
  }, [selectedUomId, UomList]);

  useEffect(() => {
    if (selectedSlotId && SlotList.length > 0) {
      const found = SlotList?.filter(
        item => item.id === selectedSlotId,
      );
      if (found) {
        setSelectedSlot(found[0]?.slotName);
      }
    }
  }, [selectedSlotId, SlotList]);

  useEffect(() => {
    if (styleDetails?.gstSlotId) {
      setSelectedSlotId(styleDetails.gstSlotId); 
    } else {
      // User is adding for the first time, so prepopulate setDefault slot
      const defaultSlot = SlotList.find(item => item?.setDefault === 1);
      if (defaultSlot) {
        setIsDefault(true);
        setSelectedSlot(defaultSlot.slotName);
        setSelectedSlotId(defaultSlot.id);
      }
    }
  }, [SlotList]);

  useEffect(() => {
    if (selectedProcessWorkflowId && processWorkflowList.length > 0) {
      const found = processWorkflowList?.filter(
        item => item.id === selectedProcessWorkflowId,
      );

      if (found) {
        setSelectedProcessWorkflow(found[0]?.configName);
      }
    }
  }, [selectedProcessWorkflowId, processWorkflowList]);

  // useEffect(() => {
  //   if (selectedSeasonGroupId) {
  //     getScales();
  //   }
  // }, [selectedSeasonGroup])

  useEffect(() => {
    if (processWorkflowList?.length > 0) {
      if (!editProcessWF) return;
      const foundItem = processWorkflowList?.filter(
        proc => proc.priority === 1,
      );
      setSelectedProcessWorkflow(foundItem[0]?.configName);
      setSelectedProcessWorkflowId(foundItem[0]?.id);
    }
  }, [processWorkflowList]);

  const getCategoriesList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_CATEGORY_LIST}${companyId}`;
    setIsLoading(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCategoryList(response?.data || []);
        setFilteredCategories(response?.data || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
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
  const getAllIndustryTypes = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_INDUSTRYTYPES_LIST}${companyId}/company`;
    setIsLoading(true);
    console.log("API URL industry types==>",apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // console.log("response industry types==>",response.data);
        setIndustryTypesList(response.data || []);

        const industryList = response.data || [];

      // find the item with max categoryMapped value
      const highestCategoryItem = industryList.reduce((maxItem, currentItem) => {
        if (!maxItem || currentItem.categoryMapped > maxItem.categoryMapped) {
          return currentItem;
        }
        return maxItem;
      }, null);

        setSelectedIndustryTypeId(highestCategoryItem?.id || 0);
        setSelectedIndustry(highestCategoryItem);
        setIsLoading(false); 
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false); 
      });
  };
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

          // const filteredLocationList = locationList?.filter(
          //   c => c.customerType === 2 && c.customerId === companyId,
          // );

          setLocationList(locationList);
          setFilteredLocationList(locationList);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setIsLoading(false); // Set loading to false in case of error
        });
    }
  };


  const getUom = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_UOM}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setUomList(response?.data?.response.uomtypeList || []);
        setFilteredUomList(response?.data?.response.uomtypeList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };
  
  const getGstSlot = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_GST_SLOT}/${companyId}`;
    console.log("API URL:", apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setSlotList(response?.data?.response.gstList || []);
        setFilteredSlotList(response?.data?.response.gstList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };
  
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
      corRate: item.corRate,
      mrp: item.mrp,
      j_item_id: item.j_item_id,
      article_no: item.article_no,
    }));

    setSelectedSizes(filteredList);
  };

  // [{"sizeId":157,"gsCode":"8907536011327","availQty":0,"gscodeMapId":2680,"sizeDesc":"SmallJJJ","dealerPrice":383,
  //   "retailerPrice":400,"mrp":500,"j_item_id":"","article_no":""},{"sizeId":158,"gsCode":"8907536011328","availQty":0,
  //     "gscodeMapId":2681,"sizeDesc":"LargeJJJ","dealerPrice":383,"retailerPrice":400,"mrp":500,"j_item_id":"","article_no":""}]

  // Handle DropDowns Onselecting+showing+filtering till 249

  const handleCategoryDropDown = () => {
    setshowCategoryList(!showCategoryList);
  };

  const handleSelectCategory = item => {
    setSelectedCategory(item.category);
    setSelectedCategoryId(item.categoryId);
    console.log('Selected Category ID:===> ', item,item.hasSizes);
    setHasSizes(item.hasSizes);
    setshowCategoryList(false);
  };

  const filtercategories = text => {
    const filtered = categoryList.filter(item =>
      item?.category?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredCategories(filtered);
  };

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

  const handleColorDropDown = () => {
    setShowColorList(!showColorList);
  };

  // const handleSelectColor = (item) => {
  //   setSelectedColor(item.colorName);
  //   setSelectedColorId(item.colorId);
  //   let array = [{
  //     colorId: item.colorId,
  //     colorName: item.colorName,
  //   }]
  //   setColorsArray(array);
  //   setShowColorList(false);
  // }

  useEffect(() => {
    if (selectedColorId && colorList.length > 0) {
      const found = colorList?.find(item => item.colorId === selectedColorId);
  
      if (found) {
        setSelectedColor(found?.colorName); // Update selected color name
        setColorCode(found?.colorCode);    // Update color code
  
        // Add selectedColorId only if it's not already unselected
        setSelectedColorIds(prevSelectedColorIds => {
          return prevSelectedColorIds.includes(selectedColorId)
            ? prevSelectedColorIds // Keep as is if already in the list
            : [...prevSelectedColorIds, selectedColorId]; // Add if not present
        });
      }
    }
  }, [selectedColorId, colorList]); // Track selectedColorId and colorList
  
  const handleSelectColor = item => {
    setSelectedColorIds(prevSelectedColorIds => {
      if (!prevSelectedColorIds.includes(item.colorId)) {
        // Add the color if not already selected
        return [...prevSelectedColorIds, item.colorId];
      } else {
        // Remove the color if already selected
        return prevSelectedColorIds.filter(id => id !== item.colorId);
      }
    });
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

  // const handleSelectallSizesInScales = (item) => {
  //   setSelectedModalSizeInSeasonListIds([...selectedModalSizeInSeasonListIds, item.id])
  // }

  const handleSelectallSizesInScales = item => {

    if (selectedModalSizeInSeasonListIds.includes(item.id)) {
      setSelectedModalSizeInSeasonListIds(
        selectedModalSizeInSeasonListIds.filter(id => id !== item.id),
      );
      setSelectedSizesInModal((prev)=>prev.filter(size => size.id !== item.id)); 
    } else {
      setSelectedModalSizeInSeasonListIds([
        ...selectedModalSizeInSeasonListIds,
        item.id,
      ]);
      setSelectedSizesInModal((prev)=>[...prev, item]);
    }


  };

  const filterColors = text => {
    const filtered = colorList.filter(item =>
      item?.colorName?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredColorList(filtered);
  };

  const handleTypesDropDown = () => {
    setShowTypesList(!showTypesList);
  };

  const handleSelectType = item => {
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


  const handUomDropDown = () => {
    setShowUomList(!showUomList);
  };

  const handleSelectUom = item => {
    setSelectedUom(item.uomName);
    setSelectedUomId(item.uomId);
    setShowUomList(false);
  };

  const filterUom = text => {
    const filtered = UomList.filter(item =>
      item?.uomName?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredUomList(filtered);
  };

  const handSlotDropDown = () => {
    setShowSlotList(!showSlotList);
  };

  const handleSelectSlot = item => {
    setSelectedSlot(item.slotName);
    setSelectedSlotId(item.id);
    setShowSlotList(false);
  };

  
  const filterSlot = text => {
    const filtered = SlotList.filter(item =>
      item?.slotName?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredSlotList(filtered);
  };

  const handleScalesDropDown = () => {
    setShowScalesList(!showScalesList);
  };

//   const handleSelectScale = async (item) => {
//     setSelectedScale(item?.scaleRange);
//     setSelectedScaleId(item?.scaleId);
//     setSelectedSizes([]);
//     console.log('SelectedScaleId=====>',item?.scaleId)
//     console.log('handleChangeScale=====>',item)
//     await handleChangeScale(item);
//  console.log('handleChangeScale=====>',item)

//     setShowScaleTable(true);

//     setShowScalesList(false);
//   };

  const filterScales = text => {
    const filtered = scalesList.filter(item =>
      item?.scale?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredScalesList(filtered);
  };


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

const handleChangeScale1 = async (scaleId, scaleRange) => {
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
          corRate: 0,
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
          intialupdateAllItems(dealerPrice, retailerPrice, mrp,corRate, newSizes);
      }, 50);

      setShowScalesList(false);
  } else {
      console.log("No sizes found for scaleId:", scaleId);
  }
};

const handleChangeScale = async (scaleId, scaleRange) => {
  
  // Fetch sizes from API
  const fetchedSizes = [...selectedSizesInModal]
  console.log("chnage scale Fetch sizes ===> ", fetchedSizes)

  if (fetchedSizes && fetchedSizes.length > 0) {
      const newSizes = fetchedSizes.map(sizeFromApi => ({
          sizeId: sizeFromApi?.id,
          sizeDesc: sizeFromApi?.size,
          dealerPrice: 0,
          retailerPrice: 0,
          corRate: 0,
          mrp: 0,
          availQty: 0,
          gsCode: null,
          gscodeMapId: null,
          j_item_id: null,
          article_no: null,
      }));

      setSelectedSizes(newSizes);

      // Ensure `intialupdateAllItems` is called after state updates
      setTimeout(() => {
          intialupdateAllItems(dealerPrice, retailerPrice, mrp,corRate, newSizes);
      }, 50);
  } else {
      console.log("No sizes found for scaleId:", scaleId);
  }
      setShowScaleTable(true);
      setScalesModal(false)

};



  
  
  
  //  const getScalesBySizeId = async () => {
  //   try {
  //     const apiUrl = `${global?.userData?.productURL}${API.GET_SIZES_BY_SCALE_ID}/${selectedSeasonGroupId}/${selectedScaleId}/getSizesByScaleId`;
  
  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     });
  
  //     if (response?.data?.status?.success) {
  //       return response?.data?.response?.sizesList || [];
  //     } else {
  //       console.error('Failed to fetch sizes');
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error('Error fetching sizes:', error);
  //     return [];
  //   }
  // };
  

  // const handleChangeScale = item => {
  //   const sizes = item?.scaleRange.split(',').map(size => size.trim());

  //   const newSizes = sizes.map((size, index) => ({
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

  const updateAllItems = (field, value) => {
    const updatedSizes = selectedSizes.map(item => ({
      ...item,
      [field]: Number(value),
    }));
    setSelectedSizes(updatedSizes);
  };

  const intialupdateAllItems = (dealerPrice, retailerPrice, mrp, corRate,sizes) => {
    const updatedSizes = sizes.map(item => ({
      ...item,
      dealerPrice: Number(dealerPrice) ? Number(dealerPrice) : 0,
      retailerPrice: Number(retailerPrice) ? Number(retailerPrice) : 0,
      corRate: Number(corRate) ? Number(corRate) : 0,
      mrp: mrp ? Number(mrp) : 0,
      availQty: 0,
    }));
    setSelectedSizes(updatedSizes);
  };

  // Modal functions
  const toggleCategoryModal = () => {
    setcategoryModal(!categoryModal);
    setmCategoryName('');
    setmCategoryDesc('');
  };

  const handleCloseCategoryModal = () => {
    setcategoryModal(false);
  };

  const handleSaveCategoryModal = () => {
    let dummy = 0;
    let formData = new FormData();

    formData.append('categoryId', dummy.toString());
    formData.append('category', mCategoryName);
    formData.append('categoryDesc', mCategoryDesc);
    formData.append('companyId', companyId);
    formData.append('linkType', 2);
    formData.append('userId', userId);
    formData.append('industryType', selectedIndustry.industry || '');


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
        setSelectedCategoryId(response?.data?.categoryId);
        getCategoriesList();
        setIsLoading(false);
        setshowCategoryList(false);
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

    setcategoryModal(false);
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

  const toggleTypesModal = () => {
    setTypesModal(!typesModal);
  };

  const handleCloseTypesModal = () => {
    setTypesModal(false);
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
        // Alert.alert(`Type Created Successfully : ${response?.data?.response?.typeList[0]?.typeName}`);
        setSelectedTypeId(response?.data?.response?.typeList[0]?.typeId);
        setSelectedType(response?.data?.response?.typeList[0]?.typeName);
        getTypesList();
        setIsLoading(false);
        setShowTypesList(false);
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

  const toggleSeasonUomModal = () => {
    setUomModal(!UomModal);
    setmUomName('');
    setUomDesc('');
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
        setShowUomList(false);
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


  const handleCloseUomModal = () => {
    setUomModal(false);
  };

  const toggleSeasonSlotModal = () => {
    setSlotModal(!SlotModal);
    setmSlotName('');
    setSlotAmoutLess('');
    setSlotAmoutGrater('');
    setSlotPercentageLess('');
    setSlotPercentageGrater('')
    setIsDefault(false);
  };


  const [isDefault, setIsDefault] = useState(false);

  const handleSaveSlotModal = () => {
    setIsLoading(true);
    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_SLOT}`;
    const requestData = {
      id: null,
      slotName: mSlotName,
      // greterAmount: mSlotAmoutGrater,
      // greterPercent:mSlotPercentageGrater,
      // smalestAmount: mSlotAmoutLess,
      // smalestPercent:mSlotPercentageLess,

      greterAmount: mSlotAmoutLess,
      greterPercent:mSlotPercentageLess,
      smalestAmount: mSlotAmoutGrater,
      smalestPercent:mSlotPercentageGrater,
      
      companyId: companyId,
      setDefault: isDefault ? 1 : 0,
      isDeleted:0,
      userId: userId,
    };

    console.log('requestData========>',requestData)
    axios
      .post(apiUrl0, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // Alert.alert(`Type Created Successfully : ${response?.data?.response?.sizeGroupList[0]?.sizeGroup}`);
        setSelectedSlot(
          response?.data?.response?.gstList[0]?.slotName,
        );
        setSelectedSlotId(
          response?.data?.response?.gstList[0]?.id,
        );
        getGstSlot();
        setIsLoading(false);
        setShowSlotList(false);
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

    setSlotModal(false);
  };

  const handleCloseSlotModal = () => {
    setSlotModal(false);
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
        setShowSeasonGroupsList(false);
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

  const ValidateSlot = async () => {
    if (processing) return;
    setProcessing(true);

    if (mSlotName.length === 0 || mSlotAmoutGrater.length === 0 || mSlotAmoutLess.length === 0 || mSlotPercentageGrater.length === 0 || mSlotPercentageLess.length === 0) {
      Alert.alert(' Please fill all mandatory fields');
      setProcessing(false);
      return;
    }
    const slash = '/';
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATE_SLOT}${mSlotName}${slash}${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data === true) {
        handleSaveSlotModal();
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
  const ValidateStyleName = async (type) => {
    if (processing) return;
    setProcessing(true);
  
    if (styleId) {
      console.log('Skipping validation because styleId is already provided.');
      handleNextPage(type); // Proceed with the next steps if styleId exists
      setProcessing(false);
      return;
    }
  
    const colorsArray = colorList
      .filter(color => selectedColorIds.includes(color.colorId))
      .map(item => ({
        colorId: item.colorId,
        colorName: item.colorName,
      }));
  
    // Create a new FormData instance
    const formData = new FormData();
    formData.append('styleName', styleName);
    formData.append('companyId', companyId); // Ensure this is the correct type (string or number)
    formData.append('myItems', JSON.stringify(colorsArray)); // Append the colors array as a JSON string
  
    console.log('Request Body:', formData); // FormData cannot be stringified directly
    console.log('Request Headers:', {
      Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      // No need to set Content-Type; Axios will set it automatically for FormData
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
        handleNextPage(type);
      } else {
        Alert.alert(
          'crm.codeverse.co.says',
          'A style with this Product name and color name combination already exists. Please check.'
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
        Alert.alert('Error', 'There was a problem validating the Product. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };
  
  
  
  // const handlepricelist = () => {
  
  //   navigation.navigate('PriceList', { 
  //     selectedScale: selectedScale,
  //     priceData: selectedSizes.map(size => ({
  //       size: size.sizeDesc,
  //       dealerPrice: size.dealerPrice || '',
  //       retailerPrice: size.retailerPrice || '',
  //       mrp: size.mrp || '',
  //       corRate: size.dealerPrice || '' // default
  //     })),
  //   });
  // };
  
  const [priceListData, setPriceListData] = useState([]);

  const handleNextPage = (type) => {
    const colorsArray = colorList
      .filter(color => selectedColorIds.includes(color.colorId))
      .map(item => ({
        colorId: item.colorId,
        colorName: item.colorName,
      }));

    
    const styleDetails = {
      styleId: styleId,
      styleNum: styleNum,
      styleName: styleName,
      styleDesc: styleDesc,
      colorId: selectedColorIds[selectedColorIds.length - 1],
      colorCode: colorCode,
      price: Number(dealerPrice),
      typeId: selectedTypeId,
      retailerPrice: Number(retailerPrice),
      corRate: Number(corRate),
      mrp: Number(mrp),
      // files: (productStyle.files as any[]).map(file => file.file),  // Convert file list to array of file objects
      scaleId: selectedScaleId,
      gsm: gsm,
      customerLevel: Number(selectedCustomerLevelId),
      hsn: hsn,
      gst: gst,
      discount: 0,
      categoryId: selectedCategoryId,
      locationId: selectedLocationId,
      uomId:selectedUomId,
      fixDisc: fixedDiscount,
      companyId: companyId,
      processId: selectedProcessWorkflowId,
      cedgeStyle: cedge_flag,
      compFlag: comp_flag,
      sizeGroupId: selectedSeasonGroupId,
      customerLevelPrice: customerLevelPrice ? Number(customerLevelPrice) : 0,
      companyName: companyName,
      sizesListReq: JSON.stringify(selectedSizes),
      myItems: colorsArray,
      myItemsStringify: JSON.stringify(colorsArray),
      imageUrls: imageUrls,
      closure: selectedClosureId,
      peak: selectedPeakId,
      logo: selectedLogoId,
      decoration: selectedDecorationId,
      trims: selectedTrimsId,
      statusId:selectedStatusId,
      gstSlotId:selectedSlotId,
      priceList: priceListData 
    };
    console.log("selectedStatus===>",selectedStatusId)
    console.log("priceListData===>",priceListData)
    if (type === 'productImages') {
      navigation.navigate('UploadProductImage', { productStyle: styleDetails, selectedScale: selectedScale });
      priceData: selectedSizes.map(size => ({
        size: size.sizeDesc,
        sizeId: size.sizeId,
        dealerPrice: size.dealerPrice || '',
        retailerPrice: size.retailerPrice || '',
        corRate: size.corRate || '',
        mrp: size.mrp || '',
        priceList: priceListData 
      }))
      
    } else {
    navigation.navigate('PriceList', {productStyle: styleDetails, selectedScale: selectedScale,
      priceData: selectedSizes.map(size => ({
        size: size.sizeDesc,
        sizeId: size.sizeId,
        dealerPrice: size.dealerPrice || '',
        retailerPrice: size.retailerPrice || '',
        corRate: size.corRate || '',
        mrp: size.mrp || '',
        priceList: priceListData 
      }))
      ,});
  };
}
  

  const handleInputChange = (index, field, value) => {
    const updatedSizes = [...selectedSizes];
    updatedSizes[index][field] = Number(value);
    setSelectedSizes(updatedSizes);
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

  return (
        <SafeAreaView style={{flex: 1}}>

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
                  style={style.menuimg}
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
                    marginRight:60
                  }}>
                   {styleName ? styleName : 'New Product'}
                </Text>
              </View>
            </View>
           
           
            <View style={{flexDirection: 'row', alignSelf: 'center', marginBottom:20}}>
  <TouchableOpacity style={style.headbasicinfo}>
    <Text style={{color:'#fff', fontWeight: 'bold'}}>Basic Info</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={()=>ValidateStyleName  ('priceList')}
    style={style.headpricelist}>
    <Text style={{color:'#000', fontWeight: 'bold'}}>Price List</Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={()=>ValidateStyleName ('productImages')}
    disabled={!nextButton}
    style={[
      style.headprductimage,
      { backgroundColor: nextButton ? '#' : 'lightgray' },
    ]}>
    <Text style={{color:'#000', fontWeight: 'bold'}}>Product Images</Text>
  </TouchableOpacity>


</View>
          <ScrollView>
    

            <View>
            {styleId !== 0 && (
              <TouchableOpacity   onPress={handleCopy} style={{flexDirection:"row",alignItems:"center",alignItems:"flex-end",alignSelf:"flex-end"}}>
<Text style={{color:'#000',fontWeight:"bold"}}>
  Copy
</Text>
  < View
    style={{
      justifyContent: "flex-end",
      alignSelf: 'flex-end',
      marginHorizontal: 10,
      marginTop:10
    }}
  
  >
    <Image
      style={{ height: 30, width: 30, marginRight: 8 }}
      source={require('../../../assets/copy.png')}
    />
  </View>
  </TouchableOpacity>
)}

            </View>


            {/* <View style={{}} />
            <Text style={style.headerTxt}>{'Category *'}</Text>
            <View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={style.container3}
                  onPress={handleCategoryDropDown}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedCategory?.length > 0 ? selectedCategory : 'Select'}
                  </Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleCategoryModal}
                  style={style.plusButton}>
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      // tintColor:'#1F74BA',
                    }}
                    source={require('../../../assets/plus.png')}
                    // source={require('../../../assets/plus11.png')}
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
                  onChangeText={filtercategories}
                />

                {filteredCategories.length === 0 && !isLoading ? (
                  <Text style={style.noCategoriesText}>
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
                          //  justifyContent: 'fle',
                          borderBottomWidth: 0.5,
                          borderColor: '#8e8e8e',
                          ...(Platform.OS === 'ios' && {
                            paddingTop: 8,
                            marginLeft: 8,
                          }),
                        }}
                        onPress={() => handleSelectCategory(item)}>
                        <Text style={style.itemcattxt}>{item?.category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )} */}

            <View  style={{marginTop:10}}/>

            <View style={style.fieldContainer}>
  <View style={style.fieldRow}>
    {/* Dropdown TextInput */}
    <View style={{flex: 1}}>
      <TextInput
        label="Category *"
        mode="outlined"
        value={selectedCategory}
        placeholder="Select"
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handleCategoryDropDown}
            forceTextInputFocus={false}
            style={{width: 18, height: 18, tintColor: '#1F74BA'}}
          />
        }
      />
    </View>

    {/* "+" Button */}
    <TouchableOpacity onPress={toggleCategoryModal} style={style.addButton}>
      <Text style={style.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>

  {/* Dropdown List */}
  {showCategoryList && (
    <View style={style.dropdownList}>
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filtercategories}
      />

      {filteredCategories.length === 0 && !isLoading ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredCategories?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectCategory(item)}>
              <Text style={style.dropdownItemText}>{item?.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>


<View style={style.fieldContainer}>
  <View style={style.fieldRow}>
    {/* Dropdown TextInput */}
    <View style={{flex: 1}}>
      <TextInput
        label="Types *"
        mode="outlined"
        value={selectedType ? selectedType : ''}
        placeholder="Select"
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handleTypesDropDown}
            forceTextInputFocus={false}
            style={{width: 18, height: 18, tintColor: '#1F74BA'}}
          />
        }
      />
    </View>

    {/* "+" Button */}
    <TouchableOpacity onPress={toggleTypesModal} style={style.addButton}>
      <Text style={style.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>

  {/* Dropdown List */}
  {showTypesList && (
    <View style={style.dropdownList}>
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filterTypes}
      />

      {filteredTypesList.length === 0 ||
      (filteredTypesList?.length === 1 && !filteredTypesList[0] && !isLoading) ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredTypesList?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectType(item)}>
              <Text style={style.dropdownItemText}>{item?.typeName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>

<TextInput
  label="Product Name *"
  mode="outlined"
  value={styleName}
  onChangeText={text => setStyleName(text)}
  placeholder="Enter product name"
  placeholderTextColor="#6B7280"
  editable={editStyleName}
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={[
    style.input,
    {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
  ]}
/>


<TextInput
  label="Product Description *"
  mode="outlined"
  value={styleDesc}
  onChangeText={text => setStyleDesc(text)}
  placeholder="Enter product description"
  placeholderTextColor="#6B7280"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>

<View style={style.fieldContainer}>
  <View style={style.fieldRow}>
    {/* Dropdown TextInput */}
    <View style={{flex: 1}}>
      <TextInput
        label="Color *"
        mode="outlined"
        value={
          selectedColorIds.length > 0
            ? filteredColorList
                .filter(color => selectedColorIds.includes(color.colorId))
                .map(color => color.colorName)
                .join(', ')
            : ''
        }
        placeholder="Select"
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={[
          style.dropdownInput,
          {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
        ]}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handleColorDropDown}
            forceTextInputFocus={false}
            style={{width: 18, height: 18, tintColor: '#1F74BA'}}
          />
        }
      />
    </View>

    {/* "+" Button */}
    <TouchableOpacity onPress={toggleColorModal} style={style.addButton}>
      <Text style={style.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>

  {/* Dropdown List */}
  {showColorList && editColor && (
    <View style={style.dropdownList}>
      {/* Select All */}
      <TouchableOpacity
        onPress={handleSelectAll}
        style={{flexDirection: 'row', alignItems: 'center', margin: 10}}>
        <CustomCheckBox isChecked={isSelectAll} onToggle={handleSelectAll} />
        <Text style={{color: '#000', marginLeft: 10}}>Select All</Text>
      </TouchableOpacity>

      {/* Search Input */}
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filterColors}
      />

      {/* No results */}
      {filteredColorList?.length === 0 ||
      (filteredColorList?.length === 1 && !filteredColorList[0] && !isLoading) ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredColorList?.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectColor(item)}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CustomCheckBox
                  isChecked={selectedColorIds.includes(item.colorId)}
                  onToggle={() => handleSelectColor(item)}
                />
                <Text style={[style.dropdownItemText, {marginLeft: 10}]}>
                  {item.colorName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>


<TextInput
  label="Color Code"
  mode="outlined"
  value={colorCode}
  onChangeText={text => setColorCode(text)}
  placeholder="Enter color code"
  placeholderTextColor="#6B7280"
  editable={false}
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>


            {/* {dealerPriceField.isVisible && (<>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {dealerPriceField?.label || "Dealer Price *"}
            </Text>
            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder={dealerPriceField?.label || "Dealer Price"}
                placeholderTextColor="#000"
                value={dealerPrice > 0 ? dealerPrice.toString() : ''}
                onChangeText={text => {
                  setDealerPrice(text);
                  updateAllItems('dealerPrice', text);
                }}
              />
            </View>

            </>)}
            
            
            {retailerPriceField.isVisible && (<>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {retailerPriceField?.label || 'Retailer Price '}
            </Text>

            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder={retailerPriceField?.label || "Retailer Price "}
                placeholderTextColor="#000"
                value={retailerPrice > 0 ? retailerPrice.toString() : ''}
                onChangeText={text => {
                  setRetailerPrice(text);
                  updateAllItems('retailerPrice', text);
                }}
              />
            </View>
            </>)}
 
 
            {mrpField.isVisible && (<>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {mrpField?.label || 'MRP '}
            </Text>

            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder={mrpField?.label || "MRP"}
                placeholderTextColor="#000"
                value={mrp > 0 ? mrp.toString() : ''}
                onChangeText={text => {
                  setMrp(text);
                  updateAllItems('mrp', text);
                }}
              />
            </View>

             </>)}
            
            {corRateField.isVisible && (<>
            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {corRateField?.label}
            </Text>
            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder={corRateField?.label || "corRate "}
                placeholderTextColor="#000"
                value={corRate > 0 ? corRate.toString() : ''}
                onChangeText={text => {
                  setCorRate(text);
                  updateAllItems('corRate', text);
                }}
              />
            </View>
            </>)} */}

            {dealerPriceField.isVisible && (
              <TextInput
                label={dealerPriceField?.label || 'Dealer Price *'}
      mode="outlined"
      value={dealerPrice > 0 ? dealerPrice.toString() : ''}
      onChangeText={text => {
        setDealerPrice(text);
        updateAllItems('dealerPrice', text);
      }}
      placeholder={dealerPriceField?.label || 'Dealer Price *'}
      placeholderTextColor="#6B7280"
      keyboardType="numeric"
      outlineColor="#D1D5DB"
      activeOutlineColor="#1F74BA"
                style={style.input}
              />
            )}

{retailerPriceField.isVisible && (
    <TextInput
      label={retailerPriceField?.label || 'Retailer Price'}
      mode="outlined"
      value={retailerPrice > 0 ? retailerPrice.toString() : ''}
      onChangeText={text => {
        setRetailerPrice(text);
        updateAllItems('retailerPrice', text);
      }}
      placeholder={retailerPriceField?.label || 'Retailer Price'}
      placeholderTextColor="#6B7280"
      keyboardType="numeric"
      outlineColor="#D1D5DB"
      activeOutlineColor="#1F74BA"
      style={style.input}
    />
)}

{mrpField.isVisible && (
  <>
    <TextInput
      label={mrpField?.label || 'MRP'}
      mode="outlined"
      value={mrp > 0 ? mrp.toString() : ''}
      onChangeText={text => {
        setMrp(text);
        updateAllItems('mrp', text);
      }}
      placeholder={mrpField?.label || 'MRP'}
      placeholderTextColor="#6B7280"
      keyboardType="numeric"
      outlineColor="#D1D5DB"
      activeOutlineColor="#1F74BA"
      style={style.input}
    />
  </>
)}

{corRateField.isVisible && (
  <>
    {/* <Text style={style.headerTxt}>{corRateField?.label || 'COR Rate'}</Text> */}

    <TextInput
      label={corRateField?.label || 'COR Rate'}
      mode="outlined"
      value={corRate > 0 ? corRate.toString() : ''}
      onChangeText={text => {
        setCorRate(text);
        updateAllItems('corRate', text);
      }}
      placeholder={corRateField?.label || 'COR Rate'}
      placeholderTextColor="#6B7280"
      keyboardType="numeric"
      outlineColor="#D1D5DB"
      activeOutlineColor="#1F74BA"
      style={style.input}
    />
  </>
)}


    <TextInput
  label="Fixed Discount"
  mode="outlined"
  value={fixedDiscount > 0 ? fixedDiscount.toString() : ''}
  onChangeText={text => setfixedDiscount(text)}
  placeholder="Enter fixed discount"
  placeholderTextColor="#6B7280"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>

{/* Gst Slot Dropdown */}
<View style={style.fieldContainer}>
  {/* <Text style={style.headerTxt}>{'Gst Slot'}</Text> */}
  <View style={style.fieldRow}>
    <View style={{ flex: 1 }}>
      <TextInput
        label="GST"
        mode="outlined"
        value={selectedSlot || ''}
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handSlotDropDown}
            forceTextInputFocus={false}
            style={{ width: 18, height: 18, tintColor: '#1F74BA' }}
          />
        }
      />
    </View>
    <TouchableOpacity onPress={toggleSeasonSlotModal} style={style.addButton}>
      <Text style={style.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>

  {showSlotList && (
    <View style={style.dropdownList}>
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filterSlot}
      />
      {filteredSlotList.length === 0 && !isLoading ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredSlotList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectSlot(item)}
            >
              <Text style={style.dropdownItemText}>{item?.slotName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>

            {/* <View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={[
                    style.container3,
                    {backgroundColor: editColor ? '#fff' : '#f1e8e6'},
                  ]}
                  onPress={handleColorDropDown}>
             <Text style={{fontWeight: '600', color: '#000'}}>
  {selectedColorIds.length > 0
    ? filteredColorList
        .filter(color => selectedColorIds.includes(color.colorId))
        .map(color => color.colorName)
        .join(', ')
    : 'Select'}
</Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleColorModal}
                  style={style.plusButton}>
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
                <View>
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
                </View>
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
                  <Text style={style.noCategoriesText}>
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
      <CustomCheckBox
        isChecked={selectedColorIds.includes(item.colorId)}  // Automatically check/uncheck based on selection
        onToggle={() => handleSelectColor(item)}
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
            )} */}


            {/* <Text style={style.headerTxt}>{'Types *'}</Text>

            <View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={style.container3}
                  onPress={handleTypesDropDown}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedType ? selectedType : 'Select'}
                  </Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleTypesModal}
                  style={style.plusButton}>
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
                  <Text style={style.noCategoriesText}>
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
            )} */}




            {/* <Text style={style.headerTxt}>{'Season Groups *'}</Text>

            <View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={[
                    style.container3,
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
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleSeasonGroupsModal}
                  style={style.plusButton}>
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
            </View> */}
            {/* {showSeasonGroupsList && editSeasonGroup && (
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
                  <Text style={style.noCategoriesText}>
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
            )} */}


            {/* <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'Weight/GSM  '}
            </Text>

            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder="Weight/GSM"
                placeholderTextColor="#000"
                value={gsm}
                keyboardType="numeric"
                onChangeText={text => setGsm(text)}
              />
            </View>

            <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'HSN'}
            </Text>

            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder="HSN  "
                placeholderTextColor="#000"
                value={hsn}
                keyboardType="numeric"
                onChangeText={text => setHsn(text)}
              />
            </View> */}
            {/* <Text
              style={{marginHorizontal: 20, marginVertical: 3, color: '#000'}}>
              {'GST'}
            </Text>


            <View style={style.inputContainer}>
              <TextInput
                style={style.txtinput}
                placeholder="GST "
                placeholderTextColor="#000"
                value={gst}
                keyboardType="numeric"
                onChangeText={text => setGst(text)}
              />
            </View> */}

            <TextInput
  label="HSN"
  mode="outlined"
  value={hsn}
  onChangeText={text => setHsn(text)}
  placeholder="Enter HSN"
  placeholderTextColor="#6B7280"
  keyboardType="numeric"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>

     {/* UOM Dropdown */}
<View style={style.fieldContainer}>
  {/* <Text style={style.headerTxt}>{'UOM (Unit of Measure)'}</Text> */}
  <View style={style.fieldRow}>
    <View style={{ flex: 1 }}>
      <TextInput
        label="UOM (Unit of Measure)"
        mode="outlined"
        value={selectedUom || ''}
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handUomDropDown}
            forceTextInputFocus={false}
            style={{ width: 18, height: 18, tintColor: '#1F74BA' }}
          />
        }
      />
    </View>
    <TouchableOpacity onPress={toggleSeasonUomModal} style={style.addButton}>
      <Text style={style.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>

  {showUomList && (
    <View style={style.dropdownList}>
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filterUom}
      />
      {filteredUomList.length === 0 && !isLoading ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredUomList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectUom(item)}
            >
              <Text style={style.dropdownItemText}>{item?.uomName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>

<TextInput
  label="Weight/GSM"
  mode="outlined"
  value={gsm}
  onChangeText={text => setGsm(text)}
  placeholder="Enter Weight/GSM"
  placeholderTextColor="#6B7280"
  keyboardType="numeric"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>
{showFabricQuality &&  <TextInput
  label="Fabric Quality"
  mode="outlined"
  value={fabricQuanlity}
  onChangeText={text => setFabricQuanlity(text)}
  placeholder="Enter Fabric Quality"
  placeholderTextColor="#6B7280"
  keyboardType="numeric"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>}





            {/* Closure Dropdown */}

            {/* {prod_additional_field_flag === 1 && (
              <View style={style.dropdownContainer}>
                <Text style={style.headerTxt}>{'Closure'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
                    <TouchableOpacity
                      style={style.dropdownButton}
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
                  <View style={style.container4}>
                    <TouchableOpacity
                      onPress={toggleClosureModal}
                      style={style.plusButton}>
                      <Image
                        style={style.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {showClosure && (
                  <View style={style.dropdownContent}>
                    <TextInput
                      style={style.searchInput}
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
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredClosureData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={style.dropdownItem}
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
            )} */}

            {prod_additional_field_flag === 1 && (
  <View style={style.fieldContainer}>
    {/* <Text style={style.headerTxt}>{'Closure'}</Text> */}

    {/* Dropdown Row */}
    <View style={style.fieldRow}>
      {/* Dropdown Input */}
      <View style={{flex: 1}}>
        <TextInput
          label="Closures"
          mode="outlined"
          value={selectedClosureId ? selectedClosure : ''}
          placeholder="Select"
          editable={false}
          outlineColor="#D1D5DB"
          activeOutlineColor="#1F74BA"
          style={style.dropdownInput}
          right={
            <TextInput.Icon
              icon={require('../../../assets/dropdown.png')}
              onPress={toggleClosure}
              forceTextInputFocus={false}
              style={{width: 18, height: 18, tintColor: '#1F74BA'}}
            />
          }
        />
      </View>

      {/* "+" Button */}
      <TouchableOpacity onPress={toggleClosureModal} style={style.addButton}>
        <Text style={style.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Dropdown List */}
    {showClosure && (
      <View style={style.dropdownList}>
        <TextInput
          style={style.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchClosure}
          onChangeText={setSearchClosure}
        />

        {isKaptureLoading ? (
          <Text style={{color: '#000', textAlign: 'center'}}>Loading...</Text>
        ) : filteredClosureData.length === 0 && !isKaptureLoading ? (
          <Text style={style.noResults}>Sorry, no results found!</Text>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {filteredClosureData.map(item => (
              <TouchableOpacity
                key={item.m_id}
                style={style.dropdownItem}
                onPress={() => {
                  setSelectedClosure(item.m_name);
                  setSelectedClosureId(item.m_id);
                  setShowClosure(false);
                }}>
                <Text style={style.dropdownItemText}>{item.m_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
  </View>
)}


            {/* Peak Dropdown */}

            {/* {prod_additional_field_flag === 1 && (
              <View style={style.dropdownContainer}>
                <Text style={style.headerTxt}>{'Peak'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
                    <TouchableOpacity
                      style={style.dropdownButton}
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
                  <View style={style.container4}>
                    <TouchableOpacity
                      onPress={togglePeakModal}
                      style={style.plusButton}>
                      <Image
                        style={style.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showPeak && (
                  <View style={style.dropdownContent}>
                    <TextInput
                      style={style.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchPeak}
                      onChangeText={setSearchPeak}
                    />
                    <ScrollView nestedScrollEnabled={true}>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredPeakData.length === 0 && !isKaptureLoading ? (
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredPeakData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={style.dropdownItem}
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
            )} */}

            {prod_additional_field_flag === 1 && (
  <View style={style.fieldContainer}>
    {/* <Text style={style.headerTxt}>{'Peak'}</Text> */}

    {/* Dropdown Row */}
    <View style={style.fieldRow}>
      {/* Dropdown Input */}
      <View style={{flex: 1}}>
        <TextInput
          label="Peak"
          mode="outlined"
          value={selectedPeakId ? selectedPeak : ''}
          placeholder="Select"
          editable={false}
          outlineColor="#D1D5DB"
          activeOutlineColor="#1F74BA"
          style={style.dropdownInput}
          right={
            <TextInput.Icon
              icon={require('../../../assets/dropdown.png')}
              onPress={togglePeak}
              forceTextInputFocus={false}
              style={{width: 18, height: 18, tintColor: '#1F74BA'}}
            />
          }
        />
      </View>

      {/* "+" Button */}
      <TouchableOpacity onPress={togglePeakModal} style={style.addButton}>
        <Text style={style.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Dropdown List */}
    {showPeak && (
      <View style={style.dropdownList}>
        <TextInput
          style={style.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchPeak}
          onChangeText={setSearchPeak}
        />

        {isKaptureLoading ? (
          <Text style={{color: '#000', textAlign: 'center'}}>Loading...</Text>
        ) : filteredPeakData.length === 0 && !isKaptureLoading ? (
          <Text style={style.noResults}>Sorry, no results found!</Text>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {filteredPeakData.map(item => (
              <TouchableOpacity
                key={item.m_id}
                style={style.dropdownItem}
                onPress={() => {
                  setSelectedPeak(item.m_name);
                  setSelectedPeakId(item.m_id);
                  setShowPeak(false);
                }}>
                <Text style={style.dropdownItemText}>{item.m_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
  </View>
)}


            {/* Logo Dropdown */}
            {/* {prod_additional_field_flag === 1 && (
              <View style={style.dropdownContainer}>
                <Text style={style.headerTxt}>{'Logo'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
                    <TouchableOpacity
                      style={style.dropdownButton}
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
                  <View style={style.container4}>
                    <TouchableOpacity
                      onPress={toggleLogoModal}
                      style={style.plusButton}>
                      <Image
                        style={style.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showLogo && (
                  <View style={style.dropdownContent}>
                    <TextInput
                      style={style.searchInput}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchLogo}
                      onChangeText={setSearchLogo}
                    />
                    <ScrollView>
                      {isKaptureLoading ? (
                        <Text style={{color: '#000'}}>Loading...</Text>
                      ) : filteredLogoData.length === 0 && !isKaptureLoading ? (
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredLogoData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={style.dropdownItem}
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
            )} */}

            {prod_additional_field_flag === 1 && (
  <View style={style.fieldContainer}>
    {/* <Text style={style.headerTxt}>{'Logo'}</Text> */}

    {/* Dropdown Row */}
    <View style={style.fieldRow}>
      {/* Dropdown Input */}
      <View style={{flex: 1}}>
        <TextInput
          label="Logo"
          mode="outlined"
          value={selectedLogoId ? selectedLogo : ''}
          placeholder="Select"
          editable={false}
          outlineColor="#D1D5DB"
          activeOutlineColor="#1F74BA"
          style={style.dropdownInput}
          right={
            <TextInput.Icon
              icon={require('../../../assets/dropdown.png')}
              onPress={toggleLogo}
              forceTextInputFocus={false}
              style={{width: 18, height: 18, tintColor: '#1F74BA'}}
            />
          }
        />
      </View>

      {/* "+" Button */}
      <TouchableOpacity onPress={toggleLogoModal} style={style.addButton}>
        <Text style={style.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Dropdown List */}
    {showLogo && (
      <View style={style.dropdownList}>
        <TextInput
          style={style.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchLogo}
          onChangeText={setSearchLogo}
        />

        {isKaptureLoading ? (
          <Text style={{color: '#000', textAlign: 'center'}}>Loading...</Text>
        ) : filteredLogoData.length === 0 && !isKaptureLoading ? (
          <Text style={style.noResults}>Sorry, no results found!</Text>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {filteredLogoData.map(item => (
              <TouchableOpacity
                key={item.m_id}
                style={style.dropdownItem}
                onPress={() => {
                  setSelectedLogo(item.m_name);
                  setSelectedLogoId(item.m_id);
                  setShowLogo(false);
                }}>
                <Text style={style.dropdownItemText}>{item.m_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
  </View>
)}



            {/* Decoration Dropdown */}
            {/* {prod_additional_field_flag === 1 && (
              <View style={style.dropdownContainer}>
                <Text style={style.headerTxt}>{'Decoration'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
                    <TouchableOpacity
                      style={style.dropdownButton}
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
                  <View style={style.container4}>
                    <TouchableOpacity
                      onPress={toggleDecorationModal}
                      style={style.plusButton}>
                      <Image
                        style={style.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showDecoration && (
                  <View style={style.dropdownContent}>
                    <TextInput
                      style={style.searchInput}
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
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredDecorationData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={style.dropdownItem}
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
            )} */}

            {prod_additional_field_flag === 1 && (
  <View style={style.fieldContainer}>
    {/* <Text style={style.headerTxt}>{'Decoration'}</Text> */}

    {/* Dropdown Row */}
    <View style={style.fieldRow}>
      {/* Dropdown Input */}
      <View style={{flex: 1}}>
        <TextInput
          label="Decoration"
          mode="outlined"
          value={selectedDecorationId ? selectedDecoration : ''}
          placeholder="Select"
          editable={false}
          outlineColor="#D1D5DB"
          activeOutlineColor="#1F74BA"
          style={style.dropdownInput}
          right={
            <TextInput.Icon
              icon={require('../../../assets/dropdown.png')}
              onPress={toggleDecoration}
              forceTextInputFocus={false}
              style={{width: 18, height: 18, tintColor: '#1F74BA'}}
            />
          }
        />
      </View>

      {/* "+" Button */}
      <TouchableOpacity onPress={toggleDecorationModal} style={style.addButton}>
        <Text style={style.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Dropdown List */}
    {showDecoration && (
      <View style={style.dropdownList}>
        <TextInput
          style={style.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchDecoration}
          onChangeText={setSearchDecoration}
        />

        {isKaptureLoading ? (
          <Text style={{color: '#000', textAlign: 'center'}}>Loading...</Text>
        ) : filteredDecorationData.length === 0 && !isKaptureLoading ? (
          <Text style={style.noResults}>Sorry, no results found!</Text>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {filteredDecorationData.map(item => (
              <TouchableOpacity
                key={item.m_id}
                style={style.dropdownItem}
                onPress={() => {
                  setSelectedDecoration(item.m_name);
                  setSelectedDecorationId(item.m_id);
                  setShowDecoration(false);
                }}>
                <Text style={style.dropdownItemText}>{item.m_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
  </View>
)}




            {/* Trims Dropdown */}
            {/* {prod_additional_field_flag === 1 && (
              <View style={style.dropdownContainer}>
                <Text style={style.headerTxt}>{'Trims'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
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
                  <View style={style.container4}>
                    <TouchableOpacity
                      onPress={toggleTrimsModal}
                      style={style.plusButton}>
                      <Image
                        style={style.plusIcon}
                        source={require('../../../assets/plus.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showTrims && (
                  <View style={style.dropdownContent}>
                    <TextInput
                      style={style.searchInput}
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
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        filteredTrimsData.map(item => (
                          <TouchableOpacity
                            key={item.m_id}
                            style={style.dropdownItem}
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
            )} */}

            {prod_additional_field_flag === 1 && (
  <View style={style.fieldContainer}>
    {/* <Text style={style.headerTxt}>{'Trims'}</Text> */}

    {/* Dropdown Row */}
    <View style={style.fieldRow}>
      {/* Dropdown Input */}
      <View style={{flex: 1}}>
        <TextInput
          label="Trims"
          mode="outlined"
          value={selectedTrimsId ? selectedTrims : ''}
          placeholder="Select"
          editable={false}
          outlineColor="#D1D5DB"
          activeOutlineColor="#1F74BA"
          style={style.dropdownInput}
          right={
            <TextInput.Icon
              icon={require('../../../assets/dropdown.png')}
              onPress={toggleTrims}
              forceTextInputFocus={false}
              style={{width: 18, height: 18, tintColor: '#1F74BA'}}
            />
          }
        />
      </View>

      {/* "+" Button */}
      <TouchableOpacity onPress={toggleTrimsModal} style={style.addButton}>
        <Text style={style.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Dropdown List */}
    {showTrims && (
      <View style={style.dropdownList}>
        <TextInput
          style={style.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchTrims}
          onChangeText={setSearchTrims}
        />

        {isKaptureLoading ? (
          <Text style={{color: '#000', textAlign: 'center'}}>Loading...</Text>
        ) : filteredTrimsData.length === 0 && !isKaptureLoading ? (
          <Text style={style.noResults}>Sorry, no results found!</Text>
        ) : (
          <ScrollView nestedScrollEnabled={true}>
            {filteredTrimsData.map(item => (
              <TouchableOpacity
                key={item.m_id}
                style={style.dropdownItem}
                onPress={() => {
                  setSelectedTrims(item.m_name);
                  setSelectedTrimsId(item.m_id);
                  setShowTrims(false);
                }}>
                <Text style={style.dropdownItemText}>{item.m_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )}
  </View>
)}



            {cedge_flag === 1 && (
              <Text style={style.headerTxt}>{'Process Work Flow *'}</Text>
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

            {showProcessWorkflowList && editProcessWF && (
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
                  <Text style={style.noCategoriesText}>
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


{/* <Text style={style.headerTxt}>{'UOM (Unit of Measure) '}</Text>

<View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={[
                    style.container3,
                    {backgroundColor:  '#fff'},
                  ]}
                  onPress={handUomDropDown}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedUom ? selectedUom : 'Select'}
                  </Text>
                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleSeasonUomModal}
                  style={style.plusButton}>
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
      <Text style={style.noCategoriesText}>
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

<Text style={style.headerTxt}>{'Gst Slot'}</Text>
<View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={[
                    style.container3,
                    {backgroundColor:  '#fff'},
                  ]}
                  onPress={handSlotDropDown}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {selectedSlot ? selectedSlot : 'Select'}
                  </Text>
                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleSeasonSlotModal}
                  style={style.plusButton}>
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
{showSlotList  && (
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
      onChangeText={filterSlot}
    />

    {filteredSlotList.length === 0 && !isLoading ? (
      <Text style={style.noCategoriesText}>
        Sorry, no results found!
      </Text>
    ) : (
      <ScrollView nestedScrollEnabled={true}>
        {filteredSlotList?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
              borderBottomWidth: 0.5,
              borderColor: '#8e8e8e',
            }}
            onPress={() => handleSelectSlot(item)}>
            <Text
              style={{
                fontWeight: '600',
                marginHorizontal: 15,
                color: '#000',
              }}>
              {item?.slotName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
)}
            <Text style={style.headerTxt}>{'Warehouse *'}</Text>

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
            {showLocationList && editLocation && (
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
                  <Text style={style.noCategoriesText}>
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
            )} */}

       



{/* Warehouse Dropdown */}
<View style={style.fieldContainer}>
  {/* <Text style={style.headerTxt}>{'Warehouse *'}</Text> */}
  <View style={style.fieldRow}>
    <View style={{ flex: 1 }}>
      <TextInput
        label="Warehouse *"
        mode="outlined"
        value={selectedLocation || ''}
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={handleLocationDropDown}
            forceTextInputFocus={false}
            style={{ width: 18, height: 18, tintColor: '#1F74BA' }}
          />
        }
      />
    </View>
  </View>

  {showLocationList && editLocation && (
    <View style={style.dropdownList}>
      <TextInput
        style={style.searchInput}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        onChangeText={filterLocation}
      />
      {filteredLocationList.length === 0 && !isLoading ? (
        <Text style={style.noResults}>Sorry, no results found!</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          {filteredLocationList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={style.dropdownItem}
              onPress={() => handleSelectLocation(item)}
            >
              <Text style={style.dropdownItemText}>{item?.locationName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>

{(!hasSizes) && <TextInput
  label="Available Quality"
  mode="outlined"
  value={availableQuantity}
  onChangeText={text => setAvailableQuantity(text)}
  placeholder="Enter Available Quantity"
  placeholderTextColor="#6B7280"
  keyboardType="numeric"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>}

{(!hasSizes) &&  <TextInput
  label="Quantity Limit"
  mode="outlined"
  value={quantityLimit}
  onChangeText={text => setQuantityLimit(text)}
  placeholder="Enter Quantity Limit"
  placeholderTextColor="#6B7280"
  keyboardType="numeric"
  outlineColor="#D1D5DB"
  activeOutlineColor="#1F74BA"
  style={style.input}
/>}




            {/* <Text style={style.headerTxt}>{'Scales *'}</Text> */}

            {/* <View style={style.container1}>
              <View style={style.container2}>
                <TouchableOpacity
                  style={[
                    style.container3,
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
              <View style={style.container4}>
                <TouchableOpacity
                  onPress={toggleScalesModal}
                  style={style.plusButton}>
                   <Text>  ADD SIZES</Text>
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
            {showScalesList && editScale && (
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
                  <Text style={style.noCategoriesText}>
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
            )} */}

            {/* <View style={style.container1}>
                    
           <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', width:'100%', paddingHorizontal:10}}>
                <TouchableOpacity
                  onPress={toggleScalesModal}
                  style={{
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    display: 'flex',
  }}>
                   <Text> ADD SIZES</Text>
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
            </View> */}

            {/* <View style={style.container1}>
                   <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 10,
      alignItems: 'center',
      marginVertical: 20,
    }}>
    <TouchableOpacity
      onPress={toggleScalesModal}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 16,
        elevation: 2, // Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: '#333',
        }}>
        ADD SIZES
      </Text>
      <Image
        style={{
          height: 18,
          width: 18,
          // tintColor: '#333',
        }}
        source={require('../../../assets/plus.png')}
      />
    </TouchableOpacity>
                   </View>
            </View> */}

            {hasSizes && (<View style={style.fieldContainer}>
  <View style={style.fieldRow}>
    <TouchableOpacity onPress={()=>setScalesModal(!scalesModal)} style={style.addButtonLarge}>
      <Text style={style.addButtonLargeText}>ADD SIZES</Text>
      <Image
        source={require('../../../assets/plus.png')}
        style={style.addButtonIcon}
      />
    </TouchableOpacity>
  </View>
</View>)}




             {/* <Text style={style.headerTxt}>{'Status *'}</Text> */}
             {/* <View style={style.container1}>
      <View style={style.container2}>
        <TouchableOpacity
          style={style.container3}
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
          <View style={style.dropdownContainersstatus}>
            {statusOptions.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={style.dropdownItem}
                onPress={() => handleSelectStatus(status)}
              >
                <Text style={style.dropdownText}>{status.label}</Text> 
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View> */}

    <View style={style.fieldContainer}>
  {/* <Text style={style.headerTxt}>{'Status'}</Text> */}

  {/* Dropdown Row */}
  <View style={style.fieldRow}>
    {/* Dropdown Input */}
    <View style={{ flex: 1 }}>
      <TextInput
        label="Status"
        mode="outlined"
        value={selectedStatus}
        placeholder="Select"
        editable={false}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1F74BA"
        style={style.dropdownInput}
        right={
          <TextInput.Icon
            icon={require('../../../assets/dropdown.png')}
            onPress={toggleStatusDropdown}
            forceTextInputFocus={false}
            style={{ width: 18, height: 18, tintColor: '#1F74BA' }}
          />
        }
      />
    </View>
  </View>

  {/* Dropdown List */}
  {showStatusDropdown && (
    <View style={style.dropdownList}>
      <ScrollView nestedScrollEnabled={true}>
        {statusOptions.map((status, index) => (
          <TouchableOpacity
            key={index}
            style={style.dropdownItem}
            onPress={() => handleSelectStatus(status)}
          >
            <Text style={style.dropdownItemText}>{status.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )}
    </View>


  

            {/* Models */}

            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={categoryModal && editShortcutKey}
              onRequestClose={() => {
                toggleCategoryModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
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
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmCategoryName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Category Description * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmCategoryDesc(text)}
                  />
                  <TouchableOpacity
                    style={style.saveButton}
                    // style={[style.saveButton, processing && { opacity: 0.5 }]}
                    onPress={ValidateNewCategory}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}


            {/* <Modal
  animationType="fade"
  transparent={true}
  visible={categoryModal && editShortcutKey}
  onRequestClose={toggleCategoryModal}>
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <View
      style={{
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#1F74BA',
            textAlign: 'center',
            flex: 1,
          }}>
          Add New Category
        </Text>
        <TouchableOpacity onPress={handleCloseCategoryModal}>
          <Image
            style={{
              height: 24,
              width: 24,
              tintColor: '#6B7280',
            }}
            source={require('../../../assets/close.png')}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: 6,
          fontSize: 15,
        }}>
        Category Name *
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 10,
          paddingVertical: 5,
          paddingHorizontal: 12,
          color: '#111827',
          fontSize: 15,
          backgroundColor: '#F9FAFB',
          marginBottom: 15,
        }}
        placeholder="Enter category name"
        placeholderTextColor="#6B7280"
        onChangeText={text => setmCategoryName(text)}
      />

      <Text
        style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: 6,
          fontSize: 15,
        }}>
        Category Description *
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 10,
          paddingVertical: 5,
          paddingHorizontal: 12,
          color: '#111827',
          fontSize: 15,
          backgroundColor: '#F9FAFB',
          marginBottom: 20,
          textAlignVertical: 'top',
        }}
        multiline
        numberOfLines={3}
        placeholder="Enter category description"
        placeholderTextColor="#6B7280"
        onChangeText={text => setmCategoryDesc(text)}
      />

      <TouchableOpacity
        onPress={ValidateNewCategory}
        disabled={processing}
        style={{
          backgroundColor: processing ? '#9CA3AF' : '#1F74BA',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          elevation: 3,
        }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 16,
          }}>
          {processing ? 'Processing...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

 */}
         {/* Category */}
            <Modal
      animationType="fade"
      transparent={true}
      visible={categoryModal && editShortcutKey}
      onRequestClose={toggleCategoryModal}>
      <View style={style.modalOverlay}>
        <View style={style.modalContainer}>
          {/* Header */}
          <View style={style.modalHeader}>
            <Text style={style.modalTitle}>Add New Category</Text>
            <TouchableOpacity onPress={handleCloseCategoryModal}>
              <Image
                style={style.closeIcon}
                source={require('../../../assets/close.png')}
              />
            </TouchableOpacity>
          </View>

          {/* Industry Selection */}
      <Text style={[style.inputLabel, {marginTop: 10}]}>Choose Industry *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: 10}}>
       {industryTypesList.length>0 && industryTypesList.map((industry) => {
          const imageName = industry.icon.split('/').pop(); 
          const iconSource = industryIcons[imageName];

          return (
            <TouchableOpacity
              key={industry.id}
              onPress={() =>{ 
                setSelectedIndustryTypeId(industry.id);
                setSelectedIndustry(industry);
                const imageName = industry.icon.split('/').pop(); 
                console.log("Selected Industry Icon:", imageName, fabricQualityIndustryIcons.includes(imageName));
                setShowFabricQuality(fabricQualityIndustryIcons.includes(imageName));
              }}
              style={[
                style.industryCard,
                selectedIndustryTypeId === industry.id && style.industryCardSelected,
              ]}>
              
              {/* ✅ Display icon */}
              {iconSource && <Image source={iconSource} style={style.industryIcon} />}
              <Text style={style.industryText}>{industry.industry}</Text>
        
              {selectedIndustryTypeId === industry?.id && (
                <View style={style.industryCheckMark}>
                  <Text style={{color: '#fff'}}>✔</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

      </ScrollView>

          {/* Category Name */}
          <Text style={style.inputLabel}>Category Name *</Text>
          <TextInput
            style={style.inputField}
            placeholder="Enter category name"
            placeholderTextColor="#6B7280"
            onChangeText={text => setmCategoryName(text)}
          />

          {/* Category Description */}
          <Text style={style.inputLabel}>Category Description *</Text>
          <TextInput
            style={[style.inputField, style.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Enter category description"
            placeholderTextColor="#6B7280"
            onChangeText={text => setmCategoryDesc(text)}
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={ValidateNewCategory}
            disabled={processing}
            style={[
              style.saveButton,
              processing && style.saveButtonDisabled,
            ]}>
            <Text style={style.saveButtonText}>
              {processing ? 'Processing...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
            </Modal>


         {/* Color */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={colorModal && editShortcutKey}
              onRequestClose={() => {
                toggleColorModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
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
                    style={{borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          color: '#111827',
          fontSize: 15,
          backgroundColor: '#F9FAFB',
          marginBottom: 15}}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Color Description * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorDesc(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Color Code '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmColorCode(text)}
                  />
                  <TouchableOpacity
                    style={[style.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateNewColor}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}

              <Modal
                animationType="fade"
                transparent={true}
                visible={colorModal && editShortcutKey}
                onRequestClose={toggleColorModal}>
                <View style={style.modalOverlay}>
                  <View style={style.modalContainer}>
                    {/* Header */}
                    <View style={style.modalHeader}>
                      <Text style={style.modalTitle}>
                        Add New Color
                      </Text>
                      <TouchableOpacity onPress={handleCloseColorModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
              
                    {/* Color Name */}
                    <Text style={style.inputLabel}>Color Name *</Text>
                    <TextInput
                      style={style.inputField}
                      placeholder="Enter color name"
                      placeholderTextColor="#6B7280"
                      onChangeText={text => setmColorName(text)}
                    />
              
                    {/* Color Description */}
                    <Text style={style.inputLabel}>Color Description *</Text>
                    <TextInput
                      style={[style.inputField, style.textArea]}
                      multiline
                      numberOfLines={3}
                      placeholder="Enter color description"
                      placeholderTextColor="#6B7280"
                      onChangeText={text => setmColorDesc(text)}
                    />
              
                    {/* Color Code */}
                    <Text style={style.inputLabel}>Color Code</Text>
                    <TextInput
                      style={style.inputField}
                      placeholder="Enter color code"
                      placeholderTextColor="#6B7280"
                      onChangeText={text => setmColorCode(text)}
                    />
              
                    {/* Save Button */}
                    <TouchableOpacity
                      style={[style.saveButton, processing && style.saveButtonDisabled]}
                      onPress={ValidateNewColor}
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
             </Modal>

             {/* type */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={typesModal }
              onRequestClose={() => {
                toggleTypesModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
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
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmTypeName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Type Description * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmTypeDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateNewType}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}

            <Modal
  animationType="fade"
  transparent={true}
  visible={typesModal}
  onRequestClose={toggleTypesModal}>
  <View style={style.modalOverlay}>
    <View style={style.modalContainer}>
      {/* Header */}
      <View style={style.modalHeader}>
        <Text style={style.modalTitle}>Add New Type</Text>
        <TouchableOpacity onPress={handleCloseTypesModal}>
          <Image
            style={style.closeIcon}
            source={require('../../../assets/close.png')}
          />
        </TouchableOpacity>
      </View>

      {/* Type Name */}
      <Text style={style.inputLabel}>Type Name *</Text>
      <TextInput
        style={style.inputField}
        placeholder="Enter type name"
        placeholderTextColor="#6B7280"
        onChangeText={text => setmTypeName(text)}
      />

      {/* Type Description */}
      <Text style={style.inputLabel}>Type Description *</Text>
      <TextInput
        style={[style.inputField, style.textArea]}
        multiline
        numberOfLines={3}
        placeholder="Enter type description"
        placeholderTextColor="#6B7280"
        onChangeText={text => setmTypeDesc(text)}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[style.saveButton, processing && style.saveButtonDisabled]}
        onPress={ValidateNewType}
        disabled={processing}>
        <Text style={style.saveButtonText}>
          {processing ? 'Processing...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
           </Modal>

          {/* Season Group */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={seasonGroupsModal && editShortcutKey}
              onRequestClose={() => {
                toggleSeasonGroupsModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
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
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSeasonGroupName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Season Group Description * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSeasonGroupDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateSeasonGroup}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
           {/* UOM */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={UomModal && editShortcutKey}
              onRequestClose={() => {
                toggleSeasonUomModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
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
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmUomName(text)}
                  />

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'UOM Description * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setUomDesc(text)}
                  />

                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateUom}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}
            <Modal
  animationType="fade"
  transparent={true}
  visible={UomModal && editShortcutKey}
  onRequestClose={toggleSeasonUomModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New UOM</Text>
          <TouchableOpacity onPress={handleCloseUomModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* UOM Name */}
        <Text style={style.inputLabel}>UOM Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter UOM Name"
          placeholderTextColor="#6B7280"
          onChangeText={text => setmUomName(text)}
        />

        {/* UOM Description */}
        <Text style={style.inputLabel}>UOM Description *</Text>
        <TextInput
          style={[style.inputField, style.textArea]}
          multiline
          numberOfLines={3}
          placeholder="Enter UOM Description"
          placeholderTextColor="#6B7280"
          onChangeText={text => setUomDesc(text)}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          onPress={ValidateUom}
          disabled={processing}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>

         
         {/* Gst Slot */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={SlotModal && editShortcutKey}
              onRequestClose={() => {
                toggleSeasonSlotModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {'Add New Gst Slot'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseSlotModal}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{fontWeight: 'bold', color: '#000'}}>
                    {'Slot Name * '}
                  </Text>
                  <TextInput
                    style={[style.input, {color: '#000'}]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSlotName(text)}
                  />
                 <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}
    onPress={() => setIsDefault(!isDefault)} // Handles both text & checkbox clicks
    activeOpacity={0.7}
  >
    <CustomCheckBox 
      isChecked={isDefault} 
      onToggle={() => setIsDefault(!isDefault)} // Ensure checkbox press toggles state
    />
    <Text style={{ color: '#000', marginLeft: 10 }}>Make it Default</Text>
  </TouchableOpacity>

                <View style={{marginBottom: 10}}>
 
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
    <Text style={{color: '#000', fontSize: 25, fontWeight: 'bold'}}>{'<'}</Text>
    <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 5}}>
      {'Amount * '}
    </Text>
    <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 10}}>
      {'Percentage * '}
    </Text>
  </View>
  
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
    <TextInput
      style={[style.input, {color: '#000', flex: 1, marginRight: 10}]}
      placeholder=""
      placeholderTextColor="#000"
      onChangeText={text => setSlotAmoutLess(text)}
    />
    <TextInput
      style={[style.input, {color: '#000', flex: 1}]}
      placeholder=""
      placeholderTextColor="#000"
      onChangeText={text => setSlotPercentageLess(text)}
    />
  </View>

  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
    <Text style={{color: '#000', fontSize: 25, fontWeight: 'bold'}}>{'>'}</Text>
    <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 5}}>
      {'Amount * '}
    </Text>
    <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 10}}>
      {'Percentage * '}
    </Text>
  </View>

  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
    <TextInput
      style={[style.input, {color: '#000', flex: 1, marginRight: 10}]}
      placeholder=""
      placeholderTextColor="#000"
      onChangeText={text => setSlotAmoutGrater(text)}
    />
    <TextInput
      style={[style.input, {color: '#000', flex: 1}]}
      placeholder=""
      placeholderTextColor="#000"
      onChangeText={text => setSlotPercentageGrater(text)}
    />
  </View>
</View>


                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && {opacity: 0.5}]}
                    onPress={ValidateSlot}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>
                      {processing ? 'Processing' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}
            <Modal
  animationType="fade"
  transparent={true}
  visible={SlotModal && editShortcutKey}
  onRequestClose={toggleSeasonSlotModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New GST</Text>
          <TouchableOpacity onPress={handleCloseSlotModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Slot Name */}
        <Text style={style.inputLabel}> GST Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter GST Name"
          placeholderTextColor="#6B7280"
          onChangeText={text => setmSlotName(text)}
        />

        {/* Make it Default Checkbox */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.7}
        >
          <CustomCheckBox 
            isChecked={isDefault} 
            onToggle={() => setIsDefault(!isDefault)} 
          />
          <Text style={{ color: '#000', marginLeft: 10 }}>Make it Default</Text>
        </TouchableOpacity>

        {/* Less than Section */}
        <View style={{marginBottom: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
            <Text style={{color: '#000', fontSize: 25, fontWeight: 'bold'}}>{'<'}</Text>
            <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 5}}>Amount *</Text>
            <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 10}}>Percentage *</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <TextInput
              style={[style.inputField, {flex: 1, marginRight: 10}]}
              placeholder=""
              placeholderTextColor="#6B7280"
              onChangeText={setSlotAmoutLess}
            />
            <TextInput
              style={[style.inputField, {flex: 1}]}
              placeholder=""
              placeholderTextColor="#6B7280"
              onChangeText={setSlotPercentageLess}
            />
          </View>

          {/* Greater than Section */}
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
            <Text style={{color: '#000', fontSize: 25, fontWeight: 'bold'}}>{'>'}</Text>
            <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 5}}>Amount *</Text>
            <Text style={{fontWeight: 'bold', color: '#000', marginLeft: 10}}>Percentage *</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <TextInput
              style={[style.inputField, {flex: 1, marginRight: 10}]}
              placeholder=""
              placeholderTextColor="#6B7280"
              onChangeText={setSlotAmoutGrater}
            />
            <TextInput
              style={[style.inputField, {flex: 1}]}
              placeholder=""
              placeholderTextColor="#6B7280"
              onChangeText={setSlotPercentageGrater}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          onPress={ValidateSlot}
          disabled={processing}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>



         
         {/* Scale */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={scalesModal && editShortcutKey}
              onRequestClose={() => {
                toggleScalesModal();
              }}>
              <ScrollView style={{}}>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
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
                          style.modalTitle,
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
                      style={[style.input, {color: '#000'}]}
                      placeholder=""
                      placeholderTextColor="#000"
                      onChangeText={text => setmSize(text)}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      onPress={ValidateNewScale}
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={[style.headerTxt, {textAlign: 'left'}]}>
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
                        <Text style={style.noCategoriesText}>
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
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      onPress={handleSaveNewSizesToSeasonGroup}
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal>
             */}
             <Modal
  animationType="fade"
  transparent={true}
  visible={scalesModal && editShortcutKey}
  onRequestClose={toggleScalesModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Scale</Text>
          <TouchableOpacity onPress={handleCloseScalesModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Size */}
        <Text style={style.inputLabel}>Size *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter Size"
          placeholderTextColor="#6B7280"
          onChangeText={text => setmSize(text)}
        />

         {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          onPress={ValidateNewScale}
          disabled={processing}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'ADD'}
          </Text>
        </TouchableOpacity>

        {/* Sizes List */}
        <Text style={[style.inputLabel, {marginTop:30}]}>Sizes :</Text>
        <View style={{height: 180, width: '100%', marginTop: 10, marginBottom:30}}>
          {allSizesInScales.length === 0 ? (
            <Text style={style.noCategoriesText}>Sorry, no results found!</Text>
          ) : (
            <ScrollView nestedScrollEnabled={true}>
              {allSizesInScales.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={style.checkboxItem}
                  onPress={() => handleSelectallSizesInScales(item)}>
                  <CustomCheckBox
                    isChecked={selectedModalSizeInSeasonListIds.includes(item.id)}
                    onToggle={() => handleSelectallSizesInScales(item)}
                  />
                  <Text style={style.checkboxLabel}>{item.size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          onPress={handleChangeScale}
          disabled={processing}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>


            {/* Closure Modal */}

            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={closureModal && editShortcutKey}
              onRequestClose={toggleClosureModal}>
              <ScrollView>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
                    <View style={style.modalHeader}>
                      <Text
                        style={[
                          style.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Closure'}
                      </Text>
                      <TouchableOpacity onPress={toggleClosureModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={style.modalLabel}>Closure Name *</Text>
                    <TextInput
                      style={style.input}
                      placeholder="Enter Closure Name"
                      placeholderTextColor="#000"
                      value={closureName}
                      onChangeText={setClosureName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      disabled={processing}
                      onPress={() =>
                        ValidateAllKapture(1, 'Closure', closureName)
                      }>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal> */}
            <Modal
  animationType="fade"
  transparent={true}
  visible={closureModal && editShortcutKey}
  onRequestClose={toggleClosureModal}>
  {/* <ScrollView contentContainerStyle={{}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Closure</Text>
          <TouchableOpacity onPress={toggleClosureModal}>
            <Image
              style={style.closeIcon}
              source={require('../../../assets/close.png')}
            />
          </TouchableOpacity>
        </View>

        {/* Closure Name */}
        <Text style={style.inputLabel}>Closure Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter closure name"
          placeholderTextColor="#6B7280"
          value={closureName}
          onChangeText={setClosureName}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          disabled={processing}
          onPress={() => ValidateAllKapture(1, 'Closure', closureName)}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
          </Modal>


            {/* Peak Modal */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={peakModal && editShortcutKey}
              onRequestClose={togglePeakModal}>
              <ScrollView>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
                    <View style={style.modalHeader}>
                      <Text
                        style={[
                          style.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Peak'}
                      </Text>
                      <TouchableOpacity onPress={togglePeakModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={style.modalLabel}>Peak Name *</Text>
                    <TextInput
                      style={style.input}
                      placeholder="Enter Peak Name"
                      placeholderTextColor="#000"
                      value={peakName}
                      onChangeText={setPeakName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      onPress={() => ValidateAllKapture(2, 'Peak', peakName)}
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal> */}
          <Modal
  animationType="fade"
  transparent={true}
  visible={peakModal && editShortcutKey}
  onRequestClose={togglePeakModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Peak</Text>
          <TouchableOpacity onPress={togglePeakModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Peak Name */}
        <Text style={style.inputLabel}>Peak Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter Peak Name"
          placeholderTextColor="#6B7280"
          value={peakName}
          onChangeText={setPeakName}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          disabled={processing}
          onPress={() => ValidateAllKapture(2, 'Peak', peakName)}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>



            {/* Logo Modal */}

            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={logoModal && editShortcutKey}
              onRequestClose={toggleLogoModal}>
              <ScrollView>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
                    <View style={style.modalHeader}>
                      <Text
                        style={[
                          style.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Logo'}
                      </Text>
                      <TouchableOpacity onPress={toggleLogoModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={style.modalLabel}>Logo Name *</Text>
                    <TextInput
                      style={style.input}
                      placeholder="Enter Logo Name"
                      placeholderTextColor="#000"
                      value={logoName}
                      onChangeText={setLogoName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      onPress={() => ValidateAllKapture(3, 'Logo', logoName)}
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal> */}
            <Modal
  animationType="fade"
  transparent={true}
  visible={logoModal && editShortcutKey}
  onRequestClose={toggleLogoModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Logo</Text>
          <TouchableOpacity onPress={toggleLogoModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Logo Name */}
        <Text style={style.inputLabel}>Logo Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter Logo Name"
          placeholderTextColor="#6B7280"
          value={logoName}
          onChangeText={setLogoName}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          disabled={processing}
          onPress={() => ValidateAllKapture(3, 'Logo', logoName)}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>

            


            {/* Decoration Modal */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={decorationModal && editShortcutKey}
              onRequestClose={toggleDecorationModal}>
              <ScrollView>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
                    <View style={style.modalHeader}>
                      <Text
                        style={[
                          style.modalTitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {' '}
                        {'Add New Decoration'}
                      </Text>
                      <TouchableOpacity onPress={toggleDecorationModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={style.modalLabel}>Decoration Name *</Text>
                    <TextInput
                      style={style.input}
                      placeholder="Enter Decoration Name"
                      placeholderTextColor="#000"
                      value={decorationName}
                      onChangeText={setDecorationName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      onPress={() =>
                        ValidateAllKapture(4, 'Decoration', decorationName)
                      }
                      disabled={processing}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal> */}

            <Modal
  animationType="fade"
  transparent={true}
  visible={decorationModal && editShortcutKey}
  onRequestClose={toggleDecorationModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Decoration</Text>
          <TouchableOpacity onPress={toggleDecorationModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Decoration Name */}
        <Text style={style.inputLabel}>Decoration Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter Decoration Name"
          placeholderTextColor="#6B7280"
          value={decorationName}
          onChangeText={setDecorationName}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          disabled={processing}
          onPress={() => ValidateAllKapture(4, 'Decoration', decorationName)}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>

       

            {/* Trims Modal */}
            {/* <Modal
              animationType="fade"
              transparent={true}
              visible={trimsModal && editShortcutKey}
              onRequestClose={toggleTrimsModal}>
              <ScrollView>
                <View style={style.modalContainerr1}>
                  <View style={style.modalContentt}>
                    <View style={style.modalHeader}>
                      <Text style={style.modalTitle}>Add New Trims</Text>
                      <TouchableOpacity onPress={toggleTrimsModal}>
                        <Image
                          style={style.closeIcon}
                          source={require('../../../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        style.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {' '}
                      {'Trims Name *'}
                    </Text>
                    <TextInput
                      style={style.input}
                      placeholder="Enter Trims Name"
                      placeholderTextColor="#000"
                      value={trimsName}
                      onChangeText={setTrimsName}
                    />
                    <TouchableOpacity
                      // style={style.saveButton}
                      style={[style.saveButton, processing && {opacity: 0.5}]}
                      disabled={processing}
                      onPress={() => ValidateAllKapture(5, 'Trim', trimsName)}>
                      <Text style={style.saveButtonText}>
                        {processing ? 'Processing' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Modal> */}

            <Modal
  animationType="fade"
  transparent={true}
  visible={trimsModal && editShortcutKey}
  onRequestClose={toggleTrimsModal}>
  {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}> */}
    <View style={style.modalOverlay}>
      <View style={style.modalContainer}>
        {/* Header */}
        <View style={style.modalHeader}>
          <Text style={style.modalTitle}>Add New Trims</Text>
          <TouchableOpacity onPress={toggleTrimsModal}>
            <Image style={style.closeIcon} source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>

        {/* Trims Name */}
        <Text style={style.inputLabel}>Trims Name *</Text>
        <TextInput
          style={style.inputField}
          placeholder="Enter Trims Name"
          placeholderTextColor="#6B7280"
          value={trimsName}
          onChangeText={setTrimsName}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[style.saveButton, processing && style.saveButtonDisabled]}
          disabled={processing}
          onPress={() => ValidateAllKapture(5, 'Trim', trimsName)}>
          <Text style={style.saveButtonText}>
            {processing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  {/* </ScrollView> */}
</Modal>


        

            {/* {showScaleTable && (
              <View style={style.container}>
                <View style={style.header}>
                  <View style={style.headerCell1}>
                    <Text style={style.headerText}>Id</Text>
                  </View>
                  <View style={style.headerCell2}>
                    <Text style={style.headerText}>Size</Text>
                  </View>
                  <View style={style.headerCell3}>
                    <Text style={style.headerText}>Dealer Price</Text>
                  </View>
                  <View style={style.headerCell4}>
                    <Text style={style.headerText}>Retailer Price</Text>
                  </View>
                  <View style={style.headerCell5}>
                    <Text style={style.headerText}>MRP</Text>
                  </View>
                  <View style={style.headerCell5}>
                    <Text style={style.headerText}>CorRate</Text>
                  </View>
                  <View style={style.headerCell6}>
                    <Text style={style.headerText}>Available Quantity</Text>
                  </View>
                </View>

                <ScrollView>
                  {selectedSizes.map((item, index) => (
                    <View key={index} style={style.row}>
                      <View style={style.cell1}>
                      <Text style={style.cellText}>{index + 1}</Text>                     
                        </View>
                      <View style={style.cell2}>
                        <Text style={style.cellText}>{item?.sizeDesc}</Text>
                      </View>
                      <View style={style.cell}>
                        <TextInput
                            style={style.input}
                          keyboardType="numeric"
                          value={item?.dealerPrice.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'dealerPrice', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={style.cell}>
                        <TextInput
                          style={style.input}
                          keyboardType="numeric"
                          value={item?.retailerPrice.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'retailerPrice', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={style.cell}>
                        <TextInput
                          style={style.input}
                          keyboardType="numeric"
                          value={item.mrp.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'mrp', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={style.cell}>
                        <TextInput
                          style={style.input}
                          keyboardType="numeric"
                          value={item?.corRate.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'corRate', text)
                          }
                          editable={true}
                        />
                      </View>
                      <View style={style.cell}>
                        <TextInput
                          style={style.input}
                          keyboardType="numeric"
                          value={item.availQty.toString()}
                          onChangeText={text =>
                            handleInputChange(index, 'availQty', text)
                          }
                          editable={editAvailQty}
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )} */}


            {showScaleTable && hasSizes && (
  <View style={tableStyle.wrapper}>
    {/* Header */}
    <View style={tableStyle.headerRow}>
      <Text style={tableStyle.headerCell1}>Id</Text>
      <Text style={tableStyle.headerCell2}>Size</Text>
      <Text style={tableStyle.headerCell3}>Dealer Price</Text>
      <Text style={tableStyle.headerCell4}>Retailer Price</Text>
      <Text style={tableStyle.headerCell5}>MRP</Text>
      <Text style={tableStyle.headerCell5}>CorRate</Text>
      <Text style={tableStyle.headerCell6}>Available Qty</Text>
      <Text style={tableStyle.headerCell6}>Delete</Text>
    </View>

    {/* Body */}
    <ScrollView style={tableStyle.scrollBody}>
      {selectedSizes.map((item, index) => (
        <View key={index} style={tableStyle.dataRow}>
          <Text style={tableStyle.dataCell1}>{index + 1}</Text>
          <Text style={tableStyle.dataCell2}>{item?.sizeDesc}</Text>

          <TextInput
            style={tableStyle.dataInput}
            keyboardType="numeric"
            value={item?.dealerPrice.toString()}
            onChangeText={text => handleInputChange(index, 'dealerPrice', text)}
            editable={true}
          />

          <TextInput
            style={tableStyle.dataInput}
            keyboardType="numeric"
            value={item?.retailerPrice.toString()}
            onChangeText={text => handleInputChange(index, 'retailerPrice', text)}
            editable={true}
          />

          <TextInput
            style={tableStyle.dataInput}
            keyboardType="numeric"
            value={item.mrp.toString()}
            onChangeText={text => handleInputChange(index, 'mrp', text)}
            editable={true}
          />

          <TextInput
            style={tableStyle.dataInput}
            keyboardType="numeric"
            value={item?.corRate.toString()}
            onChangeText={text => handleInputChange(index, 'corRate', text)}
            editable={true}
          />

          <TextInput
            style={tableStyle.dataInput}
            keyboardType="numeric"
            value={item.availQty.toString()}
            onChangeText={text => handleInputChange(index, 'availQty', text)}
            editable={editAvailQty}
          />
                 <TouchableOpacity onPress={() => console.log(index)}>
            <Image
              source={require('../../../assets/bin.png')}
              style={tableStyle.deleteIcon}
            />
          </TouchableOpacity>


        </View>
      ))}
    </ScrollView>
  </View>
)}


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
              <Text style={[style.saveButtonText, {textAlign:'center'}]}>Next</Text>
            </TouchableOpacity>

            <View style={{marginBottom: 50}} />
          </ScrollView>

        
        {isLoading && (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // light overlay
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ActivityIndicator size="large" color="#1F74BA" />
      <Text
        style={{
          marginTop: 10,
          fontSize: 16,
          color: '#1F74BA',
          fontWeight: '600',
        }}>
        Loading...
      </Text>
    </View>
  )}
        </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuimg: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
  },
  headbasicinfo: {
    marginTop: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderColor: '#000',
    borderWidth: 1,
    paddingVertical: 10,
    backgroundColor:  colors.color2,
  },
  headprductimage: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  headpricelist:{
    marginTop: 10,
    paddingHorizontal: 20,
  
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
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
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: '30%',
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
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 5,
    width: '97%',
    color: 'black',
    ...(Platform.OS === 'ios' && {paddingVertical: 7}),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 3,
    marginTop: 3,
  },
  txtinput: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000000',
    ...(Platform.OS === 'ios' && {marginVertical: 7}),
  },

  container: {
    flex: 1,
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
  // input1: {
  //   height: 40,
  //   borderColor: '#ddd',
  //   borderWidth: 1,
  //   borderRadius: 5,
  //   paddingHorizontal: 10,
  // },

  //new styles

    // Common input (outlined TextInput)
  input: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#fff',
  },

  // Wrapper for each input/dropdown field
  fieldContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
  },

  // Row layout for dropdown + add button
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Non-editable dropdown TextInput
  dropdownInput: {
    backgroundColor: '#fff',
  },

  // Add (+) button
  addButton: {
    backgroundColor: '#1F74BA',
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },

  // Dropdown list container
  dropdownList: {
    maxHeight: 250,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    elevation: 3,
  },

  // Search input inside dropdown
  searchInput: {
    margin: 10,
    height: 36,
    borderRadius: 6,
    paddingLeft: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
  },

  // No results text
  noResults: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    fontSize: 14,
  },

  // Dropdown list item
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  addButtonLarge: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 16,
  gap: 10,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
},

addButtonLargeText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#333',
},

addButtonIcon: {
  width: 18,
  height: 18,
},
// Modal Overlay (dim background)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Modal Container
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  // Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F74BA',
    textAlign: 'center',
    flex: 1,
  },
  closeIcon: {
    height: 24,
    width: 24,
    tintColor: '#6B7280',
  },

  // Input Section
  inputLabel: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    fontSize: 15,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    // paddingVertical: 5,
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
  },
  textArea: {
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  // Buttons
  saveButton: {
    backgroundColor: '#1F74BA',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  checkboxItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 0.5,
  borderColor: '#8e8e8e',
  marginHorizontal: 10,
},

checkboxLabel: {
  fontWeight: '600',
  marginLeft: 10,
  color: '#000',
},
// Industry Cards
 industryCard: {
  width: 85,
  height: 100,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
  backgroundColor: '#F9FAFB',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},
industryCardSelected: {
  borderColor: '#1F74BA',
  backgroundColor: '#EAF3FB', // subtle blue-tinted background for selected
  shadowColor: '#1F74BA',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
industryIcon: {
  width: 40,
  height: 40,
  resizeMode: 'contain',
  tintColor: '#1F74BA', // consistent icon color tone
},
industryText: {
  fontSize: 12,
  textAlign: 'center',
  marginTop: 5,
  color: '#000',
  fontWeight: '500',
},
industryCheckMark: {
  position: 'absolute',
  bottom: 5,
  right: 5,
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: 'rgba(31, 116, 186, 0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},

});

const tableStyle = StyleSheet.create({
  wrapper: {
    marginVertical:20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerCell1: { flex: 0.6, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },
  headerCell2: { flex: 1, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },
  headerCell3: { flex: 1, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },
  headerCell4: { flex: 1, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },
  headerCell5: { flex: 1, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },
  headerCell6: { flex: 1.2, fontWeight: 'bold', color: '#111827', fontSize: 13, textAlign: 'center' },

  scrollBody: { minHeight: 150 },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 4,
  },
  dataCell1: { flex: 0.6, fontSize: 13, color: '#111827', textAlign: 'center' },
  dataCell2: { flex: 1, fontSize: 13, color: '#111827', textAlign: 'center' },
  dataInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  deleteIcon: {
  width: 20,
  height: 20,
  tintColor: 'red',
  marginLeft: 10,
},
});


export default NewStyleDetail;
