const isPointInsideOfSphere = (x, y, z, sphere) => {
  const result =
    Math.pow(x - sphere.x, 2) +
    Math.pow(y - sphere.y, 2) +
    Math.pow(z - sphere.z, 2);
  return Math.pow(sphere.r, 2) == result;
};

export const getIntersectionCoordinates = (configurationSteps) => {
  const wifiCoordinates = [];
  for (let i = 0; i < configurationSteps[0].wifiInfos.length; i++) {
    const currentWifiSSID = configurationSteps[0].wifiInfos[i].SSID;
    const currentWifiInformation = [];
    console.log("-------");
    for (let j = 0; j < configurationSteps.length; j++) {
      const currentWifi = configurationSteps[j].wifiInfos.filter(
        (wifi) => wifi.SSID == currentWifiSSID
      )[0];
      const indexOfCurrentWifi =
        configurationSteps[j].wifiInfos.indexOf(currentWifi);
      currentWifiInformation.push({
        coordinates: configurationSteps[j].configurationCoordinates,
        distance: configurationSteps[j].wifiInfos[indexOfCurrentWifi].distance,
      });
    }
    console.log("-------");
    const y =
      (Math.pow(currentWifiInformation[0].distance, 2) -
        Math.pow(currentWifiInformation[1].distance, 2) +
        Math.pow(3.5, 2)) /
      7;
    const x =
      Math.pow(currentWifiInformation[0].distance, 2) -
      Math.pow(currentWifiInformation[2].distance, 2) / 7 +
      3.5 -
      y;

    console.log(
      Math.pow(currentWifiInformation[0].distance, 2) -
        Math.pow(x, 2) -
        Math.pow(y, 2)
    );
    const z1 = Math.sqrt(
      Math.pow(currentWifiInformation[0].distance, 2) -
        Math.pow(x, 2) -
        Math.pow(y, 2)
    );
    const z2 = z1 * -1;
    const z = isPointInsideOfSphere(x, y, z1, {
      r: currentWifiInformation[3].distance,
      x: currentWifiInformation[3].coordinates.x,
      y: currentWifiInformation[3].coordinates.y,
      z: currentWifiInformation[3].coordinates.z,
    })
      ? z1
      : z2;
    wifiCoordinates.push({
      SSID: currentWifiSSID,
      coordinates: {
        x: x,
        y: y,
        z: z,
      },
    });
  }
  return wifiCoordinates;
};
