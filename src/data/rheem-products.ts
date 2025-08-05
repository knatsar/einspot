// Rheem Product Data Collection
// Based on official Rheem product catalog and specifications

export interface RheemProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: number;
  image_url: string;
  gallery_images?: string[];
  specifications: Record<string, any>;
  features: string[];
  model_number: string;
  brand: string;
  is_featured: boolean;
  show_price: boolean;
  stock_status: string;
  installation_manual_url?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
}

export const rheemProductData: RheemProduct[] = [
  // WATER HEATERS - ELECTRIC STORAGE
  {
    id: 'rheem-wh-50l-electric',
    name: 'Rheem Professional Series Electric Water Heater 50L',
    description: 'High-efficiency electric storage water heater with advanced insulation and digital temperature control. Perfect for residential and small commercial applications.',
    category: 'Water Heaters',
    subcategory: 'Electric Storage',
    price: 450000,
    image_url: '/src/assets/products/rheem-electric-50l.jpg',
    gallery_images: [
      '/src/assets/products/rheem-electric-50l-1.jpg',
      '/src/assets/products/rheem-electric-50l-2.jpg',
      '/src/assets/products/rheem-electric-50l-3.jpg'
    ],
    specifications: {
      capacity: '50 Liters',
      power: '3000W',
      voltage: '220V/240V',
      efficiency: '95%',
      insulation: 'High-density polyurethane foam',
      tank_material: 'Vitreous enamel lined steel',
      warranty: '5 years tank, 2 years parts',
      dimensions: '550mm x 550mm x 850mm',
      weight: '45kg',
      max_pressure: '8 bar',
      heating_time: '45 minutes (cold to 60°C)'
    },
    features: [
      'Digital temperature display and control',
      'Energy-efficient heating element',
      'Corrosion-resistant tank lining',
      'Safety pressure relief valve',
      'Adjustable thermostat (30-75°C)',
      'Easy installation and maintenance',
      'Compact design for space saving',
      'Overheat protection system'
    ],
    model_number: 'RHEEM-ES-50L',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'In Stock',
    installation_manual_url: '/assets/manuals/rheem-electric-50l-manual.pdf',
    meta_title: 'Rheem 50L Electric Water Heater - Professional Series | EINSPOT',
    meta_description: 'High-efficiency Rheem 50L electric water heater with digital controls. Perfect for homes and small businesses. Professional installation available.',
    meta_keywords: ['rheem water heater', 'electric water heater 50l', 'nigeria water heater', 'residential water heating']
  },
  {
    id: 'rheem-wh-80l-electric',
    name: 'Rheem Professional Series Electric Water Heater 80L',
    description: 'Medium capacity electric water heater ideal for larger households and small commercial establishments. Features advanced energy management and safety systems.',
    category: 'Water Heaters',
    subcategory: 'Electric Storage',
    price: 580000,
    image_url: '/src/assets/products/rheem-electric-80l.jpg',
    specifications: {
      capacity: '80 Liters',
      power: '4000W',
      voltage: '220V/240V',
      efficiency: '96%',
      insulation: 'High-density polyurethane foam',
      tank_material: 'Vitreous enamel lined steel',
      warranty: '5 years tank, 2 years parts',
      dimensions: '550mm x 550mm x 1100mm',
      weight: '58kg',
      max_pressure: '8 bar',
      heating_time: '60 minutes (cold to 60°C)'
    },
    features: [
      'Digital temperature display and control',
      'Dual heating elements for faster heating',
      'Advanced corrosion protection',
      'Smart energy management system',
      'Safety pressure relief valve',
      'Temperature and pressure gauge',
      'Easy maintenance access',
      'Overheat and dry-fire protection'
    ],
    model_number: 'RHEEM-ES-80L',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem 80L Electric Water Heater - Professional Series | EINSPOT',
    meta_description: 'Rheem 80L electric water heater with dual elements and smart controls. Ideal for larger homes and small businesses.',
    meta_keywords: ['rheem 80l water heater', 'electric water heater', 'commercial water heater', 'nigeria']
  },

  // WATER HEATERS - TANKLESS
  {
    id: 'rheem-wh-tankless-18l',
    name: 'Rheem Tankless Electric Water Heater 18L/min',
    description: 'On-demand tankless electric water heater providing endless hot water with precise temperature control. Space-saving design with advanced safety features.',
    category: 'Water Heaters',
    subcategory: 'Tankless Electric',
    price: 750000,
    image_url: '/src/assets/products/rheem-tankless-18l.jpg',
    specifications: {
      flow_rate: '18 Liters per minute',
      power: '24kW',
      voltage: '380V (3-phase)',
      efficiency: '99%',
      temperature_range: '30-60°C',
      activation_flow: '2.5 L/min',
      warranty: '7 years heat exchanger, 2 years parts',
      dimensions: '480mm x 280mm x 155mm',
      weight: '12kg',
      max_pressure: '10 bar',
      protection_rating: 'IPX4'
    },
    features: [
      'Endless hot water on demand',
      'Compact wall-mounted design',
      'Digital temperature control',
      'Self-modulating power control',
      'Freeze protection system',
      'Overheat protection',
      'Low water pressure activation',
      'Energy-efficient operation'
    ],
    model_number: 'RHEEM-TL-18L',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem Tankless Electric Water Heater 18L/min | EINSPOT Nigeria',
    meta_description: 'Rheem tankless electric water heater with 18L/min flow rate. Endless hot water, compact design, energy efficient.',
    meta_keywords: ['rheem tankless', 'electric tankless water heater', 'on demand water heater', 'nigeria']
  },

  // HVAC SYSTEMS - SPLIT UNITS
  {
    id: 'rheem-hvac-split-2hp',
    name: 'Rheem Classic Series Split Air Conditioner 2HP',
    description: 'Energy-efficient split air conditioning system with inverter technology. Quiet operation and smart climate control for residential and commercial use.',
    category: 'HVAC Systems',
    subcategory: 'Split Air Conditioners',
    price: 850000,
    image_url: '/src/assets/products/rheem-split-2hp.jpg',
    specifications: {
      cooling_capacity: '2HP (17,000 BTU/hr)',
      power_consumption: '1.8kW',
      energy_rating: '5-star',
      refrigerant: 'R410A',
      coverage_area: '25-35 sqm',
      noise_level: '42dB (indoor), 52dB (outdoor)',
      voltage: '220V/240V',
      warranty: '3 years compressor, 1 year parts',
      dimensions_indoor: '1000mm x 300mm x 220mm',
      dimensions_outdoor: '800mm x 550mm x 300mm',
      weight_indoor: '12kg',
      weight_outdoor: '38kg'
    },
    features: [
      'Inverter technology for energy savings',
      'Smart WiFi connectivity',
      'Auto-restart after power failure',
      'Sleep mode for quiet operation',
      'Self-cleaning function',
      'Anti-corrosion coating',
      'Remote control included',
      'Timer and scheduling functions'
    ],
    model_number: 'RHEEM-CS-2HP',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem 2HP Split Air Conditioner - Classic Series | EINSPOT',
    meta_description: 'Rheem 2HP split AC with inverter technology and WiFi connectivity. Energy efficient cooling for homes and offices.',
    meta_keywords: ['rheem split ac', '2hp air conditioner', 'inverter ac nigeria', 'energy efficient cooling']
  },
  {
    id: 'rheem-hvac-split-3hp',
    name: 'Rheem Professional Series Split Air Conditioner 3HP',
    description: 'Heavy-duty split air conditioning system designed for larger spaces and commercial applications. Advanced climate control with zone management.',
    category: 'HVAC Systems',
    subcategory: 'Split Air Conditioners',
    price: 1200000,
    image_url: '/src/assets/products/rheem-split-3hp.jpg',
    specifications: {
      cooling_capacity: '3HP (25,500 BTU/hr)',
      power_consumption: '2.6kW',
      energy_rating: '4-star',
      refrigerant: 'R410A',
      coverage_area: '40-55 sqm',
      noise_level: '45dB (indoor), 55dB (outdoor)',
      voltage: '220V/240V',
      warranty: '5 years compressor, 2 years parts',
      dimensions_indoor: '1200mm x 350mm x 250mm',
      dimensions_outdoor: '900mm x 650mm x 350mm',
      weight_indoor: '16kg',
      weight_outdoor: '52kg'
    },
    features: [
      'Heavy-duty compressor for commercial use',
      'Advanced filtration system',
      'Zone control capability',
      'Robust outdoor unit design',
      'Extended operating range',
      'Professional installation required',
      'Maintenance alerts',
      'Energy monitoring system'
    ],
    model_number: 'RHEEM-PS-3HP',
    brand: 'Rheem',
    is_featured: false,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem 3HP Commercial Split Air Conditioner | EINSPOT Nigeria',
    meta_description: 'Rheem 3HP professional split AC for commercial spaces. Heavy-duty design with zone control and advanced filtration.',
    meta_keywords: ['rheem 3hp ac', 'commercial air conditioner', 'split ac nigeria', 'professional hvac']
  },

  // HVAC SYSTEMS - VRF SYSTEMS
  {
    id: 'rheem-vrf-system-10hp',
    name: 'Rheem VRF Multi-Zone System 10HP',
    description: 'Variable Refrigerant Flow system for multi-zone climate control. Ideal for office buildings, hotels, and large commercial spaces.',
    category: 'HVAC Systems',
    subcategory: 'VRF Systems',
    price: 3500000,
    image_url: '/src/assets/products/rheem-vrf-10hp.jpg',
    specifications: {
      cooling_capacity: '10HP (85,000 BTU/hr)',
      heating_capacity: '90,000 BTU/hr',
      power_consumption: '8.5kW',
      refrigerant: 'R410A',
      max_indoor_units: '16 units',
      pipe_length: '150m total, 50m per unit',
      voltage: '380V (3-phase)',
      warranty: '5 years compressor, 3 years parts',
      dimensions: '1400mm x 1000mm x 400mm',
      weight: '180kg',
      operating_range: '-15°C to 50°C'
    },
    features: [
      'Simultaneous heating and cooling',
      'Individual zone control',
      'Heat recovery technology',
      'Advanced inverter technology',
      'Building management system integration',
      'Energy monitoring and reporting',
      'Quiet operation',
      'Professional installation and commissioning'
    ],
    model_number: 'RHEEM-VRF-10HP',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'Made to Order',
    meta_title: 'Rheem VRF 10HP Multi-Zone System - Commercial HVAC | EINSPOT',
    meta_description: 'Rheem VRF 10HP system for multi-zone climate control. Perfect for commercial buildings with individual zone management.',
    meta_keywords: ['rheem vrf system', 'multi zone hvac', 'commercial air conditioning', 'vrf nigeria']
  },

  // HEAT PUMPS
  {
    id: 'rheem-heat-pump-hybrid',
    name: 'Rheem Hybrid Heat Pump Water Heater 300L',
    description: 'Revolutionary hybrid heat pump water heater combining heat pump efficiency with electric backup. Up to 70% energy savings compared to conventional electric water heaters.',
    category: 'Heat Pumps',
    subcategory: 'Hybrid Water Heaters',
    price: 1800000,
    image_url: '/src/assets/products/rheem-hybrid-300l.jpg',
    specifications: {
      capacity: '300 Liters',
      heat_pump_power: '2.5kW',
      backup_element: '4.5kW',
      voltage: '220V/240V',
      efficiency: 'COP 3.8',
      operating_range: '5°C to 45°C ambient',
      warranty: '6 years tank, 3 years heat pump',
      dimensions: '650mm x 650mm x 2100mm',
      weight: '120kg',
      noise_level: '45dB',
      annual_energy_savings: '70% vs electric'
    },
    features: [
      'Heat pump technology for maximum efficiency',
      'Electric backup for continuous operation',
      'Smart control system with scheduling',
      'Vacation mode for energy savings',
      'Advanced diagnostics and monitoring',
      'Environmentally friendly refrigerant',
      'Professional installation required',
      'Remote monitoring capability'
    ],
    model_number: 'RHEEM-HP-300L',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'Made to Order',
    meta_title: 'Rheem Hybrid Heat Pump Water Heater 300L | EINSPOT Nigeria',
    meta_description: 'Rheem hybrid heat pump water heater with 70% energy savings. 300L capacity with smart controls and backup heating.',
    meta_keywords: ['rheem heat pump', 'hybrid water heater', 'energy efficient water heating', 'heat pump nigeria']
  },

  // COMMERCIAL HVAC
  {
    id: 'rheem-commercial-rooftop-15ton',
    name: 'Rheem Commercial Rooftop Unit 15 Ton',
    description: 'Heavy-duty commercial rooftop HVAC unit designed for large commercial and industrial applications. Features advanced controls and energy management.',
    category: 'HVAC Systems',
    subcategory: 'Commercial Rooftop Units',
    price: 4500000,
    image_url: '/src/assets/products/rheem-rooftop-15ton.jpg',
    specifications: {
      cooling_capacity: '15 Tons (180,000 BTU/hr)',
      heating_capacity: '200,000 BTU/hr',
      power_consumption: '18kW',
      refrigerant: 'R410A',
      airflow: '6000 CFM',
      voltage: '380V (3-phase)',
      warranty: '5 years compressor, 2 years parts',
      dimensions: '3000mm x 2000mm x 1200mm',
      weight: '850kg',
      operating_range: '-20°C to 50°C',
      filtration: 'MERV 8 standard, MERV 13 optional'
    },
    features: [
      'Heavy-duty commercial construction',
      'Advanced microprocessor controls',
      'Variable speed fans',
      'Economizer for free cooling',
      'Building management system integration',
      'Remote monitoring and diagnostics',
      'Modular design for easy service',
      'Energy recovery options available'
    ],
    model_number: 'RHEEM-RTU-15T',
    brand: 'Rheem',
    is_featured: false,
    show_price: false,
    stock_status: 'Made to Order',
    meta_title: 'Rheem 15 Ton Commercial Rooftop HVAC Unit | EINSPOT',
    meta_description: 'Rheem 15-ton commercial rooftop HVAC unit for large buildings. Advanced controls and energy management systems.',
    meta_keywords: ['rheem rooftop unit', 'commercial hvac', '15 ton ac unit', 'industrial air conditioning']
  },

  // PLUMBING PRODUCTS
  {
    id: 'rheem-pressure-pump-1hp',
    name: 'Rheem Pressure Booster Pump 1HP',
    description: 'High-performance pressure booster pump for residential and commercial water supply systems. Ensures consistent water pressure throughout the building.',
    category: 'Plumbing Products',
    subcategory: 'Pressure Pumps',
    price: 320000,
    image_url: '/src/assets/products/rheem-pressure-pump-1hp.jpg',
    specifications: {
      power: '1HP (0.75kW)',
      flow_rate: '120 L/min',
      max_head: '45 meters',
      suction_head: '8 meters',
      voltage: '220V/240V',
      inlet_outlet: '1.5 inch',
      warranty: '2 years motor, 1 year parts',
      dimensions: '450mm x 300mm x 350mm',
      weight: '28kg',
      material: 'Cast iron body, stainless steel impeller',
      protection: 'IP54'
    },
    features: [
      'Self-priming operation',
      'Thermal overload protection',
      'Corrosion-resistant construction',
      'Low noise operation',
      'Easy installation and maintenance',
      'Pressure switch included',
      'Suitable for clean water',
      'Professional grade reliability'
    ],
    model_number: 'RHEEM-PP-1HP',
    brand: 'Rheem',
    is_featured: false,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem 1HP Pressure Booster Pump | EINSPOT Nigeria',
    meta_description: 'Rheem 1HP pressure booster pump for consistent water pressure. Self-priming with thermal protection.',
    meta_keywords: ['rheem pressure pump', 'water booster pump', 'pressure pump nigeria', '1hp pump']
  },

  // SOLAR WATER HEATING
  {
    id: 'rheem-solar-300l-system',
    name: 'Rheem Solar Water Heating System 300L',
    description: 'Complete solar water heating system with evacuated tube collectors and insulated storage tank. Eco-friendly solution with electric backup.',
    category: 'Solar Systems',
    subcategory: 'Solar Water Heaters',
    price: 1200000,
    image_url: '/src/assets/products/rheem-solar-300l.jpg',
    specifications: {
      tank_capacity: '300 Liters',
      collector_area: '4 sqm',
      collector_type: 'Evacuated tube',
      backup_heating: '4.5kW electric element',
      insulation: 'Polyurethane foam 50mm',
      tank_material: 'Stainless steel inner tank',
      warranty: '10 years tank, 5 years collectors',
      dimensions_tank: '650mm x 650mm x 2000mm',
      dimensions_collector: '2000mm x 2000mm x 150mm',
      weight_tank: '85kg (empty)',
      operating_pressure: '6 bar'
    },
    features: [
      'Zero operating cost with sunshine',
      'Electric backup for cloudy days',
      'Evacuated tube technology',
      'Freeze protection system',
      'Automatic temperature control',
      'Corrosion-resistant materials',
      'Professional installation included',
      'Government rebate eligible'
    ],
    model_number: 'RHEEM-SWH-300L',
    brand: 'Rheem',
    is_featured: true,
    show_price: false,
    stock_status: 'In Stock',
    meta_title: 'Rheem Solar Water Heating System 300L | EINSPOT Nigeria',
    meta_description: 'Rheem 300L solar water heater with evacuated tubes and electric backup. Eco-friendly hot water solution.',
    meta_keywords: ['rheem solar water heater', 'solar hot water system', 'evacuated tube collector', 'solar nigeria']
  },

  // INDUSTRIAL SYSTEMS
  {
    id: 'rheem-industrial-chiller-50ton',
    name: 'Rheem Industrial Water Chiller 50 Ton',
    description: 'High-capacity industrial water chiller for process cooling and large commercial applications. Features advanced controls and energy optimization.',
    category: 'Industrial Systems',
    subcategory: 'Water Chillers',
    price: 8500000,
    image_url: '/src/assets/products/rheem-chiller-50ton.jpg',
    specifications: {
      cooling_capacity: '50 Tons (600,000 BTU/hr)',
      power_consumption: '45kW',
      refrigerant: 'R134a',
      compressor_type: 'Scroll compressor',
      evaporator: 'Shell and tube',
      condenser: 'Air-cooled',
      voltage: '380V (3-phase)',
      warranty: '3 years compressor, 1 year parts',
      dimensions: '4000mm x 2000mm x 2200mm',
      weight: '2500kg',
      operating_range: '10°C to 50°C ambient',
      water_flow: '360 L/min'
    },
    features: [
      'Industrial-grade construction',
      'Microprocessor-based controls',
      'Energy optimization algorithms',
      'Remote monitoring capability',
      'Modular design for easy service',
      'Safety interlocks and alarms',
      'Corrosion-resistant components',
      'Professional commissioning included'
    ],
    model_number: 'RHEEM-IC-50T',
    brand: 'Rheem',
    is_featured: false,
    show_price: false,
    stock_status: 'Made to Order',
    meta_title: 'Rheem 50 Ton Industrial Water Chiller | EINSPOT Nigeria',
    meta_description: 'Rheem 50-ton industrial water chiller for process cooling and large commercial applications. Advanced controls included.',
    meta_keywords: ['rheem industrial chiller', '50 ton chiller', 'process cooling', 'industrial hvac nigeria']
  },

  // WATER TREATMENT
  {
    id: 'rheem-water-treatment-10000l',
    name: 'Rheem Water Treatment Plant 10,000L/day',
    description: 'Complete water treatment and purification system for industrial and commercial applications. Multi-stage filtration with automated controls.',
    category: 'Water Treatment',
    subcategory: 'Treatment Plants',
    price: 2800000,
    image_url: '/src/assets/products/rheem-treatment-10000l.jpg',
    specifications: {
      capacity: '10,000 Liters per day',
      filtration_stages: '7-stage process',
      automation: 'PLC controlled',
      power_consumption: '5kW',
      voltage: '380V (3-phase)',
      inlet_pressure: '2-6 bar',
      outlet_quality: 'Potable water standard',
      warranty: '3 years equipment, 1 year consumables',
      dimensions: '3000mm x 2000mm x 2500mm',
      weight: '1200kg',
      material: 'Stainless steel construction',
      compliance: 'WHO and NAFDAC standards'
    },
    features: [
      'Multi-stage reverse osmosis',
      'Automated cleaning cycles',
      'Water quality monitoring',
      'Remote monitoring system',
      'Alarm and notification system',
      'Energy-efficient operation',
      'Modular design for expansion',
      'Professional installation and training'
    ],
    model_number: 'RHEEM-WTP-10K',
    brand: 'Rheem',
    is_featured: false,
    show_price: false,
    stock_status: 'Made to Order',
    meta_title: 'Rheem Water Treatment Plant 10,000L/day | EINSPOT Nigeria',
    meta_description: 'Rheem industrial water treatment plant with 7-stage filtration and PLC controls. WHO and NAFDAC compliant.',
    meta_keywords: ['rheem water treatment', 'industrial water purification', 'water treatment plant nigeria', 'reverse osmosis']
  }
];

// Helper function to get products by category
export const getProductsByCategory = (category: string): RheemProduct[] => {
  return rheemProductData.filter(product => product.category === category);
};

// Helper function to get featured products
export const getFeaturedProducts = (): RheemProduct[] => {
  return rheemProductData.filter(product => product.is_featured);
};

// Helper function to get all categories
export const getProductCategories = (): string[] => {
  return [...new Set(rheemProductData.map(product => product.category))];
};

// Helper function to search products
export const searchProducts = (query: string): RheemProduct[] => {
  const lowercaseQuery = query.toLowerCase();
  return rheemProductData.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
  );
};