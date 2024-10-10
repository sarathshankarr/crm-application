import React from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';


const NotificationModal = ({ isModalVisible, toggleModal, slideAnim, notifications }) => {
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationIcon}>{item.icon}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </View>
  );

  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="none"
      onRequestClose={toggleModal}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={toggleModal}
      />
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notifications</Text>
          <TouchableOpacity onPress={toggleModal}>
            <Image source={require('./../../assets/close.png')} style={styles.closeButton} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          style={styles.notificationList}
        />
      </Animated.View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    right: 0,
    top: '0%',
    height: '80%',
    width: '75%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1f74ba',
    padding: 5,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    tintColor: '#000',
    height: 25,
    width: 25,
  },
  notificationList: {
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  notificationIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  notificationMessage: {
    fontSize: 16,
  },
});

export default NotificationModal;



