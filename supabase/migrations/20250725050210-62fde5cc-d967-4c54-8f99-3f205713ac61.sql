-- Add comprehensive project fields for portfolio management
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS technology_used TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_summary TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS process_overview TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS key_features TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_feedback TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_feedback_author TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS focus_keyphrase TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS keyphrase_slug TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS synonyms TEXT;

-- Insert sample EINSPOT projects
INSERT INTO public.projects (
  title, description, client_name, location, category, excerpt, client, status, duration, 
  technology_used, project_summary, process_overview, key_features, client_feedback, 
  client_feedback_author, focus_keyphrase, meta_description, keyphrase_slug, synonyms,
  tags, completion_date, is_featured, featured_image
) VALUES 
(
  'HVAC Installation for NDDC Regional Office – Bayelsa',
  'High-efficiency HVAC installation for government facility featuring LG VRF systems and zone control technology.',
  'Niger Delta Development Commission (NDDC)',
  'Yenagoa, Bayelsa State, Nigeria',
  'Government Projects / HVAC Engineering',
  'EINSPOT SOLUTIONS NIG LTD delivered a high-efficiency HVAC installation for the NDDC regional office in Bayelsa, featuring LG VRF systems, zone control technology, and surge-protected configurations—all under a 5-week timeline.',
  'Niger Delta Development Commission (NDDC)',
  'Completed',
  '5 Weeks',
  'LG VRF Systems, BMS Light, Rheem ductless units',
  'The NDDC Bayelsa office needed a modern HVAC system that could meet the demands of a high-traffic, high-security government facility while minimizing power usage and delivering consistent indoor comfort across offices, boardrooms, and reception areas. EINSPOT''s engineering team conducted a detailed site audit, performed thermal load calculations, and installed an LG VRF solution integrated with Rheem wall-mounted units. We delivered the system in record time while ensuring compliance with national fire and electrical standards.',
  '• Initial Audit: Site walk-through, HVAC needs assessment, and zone mapping
• Design Phase: VRF system sizing, pipe layout planning, indoor unit zoning based on occupancy
• Implementation: Installed over 12 indoor units, wall-mount and cassette types; mounted 4 VRF outdoor units on vibration-isolated brackets
• Electrical Integration: Used dedicated breakers, RCCBs, and surge protection
• Testing & Commissioning: Nitrogen pressure testing, system vacuuming, thermostat setup, and final runtime observation over 48 hours',
  '• LG multi-zone VRF solution optimized for Nigerian climate
• Addressable wall thermostats for each office zone
• Integration with BMS Lite dashboard for facility-wide control
• Quarterly maintenance contract for long-term performance',
  'We are impressed with EINSPOT''s professionalism and attention to detail. Our office is now fully climate-controlled and energy-efficient.',
  'Engr. Dimeji Okafor, NDDC Bayelsa Facility Manager',
  'NDDC HVAC Project Nigeria',
  'Discover how EINSPOT delivered a smart HVAC system for NDDC Bayelsa using LG VRF units and smart zoning for government infrastructure.',
  'nddc-hvac-project-bayelsa',
  'public building air conditioning, government HVAC engineering',
  ARRAY['NDDC HVAC Bayelsa', 'VRF Systems', 'Public Infrastructure'],
  '2024-12-15',
  true,
  '/src/assets/hvac-unit.jpg'
),
(
  'Church of Jesus Christ HVAC Upgrade – Abia State',
  'Full HVAC redesign for worship facility featuring noise-sensitive components and temperature zoning.',
  'Church of Jesus Christ of Latter-Day Saints',
  'Aba, Abia State',
  'Worship & Institutional Projects / HVAC Solutions',
  'EINSPOT delivered a full HVAC redesign for the LDS worship facility in Aba with noise-sensitive components, temperature zoning, and programmable energy-saving logic.',
  'Church of Jesus Christ of Latter-Day Saints',
  'Completed',
  '4 Weeks',
  'LG VRF, Rheem Wall Units, BMS Lite',
  'EINSPOT delivered a full HVAC redesign for the LDS worship facility in Aba. The system featured noise-sensitive components, temperature zoning, and programmable energy-saving logic, allowing consistent comfort during varied occupancy events.',
  '• Site assessment and worship space acoustics evaluation
• Custom VRF design for varied occupancy patterns
• Installation of ceiling-mounted cassette units
• Integration with building management systems
• Testing and commissioning with congregation feedback',
  '• Ceiling-mounted cassette units for silent cooling
• Dedicated Rheem systems for choir & podium
• Programmable thermostats for occupancy patterns
• Surge protected electrical configuration',
  'The new system provides perfect climate control without disrupting our worship services. EINSPOT understood our unique requirements perfectly.',
  'Bishop Michael Adaora, LDS Aba Ward',
  'Church HVAC Upgrade Nigeria',
  'EINSPOT upgraded HVAC for the LDS Church in Aba with zoned VRF systems, smart thermostats, and quiet operations tailored to worship spaces.',
  'church-hvac-upgrade-nigeria',
  'HVAC design for worship centers, church cooling system upgrade',
  ARRAY['Worship HVAC Design', 'VRF for Churches', 'Energy Efficient Cooling'],
  '2024-11-20',
  false,
  '/src/assets/industrial-facility.jpg'
),
(
  'VIP Plumbing & Water Pressure Optimization – Obi Cubana Residence',
  'Complete water pressure stabilization system for high-end residential property.',
  'Mr. Obinna Iyiegbu (Obi Cubana)',
  'Guzape, Abuja',
  'High-End Residential / Plumbing Engineering',
  'EINSPOT retrofitted Obi Cubana''s residence with a complete water pressure stabilization system, eliminating upper-floor flow failures and improving heater function.',
  'Mr. Obinna Iyiegbu (Obi Cubana)',
  'Completed',
  '7 Days',
  'Grundfos Pressure Pump, PPR Piping, Non-return Valves (NRVs), Thermal Water Controls',
  'EINSPOT retrofitted Obi Cubana''s residence with a complete water pressure stabilization system after persistent upper-floor flow failures. We redesigned the pipe network and installed a smart pump with fail-safes, eliminating downtime and improving heater function across all zones.',
  '• Initial assessment of existing plumbing system
• Pressure testing and flow analysis
• Custom pump sizing and placement
• PPR pipe network redesign
• Integration with existing water heaters
• System testing and client handover',
  '• Pressure boosting with surge protection
• Balanced flow for 3-storey distribution
• Integration with Rheem water heaters
• Custom maintenance handover document',
  'EINSPOT transformed our water system completely. No more pressure issues on any floor. Exceptional work quality.',
  'Mr. Obinna Iyiegbu',
  'VIP Residential Plumbing Nigeria',
  'See how EINSPOT improved water pressure and flow in Obi Cubana''s Abuja residence using smart pumps and engineering-grade pipe layouts.',
  'obi-cubana-residence-plumbing',
  'luxury home water system, high-end plumbing Nigeria',
  ARRAY['Residential Plumbing', 'Pressure Boosting', 'Water System Upgrade'],
  '2024-10-30',
  true,
  '/src/assets/water-treatment.jpg'
),
(
  'Multi-Site Rheem Water Heater Supply – Lagos & Abuja',
  'Bulk water heater supply and installation for hotel chains and residential estates.',
  'Multiple Boutique Hotels & Residential Estates',
  'Lagos Island, Abuja, Enugu',
  'Commercial Installations / Water Heating Solutions',
  'EINSPOT continues to serve several hotel chains and estates with bulk Rheem water heater supply, installation, and service contracts with custom safety configurations.',
  'Multiple Boutique Hotels & Residential Estates',
  'Ongoing Service Contract',
  'Ongoing',
  'Rheem Electric & Tankless Heaters, RCCB Breakers, Stabilizers',
  'EINSPOT continues to serve several hotel chains and estates with bulk Rheem water heater supply, installation, and service contracts. Each site is custom-sized, with safety configurations and local maintenance team training included.',
  '• Site surveys and hot water demand analysis
• Custom heater sizing for each location
• Electrical safety circuit design
• Installation and commissioning
• Maintenance team training
• Ongoing service and parts supply',
  '• 30L–200L electric heater installations
• Project-specific safety circuit designs
• Regular descale & parts replacement plan
• Client access to spare part inventory',
  'EINSPOT has been our reliable partner for water heating solutions across all our properties. Their service quality is unmatched.',
  'Chief Engineer, Lagos Hotel Group',
  'Rheem Water Heater Projects Nigeria',
  'EINSPOT installs and maintains Rheem water heaters for hotels and estates across Lagos, Abuja, and Enugu with full electrical and plumbing integration.',
  'rheem-water-heater-nigeria-projects',
  'commercial water heating Nigeria, hot water engineering',
  ARRAY['Rheem Distribution Nigeria', 'Hotel Water Heating', 'Lagos Engineering'],
  '2024-12-01',
  false,
  '/src/assets/water-heater.jpg'
);