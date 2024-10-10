import React from 'react';
import {Text, View, Image, StyleSheet, TextInput} from 'react-native';
const SignUp = () => {
  return (
    <View>
      <View style={style.imgheader}>
        <Image
          style={style.signupimg}
          source={require('../../../assets/loginbg.png')}></Image>
      </View>
      <Text style={style.createyouraccount}>Create your Account</Text>
      <View style={style.emailbox}>
        <TextInput
        placeholder='Email'
        />
      </View>
    </View>
  );
};
const style = StyleSheet.create({
  signupimg: {
    width: 103.96,
    height: 103.96,
  },
  imgheader: {
    marginTop: 50,
    marginLeft: 30,
  },
  createyouraccount: {
    fontSize: 20,
    marginLeft: 30,
    marginTop: 15,
  },
  emailbox: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    marginHorizontal:25,
  },
});
export default SignUp;
