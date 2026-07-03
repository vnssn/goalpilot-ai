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
Goal: ${goal}

URL: ${website}
Title: ${title}

Classify:
- RELEVANT: helps achieve the goal.
- DISTRACTION: unrelated entertainment.

Do not block search pages, homepages, or navigation pages if they may help find goal-related content.

Examples:
DP tutorial -> RELEVANT
YouTube search -> RELEVANT
MrBeast -> DISTRACTION
Google "DP tutorial" -> RELEVANT
Google sports search -> DISTRACTION
9anime -> DISTRACTION

Reply only:
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
