import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]
    
    # Assets directory
    assets_dir = r"C:\Users\bhada\.gemini\antigravity\brain\c14eca71-6b9b-426c-af41-14540b49f461\presentation_assets\ppt\media"
    img_er = os.path.join(assets_dir, "image1.png")
    img_landing = os.path.join(assets_dir, "image2.jpg")
    img_campaign = os.path.join(assets_dir, "image3.jpg")
    img_login = os.path.join(assets_dir, "image4.jpg")
    img_flow = os.path.join(assets_dir, "image5.jpg")

    # Colors
    c_dark_navy = RGBColor(15, 23, 42)      # #0F172A
    c_slate = RGBColor(30, 41, 59)          # #1E293B
    c_purple = RGBColor(124, 58, 237)       # #7C3AED
    c_indigo = RGBColor(79, 70, 229)        # #4F46E5
    c_blue = RGBColor(2, 132, 199)          # #0284C7
    c_light_bg = RGBColor(248, 250, 252)    # #F8FAFC
    c_card_bg = RGBColor(255, 255, 255)     # #FFFFFF
    c_card_border = RGBColor(226, 232, 240) # #E2E8F0
    c_text_dark = RGBColor(15, 23, 42)
    c_text_muted = RGBColor(100, 116, 139)  # #64748B
    c_green = RGBColor(16, 185, 129)        # #10B981

    def set_slide_background(slide, color):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="INFLUENCEAI — AI-POWERED RECOMMENDATION SYSTEM"):
        # Category pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf = cat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = c_indigo

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = c_text_dark

    def add_card(slide, left, top, width, height, bg_color=c_card_bg, border_color=c_card_border):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1)
        else:
            shape.line.fill.background()
        return shape

    # =========================================================================
    # SLIDE 1: Title Slide (Dark Theme)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, c_dark_navy)

    # Decorative header
    inst_box = s1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(0.5))
    p = inst_box.text_frame.paragraphs[0]
    p.text = "CHARUSAT  ·  DEPSTAR  ·  DEPARTMENT OF INFORMATION TECHNOLOGY"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)

    proj_id_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(0.4))
    p = proj_id_box.text_frame.paragraphs[0]
    p.text = "Project ID: PRJ_IT_5_2026_25  |  Semester 5 Project Review"
    p.font.size = Pt(12)
    p.font.color.rgb = c_indigo

    # Big Title
    title_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(2.2))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "AI-Powered Social Media\nInfluencer Recommendation System"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(1.0), Inches(4.1), Inches(11.3), Inches(0.8))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Intelligent Multi-Factor Matching, Sentence-BERT Semantic Search, Polyglot Database Architecture & Explainable Creator Discovery"
    p.font.size = Pt(15)
    p.font.color.rgb = RGBColor(203, 213, 225)

    # Presenters Card
    add_card(s1, Inches(1.0), Inches(5.2), Inches(6.5), Inches(1.6), bg_color=c_slate, border_color=None)
    card_tb = s1.shapes.add_textbox(Inches(1.2), Inches(5.3), Inches(6.1), Inches(1.4))
    tf = card_tb.text_frame
    p = tf.paragraphs[0]
    p.text = "STUDENT TEAM MEMBERS"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)

    team_members = [
        "24DIT004 — Yashvi Bhadani (Data Pipeline & Ingestion)",
        "24DIT014 — Shivansh (UI/UX & NLP Semantic Engine)",
        "24DIT030 — Astha Makwana (Supabase Database & Authentication)"
    ]
    for m in team_members:
        p2 = tf.add_paragraph()
        p2.text = f"•  {m}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = RGBColor(255, 255, 255)

    # Guide Card
    add_card(s1, Inches(7.8), Inches(5.2), Inches(4.5), Inches(1.6), bg_color=c_slate, border_color=None)
    g_tb = s1.shapes.add_textbox(Inches(8.0), Inches(5.3), Inches(4.1), Inches(1.4))
    tf2 = g_tb.text_frame
    p = tf2.paragraphs[0]
    p.text = "PROJECT MENTOR & GUIDE"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)
    p2 = tf2.add_paragraph()
    p2.text = "Ms. Neeta Chudasama"
    p2.font.size = Pt(15)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p3 = tf2.add_paragraph()
    p3.text = "Assistant Professor, Dept. of Information Technology\nDEPSTAR, CHARUSAT"
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(203, 213, 225)

    s1.notes_slide.notes_text_frame.text = (
        "Good morning respected guide and faculty members. Welcome to our Semester 5 project review. "
        "Our project is 'InfluenceAI' — an AI-powered social media influencer recommendation system. "
        "Presented by Yashvi, Shivansh, and Astha, guided by Ms. Neeta Chudasama."
    )

    # =========================================================================
    # SLIDE 2: Problem Statement & Motivation
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, c_light_bg)
    add_header(s2, "The Real-World Problem: Why Influencer Selection is Broken")

    # Left Column: The Problem (Red accented card)
    add_card(s2, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tb_prob = s2.shapes.add_textbox(Inches(1.1), Inches(1.8), Inches(5.0), Inches(4.8))
    tf = tb_prob.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Current Industry Bottlenecks"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(220, 38, 38)

    points = [
        ("Vanity Metrics Bias:", "Brands blindly select creators by follower counts, ignoring true engagement rates, real views, and audience fit."),
        ("No Semantic Content Match:", "A fitness brand launching a 'plant-based keto protein' campaign is matched with bodybuilding gym channels rather than plant-based lifestyle creators."),
        ("High Budget Inefficiencies:", "Over 68% of marketing budget is squandered on mid/macro influencers whose actual target demographics don't match the campaign."),
        ("Manual & Unscalable Discovery:", "Marketing agencies spend 15–25 hours per campaign manually scouring YouTube, scraping contact emails, and guessing creator collaboration rates.")
    ]
    for title, desc in points:
        p1 = tf.add_paragraph()
        p1.text = f"• {title} "
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_muted

    # Right Column: The Proposed Solution
    add_card(s2, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tb_sol = s2.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.1), Inches(4.8))
    tf2 = tb_sol.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "InfluenceAI's Solution Approach"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = c_indigo

    sol_points = [
        ("Multi-Dimensional Filtering:", "Enforces hard boundaries: verified category, country/location, and creator pricing tier tailored to the brand's budget."),
        ("Dense Semantic NLP Matching:", "Uses Sentence-BERT (all-MiniLM-L6-v2) to map freeform campaign briefs against dense creator video content profiles."),
        ("True Engagement Normalization:", "Evaluates (Likes + Comments) / Views with 5th–95th percentile clipping to eliminate viral clickbait distortions."),
        ("Transparent & Explainable Scoring:", "Every recommendation details its semantic match %, engagement score %, tier suitability, and direct contact email.")
    ]
    for title, desc in sol_points:
        p1 = tf2.add_paragraph()
        p1.text = f"✔ {title} "
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_muted

    s2.notes_slide.notes_text_frame.text = (
        "Here we articulate the core motivation. Finding influencers is easy, but finding the right influencer "
        "who genuinely matches a specific campaign goal, audience niche, and budget is an unsolved challenge. "
        "Traditional tools only filter by subscriber counts. InfluenceAI introduces deep semantic matching."
    )

    # =========================================================================
    # SLIDE 3: System Innovation & Objectives
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, c_light_bg)
    add_header(s3, "Project Objectives & Technical Innovations")

    objectives = [
        ("1. Multi-Factor Constraint Engine", "Filters candidate channels across strict categorical niches, geographical location (India vs Global), and budget tier eligibility (Nano, Micro, Mid, Macro).", c_indigo),
        ("2. Deep Semantic Understanding", "Transforms unstructured campaign descriptions into 384-dimensional dense vectors and compares them with creator video topic vectors using Cosine Similarity.", c_purple),
        ("3. Engagement & Metric Scaling", "Calculates authentic creator interaction rates, weeding out inactive channels and weighting consistency over one-off viral video spikes.", c_blue),
        ("4. Explainable ML Ranking Formula", "Combines semantic relevance (70%) and engagement performance (30%) with customizable weights based on Awareness, Engagement, or Conversions goals.", c_green),
        ("5. Dual-Role Creator Platform", "Brands search and manage campaigns; verified creators register their YouTube channels, which are automatically ingested and indexed in real-time.", c_indigo),
        ("6. Privacy-Safe Direct Collaboration", "Single batched query (Zero N+1) to surface public collaboration emails for registered creators directly on recommendation cards.", c_purple)
    ]

    for idx, (title, desc, color) in enumerate(objectives):
        col = idx % 3
        row = idx // 3
        left = Inches(0.8 + col * 3.95)
        top = Inches(1.6 + row * 2.7)
        add_card(s3, left, top, Inches(3.75), Inches(2.4))
        tb = s3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(3.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_muted

    s3.notes_slide.notes_text_frame.text = (
        "These six technical innovations set InfluenceAI apart. Notice how we balance both the brand's need "
        "for semantic matching and the creator's need for direct collaboration, backed by a mathematical ranking formula."
    )

    # =========================================================================
    # SLIDE 4: End-to-End System Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, c_light_bg)
    add_header(s4, "End-to-End System Architecture & Data Flow")

    # 5 Horizontal Architecture Blocks
    arch_steps = [
        ("1. Data Sources & Ingestion", "• YouTube Data API v3\n• Channel metadata & stats\n• Top 15 recent videos\n• Automated background task", c_indigo),
        ("2. Raw Document Layer", "• MongoDB (influencer_db)\n• Channels collection\n• Videos collection\n• Preserves raw API schemas", c_purple),
        ("3. AI & Embeddings Engine", "• FastAPI Python Server\n• Sentence-BERT (MiniLM)\n• 384-dim dense vectors\n• Multi-objective ranking", c_blue),
        ("4. Structured Cloud Store", "• Supabase PostgreSQL\n• JSONB vector embeddings\n• Supabase Auth (JWT)\n• Row-Level Security (RLS)", c_green),
        ("5. User Application", "• React 19 + MUI Client\n• Express.js Gateway Proxy\n• Live channel registration\n• Explainable card deck", c_indigo)
    ]

    for idx, (title, desc, color) in enumerate(arch_steps):
        left = Inches(0.8 + idx * 2.38)
        top = Inches(1.6)
        add_card(s4, left, top, Inches(2.25), Inches(5.2))
        tb = s4.shapes.add_textbox(left + Inches(0.15), top + Inches(0.2), Inches(1.95), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        
        for line in desc.split("\n"):
            p2 = tf.add_paragraph()
            p2.text = line
            p2.font.size = Pt(10)
            p2.font.color.rgb = c_text_dark

    s4.notes_slide.notes_text_frame.text = (
        "Here is our complete architecture. Notice the polyglot storage design: MongoDB acts as our raw data lake, "
        "while Supabase PostgreSQL serves as the relational operational database and vector store. "
        "FastAPI executes the heavy ML tensor computations, and React provides an interactive dashboard."
    )

    # =========================================================================
    # SLIDE 5: How Supabase Works in InfluenceAI (Detailed Explanatory Slide)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, c_light_bg)
    add_header(s5, "Deep Dive: How Supabase Works in InfluenceAI")

    supabase_pillars = [
        ("1. Relational PostgreSQL Engine", 
         "• Managed cloud PostgreSQL cluster on AWS.\n"
         "• Strict schemas: public.brands, public.influencers, public.campaigns, public.recommendation_history.\n"
         "• Enforces foreign-key integrity between auth.users and user profile records.", c_indigo),
        
        ("2. Supabase Auth & JWT Session Life-Cycle",
         "• Client-side session management via @supabase/supabase-js.\n"
         "• Reactive state sync via supabase.auth.onAuthStateChange.\n"
         "• Issues cryptographically signed RS256/HS256 Bearer JWTs.\n"
         "• Verified on FastAPI via get_current_user dependency.", c_purple),

        ("3. Row-Level Security (RLS) & Privacy Views",
         "• RLS policy: (auth.uid() = user_id) allows creators to edit only their own channel records.\n"
         "• View registered_channels_public exposes contact_email ONLY when show_email_publicly = true.\n"
         "• Eliminates data leaks: brands cannot access private creator settings.", c_blue),

        ("4. Vector Storage via JSONB Embeddings",
         "• Stores 384-dimensional dense SBERT floating-point vectors directly in ml_data.channels.\n"
         "• Indexed via unique constraint on channel_id.\n"
         "• In-memory cache in db.py loads candidates into pandas tensors for sub-50ms cosine similarity.", c_green)
    ]

    for idx, (title, desc, color) in enumerate(supabase_pillars):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.95)
        top = Inches(1.6 + row * 2.7)
        add_card(s5, left, top, Inches(5.75), Inches(2.45))
        tb = s5.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(5.35), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        for line in desc.split("\n"):
            p2 = tf.add_paragraph()
            p2.text = line
            p2.font.size = Pt(11)
            p2.font.color.rgb = c_text_dark

    s5.notes_slide.notes_text_frame.text = (
        "A key requirement was explaining how Supabase works. Supabase is not just a database; "
        "it is our unified Auth provider, PostgreSQL relational engine, and vector storage layer. "
        "We also leverage PostgreSQL Row Level Security (RLS) and public views for privacy protection."
    )

    # =========================================================================
    # SLIDE 6: Database Architecture & Schema Design (With ER Diagram Image)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, c_light_bg)
    add_header(s6, "Database Architecture: Polyglot Design & Relational Schema")

    # Left: Text Explanation
    add_card(s6, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.3))
    tb_db = s6.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.1), Inches(4.9))
    tf = tb_db.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Relational Integrity + Document Flexibility"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_indigo

    db_details = [
        ("Users (auth.users)", "Central authentication entity managing emails, hashed credentials, and metadata roles (brand vs influencer)."),
        ("Brand_profile & Influencers", "Stores business details (company_name, industry, website, location) linked via user_id foreign key."),
        ("Campaigns", "Encapsulates brand campaign parameters: category, budget, target_country, goal, and campaign_description."),
        ("registered_channels", "Links creators to verified YouTube channel_ids, contact_email, show_email_publicly consent, and ingestion_status."),
        ("ml_data.channels", "Indexed operational table containing clean metadata, statistics, tier, and 384-dim SBERT profile embeddings.")
    ]
    for ent, text_desc in db_details:
        p1 = tf.add_paragraph()
        p1.text = f"• {ent}: "
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {text_desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    # Right: ER Diagram Image Card
    add_card(s6, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.3))
    if os.path.exists(img_er):
        s6.shapes.add_picture(img_er, Inches(6.8), Inches(1.8), width=Inches(5.5))
    
    caption_box = s6.shapes.add_textbox(Inches(6.8), Inches(6.4), Inches(5.5), Inches(0.4))
    p = caption_box.text_frame.paragraphs[0]
    p.text = "Figure: Entity-Relationship Diagram implemented in PostgreSQL / Supabase"
    p.font.size = Pt(10)
    p.font.color.rgb = c_text_muted
    p.alignment = PP_ALIGN.CENTER

    s6.notes_slide.notes_text_frame.text = (
        "Here you can see the schema diagram. Notice how Users connects to Brand Profile and Campaigns. "
        "We also have registered_channels and ml_data.channels in Supabase to bridge YouTube data with ML models."
    )

    # =========================================================================
    # SLIDE 7: Data Acquisition & Pipeline Engineering
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, c_light_bg)
    add_header(s7, "Data Acquisition: YouTube Data API v3 Ingestion")

    stats = [
        ("~2,000+", "Indexed Channels", c_indigo),
        ("2,841+", "Video Records", c_purple),
        ("12", "Content Niches", c_blue),
        ("15 Videos", "Per Channel Limit", c_green)
    ]
    for idx, (num, label, color) in enumerate(stats):
        left = Inches(0.8 + idx * 2.98)
        add_card(s7, left, Inches(1.6), Inches(2.8), Inches(1.2))
        tb = s7.shapes.add_textbox(left, Inches(1.7), Inches(2.8), Inches(1.0))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = color
        p.alignment = PP_ALIGN.CENTER
        p2 = tf.add_paragraph()
        p2.text = label
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_muted
        p2.alignment = PP_ALIGN.CENTER

    # Detailed Ingestion Breakdown
    add_card(s7, Inches(0.8), Inches(3.1), Inches(5.7), Inches(3.8))
    tb_ch = s7.shapes.add_textbox(Inches(1.0), Inches(3.3), Inches(5.3), Inches(3.4))
    tf = tb_ch.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Channel-Level Signals Extracted"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = c_indigo
    ch_items = [
        "Core Metadata: Channel ID (UC...), title, custom URL, description, published date, country.",
        "Audience Statistics: Subscriber count, total channel view count, cumulative video count.",
        "Categorization Signals: Topic categories, branding settings keywords, and upload playlist ID.",
        "MongoDB Schema: Raw documents stored with exact source fields to enable retrospective feature engineering."
    ]
    for item in ch_items:
        p2 = tf.add_paragraph()
        p2.text = f"• {item}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_dark

    add_card(s7, Inches(6.8), Inches(3.1), Inches(5.7), Inches(3.8))
    tb_vid = s7.shapes.add_textbox(Inches(7.0), Inches(3.3), Inches(5.3), Inches(3.4))
    tf2 = tb_vid.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Video-Level Performance Signals"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = c_purple
    vid_items = [
        "Engagement Metrics: View count, like count, comment count per video.",
        "Content Descriptors: Video title, detailed description, tags, category ID, publication timestamp.",
        "Recent Performance: Latest 15 uploads fetched to measure active current audience response.",
        "Database Storage Safeguard: Video counts capped at 15 per creator to respect MongoDB free-tier 512MB quotas."
    ]
    for item in vid_items:
        p2 = tf2.add_paragraph()
        p2.text = f"• {item}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_dark

    s7.notes_slide.notes_text_frame.text = (
        "Our ingestion pipeline processes two distinct tiers: channel-level metadata and video-level metrics. "
        "We enforce a strict 15-video window per creator to ensure our metrics reflect current performance "
        "while keeping database storage lean and responsive."
    )

    # =========================================================================
    # SLIDE 8: Recommendation Logic — Step 1: Candidate Filtering
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, c_light_bg)
    add_header(s8, "Recommendation Logic (Step 1): Multi-Factor Hard Filtering")

    filter_cards = [
        ("1. Category Alignment", 
         "Goal: Strict semantic topic segregation.\n\n"
         "• Maps brand campaign category against creator content category.\n"
         "• Normalizes aliases: e.g. 'tech' -> 'gaming', 'workout' -> 'fitness', 'skincare' -> 'beauty'.\n"
         "• Prevents irrelevant creators (e.g. fashion creators for a tech campaign) from entering the scoring pool.", c_indigo),

        ("2. Geographic / Country Match",
         "Goal: Ensure audience reach matches the target region.\n\n"
         "• Filters creators by country code (e.g., 'IN' for India, 'US' for USA).\n"
         "• Supports 'All Countries' / 'Global' campaigns without geographic restrictions.\n"
         "• Normalizes international names: 'India', 'in', 'IN' all resolve to standard ISO codes.", c_purple),

        ("3. Budget-to-Tier Allocation",
         "Goal: Practical creator pricing feasibility.\n\n"
         "• Influencer Tiers based on subscriber base:\n"
         "   - Nano: < 10,000 subscribers\n"
         "   - Micro: 10,000 – 99,999 subscribers\n"
         "   - Mid: 100,000 – 999,999 subscribers\n"
         "   - Macro: >= 1,000,000 subscribers\n"
         "• Budget filter: Automatically matches campaign budget to eligible tiers, preventing micro-budget campaigns from getting unreachable macro influencers.", c_blue)
    ]

    for idx, (title, desc, color) in enumerate(filter_cards):
        left = Inches(0.8 + idx * 3.95)
        add_card(s8, left, Inches(1.6), Inches(3.75), Inches(5.3))
        tb = s8.shapes.add_textbox(left + Inches(0.2), Inches(1.8), Inches(3.35), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        for line in desc.split("\n"):
            p2 = tf.add_paragraph()
            p2.text = line
            p2.font.size = Pt(11)
            p2.font.color.rgb = c_text_dark

    s8.notes_slide.notes_text_frame.text = (
        "Recommendation starts with Step 1: Candidate Filtering. We eliminate non-viable candidates before ML ranking. "
        "This ensures category alignment, geographic relevance, and budget eligibility. If no budget is specified, "
        "all tiers remain open for ranking."
    )

    # =========================================================================
    # SLIDE 9: Recommendation Logic — Step 2: Semantic NLP Matching
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, c_light_bg)
    add_header(s9, "Recommendation Logic (Step 2): Sentence-BERT Semantic Matching")

    # Left: SBERT Architecture & Vector Space
    add_card(s9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tb_sbert = s9.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.2), Inches(4.9))
    tf = tb_sbert.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Sentence-BERT (all-MiniLM-L6-v2)"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_indigo

    sbert_points = [
        ("Dense Representation:", "Maps text into a 384-dimensional continuous latent space where semantic proximity equals conceptual similarity."),
        ("Creator Profile Text:", "Constructed dynamically from creator channel title, niche, channel description, keywords, and latest video titles:"),
        ("Profile Text Template:", "'Channel: {title}\\nCategory: {category}\\nDescription: {desc}\\nVideo topics: {top_videos}\\nKeywords: {tags}'"),
        ("Precomputed Vectors:", "All ~1,000+ creators have precomputed embeddings stored in Supabase JSONB, allowing instant lookups without on-the-fly re-encoding.")
    ]
    for title, desc in sbert_points:
        p1 = tf.add_paragraph()
        p1.text = f"• {title} "
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    # Right: Cosine Similarity Math & Why It Beats Keywords
    add_card(s9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tb_math = s9.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.9))
    tf2 = tb_math.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Cosine Similarity & Matching Mechanics"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_purple

    math_points = [
        ("Vector Cosine Formula:", "sim(u, v) = (u · v) / (||u|| * ||v||) where u is the encoded campaign brief vector and v is the creator content vector."),
        ("Normalized Vectors:", "Both vectors are L2-normalized so the dot product directly yields cosine similarity in the range [0.0, 1.0]."),
        ("Why SBERT Beats Keyword Matching:", "Keyword searches fail on synonyms and nuance. If a campaign asks for 'minimalist wardrobe capsule', SBERT successfully matches creators who discuss 'aesthetic neutral fashion' even if the word 'capsule' never appears."),
        ("Performance:", "Cosine similarity across 1,000 vectors runs in under 4 milliseconds via vectorized NumPy/SciPy operations.")
    ]
    for title, desc in math_points:
        p1 = tf2.add_paragraph()
        p1.text = f"✔ {title} "
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s9.notes_slide.notes_text_frame.text = (
        "Step 2 is our semantic matching engine. We use Sentence-BERT MiniLM-L6-v2. It transforms the campaign "
        "description into a 384-dimensional vector and performs cosine similarity against each creator's "
        "content vector. This captures true contextual meaning rather than dumb keyword matching."
    )

    # =========================================================================
    # SLIDE 10: Recommendation Logic — Step 3: Performance & Engagement Scoring
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, c_light_bg)
    add_header(s10, "Recommendation Logic (Step 3): Engagement & Audience Scaling")

    add_card(s10, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tb_eng = s10.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.2), Inches(4.9))
    tf = tb_eng.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Engagement Rate Formulation"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_blue

    eng_points = [
        ("Mathematical Definition:", "ER = (Total Likes + Total Comments) / max(Total Views, 1) across the latest 15 video uploads."),
        ("Why Raw Views Are Deceptive:", "A channel with 1,000,000 views and 200 comments has low audience attachment. A channel with 50,000 views and 3,500 active comments has high community trust."),
        ("Baseline Imputation:", "When video data is unavailable during cold-start, a baseline engagement of 4.5% is applied safely.")
    ]
    for title, desc in eng_points:
        p1 = tf.add_paragraph()
        p1.text = f"• {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    add_card(s10, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tb_norm = s10.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.9))
    tf2 = tb_norm.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Percentile Clipping & Normalization"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_green

    norm_points = [
        ("Outlier Problem:", "A single viral video with anomalous bots or sensationalist clickbait can artificially skew average engagement to 90%."),
        ("Robust Percentile Normalization:", "Low percentile (Q05) and High percentile (Q95) are calculated across all category candidates:"),
        ("Formula:", "Score = (ER.clip(Q05, Q95) - Q05) / (Q95 - Q05), strictly bounded between [0.0, 1.0]."),
        ("Fair Relative Comparison:", "Ensures creator scores reflect their relative strength within their specific niche rather than absolute scale.")
    ]
    for title, desc in norm_points:
        p1 = tf2.add_paragraph()
        p1.text = f"✔ {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s10.notes_slide.notes_text_frame.text = (
        "In Step 3, we evaluate audience engagement. Raw engagement rate is calculated from likes and comments "
        "divided by views. To prevent clickbait outliers from dominating the rankings, we apply robust 5th-to-95th "
        "percentile clipping."
    )

    # =========================================================================
    # SLIDE 11: Recommendation Logic — Step 4: Multi-Objective Ranking Formula
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, c_light_bg)
    add_header(s11, "Recommendation Logic (Step 4): Multi-Objective Ranking Formula")

    # Formula Banner Card
    add_card(s11, Inches(0.8), Inches(1.6), Inches(11.7), Inches(1.6), bg_color=c_dark_navy, border_color=None)
    tb_eq = s11.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(11.3), Inches(1.4))
    tf = tb_eq.text_frame
    p = tf.paragraphs[0]
    p.text = "THE CORE SCORING EQUATION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)
    p2 = tf.add_paragraph()
    p2.text = "Final Recommendation Score = (w_semantic × Semantic_Sim) + (w_eng × Engagement_Score)"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p3 = tf.add_paragraph()
    p3.text = "Baseline: 70% Semantic Relevance + 30% Verified Audience Engagement  |  Bounded in range [0.0000, 1.0000]"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(203, 213, 225)

    # 3 Goal Variations Cards
    goals = [
        ("Brand Awareness", "Prioritizes maximum semantic fit and broader view scale.", [
            "Semantic Weight: 0.70",
            "Engagement Weight: 0.30",
            "Best for product launches, brand exposure, and narrative awareness campaigns."
        ], c_indigo),

        ("High Engagement", "Favors authentic discussions and active community response.", [
            "Semantic Weight: 0.60",
            "Engagement Weight: 0.40",
            "Best for product reviews, feedback, unboxings, and community building."
        ], c_purple),

        ("Direct Conversions", "Targets focused niches with high conversion propensity.", [
            "Semantic Weight: 0.65",
            "Engagement Weight: 0.35",
            "Best for affiliate marketing, coupon codes, and app install promotions."
        ], c_blue)
    ]

    for idx, (g_title, g_desc, g_pts, color) in enumerate(goals):
        left = Inches(0.8 + idx * 3.95)
        top = Inches(3.4)
        add_card(s11, left, top, Inches(3.75), Inches(3.5))
        tb = s11.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(3.35), Inches(3.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = g_title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = color
        p2 = tf.add_paragraph()
        p2.text = g_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = c_text_muted
        
        for pt in g_pts:
            p3 = tf.add_paragraph()
            p3.text = f"• {pt}"
            p3.font.size = Pt(10)
            p3.font.color.rgb = c_text_dark

    s11.notes_slide.notes_text_frame.text = (
        "Here is the exact scoring equation. The baseline formulation is 70% semantic relevance and 30% engagement score. "
        "The weights adapt based on the campaign goal: whether the brand seeks maximum reach (Awareness), "
        "interaction (Engagement), or sales (Conversions)."
    )

    # =========================================================================
    # SLIDE 12: Registered Creator Ingestion & Zero N+1 Email Mapping
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, c_light_bg)
    add_header(s12, "Phase 3 & 4: Registered Channels & Zero N+1 Email Mapping")

    add_card(s12, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tb_reg = s12.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.2), Inches(4.9))
    tf = tb_reg.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Influencer Registration & Ingestion Flow"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_indigo

    reg_flow = [
        ("Creator Registration:", "Creator submits YouTube channel ID, custom URL, or @handle + collaboration email."),
        ("FastAPI Non-Blocking Task:", "Triggered via FastAPI BackgroundTasks: validates channel with YouTube API, rejects duplicates."),
        ("On-the-Fly SBERT Indexing:", "Fetches latest 15 videos, computes 384-dim embedding vector, upserts to ml_data.channels, and invalidates in-memory candidate cache."),
        ("Immediate Participation:", "The registered creator immediately enters the active candidate pool and competes in recommendations without requiring a full model retrain.")
    ]
    for title, desc in reg_flow:
        p1 = tf.add_paragraph()
        p1.text = f"• {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    add_card(s12, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tb_map = s12.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.9))
    tf2 = tb_map.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Zero N+1 Batched Email Mapping"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_purple

    map_flow = [
        ("The Challenge:", "Avoid firing 10 individual SQL queries for 10 recommended channels (the notorious N+1 query antipattern)."),
        ("Single Batched Query:", "SELECT youtube_channel_id, contact_email FROM public.registered_channels_public WHERE youtube_channel_id IN (:top_ids);"),
        ("Privacy Enforcement:", "Only channels where show_email_publicly = true appear in the public view. Private emails remain secured."),
        ("No Platform Bias:", "Unregistered channels rank strictly on merit. Registered channels receive direct mailto/copy actions on their card without artificial badges.")
    ]
    for title, desc in map_flow:
        p1 = tf2.add_paragraph()
        p1.text = f"✔ {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s12.notes_slide.notes_text_frame.text = (
        "Here we highlight our implementation of Phase 3 and Phase 4. Creators can register their channels, "
        "and our background task generates their embeddings so they can be recommended immediately. "
        "When recommendations are generated, a single batched SQL query attaches verified emails with Zero N+1 latency."
    )

    # =========================================================================
    # SLIDE 13: User Journey Workflow (With Diagram Image)
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, c_light_bg)
    add_header(s13, "Brand User Experience: Complete Journey Flow")

    # Image in top portion
    add_card(s13, Inches(0.8), Inches(1.6), Inches(11.7), Inches(3.2))
    if os.path.exists(img_flow):
        s13.shapes.add_picture(img_flow, Inches(1.0), Inches(1.75), width=Inches(11.3))

    # 5 Step Explanation Cards below
    steps = [
        ("Step 1: Register", "Brand creates account via Supabase Auth with company metadata.", c_indigo),
        ("Step 2: Authenticate", "Secure login with JWT persistence and ProtectedRoute guard.", c_purple),
        ("Step 3: Brand Profile", "Configures industry niche, website, state, and company context.", c_blue),
        ("Step 4: Campaign Input", "Defines budget, category, country, goal, and brief text.", c_green),
        ("Step 5: Recommendations", "Receives ranked creator cards with direct email contact.", c_indigo)
    ]
    for idx, (st_title, st_desc, color) in enumerate(steps):
        left = Inches(0.8 + idx * 2.38)
        top = Inches(5.0)
        add_card(s13, left, top, Inches(2.25), Inches(1.9))
        tb = s13.shapes.add_textbox(left + Inches(0.1), top + Inches(0.15), Inches(2.05), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = st_title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color
        p2 = tf.add_paragraph()
        p2.text = st_desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s13.notes_slide.notes_text_frame.text = (
        "This slide depicts the brand user journey. From registration to creating a campaign and viewing recommendations. "
        "The campaign description entered in Step 4 is what drives the SBERT vector matching in the backend."
    )

    # =========================================================================
    # SLIDE 14: Platform UI Showcase (With Screenshots)
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14, c_light_bg)
    add_header(s14, "Platform Interface Showcase: React + Material-UI Frontend")

    ui_cards = [
        (img_landing, "Landing & Value Proposition", "Clean hero section introducing semantic influencer intelligence."),
        (img_login, "Secure Supabase Authentication", "Dual-role authentication supporting Brand Partners and Creators."),
        (img_campaign, "Campaign Creation Dashboard", "Intuitive input matrix for category, budget, location, and brief.")
    ]

    for idx, (img_path, title, desc) in enumerate(ui_cards):
        left = Inches(0.8 + idx * 3.95)
        top = Inches(1.6)
        add_card(s14, left, top, Inches(3.75), Inches(5.3))
        
        # Image preview
        if os.path.exists(img_path):
            s14.shapes.add_picture(img_path, left + Inches(0.2), top + Inches(0.2), width=Inches(3.35))
        
        # Text details
        tb = s14.shapes.add_textbox(left + Inches(0.2), top + Inches(3.8), Inches(3.35), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = c_indigo
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s14.notes_slide.notes_text_frame.text = (
        "Here are the live application screens designed in Figma and implemented in React 19 and Material-UI. "
        "The interface is clean, professional, and built for both brand marketing teams and creators."
    )

    # =========================================================================
    # SLIDE 15: Explainability & Decision Support
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15, c_light_bg)
    add_header(s15, "Explainable AI: Why Was This Creator Recommended?")

    explain_pillars = [
        ("Semantic Match Breakdown", 
         "• Displays exact semantic similarity percentage (e.g. 84% Match).\n"
         "• Explains the contextual connection between creator's recent video themes and campaign keywords.\n"
         "• Eliminates 'black-box' recommendations so marketing teams understand the match rationale.", c_indigo),

        ("Engagement Quality Index",
         "• Transparently reports audience engagement rate (e.g. 4.82% ER).\n"
         "• Shows normalized percentile ranking within their specific category.\n"
         "• Verifies active recent viewership rather than dormant historical follower counts.", c_purple),

        ("Budget & Creator Collab Fit",
         "• Estimated collaboration cost calculated via standard Indian market formulas.\n"
         "• Tier classification (Nano, Micro, Mid, Macro) explicitly identified.\n"
         "• Confirms whether creator fee fits comfortably within campaign budget.", c_blue),

        ("Direct Contact Action",
         "• For registered platform creators, the contact email is displayed with 1-click mailto: and copy actions.\n"
         "• Zero middleman commission: brands contact creators directly.\n"
         "• Unregistered creators show YouTube channel links for manual outreach.", c_green)
    ]

    for idx, (title, desc, color) in enumerate(explain_pillars):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.95)
        top = Inches(1.6 + row * 2.7)
        add_card(s15, left, top, Inches(5.75), Inches(2.45))
        tb = s15.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(5.35), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        for line in desc.split("\n"):
            p2 = tf.add_paragraph()
            p2.text = line
            p2.font.size = Pt(11)
            p2.font.color.rgb = c_text_dark

    s15.notes_slide.notes_text_frame.text = (
        "Explainability is paramount in modern AI systems. Brands do not trust a system that just outputs names. "
        "InfluenceAI breaks down every recommendation into semantic match score, engagement index, "
        "estimated collab cost, and direct contact options."
    )

    # =========================================================================
    # SLIDE 16: Project Progress & Team Distribution
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16, c_light_bg)
    add_header(s16, "Project Work Distribution & Current Progress")

    team_cards = [
        ("Yashvi Bhadani (24DIT004)", "Data Engineering & Pipeline", [
            "✔ YouTube Data API v3 integration pipeline",
            "✔ Ingested 2,000+ channels and 2,841+ videos",
            "✔ MongoDB raw layer architecture & schemas",
            "✔ Automated background ingestion tasks",
            "→ Feature engineering & data hygiene"
        ], c_indigo),

        ("Shivansh (24DIT014)", "UI/UX & NLP Engine", [
            "✔ Complete Figma design system & layouts",
            "✔ React 19 + MUI responsive application",
            "✔ Sentence-BERT all-MiniLM-L6-v2 integration",
            "✔ Cosine similarity tensor calculation",
            "→ Graph network modeling & visualization"
        ], c_purple),

        ("Astha Makwana (24DIT030)", "Supabase Database & ML Prep", [
            "✔ Supabase PostgreSQL relational schemas",
            "✔ Client & Server Supabase Auth (JWT Bearer)",
            "✔ Row-Level Security (RLS) & Public Views",
            "✔ registered_channels table & Zero N+1 query",
            "→ Model tuning & offline ranking evaluation"
        ], c_blue)
    ]

    for idx, (name, role, tasks, color) in enumerate(team_cards):
        left = Inches(0.8 + idx * 3.95)
        top = Inches(1.6)
        add_card(s16, left, top, Inches(3.75), Inches(5.3))
        tb = s16.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(3.35), Inches(4.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = name
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        p2 = tf.add_paragraph()
        p2.text = role.upper()
        p2.font.size = Pt(9)
        p2.font.bold = True
        p2.font.color.rgb = c_text_muted
        
        for t in tasks:
            p3 = tf.add_paragraph()
            p3.text = t
            p3.font.size = Pt(11)
            p3.font.color.rgb = c_text_dark

    s16.notes_slide.notes_text_frame.text = (
        "Here is our individual contribution breakdown. Yashvi led data engineering and the YouTube ingestion pipeline; "
        "Shivansh led the UI/UX design and Sentence-BERT NLP engine; and Astha spearheaded Supabase PostgreSQL, "
        "JWT security, and registered channel mapping."
    )

    # =========================================================================
    # SLIDE 17: Implementation Status & Future Roadmap
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    set_slide_background(s17, c_light_bg)
    add_header(s17, "Current Implementation Status & Future Roadmap")

    add_card(s17, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tb_curr = s17.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.2), Inches(4.9))
    tf = tb_curr.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Completed & Live in Current Build"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_green

    completed = [
        ("Full-Stack Integration:", "React frontend, Express gateway, and FastAPI AI engine running simultaneously with zero CORS errors."),
        ("Supabase Auth & RLS:", "Dual-role signup, session persistence with onAuthStateChange, and protected FastAPI endpoints."),
        ("Live SBERT Recommender:", "Campaign briefs generate instant ranked recommendations with real similarity and engagement scores."),
        ("Creator Registration Page:", "Creators register YouTube IDs/handles; background ingestion syncs channel into ml_data.channels in real time."),
        ("Zero N+1 Public Email Sync:", "Single batched query maps contact emails to recommendations.")
    ]
    for title, desc in completed:
        p1 = tf.add_paragraph()
        p1.text = f"✔ {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    add_card(s17, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tb_road = s17.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.9))
    tf2 = tb_road.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Future Technical Roadmap (Semester 6)"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = c_indigo

    future = [
        ("Graph-Based Authority Analysis:", "Construct creator co-mention networks and calculate PageRank and Betweenness Centrality for community hubs."),
        ("Google OAuth Channel Ownership:", "Implement youtube.readonly OAuth scope (channels.list mine=true) to cryptographically verify channel ownership."),
        ("Cross-Platform Expansion:", "Ingest Instagram Reels and TikTok creator metrics alongside YouTube Data API."),
        ("Offline Model Evaluation:", "Benchmark ranking quality with NDCG@10 (Normalized Discounted Cumulative Gain) and Mean Reciprocal Rank (MRR).")
    ]
    for title, desc in future:
        p1 = tf2.add_paragraph()
        p1.text = f"→ {title}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = c_text_dark
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10)
        p2.font.color.rgb = c_text_muted

    s17.notes_slide.notes_text_frame.text = (
        "This slide shows where the project stands today versus what comes next. "
        "Our end-to-end prototype is fully functional with live recommendations and real data. "
        "Next semester, we will expand into graph network analytics and Google OAuth creator verification."
    )

    # =========================================================================
    # SLIDE 18: Conclusion & Thank You (Dark Theme)
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    set_slide_background(s18, c_dark_navy)

    tb_end = s18.shapes.add_textbox(Inches(1.5), Inches(1.8), Inches(10.3), Inches(4.0))
    tf = tb_end.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "InfluenceAI"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "From Unfiltered Search to Intelligent, Explainable Recommendation"
    p2.font.size = Pt(18)
    p2.font.color.rgb = c_indigo
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf.add_paragraph()
    p3.text = "\nThank you for your valuable guidance and attention.\nWe welcome your questions and feedback."
    p3.font.size = Pt(15)
    p3.font.color.rgb = RGBColor(203, 213, 225)
    p3.alignment = PP_ALIGN.CENTER

    p4 = tf.add_paragraph()
    p4.text = "\n24DIT004 (Yashvi)  ·  24DIT014 (Shivansh)  ·  24DIT030 (Astha)\nCHARUSAT  ·  DEPSTAR  ·  IT Dept"
    p4.font.size = Pt(12)
    p4.font.color.rgb = RGBColor(148, 163, 184)
    p4.alignment = PP_ALIGN.CENTER

    s18.notes_slide.notes_text_frame.text = (
        "Thank you respected faculty and committee members. That concludes our presentation. "
        "We are now ready for your questions and feedback."
    )

    # Save to both target locations
    out_workspace = r"c:\Users\bhada\Documents\coding\SGP\AI-Based-infulencer-recommendation-system\InfluenceAI\InfluenceAI_Project_Presentation.pptx"
    out_artifact = r"C:\Users\bhada\.gemini\antigravity\brain\c14eca71-6b9b-426c-af41-14540b49f461\InfluenceAI_Project_Presentation.pptx"

    prs.save(out_workspace)
    prs.save(out_artifact)
    print(f"Presentation saved successfully to:\n1. {out_workspace}\n2. {out_artifact}")

if __name__ == "__main__":
    create_deck()
