import React, { useEffect, useState } from 'react';
import {
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

const Cushion = ({navigation}) => {
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        setSelectedId('2'); // Ensure "Bathmat" is selected when the screen loads
      }, []);
      const radioButtons = [
        {
          id: '1',
          label: 'Bathmat',
          value: 'bathmat',
          labelStyle: styles.radioLabel,
          color: '#1F74BA',
        },
        {
          id: '2',
          label: 'Cushion',
          value: 'cushion',
          labelStyle: styles.radioLabel,
          color: '#1F74BA',
        },
      ];

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
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.Topheader}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Image
                style={styles.backImage}
                source={require('../../../assets/back_arrow.png')}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Costing</Text>
          </View>
          <TouchableOpacity style={styles.rightSection}>
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
                placeholder="Embroider with Chenille"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
                placeholder="Overheads"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
                placeholder="Margin:"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
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
                placeholder="Unit Price"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.lengthhead}>
              <TextInput
                style={styles.lengthtext}
                placeholder="0"
                placeholderTextColor="#000"
              />
            </View>
          </View>
        </View>
        <View style={styles.descriptionhead}>
            <TextInput
              style={styles.descriptiontxt}
              placeholder="Description"
              placeholderTextColor="#000"
            />
          </View>
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
});
export default Cushion;
