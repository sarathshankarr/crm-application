import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

const useOnlineStatus = () => {
  const [onlineStatus, setOnlineStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(state.isConnected);
      console.log("Is connected?", state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return onlineStatus;
};

export default useOnlineStatus;
