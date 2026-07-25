export function calculateLiveStatus(train: any, route: any) {
  const AVG_SPEED_KMH = 60; // 1 km/min
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const depTime = train.departureTime || "00:00";
  const [depH, depM] = (typeof depTime === "string" && depTime.includes(':')) ? depTime.split(':').map(Number) : [0, 0];
  const startMinutes = depH * 60 + depM;

  let elapsedMins = currentMinutes - startMinutes;
  
  // If the departure time was yesterday (e.g. current time is 01:00 AM, departure was 23:00 PM)
  if (elapsedMins < -720) {
    elapsedMins += 24 * 60;
  }
  
  // If the train hasn't departed yet today
  if (elapsedMins < 0) {
    return {
      status: "NOT_STARTED",
      currentLocation: route.stations[0].station.name,
      nextStation: route.stations[0].station.name,
      speed: 0,
      eta: train.departureTime,
      platform: "TBD",
      delay: "On Time",
      progress: 0,
      timeline: []
    };
  }

  let cumulativeTime = 0;
  let previousStation: any = null;
  let nextStation: any = null;
  let isHalted = false;
  let progress = 0;
  let speed = AVG_SPEED_KMH;
  let eta = "";
  
  const timeline = route.stations.map((rs: any, index: number) => {
    const isSource = index === 0;
    const isDest = index === route.stations.length - 1;
    
    const travelTime = Math.round(rs.distanceFromSource * (60 / AVG_SPEED_KMH));
    const arrivalTime = cumulativeTime + travelTime;
    
    let state = "FUTURE";
    if (elapsedMins >= arrivalTime + (rs.haltDuration || 0)) {
      state = "PASSED";
    } else if (elapsedMins >= arrivalTime && elapsedMins < arrivalTime + (rs.haltDuration || 0)) {
      state = "HALTED";
    }

    // Capture the exact segment we are in
    if (!previousStation && state === "FUTURE") {
      previousStation = route.stations[index - 1] || route.stations[0];
      nextStation = rs;
      isHalted = false;
      
      const segmentStart = (index === 0) ? 0 : (cumulativeTime + Math.round(route.stations[index-1].distanceFromSource * (60/AVG_SPEED_KMH)) + (route.stations[index-1].haltDuration||0));
      const segmentEnd = arrivalTime;
      const segmentElapsed = elapsedMins - segmentStart;
      const segmentTotal = segmentEnd - segmentStart;
      progress = Math.min(100, Math.max(0, (segmentElapsed / segmentTotal) * 100));
      
      const etaMins = startMinutes + arrivalTime;
      const h = String(Math.floor(etaMins / 60) % 24).padStart(2, '0');
      const m = String(etaMins % 60).padStart(2, '0');
      eta = `${h}:${m}`;
    } else if (!previousStation && state === "HALTED") {
      previousStation = rs;
      nextStation = route.stations[index + 1] || rs;
      isHalted = true;
      progress = 100;
      speed = 0;
      const etaMins = startMinutes + arrivalTime + (rs.haltDuration || 0);
      const h = String(Math.floor(etaMins / 60) % 24).padStart(2, '0');
      const m = String(etaMins % 60).padStart(2, '0');
      eta = `${h}:${m} (Departs)`;
    }

    cumulativeTime += travelTime + (rs.haltDuration || 0);

    return {
      name: rs.station.name,
      code: rs.station.code,
      state,
      distance: rs.distanceFromSource
    };
  });

  if (!nextStation) {
    // Reached destination
    const dest = route.stations[route.stations.length - 1];
    return {
      status: "COMPLETED",
      currentLocation: dest.station.name,
      nextStation: "Destination Reached",
      speed: 0,
      eta: "Arrived",
      platform: "1",
      delay: "On Time",
      progress: 100,
      timeline
    };
  }

  return {
    status: isHalted ? "HALTED" : "RUNNING",
    currentLocation: isHalted ? previousStation.station.name : `Between ${previousStation.station.name} and ${nextStation.station.name}`,
    nextStation: nextStation.station.name,
    speed: isHalted ? 0 : speed + Math.floor(Math.random() * 10 - 5), // Slight fluctuation for realism
    eta,
    platform: Math.floor(Math.random() * 4) + 1, // Random platform 1-4
    delay: "On Time", // Could add random delay logic here
    progress,
    timeline
  };
}
