const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";

const supabase = createClient(url, serviceKey);

// Use the existing user ID from DB
const userId = "727a30ed-0915-41c2-8b93-c5bac7bccbbe";

const dummyAds = [
  // ==================== GIRLS PERSONAL ====================
  {
    category: "girls-personal",
    sub_category: "place-available",
    title_en: "Luxurious Wellness Treatment in Colombo",
    description_en: "Enjoy premium relaxation and professional therapy in a luxury suite with private amenities.",
    contact_number: "+94771234561",
    district: "Colombo",
    city: "Colombo 7",
    price_range: "Rs. 8,000 - 15,000",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "girls-personal",
    sub_category: "home-hotel-visit",
    title_en: "Professional Therapy & Healing Visits",
    description_en: "Mobile visits to all major hotels and residences in Colombo and Negombo. Fully certified therapist.",
    contact_number: "+94771234562",
    district: "Colombo",
    city: "Negombo",
    price_range: "Rs. 10,000 - 20,000",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "girls-personal",
    sub_category: "both",
    title_en: "Relaxing Herbal Oil Therapy Kurunegala",
    description_en: "Traditional Ayurvedic relaxing oils used to reduce stress. Calm environment, private parking.",
    contact_number: "+94771234563",
    district: "Kurunegala",
    city: "Kurunegala",
    price_range: "Rs. 5,000 - 8,000",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80",
  },

  // ==================== BOYS PERSONAL ====================
  {
    category: "boys-personal",
    sub_category: "place-available",
    title_en: "Male Professional Sports Massage Specialist",
    description_en: "Deep tissue massage, acupressure therapy, and sports injury recovery treatments. Professional setup.",
    contact_number: "+94772345671",
    district: "Colombo",
    city: "Rajagiriya",
    price_range: "Rs. 6,000 - 12,000",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "boys-personal",
    sub_category: "home-hotel-visit",
    title_en: "Relaxing Full Body Massages for Gentlemen",
    description_en: "Certified male masseur providing hotel and home outcall therapy services in Kandy district.",
    contact_number: "+94772345672",
    district: "Kandy",
    city: "Kandy",
    price_range: "Rs. 7,000 - 15,000",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "boys-personal",
    sub_category: "both",
    title_en: "Holistic Yoga & Wellness Coaching",
    description_en: "Private one-on-one yoga therapy sessions combined with relaxing full body treatments.",
    contact_number: "+94772345673",
    district: "Galle",
    city: "Hikkaduwa",
    price_range: "Rs. 4,000 - 10,000",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
  },

  // ==================== SHEMALE PERSONAL ====================
  {
    category: "shemale-personal",
    sub_category: "place-available",
    title_en: "Elegant Transgender Therapy Suite",
    description_en: "A beautiful space for professional stress-relief treatments. High quality oils, clean towels.",
    contact_number: "+94773456781",
    district: "Colombo",
    city: "Mount Lavinia",
    price_range: "Rs. 7,000 - 12,000",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "shemale-personal",
    sub_category: "home-hotel-visit",
    title_en: "Exclusive Outcall Relaxation Sessions",
    description_en: "Providing premium professional massages to your hotel room or residence in Negombo.",
    contact_number: "+94773456782",
    district: "Gampaha",
    city: "Negombo",
    price_range: "Rs. 9,000 - 18,000",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "shemale-personal",
    sub_category: "both",
    title_en: "Premium Ayurvedic Body Relaxation",
    description_en: "Therapeutic massage designed to relieve muscle tension and soothe joints in Galle.",
    contact_number: "+94773456783",
    district: "Galle",
    city: "Unawatuna",
    price_range: "Rs. 5,000 - 8,000",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  },

  // ==================== MARRIAGE PROPOSALS ====================
  {
    category: "marriage-proposals",
    sub_category: "brides",
    title_en: "Matrimonial Proposal: Educated Buddhist Bride",
    description_en: "Looking for an educated, well-mannered partner for a 26-year-old daughter. Software engineer from Colombo.",
    contact_number: "+94774567891",
    district: "Colombo",
    city: "Nugegoda",
    price_range: "N/A",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "marriage-proposals",
    sub_category: "grooms",
    title_en: "Matrimonial Proposal: Professional Executive Groom",
    description_en: "Respectable G/B parents seek a suitable bride for their son, 31, MBA holder working in Australia.",
    contact_number: "+94774567892",
    district: "Gampaha",
    city: "Kadawatha",
    price_range: "N/A",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "marriage-proposals",
    sub_category: "brides",
    title_en: "Matrimonial Proposal: Respectable Sinhala Bride",
    description_en: "Well-connected family seeking a partner for their daughter, 28, Doctor. Astrology details required.",
    contact_number: "+94774567893",
    district: "Kandy",
    city: "Peradeniya",
    price_range: "N/A",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577fad?w=600&auto=format&fit=crop&q=80",
  },

  // ==================== LIVE CAM ====================
  {
    category: "live-cam",
    sub_category: "whatsapp",
    title_en: "Virtual Stress Relief & Consultation",
    description_en: "Direct video consultation and guided meditation over WhatsApp. Friendly and confidential session.",
    contact_number: "+94775678901",
    district: "Colombo",
    city: "Dehiwala",
    price_range: "Rs. 2,000 - 5,000 / hr",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "live-cam",
    sub_category: "telegram",
    title_en: "Telegram Live Wellness Classes",
    description_en: "Online private yoga and breathing sessions. High definition streaming and clear instruction.",
    contact_number: "+94775678902",
    district: "Colombo",
    city: "Colombo 3",
    price_range: "Rs. 3,000 - 6,000",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "live-cam",
    sub_category: "both-platforms",
    title_en: "Confidential Virtual Coaching Sessions",
    description_en: "Personalized mindfulness sessions available via WhatsApp/Telegram at your convenience.",
    contact_number: "+94775678903",
    district: "Kalutara",
    city: "Panadura",
    price_range: "Rs. 1,500 - 4,000",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=80",
  },

  // ==================== SPA & WELLNESS ====================
  {
    category: "spa-wellness",
    sub_category: "",
    title_en: "Grand Oasis Ayurvedic Wellness Spa",
    description_en: "A premium registered spa offering hot stone therapy, herbal oil baths, and classical massages.",
    contact_number: "+94776789011",
    district: "Colombo",
    city: "Colombo 5",
    price_range: "Rs. 5,000 - 15,000",
    ad_tier: "platinum",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "spa-wellness",
    sub_category: "",
    title_en: "Serene Ayurvedic Healing Sanctuary",
    description_en: "Authentic therapeutic treatments by qualified staff. Relieve back aches, stiffness, and fatigue.",
    contact_number: "+94776789012",
    district: "Colombo",
    city: "Battaramulla",
    price_range: "Rs. 4,500 - 10,000",
    ad_tier: "premium",
    imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "spa-wellness",
    sub_category: "",
    title_en: "Nature Reflexology Massage Hub",
    description_en: "Excellent body reflexology, head, foot, and shoulder massage therapy in Kandy.",
    contact_number: "+94776789013",
    district: "Kandy",
    city: "Kandy",
    price_range: "Rs. 3,000 - 7,000",
    ad_tier: "standard",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80",
  },
];

