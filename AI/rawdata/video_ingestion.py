import os
import time
import requests
import certifi

from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from datetime import datetime, timezone


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

DB_NAME = "influencer_db"

CHANNELS_COLLECTION = "channels"
VIDEOS_COLLECTION = "videos"

# Maximum videos we want per channel
MAX_VIDEOS_PER_CHANNEL = 20

# Safety limit - deliberately below 10,000
MAX_API_CALLS = 9000

api_calls = 0


# =========================================================
# MONGODB CONNECTION
# =========================================================

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=30000
)

db = client[DB_NAME]

channels_collection = db[CHANNELS_COLLECTION]
videos_collection = db[VIDEOS_COLLECTION]


# =========================================================
# MONGODB INDEXES
# =========================================================

# Prevent duplicate videos
videos_collection.create_index(
    "video_id",
    unique=True
)

# Faster channel-based video queries
videos_collection.create_index(
    "channel_id"
)


# =========================================================
# YOUTUBE API
# =========================================================

PLAYLIST_ITEMS_URL = (
    "https://www.googleapis.com/youtube/v3/playlistItems"
)

VIDEOS_URL = (
    "https://www.googleapis.com/youtube/v3/videos"
)


# =========================================================
# API REQUEST
# =========================================================

def youtube_request(url, params):

    global api_calls

    # -----------------------------------------------------
    # SAFETY CHECK
    # -----------------------------------------------------

    if api_calls >= MAX_API_CALLS:

        raise RuntimeError(
            "API CALL SAFETY LIMIT REACHED"
        )

    response = requests.get(
        url,
        params=params,
        timeout=30
    )

    api_calls += 1

    print(
        f"API calls: "
        f"{api_calls}/{MAX_API_CALLS}"
    )

    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    if response.status_code == 200:

        return response.json()

    # -----------------------------------------------------
    # ERROR
    # -----------------------------------------------------

    print(
        "\nYouTube API error:",
        response.status_code
    )

    print(
        response.text
    )

    return None


# =========================================================
# GET ONLY REQUIRED VIDEO IDS
# =========================================================

def get_channel_video_ids(
    uploads_playlist_id,
    max_videos=20
):

    video_ids = []

    next_page_token = None

    while len(video_ids) < max_videos:

        # -------------------------------------------------
        # We never request more than the number we need
        # -------------------------------------------------

        remaining = (
            max_videos - len(video_ids)
        )

        params = {

            "part":
                "snippet,contentDetails",

            "playlistId":
                uploads_playlist_id,

            "maxResults":
                min(50, remaining),

            "key":
                YOUTUBE_API_KEY
        }

        if next_page_token:

            params["pageToken"] = (
                next_page_token
            )

        data = youtube_request(
            PLAYLIST_ITEMS_URL,
            params
        )

        if data is None:

            raise RuntimeError(
                "Playlist API request failed."
            )

        # -------------------------------------------------
        # EXTRACT VIDEO IDS
        # -------------------------------------------------

        for item in data.get(
            "items",
            []
        ):

            video_id = (
                item
                .get(
                    "contentDetails",
                    {}
                )
                .get(
                    "videoId"
                )
            )

            if video_id:

                video_ids.append(
                    video_id
                )

        # -------------------------------------------------
        # STOP AS SOON AS WE HAVE ENOUGH
        # -------------------------------------------------

        if len(video_ids) >= max_videos:

            break

        # -------------------------------------------------
        # NEXT PAGE
        # -------------------------------------------------

        next_page_token = (
            data.get(
                "nextPageToken"
            )
        )

        if not next_page_token:

            break

    return video_ids[:max_videos]


# =========================================================
# GET VIDEO DETAILS
# =========================================================

def get_video_details(video_ids):

    all_videos = []

    # YouTube allows up to 50 IDs per request
    for i in range(
        0,
        len(video_ids),
        50
    ):

        batch = video_ids[
            i:i + 50
        ]

        params = {

            "part":
                "snippet,contentDetails,statistics",

            "id":
                ",".join(batch),

            "key":
                YOUTUBE_API_KEY
        }

        data = youtube_request(
            VIDEOS_URL,
            params
        )

        if data is None:

            raise RuntimeError(
                "Video API request failed."
            )

        all_videos.extend(
            data.get(
                "items",
                []
            )
        )

    return all_videos


