import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Modal, ScrollView, TextInput } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addSelectedImage, deleteNoteAction, removeSelectedImage, setNoteDetails, setNoteSaved } from '../../redux/actions/Actions';

const AddNote = () => {
  const dispatch = useDispatch();
  const selectedImages = useSelector(state => state.selectedImages);
  const noteSaved = useSelector(state => state.noteSaved);
  const { title, description } = useSelector(state => state.noteDetails);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTittleVisible, setModalTittleVisible] = useState(false);
  const [noteModified, setNoteModified] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [isComponentMounted, setComponentMounted] = useState(false);

  const toggleModalTitle = () => {
    setModalTittleVisible(!modalTittleVisible);
  };

  useEffect(() => {
    // Initialize input fields with Redux state
    setInputTitle(title);
    setInputDescription(description);
  }, [title, description]);
  
  const handleSave = () => {
    if (inputTitle && inputDescription) {
      dispatch(setNoteDetails({ title: inputTitle, description: inputDescription }));
      dispatch(setNoteSaved(true));
      setNoteModified(true);
    }
    toggleModalTitle();
  };

  const handleCancel = () => {
    if (noteModified) {
      setInputTitle(title);
      setInputDescription(description);
      setNoteModified(false);
    }
    toggleModalTitle();
  };
  
  const addImageToSelection = (imageUri) => {
    dispatch(addSelectedImage(imageUri));
  };
  
  const removeImageFromSelection = (imageUri) => {
    dispatch(removeSelectedImage(imageUri));
  };
  
  const deleteNote = () => {
    // Dispatch an action to delete the note
    dispatch(deleteNoteAction()); // Assuming you have an action creator called deleteNoteAction
  };
  

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then((image) => {
        addImageToSelection(image.path);
        setModalVisible(false);
      })
      .catch((error) => {
        setModalVisible(false);
      });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then((image) => {
        addImageToSelection(image.path);
        setModalVisible(false);
      })
      .catch((error) => {
        setModalVisible(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleModalTitle}
        >
          <Image
            style={styles.buttonImage}
            resizeMode='cover'
            source={require('../../../assets/savee.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}
          style={styles.button}
        >
          <Image
            style={styles.buttonImage1}
            source={require('../../../assets/cam.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Text style={styles.txt}>AddNote</Text>
        <Text style={styles.txt}>Photos Notes</Text>
      </View>
      <ScrollView>
        <View style={{ marginTop: 20 }}>
          {selectedImages.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
                <TouchableOpacity style={{marginHorizontal:10,borderWidth:1,borderColor:'#000',paddingHorizontal:10,borderRadius:5}} >
                  <Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{marginHorizontal:10,borderWidth:1,borderColor:'#000',paddingHorizontal:10,borderRadius:5}} onPress={() => removeImageFromSelection(imageUri)}>
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View>
          {noteSaved ? (
            <View style={{borderWidth:1,borderColor:'#000',paddingVertical:30,marginHorizontal:20}}>
              <>
                <Text>Title: {title}</Text>
                <Text>Description: {description}</Text>
              </>
              <View style={{ flexDirection: 'row', justifyContent:'flex-end', flex: 1 }}>
                <TouchableOpacity onPress={toggleModalTitle} style={{borderWidth:1,borderColor:'#000',paddingHorizontal:10,borderRadius:5}} >
                  <Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPressIn={deleteNote}  style={{marginHorizontal:10,borderWidth:1,borderColor:'#000',borderRadius:5}}>
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalTittleVisible}
        onRequestClose={toggleModalTitle}>
        <View style={styles.tittleModelContainer}>
          <View style={styles.modalContentTittle}>
            <Text style={styles.modalTitle}>Add Text Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={inputTitle}
              onChangeText={setInputTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={inputDescription}
              onChangeText={setInputDescription}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.buttonTittle, styles.cancelButton]}
                onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonTittle, styles.saveButton]}
                onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={takePhotoFromCamera}>
              <Text>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={choosePhotoFromLibrary}>
              <Text>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff'
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 50,
    padding: 15,
  },
  buttonImage: {
    height: 50,
    width: 50,
  },
  buttonImage1: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  txt: {
    marginTop: 10,
    fontSize: 20,
    marginLeft: 15,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalCancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 10,
    marginTop: 10,
  },
  imageContainer: {
    width: '90%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 20,
    paddingVertical: 5
  },
  image: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
    resizeMode: 'cover', // or 'contain' depending on your requirement
    marginLeft: 10
  },
 
  tittleModelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentTittle: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '96%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonTittle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f00',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#390050',
  },
});

export default AddNote;
