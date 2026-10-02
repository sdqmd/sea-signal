export type Place = {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  area: string
  format: 'À la carte' | 'Buffet'
  dish: string
  why: string
  badge: string
  menuUrl: string
  certificate: string
  rank: number
  waterfront?: boolean
}

// Restaurant menus and the MUIS halal establishment register were checked on 2 October 2026.
// Certificates are outlet-specific; re-check the MUIS register before visiting.
export const places: Place[] = [
  {
    id: 'mutiara-geylang', name: 'Mutiara Seafood', lat: 1.3162885, lng: 103.8966646,
    address: '1 Engku Aman Turn, Wisma Geylang Serai, #01-02', area: 'Geylang Serai',
    format: 'À la carte', dish: 'Signature Chilli Crab with fried mini buns',
    why: 'JUMBO Group’s halal seafood concept. The set menu names its signature chilli crab.',
    badge: 'Top pick · signature crab', menuUrl: 'https://www.mutiaraseafood.com/menu/Mutiara_Seafood_Set_menu.pdf',
    certificate: 'EERT20240000585', rank: 1,
  },
  {
    id: 'sampanman-jewel', name: 'SampanMan Kelong Changi', lat: 1.360341, lng: 103.989078,
    address: '78 Airport Boulevard, Jewel Changi Airport, #B1-223', area: 'Jewel Changi',
    format: 'À la carte', dish: 'Sri Lankan chilli crab',
    why: 'A kelong-inspired seafood feast with a spicier Sri Lankan take on chilli crab.',
    badge: 'For a spicy twist', menuUrl: 'https://www.sampanman.sg/',
    certificate: 'EERT20230000293', rank: 2,
  },
  {
    id: 'home-of-seafood', name: 'Home of Seafood', lat: 1.313287, lng: 103.8997384,
    address: '1 Joo Chiat Place, #01-01', area: 'Joo Chiat',
    format: 'À la carte', dish: 'Award-Winning Chilli Crab',
    why: 'Chinese-style seafood dining with chilli crab and crispy buns on the ordering menu.',
    badge: 'For classic zi char', menuUrl: 'https://order.homeofseafood.com/product-category/live-crab/',
    certificate: 'EERT20220000071', rank: 3,
  },
  {
    id: 'rasa-pasir-ris', name: 'Rasa Istimewa · Pasir Ris', lat: 1.3816417, lng: 103.9484734,
    address: '201 Pasir Ris Road, #01-03', area: 'Pasir Ris Park',
    format: 'À la carte', dish: 'Chilli Crab with fried mini buns',
    why: 'A park-side halal seafood option with chilli crab listed on its à la carte menu.',
    badge: 'Park-side pick', menuUrl: 'https://www.rasaistimewa.sg/_files/ugd/d10c37_94e6967a3b5f4f16a4a4d0158dbc841d.pdf',
    certificate: 'EERN21010012029', rank: 4, waterfront: true,
  },
  {
    id: 'rasa-jurong', name: 'Rasa Istimewa · SAFRA Jurong', lat: 1.3348887, lng: 103.7064094,
    address: '333 Boon Lay Way, SAFRA Jurong, #2B-01', area: 'Jurong',
    format: 'À la carte', dish: 'Signature Chilli Crab',
    why: 'The restaurant calls its chilli crab a signature dish, alongside classic halal Chinese seafood.',
    badge: 'West-side favourite', menuUrl: 'https://www.rasaistimewa.sg/company',
    certificate: 'EERX21010012028', rank: 5,
  },
  {
    id: 'straits-kitchen', name: 'StraitsKitchen', lat: 1.3064248, lng: 103.8334719,
    address: '10 Scotts Road, Grand Hyatt Singapore, lobby level', area: 'Orchard',
    format: 'Buffet', dish: 'Chilli Crab on the halal buffet',
    why: 'A hotel buffet for trying chilli crab with other Singapore favourites. Check the day’s spread.',
    badge: 'Buffet experience', menuUrl: 'https://www.singapore.grand.hyattrestaurants.com/straitskitchen',
    certificate: 'EEFS20240000743', rank: 6,
  },
  {
    id: 'mackenzie-rex', name: 'MacKenzie Rex', lat: 1.299736, lng: 103.850084,
    address: '66 Prinsep Street, #01-01', area: 'Prinsep Street',
    format: 'À la carte', dish: 'Chilli Crab',
    why: 'A long-running halal Chinese restaurant that lists chilli crab among its specialties.',
    badge: 'Heritage option', menuUrl: 'https://www.macrex.com.sg/',
    certificate: 'EERN21060012507', rank: 7,
  },
]

export const muisUrl = 'https://halal.muis.gov.sg/halal/establishments'