# =========================================================
# CREATE VIDEO DOCUMENT
# =========================================================

def create_video_document(
    video,
    channel
):

    snippet = video.get(
        "snippet",
        {}
    )

    statistics = video.get(
        "statistics",
        {}
    )

    content_details = video.get(
        "contentDetails",
        {}
    )

    return {

        # -------------------------------------------------
        # IDENTIFICATION
        # -------------------------------------------------

        "video_id":
            video["id"],

        "channel_id":
            channel["channel_id"],

        "channel_title":
            channel.get("title"),

        # -------------------------------------------------
        # CONTENT
        # -------------------------------------------------

        "title":
            snippet.get("title"),

        "description":
            snippet.get("description"),

        "published_at":
            snippet.get("publishedAt"),

        "tags":
            snippet.get(
                "tags",
                []
            ),

        # -------------------------------------------------
        # CATEGORY
        # -------------------------------------------------

        "category_id":
            snippet.get("categoryId"),

        "category":
            channel.get("category"),

        "location_type":
            channel.get("location_type"),

        # -------------------------------------------------
        # VIDEO DETAILS
        # -------------------------------------------------

        "duration":
            content_details.get(
                "duration"
            ),

        # -------------------------------------------------
        # STATISTICS
        # -------------------------------------------------

        "statistics": {

            "view_count":
                int(
                    statistics.get(
                        "viewCount",
                        0
                    )
                ),

            "like_count":
                int(
                    statistics.get(
                        "likeCount",
                        0
                    )
                ),

            "comment_count":
                int(
                    statistics.get(
                        "commentCount",
                        0
                    )
                )
        },

        # -------------------------------------------------
        # METADATA
        # -------------------------------------------------

        "source":
            "youtube",

        "last_updated":
            datetime.now(
                timezone.utc
            )
    }


# =========================================================
# PROCESS ONE CHANNEL
# =========================================================

