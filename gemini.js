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
You are a strict productivity website classifier.

Goal:
${goal}

Website:
${website}

Page title:
${title}

Rules:
1. Return RELEVANT if the page directly helps achieve the goal or is reasonably related to achieving the goal.
2. Educational, research, tutorial, documentation, learning, planning, and productivity content should generally be considered RELEVANT.
3. Movies, TV shows, anime, music, entertainment, memes, celebrity content, gaming, sports, social media, and random leisure content are ALWAYS DISTRACTION.
4. Login pages, search pages, homepages, dashboards, and navigation pages should be considered RELEVANT.
5. If a page could reasonably help the user progress toward their goal, return RELEVANT.
6. When uncertain, prefer RELEVANT rather than blocking potentially useful content.

Examples:

Goal: Learn guitar
Page: Beginner Finger Exercises for Guitar
Answer: RELEVANT

Goal: Study Dynamic Programming
Page: Binary Search Tutorial
Answer: RELEVANT

Goal: Lose weight
Page: Healthy Meal Planning Guide
Answer: RELEVANT

Goal: Study Physics
Page: STUART LITTLE Full Movie
Answer: DISTRACTION

Reply with EXACTLY one word:
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
