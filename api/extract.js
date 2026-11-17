export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { text, team, today } = req.body || {};
    if (!text || text.length > 20000) return res.status(400).json({ error: "bad input" });

    const prompt = `You turn meeting notes into projects and tasks for NovaWorks Technologies (Lahore). Today is ${today}. Team (use ONLY these ids): ${JSON.stringify(team)}.
Each project needs one manager id (role manager). Each task needs one developer id (role dev), deadline YYYY-MM-DD (resolve relative dates from today; estimate if missing), estimated_hours number (estimate if missing) and priority high|medium|low.
Return ONLY JSON: {"projects":[{"name":"","description":"","manager":"usman","tasks":[{"title":"","assignee":"ali","deadline":"YYYY-MM-DD","estimated_hours":0,"priority":"medium"}]}]}
Notes:
${text}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await r.json();
    const raw = d.content?.[0]?.text || "";
    res.status(200).json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (e) {
    res.status(500).json({ error: "AI failed" });
  }
}