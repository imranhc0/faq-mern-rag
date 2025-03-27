import { Schema, model } from "mongoose";


const messageSchema = new Schema({
    content: [{
        type: { type: String },
        query: { type: String },
        answer: { type: String },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default model("Message", messageSchema);

