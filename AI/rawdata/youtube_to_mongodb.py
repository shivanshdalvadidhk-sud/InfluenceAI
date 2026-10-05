import os
import time
import requests
import certifi

from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timezone


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

DB_NAME = "influencer_db"
COLLECTION_NAME = "channels"

TARGET_CHANNELS = 1000

CATEGORIES = [
    "fashion",
    "beauty",
    "fitness",
    "food",
    "travel",
    "finance",
    "gaming",
    "lifestyle",
    "parenting",
    "automobile",
    "health"
]


# =========================================================
# MONGODB
# =========================================================

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=30000
)

db = client[DB_NAME]

channels_collection = db[COLLECTION_NAME]

# Prevent duplicate channel IDs
channels_collection.create_index(
    "channel_id",
    unique=True
)


# =========================================================
# YOUTUBE API
# =========================================================

SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"


# =========================================================
# SEARCH QUERIES
# =========================================================

def get_search_queries(category, location):

    if location == "India":

        return [
            f"{category} India",
            f"Indian {category} influencer",
            f"{category} creator India",
            f"{category} Hindi India"
        ]

    else:

        return [
            f"{category} influencer",
            f"{category} creator",
            f"best {category} channels",
            f"{category} content creator"
        ]


# =========================================================
# SEARCH CHANNELS
# =========================================================

def search_channels(query, max_pages=3):

    channel_ids = []

    next_page_token = None

    for page in range(max_pages):

        params = {
            "part": "snippet",
            "q": query,
            "type": "channel",
            "maxResults": 50,
            "key": YOUTUBE_API_KEY
        }

        if next_page_token:
            params["pageToken"] = next_page_token

        response = requests.get(
            SEARCH_URL,
            params=params,
            timeout=30
        )

        if response.status_code != 200:

            print(
                "Search API error:",
                response.status_code,
                response.text
            )

            break

        data = response.json()

        for item in data.get("items", []):

            channel_id = item["id"].get("channelId")

            if channel_id:
                channel_ids.append(channel_id)

        next_page_token = data.get("nextPageToken")

        if not next_page_token:
            break

        time.sleep(0.2)

    return channel_ids


# =========================================================
# GET CHANNEL DETAILS
# =========================================================

def get_channel_details(channel_ids):

    all_channels = []

    # YouTube allows multiple IDs in one channels.list request
    for i in range(0, len(channel_ids), 50):

        batch = channel_ids[i:i + 50]

        params = {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(batch),
            "key": YOUTUBE_API_KEY
        }

        response = requests.get(
            CHANNEL_URL,
            params=params,
            timeout=30
        )

        if response.status_code != 200:

            print(
                "Channel API error:",
                response.status_code,
                response.text
            )

            continue

        data = response.json()

        all_channels.extend(
            data.get("items", [])
        )

        time.sleep(0.2)

    return all_channels


# =========================================================
# STORE CHANNEL
# =========================================================

def store_channel(
    channel,
    category,
    location
):

    snippet = channel.get(
        "snippet",
        {}
    )

    statistics = channel.get(
        "statistics",
        {}
    )

    content_details = channel.get(
        "contentDetails",
        {}
    )

    document = {

        "channel_id":
            channel["id"],

        "channel_url":
            f"https://www.youtube.com/channel/{channel['id']}",

        "title":
            snippet.get("title"),

        "description":
            snippet.get("description"),

        "country":
            snippet.get("country"),

        "category":
            category,

        "location_type":
            location,

        "published_at":
            snippet.get("publishedAt"),

        "thumbnails":
            snippet.get("thumbnails"),

        "statistics": {

            "subscriber_count":
                int(
                    statistics.get(
                        "subscriberCount",
                        0
                    )
                ),

            "view_count":
                int(
                    statistics.get(
                        "viewCount",
                        0
                    )
                ),

            "video_count":
                int(
                    statistics.get(
                        "videoCount",
                        0
                    )
                )
        },

        "uploads_playlist_id":
            content_details
            .get(
                "relatedPlaylists",
                {}
            )
            .get(
                "uploads"
            ),

        "source":
            "youtube",

        "last_updated":
            datetime.now(
                timezone.utc
            )
    }

    # -----------------------------------------------------
    # IMPORTANT
    # Don't overwrite category/location if the channel
    # already exists with another classification.
    # -----------------------------------------------------

    channels_collection.update_one(

        {
            "channel_id":
                document["channel_id"]
        },

        {
            "$set": document
        },

        upsert=True
    )


# =========================================================
# MAIN INGESTION
# =========================================================

def main():

    print("\n======================================")
    print("YouTube Influencer Data Collection")
    print("======================================\n")

    total_before = channels_collection.count_documents({})

    print(
        "Existing channels:",
        total_before
    )

    for category in CATEGORIES:

        if channels_collection.count_documents({}) >= TARGET_CHANNELS:
            break

        print(
            f"\n========== CATEGORY: {category.upper()} =========="
        )

        for location in ["India", "Global"]:

            if channels_collection.count_documents({}) >= TARGET_CHANNELS:
                break

            print(
                f"\n--- Location: {location} ---"
            )

            queries = get_search_queries(
                category,
                location
            )

            for query in queries:

                if channels_collection.count_documents({}) >= TARGET_CHANNELS:
                    break

                print(
                    "\nSearching:",
                    query
                )

                ids = search_channels(
                    query,
                    max_pages=3
                )

                # Remove duplicate IDs
                ids = list(
                    set(ids)
                )

                print(
                    "Candidate channels:",
                    len(ids)
                )

                # Get detailed information
                details = get_channel_details(ids)

                stored_count = 0

                for channel in details:

                    if channels_collection.count_documents({}) >= TARGET_CHANNELS:
                        break

                    try:

                        store_channel(
                            channel,
                            category,
                            location
                        )

                        stored_count += 1

                    except Exception as e:

                        print(
                            "Storage error:",
                            e
                        )

                print(
                    "Processed:",
                    stored_count
                )

                current_total = (
                    channels_collection.count_documents({})
                )

                print(
                    "Total channels:",
                    current_total,
                    "/",
                    TARGET_CHANNELS
                )

                time.sleep(0.5)

    final_count = (
        channels_collection.count_documents({})
    )

    print("\n======================================")
    print("INGESTION COMPLETED")
    print("======================================")

    print(
        "Total channels:",
        final_count
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()  