def process_channel(channel):

    channel_id = channel.get(
        "channel_id"
    )

    channel_title = channel.get(
        "title"
    )

    playlist_id = channel.get(
        "uploads_playlist_id"
    )

    print("\n" + "=" * 70)

    print(
        "CHANNEL:",
        channel_title
    )

    print(
        "CHANNEL ID:",
        channel_id
    )

    print("=" * 70)


    # =====================================================
    # CHECK HOW MANY VIDEOS ALREADY EXIST
    # =====================================================

    existing_count = (
        videos_collection.count_documents({
            "channel_id":
                channel_id
        })
    )

    # Never add videos when this channel already reached the limit.
    existing_count = min(
        existing_count,
        MAX_VIDEOS_PER_CHANNEL
    )

    print(
        "Existing videos:",
        existing_count
    )


    # -----------------------------------------------------
    # IF ALREADY 20, NO YOUTUBE API CALL IS NEEDED
    # -----------------------------------------------------

    if existing_count >= MAX_VIDEOS_PER_CHANNEL:

        print(
            "Already have 20+ videos."
        )

        print(
            "Skipping YouTube fetching."
        )

        channels_collection.update_one(

            {
                "channel_id":
                    channel_id
            },

            {
                "$set": {

                    "video_ingestion_status":
                        "completed",

                    "video_ingested_at":
                        datetime.now(
                            timezone.utc
                        ),

                    "video_count_in_mongodb":
                        existing_count,

                    "video_ingestion_error":
                        None
                }
            }
        )

        print(
            "STATUS → COMPLETED"
        )

        return True


    # =====================================================
    # CHECK PLAYLIST
    # =====================================================

    if not playlist_id:

        print(
            "No uploads playlist found."
        )

        channels_collection.update_one(

            {
                "channel_id":
                    channel_id
            },

            {
                "$set": {

                    "video_ingestion_status":
                        "failed",

                    "video_ingestion_error":
                        "No uploads playlist ID",

                    "video_ingestion_last_attempt":
                        datetime.now(
                            timezone.utc
                        )
                }
            }
        )

        return False


    # =====================================================
    # CALCULATE HOW MANY VIDEOS WE STILL NEED
    # =====================================================

    remaining_slots = (
        MAX_VIDEOS_PER_CHANNEL
        - existing_count
    )

    print(
        "Videos still needed:",
        remaining_slots
    )


    # =====================================================
    # FETCH ONLY REQUIRED VIDEO IDS
    # =====================================================

    print(
        "Fetching video IDs..."
    )

    video_ids = get_channel_video_ids(

        playlist_id,

        max_videos=
            remaining_slots
    )

    print(
        "Videos found:",
        len(video_ids)
    )


    # =====================================================
    # REMOVE DUPLICATE IDS
    # =====================================================

    video_ids = list(
        dict.fromkeys(
            video_ids
        )
    )


    # =====================================================
    # CHECK WHICH VIDEOS ALREADY EXIST
    # =====================================================

    existing_ids = set(

        videos_collection.distinct(

            "video_id",

            {
                "channel_id":
                    channel_id
            }
        )
    )


    new_video_ids = [

        video_id

        for video_id in video_ids

        if video_id not in existing_ids

    ]

    new_video_ids = new_video_ids[:remaining_slots]


    print(
        "Already in MongoDB:",
        len(existing_ids)
    )

    print(
        "New videos:",
        len(new_video_ids)
    )


    # =====================================================
    # GET VIDEO DETAILS
    # =====================================================

    videos = []

    if new_video_ids:

        print(
            "Fetching video details..."
        )

        videos = get_video_details(
            new_video_ids
        )

    else:

        print(
            "No new videos to fetch."
        )


    # =====================================================
    # STORE VIDEOS
    # =====================================================

    inserted = 0

    if videos:

        operations = []

        # -------------------------------------------------
        # EXTRA SAFETY:
        # Never process more than remaining slots
        # -------------------------------------------------

        videos = videos[
            :remaining_slots
        ]

        for video in videos:

            document = (
                create_video_document(
                    video,
                    channel
                )
            )

            operations.append(

                UpdateOne(

                    {
                        "video_id":
                            document[
                                "video_id"
                            ]
                    },

                    {
                        "$set":
                            document
                    },

                    upsert=True

                )
            )


        if operations:

            result = (
                videos_collection
                .bulk_write(
                    operations,
                    ordered=False
                )
            )

            inserted = (
                result.upserted_count
                + result.modified_count
            )


    print(
        "Videos inserted/updated:",
        inserted
    )


    # =====================================================
    # FINAL CHANNEL VIDEO COUNT
    # =====================================================

    final_video_count = (
        videos_collection.count_documents({

            "channel_id":
                channel_id

        })
    )


    print(
        "Final videos for channel:",
        final_video_count
    )


    # =====================================================
    # MARK CHANNEL COMPLETED
    # =====================================================

    channels_collection.update_one(

        {
            "channel_id":
                channel_id
        },

        {
            "$set": {

                "video_ingestion_status":
                    "completed",

                "video_ingested_at":
                    datetime.now(
                        timezone.utc
                    ),

                "video_count_in_mongodb":
                    final_video_count,

                "video_ingestion_error":
                    None
            }
        }
    )


    print(
        "STATUS → COMPLETED"
    )

    return True


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "\n=========================================="
    )

    print(
        "VIDEO INGESTION"
    )

    print(
        "=========================================="
    )


    # =====================================================
    # CONNECTION TEST
    # =====================================================

    try:

        client.admin.command(
            "ping"
        )

        print(
            "MongoDB connection successful!"
        )

    except Exception as e:

        print(
            "MongoDB connection failed:"
        )

        print(e)

        return


    # =====================================================
    # COUNTS BEFORE
    # =====================================================

    total_channels = (
        channels_collection
        .count_documents({})
    )

    completed_channels = (
        channels_collection
        .count_documents({

            "video_ingestion_status":
                "completed"

        })
    )

    remaining_channels = (
        channels_collection
        .count_documents({

            "$or": [

                {
                    "video_ingestion_status":
                        {
                            "$exists":
                                False
                        }
                },

                {
                    "video_ingestion_status":
                        {
                            "$ne":
                                "completed"
                        }
                }

            ]

        })
    )

    total_videos = (
        videos_collection
        .count_documents({})
    )


    print(
        "\nTotal channels:",
        total_channels
    )

    print(
        "Completed channels:",
        completed_channels
    )

    print(
        "Remaining channels:",
        remaining_channels
    )

    print(
        "Existing videos:",
        total_videos
    )


    # =====================================================
    # GET REMAINING CHANNELS
    # =====================================================
    #
    # IMPORTANT:
    # - Only channels not completed
    # - Fashion is completely skipped
    # - list() prevents CursorNotFound during long jobs
    # =====================================================

    remaining = list(

        channels_collection.find({

            "$and": [

                # -----------------------------------------
                # NOT COMPLETED
                # -----------------------------------------

                {
                    "$or": [

                        {
                            "video_ingestion_status":
                                {
                                    "$exists":
                                        False
                                }
                        },

                        {
                            "video_ingestion_status":
                                {
                                    "$ne":
                                        "completed"
                                }
                        }

                    ]
                },

                # -----------------------------------------
                # SKIP FASHION
                # -----------------------------------------

                {
                    "category":
                        {
                            "$ne":
                                "fashion"
                        }
                }

            ]

        })

    )


    print(
        "\nChannels to process:",
        len(remaining)
    )

    print(
        "Fashion channels: SKIPPED"
    )


    # =====================================================
    # PROGRESS COUNTERS
    # =====================================================

    processed = 0
    successful = 0
    failed = 0


    # =====================================================
    # PROCESS CHANNELS
    # =====================================================

    try:

        for channel in remaining:


            # ---------------------------------------------
            # API SAFETY CHECK
            # ---------------------------------------------

            if api_calls >= MAX_API_CALLS:

                print(
                    "\nAPI SAFETY LIMIT REACHED."
                )

                print(
                    "Stopping safely."
                )

                break


            processed += 1


            try:

                success = process_channel(
                    channel
                )


                if success:

                    successful += 1

                else:

                    failed += 1


            except Exception as e:

                failed += 1

                channel_id = (
                    channel.get(
                        "channel_id"
                    )
                )


                print(
                    "\nERROR:",
                    channel_id
                )

                print(e)


                # -----------------------------------------
                # MARK FAILED
                # -----------------------------------------

                channels_collection.update_one(

                    {
                        "channel_id":
                            channel_id
                    },

                    {
                        "$set": {

                            "video_ingestion_status":
                                "failed",

                            "video_ingestion_error":
                                str(e),

                            "video_ingestion_last_attempt":
                                datetime.now(
                                    timezone.utc
                                )
                        }
                    }
                )


            # ---------------------------------------------
            # PROGRESS
            # ---------------------------------------------

            print(
                "\nProgress:"
            )

            print(
                "Processed:",
                processed
            )

            print(
                "Successful:",
                successful
            )

            print(
                "Failed:",
                failed
            )

            print(
                "API calls:",
                api_calls,
                "/",
                MAX_API_CALLS
            )


            time.sleep(0.2)


    except KeyboardInterrupt:

        print(
            "\n\nStopped manually."
        )

        print(
            "Progress has been saved."
        )


    # =====================================================
    # FINAL COUNTS
    # =====================================================

    final_completed = (
        channels_collection
        .count_documents({

            "video_ingestion_status":
                "completed"

        })
    )


    final_remaining = (
        channels_collection
        .count_documents({

            "$or": [

                {
                    "video_ingestion_status":
                        {
                            "$exists":
                                False
                        }
                },

                {
                    "video_ingestion_status":
                        {
                            "$ne":
                                "completed"
                        }
                }

            ]

        })
    )


    final_videos = (
        videos_collection
        .count_documents({})
    )


    print(
        "\n=========================================="
    )

    print(
        "VIDEO INGESTION SUMMARY"
    )

    print(
        "=========================================="
    )

    print(
        "Completed channels:",
        final_completed
    )

    print(
        "Remaining channels:",
        final_remaining
    )

    print(
        "Total videos:",
        final_videos
    )

    print(
        "API calls used:",
        api_calls
    )

    print(
        "=========================================="
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    main()