const { MongoClient } = require("mongodb")

const MONGO_URI = "mongodb+srv://artevern_db_user:vxolCDdZp72N01GC@cluster0.lhfeexq.mongodb.net/?retryWrites=true&w=majority"

let cachedClient = null

exports.handler = async (event) => {

try{

const body = JSON.parse(event.body)

const user_id = body.user_id

if(!user_id){
return{
statusCode:400,
body:JSON.stringify({success:false})
}
}

if(!cachedClient){
cachedClient = await MongoClient.connect(MONGO_URI)
}

const db = cachedClient.db("video_bot")

const users = db.collection("users")

const unlockTime = new Date(Date.now() + 6 * 60 * 60 * 1000)

await users.updateOne(
{user_id:String(user_id)},
{$set:{unlimited_until:unlockTime}},
{upsert:true}
)

return{
statusCode:200,
body:JSON.stringify({success:true})
}

}catch(err){

return{
statusCode:500,
body:JSON.stringify({success:false,error:err.toString()})
}

}

}
