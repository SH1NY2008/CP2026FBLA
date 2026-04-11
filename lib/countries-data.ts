export interface CountryData {
  name: string;
  code: string;
  states: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    name: 'United States',
    code: 'US',
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming',
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
      'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
      'Yukon',
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    states: [
      'England', 'Scotland', 'Wales', 'Northern Ireland',
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory',
      'Queensland', 'South Australia', 'Tasmania', 'Victoria',
      'Western Australia',
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    states: [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen',
      'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern',
      'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony',
      'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
    ],
  },
  {
    name: 'France',
    code: 'FR',
    states: [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany',
      'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France',
      'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie',
      'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
    ],
  },
  {
    name: 'Italy',
    code: 'IT',
    states: [
      'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria',
      'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio',
      'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Sardinia',
      'Sicily', 'Trentino-Alto Adige', 'Tuscany', 'Umbria', 'Veneto',
    ],
  },
  {
    name: 'Spain',
    code: 'ES',
    states: [
      'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country',
      'Canary Islands', 'Cantabria', 'Castile and León', 'Castilla-La Mancha',
      'Catalonia', 'Ceuta', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid',
      'Melilla', 'Murcia', 'Navarre', 'Valencia',
    ],
  },
  {
    name: 'India',
    code: 'IN',
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
      'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
      'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    ],
  },
  {
    name: 'Japan',
    code: 'JP',
    states: [
      'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka',
      'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo',
      'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa',
      'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki', 'Nagano',
      'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka',
      'Saga', 'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi',
      'Tokushima', 'Tokyo', 'Tottori', 'Toyama', 'Wakayama', 'Yamagata',
      'Yamaguchi', 'Yamanashi',
    ],
  },
  {
    name: 'China',
    code: 'CN',
    states: [
      'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong',
      'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan',
      'Hong Kong', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi',
      'Jilin', 'Liaoning', 'Macau', 'Ningxia', 'Qinghai', 'Shaanxi',
      'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet',
      'Xinjiang', 'Yunnan', 'Zhejiang',
    ],
  },
  {
    name: 'Brazil',
    code: 'BR',
    states: [
      'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará',
      'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão',
      'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba',
      'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte',
      'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina',
      'São Paulo', 'Sergipe', 'Tocantins',
    ],
  },
  {
    name: 'Mexico',
    code: 'MX',
    states: [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
      'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
      'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State',
      'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
      'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
      'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
    ],
  },
  {
    name: 'South Korea',
    code: 'KR',
    states: [
      'Busan', 'Chungcheongbuk-do', 'Chungcheongnam-do', 'Daegu', 'Daejeon',
      'Gangwon-do', 'Gwangju', 'Gyeonggi-do', 'Gyeongsangbuk-do',
      'Gyeongsangnam-do', 'Incheon', 'Jeju', 'Jeollabuk-do', 'Jeollanam-do',
      'Sejong', 'Seoul', 'Ulsan',
    ],
  },
  {
    name: 'Netherlands',
    code: 'NL',
    states: [
      'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen',
      'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel',
      'South Holland', 'Utrecht', 'Zeeland',
    ],
  },
  {
    name: 'Sweden',
    code: 'SE',
    states: [
      'Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland',
      'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten',
      'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm',
      'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland',
      'Västra Götaland',
    ],
  },
  {
    name: 'Norway',
    code: 'NO',
    states: [
      'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo',
      'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark',
      'Vestland', 'Viken',
    ],
  },
  {
    name: 'Switzerland',
    code: 'CH',
    states: [
      'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
      'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden',
      'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden',
      'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau',
      'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich',
    ],
  },
  {
    name: 'Portugal',
    code: 'PT',
    states: [
      'Aveiro', 'Azores', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
      'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisbon',
      'Madeira', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
      'Viana do Castelo', 'Vila Real', 'Viseu',
    ],
  },
  {
    name: 'Argentina',
    code: 'AR',
    states: [
      'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
      'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
      'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
      'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
      'Tucumán',
    ],
  },
  {
    name: 'South Africa',
    code: 'ZA',
    states: [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
      'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
    ],
  },
  {
    name: 'Nigeria',
    code: 'NG',
    states: [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
      'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
      'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
      'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
      'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
      'Taraba', 'Yobe', 'Zamfara',
    ],
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    states: [
      'Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', "Hawke's Bay",
      'Manawatu-Whanganui', 'Marlborough', 'Nelson', 'Northland',
      'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato',
      'Wellington', 'West Coast',
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    states: [
      'Central Region', 'East Region', 'North Region', 'North-East Region',
      'West Region',
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    states: [
      'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah',
      'Sharjah', 'Umm Al Quwain',
    ],
  },
  {
    name: 'Turkey',
    code: 'TR',
    states: [
      'Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Eskişehir',
      'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin',
      'Samsun', 'Trabzon',
    ],
  },
  {
    name: 'Greece',
    code: 'GR',
    states: [
      'Aegean Islands', 'Attica', 'Central Greece', 'Central Macedonia',
      'Crete', 'Eastern Macedonia and Thrace', 'Epirus', 'Ionian Islands',
      'Mount Athos', 'North Aegean', 'Peloponnese', 'South Aegean',
      'Thessaly', 'Western Greece', 'Western Macedonia',
    ],
  },
  {
    name: 'Poland',
    code: 'PL',
    states: [
      'Greater Poland', 'Holy Cross', 'Kuyavian-Pomeranian', 'Lesser Poland',
      'Łódź', 'Lower Silesian', 'Lublin', 'Lubusz', 'Masovian', 'Opole',
      'Podlaskie', 'Pomeranian', 'Silesian', 'Subcarpathian',
      'Warmian-Masurian', 'West Pomeranian',
    ],
  },
  {
    name: 'Thailand',
    code: 'TH',
    states: [
      'Bangkok', 'Chiang Mai', 'Chiang Rai', 'Chonburi', 'Khon Kaen',
      'Nakhon Ratchasima', 'Nonthaburi', 'Pathum Thani', 'Phuket',
      'Rayong', 'Samut Prakan', 'Samut Sakhon', 'Songkhla', 'Surat Thani',
      'Udon Thani',
    ],
  },
  {
    name: 'Malaysia',
    code: 'MY',
    states: [
      'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
      'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis',
      'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
    ],
  },
  {
    name: 'Indonesia',
    code: 'ID',
    states: [
      'Aceh', 'Bali', 'Banten', 'Bengkulu', 'Central Java', 'Central Kalimantan',
      'Central Sulawesi', 'East Java', 'East Kalimantan', 'East Nusa Tenggara',
      'Gorontalo', 'Jakarta', 'Jambi', 'Lampung', 'Maluku',
      'North Kalimantan', 'North Maluku', 'North Sulawesi', 'North Sumatra',
      'Papua', 'Riau', 'Riau Islands', 'South Kalimantan', 'South Sulawesi',
      'South Sumatra', 'Southeast Sulawesi', 'West Java', 'West Kalimantan',
      'West Nusa Tenggara', 'West Papua', 'West Sulawesi', 'West Sumatra',
      'Yogyakarta',
    ],
  },
  {
    name: 'Philippines',
    code: 'PH',
    states: [
      'Abra', 'Batangas', 'Benguet', 'Bohol', 'Bukidnon', 'Bulacan',
      'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Cavite', 'Cebu',
      'Davao del Norte', 'Davao del Sur', 'Ilocos Norte', 'Ilocos Sur',
      'Iloilo', 'Isabela', 'La Union', 'Laguna', 'Leyte', 'Metro Manila',
      'Misamis Occidental', 'Misamis Oriental', 'Mountain Province',
      'Negros Occidental', 'Negros Oriental', 'Nueva Ecija', 'Nueva Vizcaya',
      'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal',
      'Samar', 'Sorsogon', 'South Cotabato', 'Sultan Kudarat', 'Sulu',
      'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Zambales',
    ],
  },
  {
    name: 'Pakistan',
    code: 'PK',
    states: [
      'Azad Kashmir', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad',
      'Khyber Pakhtunkhwa', 'Punjab', 'Sindh',
    ],
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    states: [
      'Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh',
      'Rajshahi', 'Rangpur', 'Sylhet',
    ],
  },
  {
    name: 'Egypt',
    code: 'EG',
    states: [
      'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo',
      'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia',
      'Kafr el-Sheikh', 'Luxor', 'Matruh', 'Minya', 'Monufia',
      'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena',
      'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez',
    ],
  },
  {
    name: 'Kenya',
    code: 'KE',
    states: [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
      'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
      'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
      'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
      'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
      'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
      'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
      'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
    ],
  },
  {
    name: 'Russia',
    code: 'RU',
    states: [
      'Altai Krai', 'Arkhangelsk Oblast', 'Astrakhan Oblast', 'Bashkortostan',
      'Belgorod Oblast', 'Bryansk Oblast', 'Chelyabinsk Oblast', 'Chuvashia',
      'Dagestan', 'Irkutsk Oblast', 'Ivanovo Oblast', 'Kaliningrad Oblast',
      'Kaluga Oblast', 'Kamchatka Krai', 'Karachay-Cherkessia', 'Karelia',
      'Kemerovo Oblast', 'Khabarovsk Krai', 'Khanty-Mansi', 'Kirov Oblast',
      'Komi Republic', 'Kostroma Oblast', 'Krasnodar Krai', 'Krasnoyarsk Krai',
      'Kursk Oblast', 'Leningrad Oblast', 'Lipetsk Oblast', 'Moscow',
      'Moscow Oblast', 'Murmansk Oblast', 'Nizhny Novgorod Oblast',
      'North Ossetia', 'Novosibirsk Oblast', 'Omsk Oblast', 'Orel Oblast',
      'Orenburg Oblast', 'Penza Oblast', 'Perm Krai', 'Primorsky Krai',
      'Pskov Oblast', 'Rostov Oblast', 'Ryazan Oblast', 'Saint Petersburg',
      'Sakhalin Oblast', 'Samara Oblast', 'Saratov Oblast', 'Smolensk Oblast',
      'Stavropol Krai', 'Sverdlovsk Oblast', 'Tatarstan', 'Tomsk Oblast',
      'Tula Oblast', 'Tver Oblast', 'Tyumen Oblast', 'Udmurtia',
      'Ulyanovsk Oblast', 'Vladimir Oblast', 'Volgograd Oblast',
      'Vologda Oblast', 'Voronezh Oblast', 'Yakutia', 'Yamalo-Nenets',
      'Yaroslavl Oblast', 'Zabaykalsky Krai',
    ],
  },
];
