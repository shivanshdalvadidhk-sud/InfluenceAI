const supabase = require('../config/supabase');

const seedData = async (req, res) => {
  try {
    const demoBrandUserId = "a0000000-0000-0000-0000-000000000001";
    const demoCreatorUserId = "a0000000-0000-0000-0000-000000000002";

    // 1. Seed Profiles
    await supabase.from('profiles').upsert([
      { id: demoBrandUserId, account_type: 'brand' },
      { id: demoCreatorUserId, account_type: 'influencer' }
    ]);

    // 2. Seed Brands
    await supabase.from('brands').upsert([
      {
        user_id: demoBrandUserId,
        company_name: 'Aura Lifestyle',
        brand_name: 'Aura Lifestyle',
        industry_category: 'Fashion',
        headquarters_city: 'Mumbai',
        state_ut: 'Maharashtra',
        terms_accepted: true,
        description: 'D2C sustainable fashion brand'
      }
    ]);

    // 3. Seed Influencers
    const sampleInfluencers = [
      {
        user_id: demoCreatorUserId,
        full_name: 'Rohan Mehta',
        creator_name: 'Rohan Mehta',
        youtube_handle: '@techwithrohan',
        content_niche_category: 'Technology',
        state_ut: 'Karnataka',
        terms_accepted: true,
        bio: 'Deep-dive smartphone reviews, AI gadgets & PC builds.',
        primary_platform: 'YouTube',
        subscribers: 1850000,
        avg_views: 420000,
        engagement_rate: 4.8,
        graph_score: 92,
        estimated_cost: 184800,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      },
      {
        user_id: demoCreatorUserId,
        full_name: 'Vikramaditya Roy',
        creator_name: 'Vikramaditya Roy',
        youtube_handle: '@fit_vikram_yt',
        content_niche_category: 'Fitness',
        state_ut: 'Delhi',
        terms_accepted: true,
        bio: 'Home workout programs, diet nutrition guides & sports science.',
        primary_platform: 'YouTube',
        subscribers: 680000,
        avg_views: 190000,
        engagement_rate: 5.2,
        graph_score: 91,
        estimated_cost: 95000,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        user_id: demoCreatorUserId,
        full_name: 'Suhana Kapoor',
        creator_name: 'Suhana Kapoor',
        youtube_handle: '@suhana_vogue_yt',
        content_niche_category: 'Fashion',
        state_ut: 'Delhi',
        terms_accepted: true,
        bio: 'Luxury designer clothing reviews & wedding couture styling vlogs.',
        primary_platform: 'YouTube',
        subscribers: 1600000,
        avg_views: 410000,
        engagement_rate: 6.1,
        graph_score: 89,
        estimated_cost: 150000,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        user_id: demoCreatorUserId,
        full_name: 'Kabir Dev',
        creator_name: 'Kabir Dev',
        youtube_handle: '@kabirplay',
        content_niche_category: 'Gaming',
        state_ut: 'Maharashtra',
        terms_accepted: true,
        bio: 'Action shooter game streaming, competitive Indian esports insights.',
        primary_platform: 'YouTube',
        subscribers: 2400000,
        avg_views: 650000,
        engagement_rate: 7.4,
        graph_score: 95,
        estimated_cost: 210000,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ];

    await supabase.from('influencers').insert(sampleInfluencers);

    // 4. Seed Inquiries (Influencer Side Inbox)
    const sampleInquiries = [
      {
        company_id: demoBrandUserId,
        influencer_id: '1',
        campaign_name: 'Festive Wear Product Unboxing & Review',
        company_name: 'Aura Lifestyle',
        message: 'We would love to sponsor a 60-second unboxing segment for our organic festive collection.',
        bid_amount: 120000,
        deliverables: ['60s Video Integration', 'Instagram Story Cross-post'],
        status: 'New'
      },
      {
        company_id: demoBrandUserId,
        influencer_id: '1',
        campaign_name: 'AI Developer Suite Launch Campaign',
        company_name: 'TechCorp Solutions',
        message: 'Showcase our new AI code generator tool with a live demonstration in your video.',
        bid_amount: 220000,
        deliverables: ['Dedicated Video', 'Community Post'],
        status: 'New'
      }
    ];

    await supabase.from('inquiries').insert(sampleInquiries);

    // 5. Seed Campaigns
    const sampleCampaigns = [
      {
        company_id: demoBrandUserId,
        name: 'Festive Wear Product Unboxing & Review',
        category: 'Fashion',
        budget: 150000,
        description: 'Promote organic cotton festive ethnic line for Diwali season.',
        audience_gender: 'Female',
        audience_language: 'Hindi',
        state_ut: 'Maharashtra',
        status: 'Active'
      },
      {
        company_id: demoBrandUserId,
        name: 'AI Coding Assistant Integration',
        category: 'Technology',
        budget: 200000,
        description: '60-second integrated sponsor segment showcasing AI developer toolkit.',
        audience_gender: 'Male',
        audience_language: 'English',
        state_ut: 'Karnataka',
        status: 'Active'
      }
    ];

    await supabase.from('campaigns').insert(sampleCampaigns);

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully with initial creators, campaigns, and inquiries!'
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { seedData };
