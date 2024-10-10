import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CustomCheckBox from '../../components/CheckBox';

const NewStyleDetail = ({ route }) => {
  const navigation = useNavigation();
  const selectedCompany = useSelector(state => state.selectedCompany);
  const userId = useSelector(state => state?.loggedInUser?.userId);

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

  const [showScalesList, setShowScalesList] = useState(false);
  const [scalesList, setScalesList] = useState([]);
  const [filteredScalesList, setFilteredScalesList] = useState([]);
  const [selectedScale, setSelectedScale] = useState('');
  const [selectedScaleId, setSelectedScaleId] = useState(0);

  const [categoryModal, setcategoryModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);
  const [typesModal, setTypesModal] = useState(false);
  const [seasonGroupsModal, setSeasonGroupsModal] = useState(false);
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
  const [mrp, setMrp] = useState(null);
  const [fixedDiscount, setfixedDiscount] = useState(0);
  const [colorCode, setColorCode] = useState('');

  // const [styleQuantity, setStyleQuantity]=useState('');
  // const [fabricQuantity, setFabricQuantity]=useState('');
  const [styleNum, setStyleNum] = useState(0);

  const [gsm, setGsm] = useState('');
  const [hsn, setHsn] = useState('');
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

  const [mSize, setmSize] = useState('');
  const [mSizeDesc, setmSizeDesc] = useState('');
  // const [colorsArray, setColorsArray] = useState([]);

  const [editColor, setEditColor] = useState(true);
  const [editSeasonGroup, setEditSeasonGroup] = useState(true);
  const [editLocation, setEditLocation] = useState(true);
  const [editScale, setEditScale] = useState(true);
  const [editStyleName, seteditStyleName] = useState(true);
  const [editAvailQty, seteditAvailQty] = useState(true);
  const [editShortcutKey, setEditShortcutKey] = useState(true);
  const [editProcessWF, seteditProcessWF] = useState(true);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getCategoriesList();
    getCustomerLevelList();
    getcolorsList();
    getTypesList();
    getSeasonalGroups();
    getProcessWorkFlow();
    getLocations();
    getAllSizesInScale();
    getAllKapture(1);
    getAllKapture(2);
    getAllKapture(3);
    getAllKapture(4);
    getAllKapture(5);
  }, [companyId]);

  useEffect(() => {
    if (route.params && route?.params?.styleDetails) {
      const styleDetails = route?.params?.styleDetails;

      console.log("Style Details ==> ", styleDetails);

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
      selectedSeasonGroupId,
      selectedProcessWorkflowId,
      selectedLocationId,
      selectedScaleId,
    );
    // if (selectedCategory.length > 0 && styleName.length > 0 && styleDesc.length > 0 && dealerPrice > 0 && selectedCustomerLevel?.length > 0 && selectedColorIds.length > 0 && selectedType.length > 0 && selectedSeasonGroup.length > 0 && (cedge_flag === 0 || selectedProcessWorkflow.length > 0) && selectedLocation.length > 0 && selectedScale.length > 0) {
    if (
      selectedCategoryId &&
      styleName.length > 0 &&
      styleDesc.length > 0 &&
      dealerPrice > 0 &&
      selectedColorIds.length > 0 &&
      selectedTypeId &&
      selectedSeasonGroupId &&
      (cedge_flag === 0 || selectedProcessWorkflowId) &&
      selectedLocationId &&
      selectedScaleId
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

  useEffect(() => {
    if (selectedColorIds && selectedColorIds.length > 0) {
      const l = selectedColorIds?.length;
      const selectedColorId = selectedColorIds[l - 1];
      const found = colorList?.filter(item => item.colorId === selectedColorId);
      if (found) {
        setColorCode(found[0]?.colorCode);
      }
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

  useEffect(() => {
    if (selectedSeasonGroupId && seasonGroupsList.length > 0) {
      const found = seasonGroupsList?.filter(
        item => item.sizeGroupId === selectedSeasonGroupId,
      );
      if (found) {
        setSelectedSeasonGroup(found[0]?.sizeGroup);
      }
      getScales();
    }
  }, [selectedSeasonGroupId, seasonGroupsList]);

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
        item => item.scaleId === selectedScaleId,
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
      if(!editProcessWF) return;
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
    if (comp_flag === 0) {
      const apiUrl0 = `${global?.userData?.productURL}${API.GET_LOCATION_C0_LIST}`;
      setIsLoading(true);
      const requestData = {
        styleName: '',
      };
      axios
        .post(apiUrl0, requestData, {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        })
        .then(response => {
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

  const handleSelectColor = item => {
    if (!selectedColorIds.includes(item.colorId)) {
      setSelectedColorIds([...selectedColorIds, item.colorId]);
    } else {
      setSelectedColorIds(selectedColorIds.filter(id => id !== item.colorId));
    }

    if (selectedColorIds.length === filteredColorList.length - 1) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
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
    } else {
      setSelectedModalSizeInSeasonListIds([
        ...selectedModalSizeInSeasonListIds,
        item.id,
      ]);
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
    setSelectedProcessWorkflow(item.id);
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

  const handleScalesDropDown = () => {
    setShowScalesList(!showScalesList);
  };

  const handleSelectScale = item => {
    setSelectedScale(item.scaleRange);
    setSelectedScaleId(item.scaleId);
    setSelectedSizes([]);

    handleChangeScale(item);

    setShowScaleTable(true);

    setShowScalesList(false);
  };

  const filterScales = text => {
    const filtered = scalesList.filter(item =>
      item?.scale?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredScalesList(filtered);
  };

  const handleChangeScale = item => {

    const sizes = item.scaleRange.split(',').map(size => size.trim());

    const newSizes = sizes.map((size, index) => ({
      sizeId: index + 1,
      sizeDesc: size,
      dealerPrice: 0,
      retailerPrice: 0,
      mrp: 0,
      availQty: 0,
      gsCode: null,
      gscodeMapId: null,
      j_item_id: null,
      article_no: null,
    }));


    // Update selectedSizes and then update all items
    setSelectedSizes(newSizes);
    setShowScalesList(false);

    // Use a callback to ensure the state update is applied before updating all items
    setSelectedSizes(prevSelectedSizes => {
      intialupdateAllItems(dealerPrice, retailerPrice, mrp, prevSelectedSizes);
      return [...prevSelectedSizes, ...newSizes];
    });
  };

  const updateAllItems = (field, value) => {
    const updatedSizes = selectedSizes.map(item => ({
      ...item,
      [field]: Number(value),
    }));
    setSelectedSizes(updatedSizes);
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

    formData.append('categoryId', dummy.toString()); // Ensure that dummy is a string
    formData.append('category', mCategoryName);
    formData.append('categoryDesc', mCategoryDesc);
    formData.append('companyId', companyId);
    formData.append('linkType', 2);

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

  const handleNextPage = () => {
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
      mrp: Number(mrp),
      // files: (productStyle.files as any[]).map(file => file.file),  // Convert file list to array of file objects
      scaleId: selectedScaleId,
      gsm: gsm,
      customerLevel: Number(selectedCustomerLevelId),
      hsn: hsn,
      discount: 0,
      categoryId: selectedCategoryId,
      locationId: selectedLocationId,
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
    };
    navigation.navigate('Product Images', { productStyle: styleDetails });
  };

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
      })
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
      getAllKapture(1)
      getAllKapture(2)
      getAllKapture(3)
      getAllKapture(4)
      getAllKapture(5)
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
    <>
      {isLoading ? (
        <ActivityIndicator
          style={{
            position: 'absolute',
            top: 200,
            left: '50%',
            marginLeft: -20,
            marginTop: -20,
          }}
          size="large"
          color="#1F74BA"
        />
      ) : (
        <ScrollView style={style.conatiner}>
          <View style={{ marginTop: 15 }} />
          <Text style={style.headerTxt}>{'Category *'}</Text>
          <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={style.container3}
                onPress={handleCategoryDropDown}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedCategory?.length > 0 ? selectedCategory : 'Select'}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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
                        height: 50,
                        //  justifyContent: 'fle',
                        borderBottomWidth: 0.5,
                        borderColor: '#8e8e8e',
                      }}
                      onPress={() => handleSelectCategory(item)}>
                      <Text
                        style={{
                          fontWeight: '600',
                          marginHorizontal: 15,
                          color: '#000',
                        }}>
                        {item?.category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Style Name *'}
          </Text>
          <View style={style.inputContainer}>
            <TextInput
              style={[
                style.txtinput,
                { backgroundColor: editColor ? '#fff' : '#f1e8e6' },
              ]}
              placeholder="Style name"
              placeholderTextColor="#000"
              value={styleName}
              editable={editStyleName}
              onChangeText={text => setStyleName(text)}
            />
          </View>
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Style Description *'}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="style Description"
              placeholderTextColor="#000"
              value={styleDesc}
              onChangeText={text => setStyleDesc(text)}
            />
          </View>
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Dealer Price *'}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="Dealer Price"
              placeholderTextColor="#000"
              value={dealerPrice > 0 ? dealerPrice.toString() : ''}
              onChangeText={text => {
                setDealerPrice(text);
                updateAllItems('dealerPrice', text);
              }}
            />
          </View>
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Retailer Price '}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
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
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'MRP '}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="MRP"
              placeholderTextColor="#000"
              value={mrp > 0 ? mrp.toString() : ''}
              onChangeText={text => {
                setMrp(text);
                updateAllItems('mrp', text);
              }}
            />
          </View>
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Fixed Discount '}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="Fixed Discount "
              placeholderTextColor="#000"
              value={fixedDiscount > 0 ? fixedDiscount.toString() : ''}
              onChangeText={text => setfixedDiscount(text)}
            />
          </View>
          <Text style={style.headerTxt}>{'Customer Level '}</Text>

          <View style={{ flexDirection: 'row', marginTop: 13 }}>
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
              onPress={handleCustomerLevelDropDown}>
              <Text style={{ fontWeight: '600', color: '#000' }}>
                {selectedCustomerLevel ? selectedCustomerLevel : 'Select'}
              </Text>

              <Image
                source={require('../../../assets/dropdown.png')}
                style={{ width: 20, height: 20 }}
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
                <Text style={style.noCategoriesText}>
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

              <View style={style.inputContainer}>
                <TextInput
                  style={style.txtinput}
                  placeholder="Customer Level Price "
                  placeholderTextColor="#000"
                  value={
                    customerLevelPrice > 0 ? customerLevelPrice.toString() : ''
                  }
                  onChangeText={text => setCustomerLevelPrice(text)}
                />
              </View>
            </>
          )}
          <Text style={style.headerTxt}>{'Color  *'}</Text>

          {/* <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={[style.container3, {backgroundColor:editColor?'#fff':'#f1e8e6'}]}
                onPress={handleColorDropDown}>
                <Text style={{ fontWeight: '600', color: "#000" }}>
                  {selectedColorId ? selectedColor : "Select"}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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
                backgroundColor:'#fff',
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
                onChangeText={filterColors}
              />

              {filteredColorList.length === 0 && !isLoading ? (
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
                      onPress={() => handleSelectColor(item)
                      }>
                      <Text
                        style={{
                          fontWeight: '600',
                          marginHorizontal: 15,
                          color: '#000',
                        }}>
                        {item?.colorName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )} */}
          <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={[
                  style.container3,
                  { backgroundColor: editColor ? '#fff' : '#f1e8e6' },
                ]}
                onPress={handleColorDropDown}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedColorIds.length > 0
                    ? filteredColorList
                      .filter(color =>
                        selectedColorIds.includes(color.colorId),
                      )
                      .map(color => color.colorName)
                      .join(', ')
                    : 'Select'}
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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
                  <Text style={{ color: '#000', marginLeft: 10 }}>
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
                          isChecked={selectedColorIds.includes(item.colorId)}
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
          )}

          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'Color Code '}
          </Text>
          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="Color Code"
              placeholderTextColor="#000"
              editable={false}
              value={colorCode}
              onChangeText={text => setColorCode(text)}
            />
          </View>

          <Text style={style.headerTxt}>{'Types *'}</Text>

          <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={style.container3}
                onPress={handleTypesDropDown}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedType ? selectedType : 'Select'}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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
          )}

          <Text style={style.headerTxt}>{'Season Groups *'}</Text>

          <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={[
                  style.container3,
                  { backgroundColor: editColor ? '#fff' : '#f1e8e6' },
                ]}
                onPress={handleSeasonGroupsDropDown}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedSeasonGroup ? selectedSeasonGroup : 'Select'}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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
          </View>
          {showSeasonGroupsList && editSeasonGroup && (
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
          )}
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'GSM  '}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="GSM  "
              placeholderTextColor="#000"
              value={gsm}
               keyboardType='numeric'
              onChangeText={text => setGsm(text)}
            />
          </View>
          <Text
            style={{ marginHorizontal: 20, marginVertical: 3, color: '#000' }}>
            {'HSN'}
          </Text>

          <View style={style.inputContainer}>
            <TextInput
              style={style.txtinput}
              placeholder="HSN  "
              placeholderTextColor="#000"
              value={hsn}
              keyboardType='numeric'
              onChangeText={text => setHsn(text)}
            />
          </View>

          {/* Closure Dropdown */}
          {kapture_task_flag === 1 && (
            <View style={style.dropdownContainer}>
              <Text style={style.headerTxt}>{'Closure'}</Text>
              <View style={style.container1}>
                <View style={style.container2}>
                  <TouchableOpacity
                    style={style.dropdownButton}
                    onPress={toggleClosure}>
                    <Text style={{ fontWeight: '600', color: '#000' }}>
                      {selectedClosureId ? selectedClosure : 'Select'}
                    </Text>
                    <Image
                      style={{ width: 20, height: 20 }}
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
                      <Text style={{ color: '#000' }}>Loading...</Text>
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
          )}

          {/* Peak Dropdown */}
          {kapture_task_flag === 1 && (
            <View style={style.dropdownContainer}>
              <Text style={style.headerTxt}>{'Peak'}</Text>
              <View style={style.container1}>
                <View style={style.container2}>
                  <TouchableOpacity
                    style={style.dropdownButton}
                    onPress={togglePeak}>
                    <Text style={{ fontWeight: '600', color: '#000' }}>
                      {selectedPeakId ? selectedPeak : 'Select'}
                    </Text>
                    <Image
                      style={{ width: 20, height: 20 }}
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
                      <Text style={{ color: '#000' }}>Loading...</Text>
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
          )}

          {/* Logo Dropdown */}
          {kapture_task_flag === 1 && (
            <View style={style.dropdownContainer}>
              <Text style={style.headerTxt}>{'Logo'}</Text>
              <View style={style.container1}>
                <View style={style.container2}>
                  <TouchableOpacity
                    style={style.dropdownButton}
                    onPress={toggleLogo}>
                    <Text style={{ fontWeight: '600', color: '#000' }}>
                      {selectedLogoId ? selectedLogo : 'Select'}
                    </Text>
                    <Image
                      style={{ width: 20, height: 20 }}
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
                      <Text style={{ color: '#000' }}>Loading...</Text>
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
          )}
          {/* Decoration Dropdown */}
          {kapture_task_flag === 1 && (
            <View style={style.dropdownContainer}>
              <Text style={style.headerTxt}>{'Decoration'}</Text>
              <View style={style.container1}>
                <View style={style.container2}>
                  <TouchableOpacity
                    style={style.dropdownButton}
                    onPress={toggleDecoration}>
                    <Text style={{ fontWeight: '600', color: '#000' }}>
                      {selectedDecorationId ? selectedDecoration : 'Select'}
                    </Text>
                    <Image
                      style={{ width: 20, height: 20 }}
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
                      <Text style={{ color: '#000' }}>Loading...</Text>
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
          )}
          {/* Trims Dropdown */}
          {kapture_task_flag === 1 && (
            <View style={style.dropdownContainer}>
              <Text style={style.headerTxt}>{'Trims'}</Text>
              <View style={style.container1}>
                <View style={style.container2}>
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
                    onPress={toggleTrims}>
                    <Text style={{ fontWeight: '600', color: '#000' }}>
                      {selectedTrimsId ? selectedTrims : 'Select'}
                    </Text>
                    <Image
                      style={{ width: 20, height: 20 }}
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
                      <Text style={{ color: '#000' }}>Loading...</Text>
                    ) : filteredTrimsData.length === 0 && !isKaptureLoading ? (
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
          )}
          {cedge_flag === 1 && (
            <Text style={style.headerTxt}>{'Process Work Flow *'}</Text>
          )}

          {cedge_flag === 1 && (
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
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
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedProcessWorkflow ? selectedProcessWorkflow : 'Select'}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
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

          <Text style={style.headerTxt}>{'Location *'}</Text>

          <View style={{ flexDirection: 'row', marginTop: 10 }}>
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
                backgroundColor: editColor ? '#fff' : '#f1e8e6',
              }}
              onPress={handleLocationDropDown}>
              <Text style={{ fontWeight: '600', color: '#000' }}>
                {selectedLocation ? selectedLocation : 'Select'}
              </Text>

              <Image
                source={require('../../../assets/dropdown.png')}
                style={{ width: 20, height: 20 }}
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
          )}
          <Text style={style.headerTxt}>{'Scales *'}</Text>

          <View style={style.container1}>
            <View style={style.container2}>
              <TouchableOpacity
                style={[
                  style.container3,
                  { backgroundColor: editColor ? '#fff' : '#f1e8e6' },
                ]}
                onPress={handleScalesDropDown}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {selectedScale ? selectedScale : 'Select'}
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>
            <View style={style.container4}>
              <TouchableOpacity
                onPress={toggleScalesModal}
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
          {showScalesList && editScale && (
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
          )}

          {/* Models */}

          <Modal
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
                    backgroundColor: '#1F74BA',
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
                    style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>
                    {'Add New Category'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseCategoryModal}
                    style={{ alignSelf: 'flex-end' }}>
                    <Image
                      style={{ height: 30, width: 30, marginRight: 5 }}
                      source={require('../../../assets/close.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#000' }}>{'Category Name * '}</Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmCategoryName(text)}
                />

                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                  {'Category Description * '}
                </Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmCategoryDesc(text)}
                />
                <TouchableOpacity
                  style={style.saveButton}
                  // style={[style.saveButton, processing && { opacity: 0.5 }]}
                  onPress={ValidateNewCategory}
                  disabled={processing}>
                  <Text style={style.saveButtonText}>{processing ? "Processing..." : "Save"}</Text>
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
            <View style={style.modalContainerr}>
              <View style={style.modalContentt}>
                <View
                  style={{
                    backgroundColor: '#1F74BA',
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
                    style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>
                    {'Add New Color'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseColorModal}
                    style={{ alignSelf: 'flex-end' }}>
                    <Image
                      style={{ height: 30, width: 30, marginRight: 5 }}
                      source={require('../../../assets/close.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#000' }}>{'Color Name * '}</Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmColorName(text)}
                />

                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                  {'Color Description * '}
                </Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmColorDesc(text)}
                />

                <Text style={{ fontWeight: 'bold', color: '#000' }}>{'Color Code '}</Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmColorCode(text)}
                />
                <TouchableOpacity
                  // style={style.saveButton}
                  style={[style.saveButton, processing && { opacity: 0.5 }]}
                  onPress={ValidateNewColor}
                  disabled={processing}>
                  <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={typesModal && editShortcutKey}
            onRequestClose={() => {
              toggleTypesModal();
            }}>
            <View style={style.modalContainerr}>
              <View style={style.modalContentt}>
                <View
                  style={{
                    backgroundColor: '#1F74BA',
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
                    style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>
                    {'Add New Type'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseTypesModal}
                    style={{ alignSelf: 'flex-end' }}>
                    <Image
                      style={{ height: 30, width: 30, marginRight: 5 }}
                      source={require('../../../assets/close.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#000' }}>{'Type Name * '}</Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmTypeName(text)}
                />

                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                  {'Type Description * '}
                </Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmTypeDesc(text)}
                />

                <TouchableOpacity
                  // style={style.saveButton}
                  style={[style.saveButton, processing && { opacity: 0.5 }]}

                  onPress={ValidateNewType}
                  disabled={processing}>
                  <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
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
            <View style={style.modalContainerr}>
              <View style={style.modalContentt}>
                <View
                  style={{
                    backgroundColor: '#1F74BA',
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
                    style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>
                    {'Add New Season Group'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseSeasonGroupsModal}
                    style={{ alignSelf: 'flex-end' }}>
                    <Image
                      style={{ height: 30, width: 30, marginRight: 5 }}
                      source={require('../../../assets/close.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                  {'Season Group Name * '}
                </Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmSeasonGroupName(text)}
                />

                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                  {'Season Group Description * '}
                </Text>
                <TextInput
                  style={[style.input, { color: '#000' }]}
                  placeholder=""
                  placeholderTextColor="#000"
                  onChangeText={text => setmSeasonGroupDesc(text)}
                />

                <TouchableOpacity
                  // style={style.saveButton}
                  style={[style.saveButton, processing && { opacity: 0.5 }]}
                  onPress={ValidateSeasonGroup}
                  disabled={processing}>
                  <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
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
                      backgroundColor: '#1F74BA',
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
                        { textAlign: 'center', flex: 1 },
                      ]}>
                      {'Add New Scale'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseScalesModal}
                      style={{ alignSelf: 'flex-end' }}>
                      <Image
                        style={{ height: 30, width: 30, marginRight: 5 }}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontWeight: 'bold', color: '#000' }}>{'Size * '}</Text>
                  <TextInput
                    style={[style.input, { color: '#000' }]}
                    placeholder=""
                    placeholderTextColor="#000"
                    onChangeText={text => setmSize(text)}
                  />
                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && { opacity: 0.5 }]}

                    onPress={ValidateNewScale}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
                  </TouchableOpacity>

                  <Text style={[style.headerTxt, { textAlign: 'left' }]}>
                    {'Season Group *'}
                  </Text>

                  <View style={{ flexDirection: 'row', marginTop: 13 }}>
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
                      onPress={handleModalSeasonGroupsDropDown}>
                      <Text style={{ fontWeight: '600', color: '#000' }}>
                        {selectedModalSeasonGroup
                          ? selectedModalSeasonGroup
                          : 'Select'}
                      </Text>

                      <Image
                        source={require('../../../assets/dropdown.png')}
                        style={{ width: 20, height: 20 }}
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
                          {filteredModalSeasonGroupsList?.map((item, index) => (
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
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}

                  <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#000' }}>
                    {'Sizes :'}
                  </Text>

                  <View style={{ height: 180, width: '90%', marginTop: 10 }}>
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
                            onPress={() => handleSelectallSizesInScales(item)}>
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
                    style={[style.saveButton, processing && { opacity: 0.5 }]}
                    onPress={handleSaveNewSizesToSeasonGroup}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Modal>

          {/* Closure Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={closureModal && editShortcutKey}
            onRequestClose={toggleClosureModal}>
            <ScrollView>
              <View style={style.modalContainerr1}>
                <View style={style.modalContentt}>
                  <View style={style.modalHeader}>
                    <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}> {'Add New Closure'}</Text>
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
                    style={[style.saveButton, processing && { opacity: 0.5 }]}
                    disabled={processing}
                    onPress={() => ValidateAllKapture(1, 'Closure', closureName)}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
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
              <View style={style.modalContainerr1}>
                <View style={style.modalContentt}>
                  <View style={style.modalHeader}>
                    <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}> {'Add New Peak'}</Text>
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
                    style={[style.saveButton, processing && { opacity: 0.5 }]}
                    onPress={() => ValidateAllKapture(2, 'Peak', peakName)}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
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
              <View style={style.modalContainerr1}>
                <View style={style.modalContentt}>
                  <View style={style.modalHeader}>
                    <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}> {'Add New Logo'}</Text>
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
                    style={[style.saveButton, processing && { opacity: 0.5 }]}

                    onPress={() => ValidateAllKapture(3, 'Logo', logoName)}
                    disabled={processing}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
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
              <View style={style.modalContainerr1}>
                <View style={style.modalContentt}>
                  <View style={style.modalHeader}>
                    <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}> {'Add New Decoration'}</Text>
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
                    style={[style.saveButton, processing && { opacity: 0.5 }]}

                    onPress={() =>
                      ValidateAllKapture(4, 'Decoration', decorationName)
                    }
                    disabled={processing}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
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
                  <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}> {'Trims Name *'}</Text>
                  <TextInput
                    style={style.input}
                    placeholder="Enter Trims Name"
                    placeholderTextColor="#000"
                    value={trimsName}
                    onChangeText={setTrimsName}
                  />
                  <TouchableOpacity
                    // style={style.saveButton}
                    style={[style.saveButton, processing && { opacity: 0.5 }]}
                    disabled={processing}
                    onPress={() => ValidateAllKapture(5, 'Trim', trimsName)}>
                    <Text style={style.saveButtonText}>{processing ? "Processing" : "Save"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Modal>

          {showScaleTable && (
            <View style={style.container}>
              <View style={style.header}>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>Id</Text>
                </View>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>Size</Text>
                </View>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>Dealer Price</Text>
                </View>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>Retailer Price</Text>
                </View>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>MRP</Text>
                </View>
                <View style={style.headerCell}>
                  <Text style={style.headerText}>Available Quantity</Text>
                </View>
              </View>

              <ScrollView>
                {selectedSizes.map((item, index) => (
                  <View key={index} style={style.row}>
                    <View style={style.cell}>
                      <Text style={style.cellText}>{item?.sizeId}</Text>
                    </View>
                    <View style={style.cell}>
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
          )}

          <TouchableOpacity
            style={{
              backgroundColor: nextButton ? '#1F74BA' : 'skyblue',
              padding: 10,
              borderRadius: 5,
              marginTop: 20,
              width: '90%',
              marginHorizontal: 20,
            }}
            onPress={handleNextPage}
            disabled={!nextButton}>
            <Text style={style.saveButtonText}>Next</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 50 }} />
        </ScrollView>
      )}
    </>
  );
};

const style = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: '#fff',
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
    height: 50,
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
    color: "#000"
  },
  saveButton: {
    backgroundColor: '#1F74BA',
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
    padding: 10,
    marginBottom: 5,
    width: '100%',
    color: 'black',
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
  },

  container: {
    flex: 1,
    padding: 10,
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
    paddingHorizontal: 5,
  },
  cellText: {
    color: '#000',
    textAlign: 'center',
  },
  dropdownButton: {
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
  },
  dropdownContent: {
    elevation: 5,
    height: 300,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
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
    backgroundColor: '#1F74BA',
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
    height: 30, width: 30, marginRight: 5
  }
  // input1: {
  //   height: 40,
  //   borderColor: '#ddd',
  //   borderWidth: 1,
  //   borderRadius: 5,
  //   paddingHorizontal: 10,
  // },
});

export default NewStyleDetail;
