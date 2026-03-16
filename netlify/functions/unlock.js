const { MongoClient } = require("mongodb");

// Get this from your Netlify Environment Variables
const uri = process.env.MONGODB_URI || "mongodb+srv://artevern_db_user:vxolCDdZp72N01GC@cluster0.lhfeexq.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

exports.handler = async (event, context) => {
    // Enable CORS just in case Telegram WebView acts up
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    try {
        const userId = event.queryStringParameters.user_id;

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ status: "error", message: "Missing user_id parameter" })
            };
        }

        await client.connect();
        const db = client.db("video_bot");
        const usersCol = db.collection("users");

        // Add 6 hours to current time
        const unlockTime = new Date();
        unlockTime.setHours(unlockTime.getHours() + 6);

        // 🔴 CRITICAL FIX: Force user_id to be a STRING so Python's `str(user_id)` can find it!
        await usersCol.updateOne(
            { user_id: String(userId) }, 
            { $set: { unlimited_until: unlockTime } },
            { upsert: true }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: "ok", message: "Unlocked for 6 hours" })
        };

    } catch (error) {
        console.error("MongoDB Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ status: "error", message: "Internal Server Error" })
        };
    } finally {
        await client.close();
    }
};
