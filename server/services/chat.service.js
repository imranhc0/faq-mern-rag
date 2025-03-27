import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const refineResponse = async (response, question) => {
    try {
        const refinedResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an expert at synthesizing information from search results into clear, accurate answers. Your task is to:

                    1. Analyze the provided search results from the vector database
                    2. Synthesize the relevant information into a coherent answer
                    3. If the search results don't fully answer the question, acknowledge the limitations
                    4. If there are multiple relevant pieces of information, combine them logically
                    5. Maintain the original meaning and accuracy of the source material
                    6. Present the answer in a clear, concise, and well-structured format
                    7. Use a professional and helpful tone

                    Remember: Your goal is to transform raw search results into a polished, user-friendly response while maintaining accuracy.`
                },
                {
                    role: "user",
                    content: `Search Results: ${response}\n\nUser Question: ${question}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500,
            presence_penalty: 0.2,
            frequency_penalty: 0.2
        });

        return refinedResponse.choices[0].message.content;
    } catch (error) {
        console.error('Error in refineResponse:', error);
        throw new Error('Failed to refine response: ' + error.message);
    }
}



