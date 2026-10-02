const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'amma_kitchen',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

const MENU_ITEMS_SEED = [
  // --- Restaurant: Breakfast ---
  {
    id: 'ak-idli-vada-combo',
    name: 'Idli & Vada Feast',
    subtitle: 'Steamed Rice Cakes & Golden Fritter',
    price: 89.00,
    original_price: 109.00,
    rating: 4.9,
    review_count: 480,
    description: '3 feather-soft steamed idlis and 1 golden crispy medu vada served with 2 freshly ground chutneys & tiffin sambar.',
    long_description: 'Naturally fermented stone-ground batter makes our idlis delightfully airy and light on the stomach. The medu vada is crunchy on the outside and fluffy inside, paired with freshly ground white coconut chutney, spicy red tomato chutney, and warm drumstick sambar.',
    category: 'Restaurant',
    sub_category: 'Breakfast',
    is_veg: true,
    is_popular: true,
    prep_time: '10-15 mins',
    serving_size: '3 Idlis + 1 Vada',
    calories: '340 kcal',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-ghee-podi-idli',
    name: 'Ghee Podi Mini Idlis',
    subtitle: 'Tossed in Pure Desi Ghee & Spice Blend',
    price: 99.00,
    original_price: 119.00,
    rating: 4.9,
    review_count: 380,
    description: '14 bite-sized button idlis generously bathed in pure cow ghee and Amma’s aromatic roasted lentil spice powder.',
    long_description: 'Salem’s favorite evening comfort. Tiny button idlis tossed in hot golden cow ghee and coated with freshly hand-pounded spice powder of roasted lentils, curry leaves, and dried chillies. Served with coconut chutney.',
    category: 'Restaurant',
    sub_category: 'Breakfast',
    is_veg: true,
    is_popular: true,
    prep_time: '10 mins',
    serving_size: '14 Mini Idlis',
    calories: '310 kcal',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-senior-millet-porridge',
    name: 'Cooling Pearl Millet Porridge',
    subtitle: 'Probiotic Buttermilk Drink',
    price: 79.00,
    original_price: 99.00,
    rating: 4.9,
    review_count: 190,
    description: 'Natural cooling porridge of fermented pearl millet blended with churned fresh buttermilk and crushed shallots.',
    long_description: 'Natural body coolant and restorative breakfast. Fermented pearl millet gently blended with Amma’s fresh churned buttermilk, crushed shallots, and mild curry leaves.',
    category: 'Restaurant',
    sub_category: 'Breakfast',
    is_veg: true,
    is_popular: false,
    prep_time: '5 mins',
    serving_size: '400 ml',
    calories: '190 kcal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Restaurant: Lunch ---
  {
    id: 'ak-south-indian-meals',
    name: 'Grand South Indian Meals',
    subtitle: 'Signature Salem Traditional Thali',
    price: 149.00,
    original_price: 179.00,
    rating: 4.9,
    review_count: 342,
    description: 'Steamed Ponni rice, Salem drumstick sambar, pepper rasam, seasonal vegetable kootu, poriyal, appalam & fresh curd.',
    long_description: 'The crown jewel of Amma’s Kitchen. Prepared fresh daily using heirloom lentils, farm-fresh vegetables from Salem farmers, aromatic freshly ground sambar masala, and cold-pressed pure gingelly oil. Wholesome, satisfying, and cooked with authentic motherly affection.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: true,
    prep_time: '20-25 mins',
    serving_size: 'Serves 1 generous',
    calories: '620 kcal',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-mini-meals',
    name: 'Comfort Mini Meals',
    subtitle: 'Sambar & Curd Rice Duo',
    price: 119.00,
    original_price: 139.00,
    rating: 4.8,
    review_count: 215,
    description: 'Hot ghee sambar rice paired with soothing tempered curd rice, crisp roasted potatoes & appalam.',
    long_description: 'The ideal mid-day lunch crafted for busy workdays. Enjoy the aromatic blend of hot ghee-kissed toor dal sambar rice followed by velvety, cooling curd rice with mustard tempering and Salem-style spiced potato roast.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: true,
    prep_time: '15-20 mins',
    serving_size: 'Serves 1',
    calories: '480 kcal',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-homestyle-veg-meals',
    name: 'Homestyle Buttermilk Meals',
    subtitle: 'Gentle Spiced Comfort Lunch',
    price: 139.00,
    original_price: 159.00,
    rating: 4.8,
    review_count: 198,
    description: 'Steamed rice served with tangy spiced mor kuzhambu (buttermilk curry), digestive pepper rasam, vegetable kootu & sweet payasam.',
    long_description: 'Crafted with the pure nostalgia of home. Featuring cooling spiced buttermilk curry with okra, soothing ginger-garlic pepper rasam for easy digestion, farm vegetable kootu, and a sweet bowl of slow-cooked semiya payasam.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: false,
    prep_time: '20 mins',
    serving_size: 'Serves 1',
    calories: '550 kcal',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-lemon-rice',
    name: 'Salem Lemon Rice',
    subtitle: 'Zesty Turmeric & Roasted Peanuts',
    price: 79.00,
    original_price: 89.00,
    rating: 4.7,
    review_count: 165,
    description: 'Fragrant golden rice tossed with freshly squeezed Salem lemons, roasted crunchy peanuts, turmeric & curry leaves.',
    long_description: 'Zesty, fragrant, and uplifting. Long grains of rice delicately infused with fresh lemon juice, golden turmeric, roasted groundnuts for crunch, mustard seeds, and mild green chillies.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: false,
    prep_time: '10-15 mins',
    serving_size: '350 g',
    calories: '320 kcal',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-millet-sambar-rice',
    name: 'Organic Foxtail Millet Sambar Bowl',
    subtitle: 'High-Fiber Supergrain Lunch',
    price: 109.00,
    original_price: 129.00,
    rating: 4.8,
    review_count: 140,
    description: 'Ancient organic foxtail millet slow-cooked with drumsticks, tender shallots, pure toor dal and aromatic ghee tadka.',
    long_description: 'Ancient wellness in modern culinary perfection. Organic foxtail millet slow-cooked with Salem drumsticks, shallots, and fragrant spices. Rich in protein, low in glycemic index, and deeply comforting.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: false,
    prep_time: '15-20 mins',
    serving_size: '350 g',
    calories: '340 kcal',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-senior-citizen-meal',
    name: 'Senior Citizen Care Meal',
    subtitle: 'Soft, Low-Spice & Gut-Friendly',
    price: 129.00,
    original_price: 159.00,
    rating: 5.0,
    review_count: 420,
    description: 'Specially prepared soft-texture meal with mild ash gourd kootu, digestive cumin-garlic rasam, steamed vegetables & churned buttermilk.',
    long_description: 'Thoughtfully tailored for our beloved senior citizens. Soft-cooked mash rice, gentle moong dal stew with cooling ash gourd, mild digestive cumin rasam with zero harsh spices, steamed carrots and beans, finished with soothing probiotic buttermilk.',
    category: 'Restaurant',
    sub_category: 'Lunch',
    is_veg: true,
    is_popular: true,
    prep_time: '15-20 mins',
    serving_size: 'Tailored Elder Portion',
    calories: '380 kcal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Restaurant: Dinner ---
  {
    id: 'ak-curd-rice',
    name: 'Tempered Curd Rice',
    subtitle: 'Cooling Pomegranate Thayir Sadam',
    price: 79.00,
    original_price: 99.00,
    rating: 4.9,
    review_count: 310,
    description: 'Velvety homestyle thick curd rice tempered with mustard, grated ginger, curry leaves and sweet ruby pomegranate.',
    long_description: 'The ultimate comfort dish for everyday wellness. Soft mashed rice blended with naturally set thick curd, tempered with crackling mustard seeds, green chillies, ginger, and garnished with sweet pomegranate arils.',
    category: 'Restaurant',
    sub_category: 'Dinner',
    is_veg: true,
    is_popular: true,
    prep_time: '10 mins',
    serving_size: '350 g',
    calories: '290 kcal',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-chapati-kurma',
    name: 'Whole Wheat Chapatis with Veg Kurma',
    subtitle: 'Tawa Puffed Chapatis & Coconut Curry',
    price: 99.00,
    original_price: 119.00,
    rating: 4.7,
    review_count: 220,
    description: '3 soft stone-ground whole wheat chapatis served with aromatic coconut, cashew and green peas kurma.',
    long_description: 'Hand-kneaded 100% whole wheat stone-ground flour chapatis puffed on cast iron tawa with drops of ghee. Served alongside fragrant coconut-poppy seed vegetable kurma.',
    category: 'Restaurant',
    sub_category: 'Dinner',
    is_veg: true,
    is_popular: false,
    prep_time: '15 mins',
    serving_size: '3 Chapatis + 250ml Kurma',
    calories: '410 kcal',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Chat Corner (11 to 11) ---
  {
    id: 'chat-burger',
    name: "Amma's Spiced Veggie Burger",
    subtitle: 'Salem Fusion Crispy Burger',
    price: 89.00,
    original_price: 109.00,
    rating: 4.8,
    review_count: 142,
    description: 'Crispy hand-mashed potato & veggie patty seasoned with traditional Salem spices, layered with fresh veggies & house mint sauce.',
    long_description: 'A delightful fusion burger made with local elements. Our potato and mixed vegetable patty is seasoned with wood-pressed oil-roasted masalas, breaded and fried to crisp perfection. Placed inside soft butter-toasted buns with farm-fresh sliced onions, tomatoes, and home-crafted zesty mint-coriander mayonnaise.',
    category: 'Chat Corner',
    sub_category: 'Burger',
    is_veg: true,
    is_popular: true,
    prep_time: '10-12 mins',
    serving_size: 'Serves 1',
    calories: '320 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'chat-pizza',
    name: 'Salem Fusion Paneer Tikka Pizza',
    subtitle: 'Wood-fired Style Indulgent Pizza',
    price: 159.00,
    original_price: 199.00,
    rating: 4.9,
    review_count: 185,
    description: 'Hand-stretched wheat crust loaded with clay-oven baked spiced paneer chunks, crunchy bell peppers, onions & pure mozzarella cheese.',
    long_description: 'Premium fusion pizza crafted with authentic flavors. Soft paneer cubes are marinated overnight in hung curd and hand-pounded tandoori masalas. Arranged on a fresh thin wheat crust with sweet tomatoes, red onion slices, and rich stringy mozzarella, finished with a dash of dried curry leaf powder.',
    category: 'Chat Corner',
    sub_category: 'Pizza',
    is_veg: true,
    is_popular: true,
    prep_time: '15-18 mins',
    serving_size: '7-inch Personal Crust',
    calories: '490 kcal',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'chat-pani-puri',
    name: 'Crispy Mint Pani Puri Set',
    subtitle: 'Classic Salem Street Style Delight',
    price: 59.00,
    original_price: 79.00,
    rating: 4.9,
    review_count: 312,
    description: '8 crispy hollow puris filled with spiced potato-chana mash, served with tangy tamarind water & spicy mint herbal water.',
    long_description: 'Salem’s absolute street favorite prepared under strict hygiene. Eight golden fried crispy semolina puris served with a hearty, warm filling of spiced mashed potatoes and boiled black chickpeas, paired with fresh, ice-cold mint-coriander herbal water (Teekha pani) and a sweet-tangy dates-tamarind nectar (Meetha pani).',
    category: 'Chat Corner',
    sub_category: 'Pani Puri',
    is_veg: true,
    is_popular: true,
    prep_time: '5 mins',
    serving_size: '8 Puris + Filling + Dual Water',
    calories: '180 kcal',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'ak-salem-thattu-vadai-set',
    name: 'Salem Special Street Crackers Set',
    subtitle: 'Crispy Rice Discs with Fresh Veg Toppings',
    price: 69.00,
    original_price: 89.00,
    rating: 4.9,
    review_count: 512,
    description: 'Salem’s iconic evening snack: 4 sets of crispy artisanal rice crackers layered with freshly grated beetroot, carrots & zesty chutneys.',
    long_description: 'Salem’s proudest street heritage made strictly homestyle. Crunchy rice flour crackers stuffed with finely shredded beetroot, carrots, onions, lemon juice, green mint-coriander sauce, and spicy garlic chutney.',
    category: 'Chat Corner',
    sub_category: 'Pani Puri',
    is_veg: true,
    is_popular: true,
    prep_time: '8 mins',
    serving_size: '4 Sets (8 pieces)',
    calories: '240 kcal',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'chat-samosa',
    name: 'Tangy Samosa Dahi Chat',
    subtitle: 'Layered Street Style Samosa Mash',
    price: 79.00,
    original_price: 99.00,
    rating: 4.8,
    review_count: 220,
    description: '2 crushed potato samosas topped with warm spiced white peas curry (ragda), churned sweetened curd, mint and tamarind chutneys & fine sev.',
    long_description: 'An absolute blast of flavors! Two crispy golden samosas are gently crushed and layered with slow-cooked hot yellow/white peas gravy, covered in rich sweet curd, showered with mint chutney and sweet dates chutney, and garnished with roasted cumin powder, red chilli powder, fresh pomegranate, and crispy fine sev.',
    category: 'Chat Corner',
    sub_category: 'Samosa Dahi Chat',
    is_veg: true,
    is_popular: false,
    prep_time: '8-10 mins',
    serving_size: 'Generous Plate',
    calories: '390 kcal',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'chat-sundal',
    name: 'Channa Masala Dahi Sundal',
    subtitle: 'Probiotic Rich Spiced Legume Sundal',
    price: 69.00,
    original_price: 89.00,
    rating: 4.8,
    review_count: 164,
    description: 'Warm boiled white chickpeas tossed in coconut-mustard tempering, layered with rich thick curd, raw mango shreds & fresh coriander.',
    long_description: 'Health and taste combined. Hearty white kabuli chana is boiled till tender, tossed in cold-pressed coconut oil with mustard seeds, split urad dal, green chillies and curry leaves. Drizzled with fresh sweet curd, grated raw mango, carrots and crisp boondi for a refreshing, nutritious crunch.',
    category: 'Chat Corner',
    sub_category: 'Channa Masla Dhahi Sundal',
    is_veg: true,
    is_popular: false,
    prep_time: '6 mins',
    serving_size: '250 g',
    calories: '210 kcal',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Monthly Subscription plans ---
  {
    id: 'sub-breakfast',
    name: 'Tiffin Breakfast Subscription',
    subtitle: 'Breakfast Only Monthly Plan',
    price: 1499.00,
    original_price: 1799.00,
    rating: 4.9,
    review_count: 95,
    description: 'Fresh tiffin delivered daily for 30 days: Idli, Dosa, Pongal, Poori, or Upma with sambar & chutneys. Free delivery.',
    long_description: 'Start your mornings with wholesome, homestyle breakfasts. Features a daily rotation of traditional South Indian breakfast items prepared with overnight-fermented batter and wood-pressed oil. Delivered hot to your doorstep between 7:30 AM and 8:30 AM.',
    category: 'Monthly Subscription',
    sub_category: 'Breakfast only',
    is_veg: true,
    is_popular: false,
    prep_time: 'Delivered Daily',
    serving_size: '1 Person / 30 Days',
    calories: '320-400 kcal/day',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'sub-lunch',
    name: 'Home-style Lunch Subscription',
    subtitle: 'Lunch Only Monthly Plan',
    price: 2199.00,
    original_price: 2499.00,
    rating: 5.0,
    review_count: 142,
    description: 'Comforting Salem thali lunch delivered daily for 30 days: Ponni rice, sambar, rasam, kootu, poriyal & fresh buttermilk.',
    long_description: 'The perfect solution for office-goers and seniors. A balanced, nutritional meal containing rice, fresh dal-based sambar, digestive daily rasam, seasonal vegetable curries, and fresh buttermilk. Lowered oil and salt for everyday health. Delivered between 12:30 PM and 1:30 PM.',
    category: 'Monthly Subscription',
    sub_category: 'Lunch only',
    is_veg: true,
    is_popular: true,
    prep_time: 'Delivered Daily',
    serving_size: '1 Person / 30 Days',
    calories: '550-650 kcal/day',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'sub-dinner',
    name: 'Comfort Dinner Subscription',
    subtitle: 'Dinner Only Monthly Plan',
    price: 1999.00,
    original_price: 2299.00,
    rating: 4.9,
    review_count: 110,
    description: 'Light, gut-friendly dinners delivered daily for 30 days: Soft chapatis with veg kurma, idli combo, or curd rice.',
    long_description: 'Unwind with light and easy-to-digest dinners cooked with care. Features soft wheat chapatis, button idlis tossed in mild podi, or cooling curd rice with pomegranate. Delivered hot between 7:30 PM and 8:30 PM.',
    category: 'Monthly Subscription',
    sub_category: 'Dinner only',
    is_veg: true,
    is_popular: false,
    prep_time: 'Delivered Daily',
    serving_size: '1 Person / 30 Days',
    calories: '350-450 kcal/day',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'sub-full',
    name: 'Full Day Triple Meal Subscription',
    subtitle: 'All-Inclusive Monthly Subscription',
    price: 4999.00,
    original_price: 5999.00,
    rating: 5.0,
    review_count: 178,
    description: 'Complete meal solutions (Breakfast, Lunch, and Dinner) delivered hot thrice a day for 30 days. Save 25%.',
    long_description: 'Let Amma take care of your kitchen. The ultimate monthly subscription delivering hot, freshly cooked breakfast, lunch, and dinner to your door. Balanced menus, rotating specials, zero soda, zero preservatives, and made with cold-pressed oils. Highly recommended for students, working professionals, and seniors living independently.',
    category: 'Monthly Subscription',
    sub_category: 'Monthly Subscription',
    is_veg: true,
    is_popular: true,
    prep_time: 'Delivered Thrice Daily',
    serving_size: '1 Person / 30 Days',
    calories: '1300-1500 kcal/day total',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Amma's kitchen Special / SKC Corner ---
  {
    id: 'skc-sweet',
    name: 'Traditional Ghee Mysore Pak',
    subtitle: 'Melting Royal Chickpea Sweet',
    price: 120.00,
    original_price: 150.00,
    rating: 5.0,
    review_count: 295,
    description: 'Rich, aromatic sweet made of roasted chickpea flour (besan), pure hot cow ghee, and fine sugar, melting instantly in your mouth.',
    long_description: 'Cooked using traditional methods in heavy brass vessels. We roast premium chickpea flour till fragrant and slow-pour hot bubbling cow ghee until it absorbs and forms a porous, melt-in-the-mouth, aromatic royal sweet block. Packaged fresh.',
    category: 'SKC Corner',
    sub_category: 'Sweet',
    is_veg: true,
    is_popular: true,
    prep_time: '5 mins',
    serving_size: '250 g Box',
    calories: '420 kcal',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'skc-karam',
    name: 'Salem Special Kara Boondi',
    subtitle: 'Crispy Spiced Gram Flour Droplets',
    price: 80.00,
    original_price: 99.00,
    rating: 4.8,
    review_count: 164,
    description: 'Crispy fried chickpea flour droplets tossed with roasted cashew nuts, peanuts, garlic cloves, curry leaves & chilli powder.',
    long_description: 'Salem’s perfect accompaniment for meals and evening tea. Golden droplets of gram flour batter are fried in cold-pressed oil, tossed immediately with roasted peanuts, crunchy split cashews, crushed garlic pods, fresh curry leaves, and a sprinkle of spicy Kashmiri red chilli powder and salt.',
    category: 'SKC Corner',
    sub_category: 'Karam',
    is_veg: true,
    is_popular: false,
    prep_time: '5 mins',
    serving_size: '200 g Packet',
    calories: '280 kcal',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'skc-coffee',
    name: "Amma's Fresh Filter Coffee",
    subtitle: 'Authentic Chicory Blend Filter Brew',
    price: 30.00,
    original_price: 40.00,
    rating: 4.9,
    review_count: 385,
    description: 'Strong traditional decoction brewed from fresh coffee beans, frothed with hot creamy milk and raw sugar.',
    long_description: 'An absolute Salem wake-up tradition. Freshly ground coffee beans (80% Arabica, 20% Chicory) slow-dripped overnight in brass filters to extract the thick aromatic decoction, mixed with boiling cow milk, and frothed in traditional tumblers.',
    category: 'SKC Corner',
    sub_category: 'Coffee',
    is_veg: true,
    is_popular: true,
    prep_time: '5 mins',
    serving_size: '150 ml Tumbler',
    calories: '110 kcal',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Cold Beverages ---
  {
    id: 'cold-nannari',
    name: 'Fragrant Nannari Sarbath',
    subtitle: 'Cooling Sarsaparilla Herb Drink',
    price: 45.00,
    original_price: 55.00,
    rating: 4.8,
    review_count: 154,
    description: 'Refreshing iced drink made with organic sarsaparilla root syrup, freshly squeezed lime, and sweet basil seeds (sabja).',
    long_description: 'The perfect summer coolant. Sarsaparilla (Nannari) roots are boiled to create a fragrant, earthy syrup. Hand-shaken with iced water, freshly crushed lime juice, and soaked gelatinous sabja seeds which act as a natural body coolant.',
    category: 'Cold Beverages',
    is_veg: true,
    is_popular: true,
    prep_time: '4 mins',
    serving_size: '300 ml Glass',
    calories: '120 kcal',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cold-rosemilk',
    name: 'Authentic Rose Milk',
    subtitle: 'Nostalgic Chilled Sweet Milk',
    price: 50.00,
    original_price: 60.00,
    rating: 4.9,
    review_count: 224,
    description: 'Creamy chilled milk blended with sweet organic rose petal extract syrup, served ice cold.',
    long_description: 'Revisit childhood memories. Pure cow milk is boiled and chilled, then blended with Amma’s aromatic, natural rose syrup made from real damask rose petals, giving a pleasant pink hue and calming floral fragrance.',
    category: 'Cold Beverages',
    is_veg: true,
    is_popular: false,
    prep_time: '3 mins',
    serving_size: '300 ml Glass',
    calories: '180 kcal',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cold-badam',
    name: 'Creamy Cold Badam Milk',
    subtitle: 'Saffron Infused Almond Milk',
    price: 60.00,
    original_price: 75.00,
    rating: 4.9,
    review_count: 198,
    description: 'Chilled rich milk slow-cooked with ground almonds, cardamoms, and real saffron strands, topped with chopped almond bits.',
    long_description: 'Luxury in a glass. Premium almonds are soaked, peeled, and stone-ground to a fine paste. Simmered with full cream milk, crushed cardamom, and saffron strands until golden, then chilled to perfection. Garnished with almond slivers.',
    category: 'Cold Beverages',
    is_veg: true,
    is_popular: true,
    prep_time: '4 mins',
    serving_size: '300 ml Glass',
    calories: '230 kcal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80'
  },

  // --- Ice Cream & Brownie ---
  {
    id: 'dessert-brownie',
    name: 'Sizzling Brownie with Vanilla',
    subtitle: 'Warm Fudgy Brownie & Cool Ice Cream',
    price: 129.00,
    original_price: 159.00,
    rating: 4.9,
    review_count: 342,
    description: 'Rich warm double-chocolate fudge brownie topped with a scoop of premium vanilla bean ice cream & chocolate drizzle.',
    long_description: 'The ultimate contrast. A dense, gooey, dark chocolate fudge brownie baked fresh in Amma’s kitchen is warmed and paired with a scoop of velvety vanilla bean ice cream, finished with homemade warm chocolate ganache pour.',
    category: 'Ice Cream & Brownie',
    is_veg: true,
    is_popular: true,
    prep_time: '5-7 mins',
    serving_size: 'Serves 1 generous',
    calories: '380 kcal',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'dessert-kulfi',
    name: 'Rich Mango Kulfi Slice',
    subtitle: 'Creamy Indian Mango Ice Cream',
    price: 79.00,
    original_price: 99.00,
    rating: 5.0,
    review_count: 265,
    description: 'Traditional slow-reduced milk kulfi infused with sweet Salem Alphonso mango pulp, cardamom, and sliced pistachios.',
    long_description: 'Pure Indian dessert royalty. Whole milk is simmered and reduced to one-third, sweetened and blended with fresh pulp of hand-picked Salem Alphonso mangoes, poured into traditional metal cones, and frozen. Served in thick circular slices.',
    category: 'Ice Cream & Brownie',
    is_veg: true,
    is_popular: false,
    prep_time: '3 mins',
    serving_size: '1 Sliced Circle (120g)',
    calories: '160 kcal',
    image: 'https://images.unsplash.com/photo-1488900128323-24ddcefed296?auto=format&fit=crop&w=1000&q=80'
  }
];

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Successfully connected to PostgreSQL. Setting up tables...');

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Addresses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        label VARCHAR(50) NOT NULL,
        address_line TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE
      );
    `);

    // Menu Items Table with sub_category column
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        rating DECIMAL(3, 2),
        review_count INTEGER,
        description TEXT,
        long_description TEXT,
        category VARCHAR(100) NOT NULL,
        is_veg BOOLEAN DEFAULT TRUE,
        is_popular BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        prep_time VARCHAR(50),
        serving_size VARCHAR(100),
        calories VARCHAR(50),
        image TEXT
      );
    `);

    // Run table alteration to support sub_category if it doesn't exist
    await client.query(`
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100);
    `);

    // Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        packaging_fee DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Received',
        delivery_address TEXT NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id VARCHAR(255) REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        special_notes TEXT
      );
    `);

    // Alter orders table to support rider and payment fields
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_name VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_phone VARCHAR(20);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';
    `);

    console.log('Tables verified. Seeding menu items...');

    // Seed Menu Items
    for (const item of MENU_ITEMS_SEED) {
      await client.query(`
        INSERT INTO menu_items (
          id, name, subtitle, price, original_price, rating, review_count, 
          description, long_description, category, sub_category, is_veg, is_popular, 
          prep_time, serving_size, calories, image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          subtitle = EXCLUDED.subtitle,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          description = EXCLUDED.description,
          long_description = EXCLUDED.long_description,
          category = EXCLUDED.category,
          sub_category = EXCLUDED.sub_category,
          image = EXCLUDED.image;
      `, [
        item.id, item.name, item.subtitle, item.price, item.original_price, item.rating, item.review_count,
        item.description, item.long_description, item.category, item.sub_category || null, item.is_veg, item.is_popular,
        item.prep_time, item.serving_size, item.calories, item.image
      ]);
    }

    // Seed default test customer
    await client.query(`
      INSERT INTO users (id, name, phone, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING;
    `, ['user-123', 'Akarsh Raj', '9876543210', 'akarsh@test.com']);

    // Create Elder Profiles Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_elder_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        dietary_restriction VARCHAR(100),
        delivery_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default elder care profile for testing
    await client.query(`
      INSERT INTO user_elder_profiles (id, user_id, name, phone, address, dietary_restriction, delivery_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING;
    `, ['elder-1', 'user-123', 'Saraswathi Amma', '9876543211', '14, Hasthampatti Main Road, Salem, Tamil Nadu', 'low-salt', 'Deliver strictly to hands, rings bell twice.']);

    // Create Meal Planner Calendar Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_meal_planner (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        plan_date DATE NOT NULL,
        meal_slot VARCHAR(50) NOT NULL,
        menu_item_id VARCHAR(255) REFERENCES menu_items(id),
        status VARCHAR(50) DEFAULT 'Scheduled',
        UNIQUE(user_id, plan_date, meal_slot)
      );
    `);

    // Create Loyalty Points Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_loyalty_points (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        points_balance INTEGER DEFAULT 0,
        meals_donated INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default loyalty points for test user
    await client.query(`
      INSERT INTO user_loyalty_points (user_id, points_balance, meals_donated)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO NOTHING;
    `, ['user-123', 250, 2]);

    // Create Coupons Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount_value INTEGER NOT NULL,
        discount_type VARCHAR(20) DEFAULT 'fixed',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default coupons
    await client.query(`
      INSERT INTO coupons (code, discount_value, discount_type, is_active)
      VALUES 
        ('AMMA50', 50, 'fixed', TRUE),
        ('FIRST', 30, 'fixed', TRUE),
        ('WELCOME', 20, 'percent', TRUE),
        ('AMMAVIP', 25, 'fixed', TRUE)
      ON CONFLICT (code) DO NOTHING;
    `);

    console.log('Database initialization and seeding complete.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase
};
