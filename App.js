import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Button,
} from "react-native";
import Wifi from "react-native-wifi-reborn";

import { GetDistance } from "./utils/DistanceUtil";
import { getIntersectionCoordinates } from "./utils/IntersectionCoordinates";

const getPermission = async (setPermission) => {
  const permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location permission is required for WiFi connections",
      message:
        "This app needs location permission as this is required  " +
        "to scan for wifi networks.",
      buttonNegative: "DENY",
      buttonPositive: "ALLOW",
    }
  );
  setPermission(permission);
};

const avgWifiInfos = async (configurationSteps) => {
  let wifiInfos = [];
  if (configurationSteps.length === 0) {
    while (wifiInfos.length < 4) {
      await Wifi.reScanAndLoadWifiList().then((wifiList) => {
        wifiInfos = wifiInfos.concat(wifiList);
      });
    }
    wifiInfos.sort((a, b) => {
      return Math.abs(a.level) - Math.abs(b.level);
    });
  } else {
    while (wifiInfos.length != configurationSteps[0].wifiInfos.length) {
      await Wifi.reScanAndLoadWifiList().then((wifiList) => {
        wifiInfos = wifiList.filter(
          (wifi) =>
            configurationSteps[0].wifiInfos.filter(
              (wifi2) => wifi2.BSSID === wifi.BSSID
            ).length > 0
        );
      });
    }
  }

  wifiInfos = wifiInfos.slice(0, 4).map((wifi) => ({ ...wifi, amount: 1 }));
  for (let i = 0; i < 2; ) {
    const tempWifiInfos = [];
    await Wifi.reScanAndLoadWifiList().then((wifiList) => {
      for (let wifi of wifiList) {
        const filteredWifiInfos = wifiInfos.filter(
          (wifiInfo) => wifiInfo.BSSID === wifi.BSSID
        );
        if (filteredWifiInfos.length > 0) {
          tempWifiInfos.push(wifi);
        }
      }
    });
    if (tempWifiInfos.length != wifiInfos.length) {
      continue;
    }
    for (let tempWifiInfo of tempWifiInfos) {
      const currentWifi = wifiInfos.filter(
        (wifiInfo) => wifiInfo.BSSID === tempWifiInfo.BSSID
      )[0];
      const indexOfCurrentWifi = wifiInfos.indexOf(currentWifi);
      wifiInfos[indexOfCurrentWifi].level += tempWifiInfo.level;
      wifiInfos[indexOfCurrentWifi].amount += 1;
    }
    i++;
  }
  wifiInfos = wifiInfos.map((wifi) => ({
    ...wifi,
    level: wifi.level / wifi.amount,
  }));
  return wifiInfos;
};

const getWifiListForConfigurations = async (
  configurationSteps,
  setConfigurationSteps,
  setIsDataLoaded,
  configurationsCoordinates
) => {
  setIsDataLoaded(false);
  const wifiInfos = (await avgWifiInfos(configurationSteps)).map((wifi) =>
    AddDistanceInfo(wifi)
  );
  setConfigurationSteps((prev) => [
    ...prev,
    {
      configurationCoordinates: configurationsCoordinates,
      wifiInfos: wifiInfos,
    },
  ]);
  setIsDataLoaded(true);
};

const AddDistanceInfo = (wifi) => {
  return {
    SSID: wifi.SSID,
    BSSID: wifi.BSSID,
    distance: GetDistance(wifi.frequency, wifi.level),
  };
};

export default function App() {
  const [permission, setPermission] = useState();
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  const [configurationSteps, setConfigurationSteps] = useState([]);
  const [configurationCoordinates, setConfigurationCoordinates] = useState({});
  const [wifiCoordinates, setWifiCoordinates] = useState([]);

  const currentStep = configurationSteps.length;

  useEffect(() => {
    getPermission(setPermission);
  }, []);

  useEffect(() => {
    switch (currentStep) {
      case 0:
        setConfigurationCoordinates({ x: 0, y: 0, z: 0 });
        break;
      case 1:
        setConfigurationCoordinates({ x: 0, y: 3.5, z: 0 });
        break;
      case 2:
        setConfigurationCoordinates({ x: 3.5, y: 3.5, z: 0 });
        break;
      case 3:
        setConfigurationCoordinates({ x: 3.5, y: 0, z: 0 });
        break;
      default:
        setWifiCoordinates(getIntersectionCoordinates(configurationSteps));
        break;
    }
  }, [configurationSteps]);

  const configureButtonClickHandler = () => {
    getWifiListForConfigurations(
      configurationSteps,
      setConfigurationSteps,
      setIsDataLoaded,
      configurationCoordinates
    );
  };

  return (
    <View style={styles.container}>
      {permission === PermissionsAndroid.RESULTS.GRANTED && (
        <>
          {currentStep < 4 && (
            <>
              {isDataLoaded === false && <Text>Loading...</Text>}
              {isDataLoaded === true && (
                <Text>
                  {currentStep === 0 &&
                    "Stay on your position and click configure."}
                  {currentStep === 1 &&
                    "Make 5 steps forward and click configure."}
                  {currentStep > 1 &&
                    "Make 5 steps to the right and click configure."}
                </Text>
              )}
              <Button
                title="Configure"
                onPress={configureButtonClickHandler}
                disabled={!isDataLoaded}
              />
              <View>
                {configurationSteps.map((step) => (
                  <Text>{JSON.stringify(step)}</Text>
                ))}
              </View>
            </>
          )}
          {currentStep === 4 && (
            <View>
              {wifiCoordinates.map((step) => (
                <Text>{JSON.stringify(step)}</Text>
              ))}
            </View>
          )}
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