async function seed() {
  console.log("Seeding started...");

  for (const item of dummyAds) {
    const slug = `${item.title_en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: adRow, error: adError } = await supabase
      .from("ads")
      .insert({
        user_id: userId,
        category: item.category,
        sub_category: item.sub_category,
        title_en: item.title_en,
        title_si: item.title_en + " (සිංහල)",
        description_en: item.description_en,
        description_si: item.description_en + " (සිංහල පරිවර්තනය)",
        slug,
        contact_number: item.contact_number,
        service_area: `${item.city}, ${item.district}`,
        district: item.district,
        city: item.city,
        price_range: item.price_range,
        ad_tier: item.ad_tier,
        status: "active", // Active so they appear immediately
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (adError || !adRow) {
      console.error(`Failed to insert ad: ${item.title_en}`, adError);
      continue;
    }

    // Insert image
    const { error: imgError } = await supabase
      .from("ad_images")
      .insert({
        ad_id: adRow.id,
        cloudinary_url: item.imageUrl,
        alt_text: item.title_en,
        display_order: 1,
      });

    if (imgError) {
      console.error(`Failed to insert image for: ${item.title_en}`, imgError);
    } else {
      console.log(`Successfully seeded: ${item.title_en} [${item.ad_tier}]`);
    }
  }

  console.log("Seeding complete!");
}

seed();
