import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Pages/Login/Login';
import Splash from '../Pages/Splash';
import Details from '../Pages/details/Details';
import Main from '../Pages/main/Main';
import Cart from '../Pages/cart/Cart';
import Profile from '../Pages/editprofile/EditProfile';
import AllCategoriesListed from '../Pages/allcategorieslisted/AllCategoriesListed';
import CommonHeader from '../components/CommonHeader';
import AddNote from '../Pages/notes/AddNote';
import LoaderComponent from '../utils/loaderComponent/loaderComponent';
import CustomDropDown from '../components/CustomDropDown';
import ProductInventory from '../Pages/inventory/ProductInventory';
import LocationInventory from '../Pages/inventory/LocationInventory';
import SignUp from '../Pages/signup/SignUp';
import ImageSlider from '../components/ImageSlider';
import CommenHeaderHomeScreen from '../components/CommenHeaderHomeScreen';
import PackingOrders from '../Pages/Packingorders/PackingOrders';
import DistributorGrn from '../Pages/distributorgrn/DistributorGrn';
import DistributorOrder from '../Pages/distributororder/DistributorOrder';
import ModalScreen from '../components/ModalScreen';
import Activities from '../Pages/activities/Activities';
import NewTask from '../Pages/activities/NewTask';
import NewCall from '../Pages/activities/NewCall';
import CustomCheckBox from '../components/CheckBox';
import CustomerLocation from '../Pages/loc/CustomerLocation';
import ProductPackagePublish from '../Pages/publish/ProductPackagePublish';
import ProductsStyles from '../Pages/product/ProductsStyles';
import AddNewStyle from '../Pages/product/AddNewStyle';
import NewStyleDetail from '../Pages/product/NewStyleDetail';
import UploadProductImage from '../Pages/product/UploadProductImage';
import TaskDetails from '../Pages/loc/TaskDetails';
import NewCategoryUi from '../Pages/newCategoriesUi/NewCategoryUi';
import Packorders from '../Pages/ordersdetails/Packorders';
import PackingConformation from '../Pages/ordersdetails/PackingConformation';
import CustomCheckBoxStatus from '../components/CustomCheckBoxStatus';
import Location from '../Pages/location/Location';
import Files from '../Pages/loc/Files';
import Notifications from '../Pages/notification/Notifications';
import DistributorInventory from '../Pages/inventory/DistributorInventory';
import Attendence from '../Pages/attendence/Attendence';
import Packages from '../Pages/product/Packages';
import PackageDetail from '../Pages/product/PackageDetail';
import MailConfirmation from '../Pages/forgetPassword/MailConfirmation';
import ConfirmPassword from '../Pages/forgetPassword/ConfirmPassword';
import EnterOtp from '../Pages/forgetPassword/EnterOtp';
import ImageSliderPackages from '../components/ImageSliderPackages';
import QRCodeScanner from '../Pages/scan/QrScanner';
import Costing from '../Pages/styles/Costing';
import NewCosting from '../Pages/styles/NewCosting';
import Cushion from '../Pages/styles/Cushion';
import {Settings} from 'react-native';
import SettingsScreen from '../settings/SettingsScreen';
import CompanyDropdown from '../components/CompanyDropdown';
import CopyProduct from '../Pages/product/CopyProduct';
// import DistributorPayments from '../Pages/payments/DistributorPayments';
import DistributorPayments from '../Pages/payments/ DistributorPayments';
import PickList from '../Pages/Packingorders/PickList';
import PickListEdit from '../Pages/Packingorders/PickListEdit';
import GoogleMap from '../components/GoogleMap';
import CameraScreen from '../components/CameraScreen';
import LocationEdit from '../Pages/master/LocationEdit';
import AddNewLocation from '../Pages/master/AddNewLocation';
import MasterLocation from '../Pages/master/MasterLocation';
import OrderReturns from '../Pages/orderreturns/OrderReturns';
import OrderReturnsEdit from '../Pages/orderreturns/OrderReturnsEdit';
import PriceList from '../Pages/product/PriceList';
import CreditNotes from '../Pages/creditnotes/CreditNotes';
import CreditNotesEdit from '../Pages/creditnotes/CreditNotesEdit';

const Stack = createNativeStackNavigator();

