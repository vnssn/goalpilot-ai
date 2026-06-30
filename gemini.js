//=====================================
// GEMINI API INTEGRATION
//=====================================

// Sends current page information
// to Gemini and gets back either
// RELEVANT or DISTRACTION.

async function askGemini(goal, website, title, apiKey) {
  // Build prompt for Gemini
  const prompt = `
User Goal:
${goal}

Website:
${website}

Page Title:
${title}

Determine whether this page helps achieve the user's goal.

Reply with ONLY:

RELEVANT

or

DISTRACTION
`;

  // Send request to Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
    return "ERROR";
  }

  // Return Gemini's decision
  return data.candidates[0].content.parts[0].text;
}
