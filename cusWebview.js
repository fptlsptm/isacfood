import * as React from 'react';
import {Text, View,StyleSheet, ToastAndroid, BackHandler,Alert,Platform,Toast,Linking ,NativeModules,TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
import { getStatusBarHeight } from 'react-native-status-bar-height';
//import AsyncStorage from '@react-native-community/async-storage';
// import IntentLauncher from 'react-native-intent-launcher';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
export default function CusWebview(props){
    
    const [urls, seTurls] = React.useState("");
    const [app_token,setToken] = React.useState("");
    const webViews = React.useRef();
    const setttingToken = async () =>{
        const token = await firebase.messaging().getToken();
        console.log("token",token);
        setToken(token);
    }
    const onShouldStartLoadWithRequest = (e) => {
        let wurl = e.url;
 

        let rs = true;
        var SendIntentAndroid = require('react-native-send-intent');
        if (!wurl.startsWith("http://")&& !wurl.startsWith("https://")&& !wurl.startsWith("javascript:")){
            if(Platform.OS=="android"){
                webViews.current.stopLoading();
                SendIntentAndroid.openChromeIntent(wurl)
                    .then(isOpened => {
                    if(!isOpened){ToastAndroid.show('어플을 설치해주세요.', ToastAndroid.SHORT);}
                });      
            }else{
                const supported = Linking.canOpenURL(wurl);
                if(supported){
                    Linking.openURL(wurl);
                }else{
                    alert("어플을 설치해주세요");
                }
            }
            rs = false;
        }
       
        return rs;
    }
    const onLoadEnd = (e) =>{
        seTurls(e.nativeEvent.url);
        webViews.current.injectJavaScript('set_token("'+app_token+'")'); 
    }

    const handleBackButton = () => {
        console.log(urls);
        if(urls=="" || urls == props.url || urls == props.url+"?ck_rn=react_native" || urls == "https://go123400.cafe24.com/pub"){
            Alert.alert(
                '어플을 종료할까요?','',
                [
                { text: '네', onPress: () =>  BackHandler.exitApp()},
                {text: '아니요'}
                ]
            );
    
        }else {
            webViews.current.goBack();
        }
        return true;
    }
    React.useEffect(async ()=>{      
        const unsubscribe = messaging().onMessage(async res =>{
            if(Platform.OS=="android"){
                Alert.alert(res.data.body.toString())
            }
            if(Platform.OS=="ios"){
                Alert.alert(res.notification.title,res.notification.body);
            }
       });
       return unsubscribe;
   },[]);
    React.useEffect(()=>{
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    },[]);
    React.useEffect(async ()=>{
        await setttingToken();
    },[]);
    
    return (
        <View style={styles.container}>
            <View style={styles.webView}>
            <WebView
                ref={webViews}
                source={{uri: props.url}}
                //source={{uri: props.url+"?ck_rn=react_native"}}
                //onMessage={(event)=> Alert.alert(event.nativeEvent.data, ToastAndroid.SHORT) }
                onShouldStartLoadWithRequest= {onShouldStartLoadWithRequest}
                onLoadEnd={onLoadEnd}
                javaScriptEnabledAndroid={true}
                allowFileAccess={true}
                renderLoading={true}
                mediaPlaybackRequiresUserAction={false}
                setJavaScriptEnabled = {false}
                scalesPageToFit={false}
                allowsBackForwardNavigationGestures={true}
                originWhitelist={['*']}
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
               
            />
          
            </View>
        </View>
    );
}
const marginH = getStatusBarHeight(true);
const styles = StyleSheet.create({
  container: {
    marginTop:marginH,
    borderTopWidth:1,
    borderColor:"#eee",
    flex: 1,
    backgroundColor: 'white',
  },
  webView: {
    flex: 12,
  },
  nav: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row'
  },
  nav_bnt: {
    width:"25%",
    height:"100%",
    backgroundColor: '#eee',
    textAlign:'center',
    justifyContent: 'center',
    alignItems:'center',
    lineHeight:50,
  },
  fonts:{
      fontSize:25,
  }

});