const Routes = () => {
  return (
    <Stack.Navigator
    screenOptions={({ navigation, route }) => ({
      header: () => {
        return (
          <CommenHeaderHomeScreen
            navigation={navigation}
            title={route.name}
            showMessageIcon={true}
            showCartIcon={true}
            showLocationIcon={true}
          />
        );
      },
    })}
  >
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={Main}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Details"
        component={Details}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Details" />,
        }}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        options={({navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title="Order Preview"
              showMessageIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="AllCategoriesListed"
        component={AllCategoriesListed}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="AllCategoriesListed" />,
        }}
      />
      <Stack.Screen
        name="NewCategoryUi"
        component={NewCategoryUi}
        options={({route, navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title={`NewCategoryUi`} // Set the header title dynamically
              showMessageIcon={true}
              showCartIcon={true}
              showLocationIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />
      <Stack.Screen
        name="Add Note"
        component={AddNote}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="LoaderComponent"
        component={LoaderComponent}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="CustomDropDown"
        component={CustomDropDown}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="ProductInventory"
        component={ProductInventory}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="ProductInventory" />,
        }}
      />
      <Stack.Screen
        name="LocationInventory"
        component={LocationInventory}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Location Inventory" />,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ImageSlider"
        component={ImageSlider}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CommenHeaderHomeScreen"
        component={CommenHeaderHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PackingOrders"
        component={PackingOrders}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Distributor GRN"
        component={DistributorGrn}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Distributor GRN" />,
        }}
      />
      <Stack.Screen
        name="DistributorOrder"
        component={DistributorOrder}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ModalScreen"
        component={ModalScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Activities"
        component={Activities}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Location Inventory" />,
        }}
      />
      <Stack.Screen
        name="NewTask"
        component={NewTask}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NewCall"
        component={NewCall}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StyleDetails"
        component={NewStyleDetail}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UploadProductImage"
        component={UploadProductImage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CustomCheckBox"
        component={CustomCheckBox}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CustomerLocation"
        component={CustomerLocation}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="ProductPackagePublish" />,
        }}
      />
      <Stack.Screen
        name="ProductPackagePublish"
        component={ProductPackagePublish}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="ProductPackagePublish" />,
        }}
      />
      <Stack.Screen
        name="ProductsStyles"
        component={ProductsStyles}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="ProductsStyles" />,
        }}
      />
      <Stack.Screen
        name="AddNewStyle"
        component={AddNewStyle}
        options={({navigation}) => ({
          // header: () => (
          //   <CommonHeader navigation={navigation} title="New Style" />
          // ),
          headerBackVisible: true,
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Packing orders"
        component={Packorders}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Packing orders" />,
        }}
      />
      <Stack.Screen
        name="PackingConformation"
        component={PackingConformation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CustomCheckBoxStatus"
        component={CustomCheckBoxStatus}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Files"
        component={Files}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DistributorInventory"
        component={DistributorInventory}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Distributor Inventory" />,
        }}
      />
      <Stack.Screen
        name="Attendence"
        component={Attendence}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Distributor Inventory" />,
        }}
      />
      <Stack.Screen
        name="Packages"
        component={Packages}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Packages" />,
        }}
      />
      <Stack.Screen
        name="PackageDetail"
        component={PackageDetail}
        options={({route, navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title={`PackageDetail`} // Set the header title dynamically
              showMessageIcon={true}
              showCartIcon={true}
              showLocationIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />

      <Stack.Screen
        name="MailConfirmation"
        component={MailConfirmation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ConfirmPassword"
        component={ConfirmPassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EnterOtp"
        component={EnterOtp}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ImageSliderPackages"
        component={ImageSliderPackages}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QRCodeScanner"
        component={QRCodeScanner}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Costing"
        component={Costing}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Costing" />,
        }}
      />
      <Stack.Screen
        name="NewCosting"
        component={NewCosting}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="NewCosting" />,
        }}
      />
      <Stack.Screen
        name="Cushion"
        component={Cushion}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="Cushion" />,
        }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="CopyProduct"
        component={CopyProduct}
        options={{headerShown: false}}
      />
          <Stack.Screen
        name="DistributorPayments"
        component={DistributorPayments}
        options={{headerShown: false}}
      />
     
<Stack.Screen
        name="PickList"
        component={PickList}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="PickList" />,
        }}
      />
      <Stack.Screen
        name="PickListEdit"
        component={PickListEdit}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="PickListEdit" />,
        }}
      />
        <Stack.Screen
        name="GoogleMap"
        component={GoogleMap}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="GoogleMap" />,
        }}
      />
       <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{
          headerShown: false,
          headerTitle: () => <CompanyDropdown title="CameraScreen" />,
        }}
      />
        <Stack.Screen
        name="MasterLocation"
        component={MasterLocation}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="MasterLocation" />,
        }}
      />
       <Stack.Screen
        name="LocationEdit"
        component={LocationEdit}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="LocationEdit" />,
        }}
      />
        <Stack.Screen
        name="AddNewLocation"
        component={AddNewLocation}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="AddNewLocation" />,
        }}
      />
        <Stack.Screen
        name="OrderReturns"
        component={OrderReturns}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="OrderReturns" />,
        }}
      />
       <Stack.Screen
        name="OrderReturnsEdit"
        component={OrderReturnsEdit}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="OrderReturnsEdit" />,
        }}
      />
        <Stack.Screen
        name="PriceList"
        component={PriceList}
        options={{
          headerShown: false,
          headerTitle: () => <CompanyDropdown title="PriceList" />,
        }}
        
      />
    <Stack.Screen
        name="CreditNotes"
        component={CreditNotes}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="CreditNotes" />,
        }}
        
      />
         <Stack.Screen
        name="CreditNotesEdit"
        component={CreditNotesEdit}
        options={{
          headerShown: true,
          headerTitle: () => <CompanyDropdown title="CreditNotesEdit" />,
        }}
        
      />

    </Stack.Navigator>
  );
};

export default Routes;
