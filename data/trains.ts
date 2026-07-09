export const trainsData = [
  // 1. Delhi - Mumbai
  { number: "12951", name: "Mumbai Rajdhani Express", routeId: "MMCT-NDLS", reverseRoute: "NDLS-MMCT", dep: "15:50", days: [0,1,2,3,4,5,6] },
  { number: "12953", name: "August Kranti Rajdhani", routeId: "MMCT-NZM", reverseRoute: "NZM-MMCT", dep: "16:10", days: [0,1,2,3,4,5,6] },
  { number: "12215", name: "Delhi Sarai Rohilla - Bandra Terminus Garib Rath", routeId: "DEE-BDTS", dep: "08:55", days: [2,4,6] },
  { number: "12905", name: "Howrah - Mumbai CSMT Superfast", routeId: "HWH-CSMT", dep: "14:05", days: [0,1,2,3,4,5,6] },
  { number: "19019", name: "Dehradun - Bandra Terminus Express", routeId: "DDN-BDTS", dep: "13:25", days: [0,1,2,3,4,5,6] },
  { number: "22415", name: "New Delhi - Valsad SF Express", routeId: "NDLS-BL", dep: "16:15", days: [2,4,6] },
  { number: "12959", name: "Dadar - Bhuj SF Express", routeId: "DR-BHUJ", dep: "00:05", days: [1,3,5] },
  { number: "12431", name: "Hazrat Nizamuddin - Trivandrum Rajdhani", routeId: "NZM-TVC", dep: "10:55", days: [0,1,2,3,4,5,6] },
  { number: "12171", name: "Mumbai LTT - Haridwar AC SF Express", routeId: "LTT-HW", dep: "07:55", days: [4] },
  
  // 2. Mumbai - Chennai
  { number: "12621", name: "Tamil Nadu Express", routeId: "MAS-NDLS", dep: "21:30", days: [0,1,2,3,4,5,6] },
  { number: "12213", name: "Yesvantpur - Delhi Sarai Rohilla Duronto", routeId: "YPR-DEE", dep: "23:40", days: [2,4,6] },
  { number: "12211", name: "Mumbai LTT - Krishnarajapuram SF Express", routeId: "LTT-KJM", dep: "14:20", days: [2] },
  { number: "12163", name: "Mumbai LTT - Chennai Egmore SF Express", routeId: "LTT-MS", dep: "18:40", days: [0,1,2,3,4,5,6] },
  { number: "11027", name: "Mumbai CSMT - Chennai Central Mail", routeId: "CSMT-MAS", dep: "23:45", days: [0,1,2,3,4,5,6] },
  { number: "22157", name: "Mumbai CSMT - Chennai Egmore SF Express", routeId: "CSMT-MS", reverseRoute: "LTT-MS", dep: "22:52", days: [1,3,5] },
  
  // 3. Kolkata - Delhi
  { number: "12301", name: "Howrah Rajdhani Express", routeId: "HWH-NDLS", dep: "17:30", days: [0,1,2,3,4,5,6] },
  { number: "12309", name: "Howrah - New Delhi Rajdhani", routeId: "HWH-NDLS", dep: "17:05", days: [1,2,3,4,5,6] },
  { number: "12311", name: "Howrah - Kalka Mail", routeId: "HWH-KLK", dep: "21:55", days: [0,1,2,3,4,5,6] },
  { number: "12313", name: "Sealdah Rajdhani Express", routeId: "SDAH-NDLS", dep: "16:50", days: [0,1,2,3,4,5,6] },
  { number: "12259", name: "Sealdah - New Delhi Duronto", routeId: "SDAH-NDLS", dep: "18:30", days: [2,4,6] },
  { number: "12327", name: "Howrah - Dehradun Express", routeId: "HWH-DDN", dep: "13:00", days: [0,1,2,3,4,5,6] },
  { number: "12329", name: "Howrah - Amritsar Express", routeId: "HWH-ASR", dep: "22:40", days: [0,1,2,3,4,5,6] },
  { number: "12345", name: "Howrah - New Delhi SF Express", routeId: "HWH-NDLS", dep: "15:50", days: [0,1,2,3,4,5,6] },
  
  // 4. Bangalore - Chennai
  { number: "12607", name: "Lalbagh SF Express", routeId: "MAS-SBC", reverseRoute: "SBC-MAS", dep: "15:30", days: [0,1,2,3,4,5,6] },
  { number: "12609", name: "Brindavan SF Express", routeId: "MAS-SBC", reverseRoute: "SBC-MAS", dep: "07:40", days: [0,1,2,3,4,5,6] },
  { number: "12291", name: "Yesvantpur - Chennai Central SF Express", routeId: "YPR-MAS", dep: "22:45", days: [0,1,2,3,4,5,6] },
  { number: "12684", name: "Coimbatore - Bangalore SF Express", routeId: "CBE-SBC", dep: "18:25", days: [0,1,2,3,4,5,6] },
  
  // 5. Hyderabad - Chennai
  { number: "12603", name: "Hyderabad - Chennai SF Express", routeId: "HYB-MAS", dep: "16:45", days: [0,1,2,3,4,5,6] },
  { number: "12759", name: "Charminar Express", routeId: "MAS-HYB", reverseRoute: "HYB-MAS", dep: "18:10", days: [0,1,2,3,4,5,6] },
  { number: "12797", name: "Kacheguda - Chennai Egmore SF Express", routeId: "KCG-MS", dep: "20:05", days: [0,1,2,3,4,5,6] },
  { number: "17625", name: "Kacheguda - Tirupati Express", routeId: "KCG-TPTY", dep: "16:15", days: [0,1,2,3,4,5,6] },
  { number: "12253", name: "Yesvantpur - Hyderabad Garib Rath", routeId: "YPR-HYB", dep: "15:40", days: [2,5] },
  
  // 6. Pune - Mumbai
  { number: "12125", name: "Pragati Express", routeId: "CSMT-PUNE", reverseRoute: "PUNE-CSMT", dep: "16:25", days: [0,1,2,3,4,5,6] },
  { number: "12127", name: "Deccan Express", routeId: "CSMT-PUNE", reverseRoute: "PUNE-CSMT", dep: "07:00", days: [0,1,2,3,4,5,6] },
  { number: "11025", name: "Pune - Mumbai Express", routeId: "PUNE-CSMT", dep: "06:05", days: [0,1,2,3,4,5,6] },
  { number: "11007", name: "Deccan Queen", routeId: "CSMT-PUNE", reverseRoute: "PUNE-CSMT", dep: "17:10", days: [0,1,2,3,4,5,6] },
  { number: "12755", name: "Madgaon - Mumbai Weekly SF", routeId: "MAO-CSMT", dep: "15:00", days: [2] },
  { number: "12051", name: "Mumbai - Pune Shatabdi", routeId: "CSMT-PUNE", reverseRoute: "PUNE-CSMT", dep: "06:15", days: [1,2,3,4,5,6] },
  
  // 7. Ahmedabad - Mumbai
  { number: "12009", name: "Mumbai - Ahmedabad Shatabdi", routeId: "MMCT-ADI", reverseRoute: "ADI-MMCT", dep: "06:20", days: [1,2,3,4,5,6] },
  { number: "12907", name: "Bandra - Ahmedabad SF Express", routeId: "BDTS-ADI", reverseRoute: "ADI-BDTS", dep: "21:40", days: [0,1,2,3,4,5,6] },
  { number: "12231", name: "Lucknow - Yesvantpur Express", routeId: "LKO-YPR", dep: "00:05", days: [4] },
  { number: "22909", name: "Bandra - Valsad Express", routeId: "BDTS-BL", reverseRoute: "NDLS-BL", dep: "16:00", days: [0,1,2,3,4,5,6] }, // Fallback to NDLS-BL logic if needed
  
  // 8. Jaipur - Delhi
  { number: "12015", name: "Ajmer - New Delhi Shatabdi", routeId: "AII-NDLS", dep: "05:40", days: [1,2,3,4,5,6] },
  { number: "12455", name: "Delhi - Bikaner SF Express", routeId: "NDLS-BKN", dep: "22:45", days: [0,1,2,3,4,5,6] },
  
  // 9. Lucknow - Delhi
  { number: "12003", name: "Lucknow - New Delhi Shatabdi", routeId: "LKO-NDLS", dep: "15:35", days: [1,2,3,4,5,6] },
  { number: "12511", name: "Gorakhpur - Mumbai LTT Express", routeId: "GKP-LTT", dep: "06:35", days: [0,1,2,3,4,5,6] },
  { number: "12203", name: "Saharsa - Amritsar Garib Rath", routeId: "SHC-ASR", dep: "14:30", days: [0,4] },
  
  // 10. Patna - Delhi
  { number: "12309", name: "Patna - New Delhi Rajdhani", routeId: "PNBE-NDLS", dep: "19:10", days: [0,1,2,3,4,5,6] },
  
  // Additional Major Routes
  { number: "12423", name: "Dibrugarh - New Delhi Rajdhani", routeId: "DBRG-NDLS", dep: "20:55", days: [1] },
  { number: "15620", name: "Kamakhya - Gaya Express", routeId: "KYQ-GAYA", dep: "06:30", days: [1] },
  { number: "15905", name: "Dibrugarh - Kanniyakumari Express", routeId: "DBRG-CAPE", dep: "19:25", days: [6] },
  { number: "15901", name: "Lumding - Guwahati Express", routeId: "LMG-GHY", dep: "06:15", days: [0,1,2,3,4,5,6] },
  { number: "15621", name: "Kamakhya - Anand Vihar Express", routeId: "KYQ-ANVT", dep: "05:00", days: [4] },
  { number: "12519", name: "Kamakhya - Mumbai LTT SF Express", routeId: "KYQ-LTT", dep: "21:00", days: [4] },
  { number: "12525", name: "Kamakhya - Kolkata SF Express", routeId: "KYQ-KOAA", dep: "11:00", days: [0,1,2,3,4,5,6] },
  { number: "15601", name: "Guwahati - New Delhi Rajdhani", routeId: "GHY-NDLS", dep: "21:00", days: [1,5] },
  { number: "12659", name: "Guruvayur - Chennai Express", routeId: "GUV-MAS", dep: "23:15", days: [0,1,2,3,4,5,6] },
  { number: "12683", name: "Ernakulam - Bangalore SF Express", routeId: "ERS-SBC", dep: "17:00", days: [0,1,2,3,4,5,6] },
  { number: "12685", name: "Chennai - Mangalore Express", routeId: "MAS-MAQ", dep: "16:20", days: [0,1,2,3,4,5,6] },
  { number: "12909", name: "Bandra - Hazrat Nizamuddin Garib Rath", routeId: "BDTS-NZM", dep: "17:30", days: [1,3,5] },
  { number: "12911", name: "Vadodara - Mumbai SF Express", routeId: "BRC-MMCT", dep: "05:40", days: [0,1,2,3,4,5,6] },
  { number: "12919", name: "Bandra - Jammu Tawi SF Express", routeId: "BDTS-JAT", dep: "12:00", days: [1] },
  { number: "12923", name: "Nagpur - Mumbai SF Express", routeId: "NGP-CSMT", dep: "18:25", days: [0,1,2,3,4,5,6] },
  { number: "12927", name: "Mumbai - Vadodara SF Express", routeId: "MMCT-BRC", dep: "23:40", days: [0,1,2,3,4,5,6] },
  { number: "12929", name: "Mumbai - Udaipur SF Express", routeId: "MMCT-UDZ", dep: "23:25", days: [2] },
  { number: "12931", name: "Mumbai - Ahmedabad SF Express", routeId: "MMCT-ADI", dep: "05:40", days: [0,1,2,3,4,5,6] },
  { number: "12935", name: "Bandra - Surat SF Express", routeId: "BDTS-ST", dep: "06:35", days: [0,1,2,3,4,5,6] },
  { number: "12939", name: "Jaipur - Mumbai SF Express", routeId: "JP-MMCT", dep: "19:15", days: [2] },
  
  // East India
  { number: "12801", name: "Puri - Howrah Express", routeId: "PURI-HWH", dep: "19:20", days: [0,1,2,3,4,5,6] },
  { number: "12815", name: "Puri - New Delhi Express", routeId: "PURI-NDLS", dep: "11:00", days: [0,1,2,3,4,5,6] },
  { number: "12817", name: "Howrah - Ranchi Express", routeId: "HWH-RNC", dep: "16:10", days: [0,1,2,3,4,5,6] },
  { number: "12821", name: "Howrah - Bhubaneswar Express", routeId: "HWH-BBS", dep: "16:25", days: [0,1,2,3,4,5,6] },
  { number: "12823", name: "Howrah - Digha Express", routeId: "HWH-DGHA", dep: "11:00", days: [0,1,2,3,4,5,6] },
  { number: "12839", name: "Howrah - Chennai Mail", routeId: "HWH-MAS", dep: "23:55", days: [0,1,2,3,4,5,6] },
];
