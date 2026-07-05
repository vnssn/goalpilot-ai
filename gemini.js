//=====================================
// GEMINI API INTEGRATION
//=====================================

// Sends current page information
// to Gemini and gets back either
// RELEVANT or DISTRACTION.

async function askGemini(goal, website, title, apiKey) {
  try {
    // Build prompt for Gemini
    const prompt = `
User goal: ${goal}

Website: ${website}

Title: ${title}

Classify the page as:
- RELEVANT: directly helps achieve the user's goal.
- DISTRACTION: unrelated entertainment, social media, celebrity, gaming, shopping, movies, TV, memes, or leisure content unless the user goal is related to those topics.

Educational, documentation, coding, research, planning, and productivity content are usually RELEVANT unless the user goal is unrelated to those topics.

Search pages and homepages are RELEVANT only if their content matches the goal.

Reply with exactly one word:
RELEVANT
or
DISTRACTION
`;

    console.log("PROMPT:");
    console.log(prompt);

    // Send request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Gemini expects data in this format
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    // Convert API response to JS object
    const data = await response.json();

    // Print everything Gemini returned
    console.log("STATUS:", response.status);
    console.log("FULL GEMINI RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    // If Gemini returned an error
    if (!data.candidates) {
      console.error("Gemini Error:", data);

      // Fail closed
      return "ERROR";
    }

    // Return Gemini's decision
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("RAW GEMINI ANSWER:", answer);

    if (!answer) {
      console.error("NO GEMINI ANSWER");
      return "ERROR";
    }

    return answer.trim();
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return "ERROR";
  }
}
