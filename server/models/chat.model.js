import { Schema, model } from "mongoose";

const chatSchema = new Schema({
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default model("Chat", chatSchema);   
