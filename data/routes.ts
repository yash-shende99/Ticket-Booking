export const routesData = [
  // 1. Delhi - Mumbai Routes
  { name: "NDLS-MMCT", source: "NDLS", destination: "MMCT", distance: 1384 },
  { name: "NZM-BDTS", source: "NZM", destination: "BDTS", distance: 1366 },
  { name: "DEE-BDTS", source: "DEE", destination: "BDTS", distance: 1370 },
  
  // 2. Mumbai - Chennai
  { name: "CSMT-MAS", source: "CSMT", destination: "MAS", distance: 1281 },
  { name: "LTT-MAS", source: "LTT", destination: "MAS", distance: 1269 },
  { name: "LTT-MS", source: "LTT", destination: "MS", distance: 1275 },
  
  // 3. Kolkata - Delhi
  { name: "HWH-NDLS", source: "HWH", destination: "NDLS", distance: 1453 },
  { name: "SDAH-NDLS", source: "SDAH", destination: "NDLS", distance: 1458 },
  
  // 4. Bangalore - Chennai
  { name: "SBC-MAS", source: "SBC", destination: "MAS", distance: 359 },
  { name: "YPR-MAS", source: "YPR", destination: "MAS", distance: 365 },
  
  // 5. Hyderabad - Chennai
  { name: "HYB-MAS", source: "HYB", destination: "MAS", distance: 713 },
  { name: "KCG-MS", source: "KCG", destination: "MS", distance: 710 },
  { name: "MAS-HYB", source: "MAS", destination: "HYB", distance: 713 }, // Reverse
  
  // 6. Pune - Mumbai
  { name: "PUNE-CSMT", source: "PUNE", destination: "CSMT", distance: 192 },
  { name: "PUNE-MMCT", source: "PUNE", destination: "MMCT", distance: 195 },
  { name: "CSMT-PUNE", source: "CSMT", destination: "PUNE", distance: 192 },
  
  // 7. Ahmedabad - Mumbai
  { name: "ADI-MMCT", source: "ADI", destination: "MMCT", distance: 493 },
  { name: "ADI-BDTS", source: "ADI", destination: "BDTS", distance: 481 },
  
  // 8. Jaipur - Delhi
  { name: "JP-NDLS", source: "JP", destination: "NDLS", distance: 308 },
  
  // 9. Lucknow - Delhi
  { name: "LKO-NDLS", source: "LKO", destination: "NDLS", distance: 492 },
  
  // 10. Patna - Delhi
  { name: "PNBE-NDLS", source: "PNBE", destination: "NDLS", distance: 1000 },
  
  // Additional Routes needed for trains
  { name: "HWH-CSMT", source: "HWH", destination: "CSMT", distance: 1968 },
  { name: "DDN-BDTS", source: "DDN", destination: "BDTS", distance: 1365 },
  { name: "NDLS-BL", source: "NDLS", destination: "BL", distance: 1100 },
  { name: "DR-BHUJ", source: "DR", destination: "BHUJ", distance: 795 },
  { name: "NZM-TVC", source: "NZM", destination: "TVC", distance: 2844 },
  { name: "LTT-HW", source: "LTT", destination: "HW", distance: 1610 },
  
  { name: "MAS-NDLS", source: "MAS", destination: "NDLS", distance: 2182 },
  { name: "YPR-DEE", source: "YPR", destination: "DEE", distance: 2365 },
  { name: "LTT-KJM", source: "LTT", destination: "KJM", distance: 1095 },
  
  { name: "HWH-KLK", source: "HWH", destination: "KLK", distance: 1714 },
  { name: "HWH-DDN", source: "HWH", destination: "DDN", distance: 1587 },
  { name: "HWH-ASR", source: "HWH", destination: "ASR", distance: 1910 },
  
  { name: "CBE-SBC", source: "CBE", destination: "SBC", distance: 420 },
  
  { name: "KCG-TPTY", source: "KCG", destination: "TPTY", distance: 625 },
  { name: "YPR-HYB", source: "YPR", destination: "HYB", distance: 610 },
  
  { name: "MAO-CSMT", source: "MAO", destination: "CSMT", distance: 580 },
  
  { name: "LKO-YPR", source: "LKO", destination: "YPR", distance: 2010 },
  
  { name: "AII-NDLS", source: "AII", destination: "NDLS", distance: 442 },
  { name: "NDLS-BKN", source: "NDLS", destination: "BKN", distance: 462 },
  
  { name: "GKP-LTT", source: "GKP", destination: "LTT", distance: 1690 },
  { name: "SHC-ASR", source: "SHC", destination: "ASR", distance: 1550 },
  
  { name: "DBRG-NDLS", source: "DBRG", destination: "NDLS", distance: 2450 },
  { name: "KYQ-GAYA", source: "KYQ", destination: "GAYA", distance: 950 },
  { name: "DBRG-CAPE", source: "DBRG", destination: "CAPE", distance: 4235 },
  { name: "LMG-GHY", source: "LMG", destination: "GHY", distance: 180 },
  { name: "KYQ-ANVT", source: "KYQ", destination: "ANVT", distance: 1880 },
  { name: "KYQ-LTT", source: "KYQ", destination: "LTT", distance: 2570 },
  { name: "KYQ-KOAA", source: "KYQ", destination: "KOAA", distance: 980 },
  { name: "GHY-NDLS", source: "GHY", destination: "NDLS", distance: 1910 },
  
  { name: "GUV-MAS", source: "GUV", destination: "MAS", distance: 680 },
  { name: "ERS-SBC", source: "ERS", destination: "SBC", distance: 584 },
  { name: "MAS-MAQ", source: "MAS", destination: "MAQ", distance: 900 },
  
  { name: "BDTS-NZM", source: "BDTS", destination: "NZM", distance: 1366 }, // Reverse
  { name: "BRC-MMCT", source: "BRC", destination: "MMCT", distance: 390 },
  { name: "BDTS-JAT", source: "BDTS", destination: "JAT", distance: 1950 },
  { name: "NGP-CSMT", source: "NGP", destination: "CSMT", distance: 835 },
  { name: "MMCT-BRC", source: "MMCT", destination: "BRC", distance: 390 },
  { name: "MMCT-UDZ", source: "MMCT", destination: "UDZ", distance: 945 },
  { name: "MMCT-ADI", source: "MMCT", destination: "ADI", distance: 493 }, // Reverse
  { name: "BDTS-ST", source: "BDTS", destination: "ST", distance: 252 },
  { name: "JP-MMCT", source: "JP", destination: "MMCT", distance: 1150 },
  
  { name: "PURI-HWH", source: "PURI", destination: "HWH", distance: 500 },
  { name: "PURI-NDLS", source: "PURI", destination: "NDLS", distance: 1795 },
  { name: "HWH-RNC", source: "HWH", destination: "RNC", distance: 415 },
  { name: "HWH-BBS", source: "HWH", destination: "BBS", distance: 437 },
  { name: "HWH-DGHA", source: "HWH", destination: "DGHA", distance: 185 },
  { name: "HWH-MAS", source: "HWH", destination: "MAS", distance: 1660 }
];
