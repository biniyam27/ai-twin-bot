require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const Groq = require("groq-sdk");
const fs = require("fs");

const KNOWLEDGE_FILE = "./knowledge.txt";
const CONTENT_FILE = "./aibina-content.txt";

<<<<<<< HEAD
=======
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

>>>>>>> 11e87d5 (fix: clean project update)
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, "");
}
const LOG_FILE = "./messages.txt";

if (!fs.existsSync(KNOWLEDGE_FILE)) {
  fs.writeFileSync(KNOWLEDGE_FILE, "");
}


function getKnowledge() {
  const main = fs.readFileSync(
    "./knowledge.txt",
    "utf8"
  );

  const channel = fs.readFileSync(
    "./aibina-content.txt",
    "utf8"
  );

  return main + "\n\n" + channel;
}
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;
const OWNER_ID       = Number(process.env.OWNER_ID);

const bot  = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const groq = new Groq({ apiKey: GROQ_API_KEY });



const SYSTEM_PROMPT = `
You are Biniyam's AI Twin.
means talk like biniyam, users say "you" represent biniyam's
Your role:
- Represent Biniyam's knowledge, communication style, and interests.
- Answer naturally like a friendly Ethiopian software engineering student.
Use English when the user writes in English.
when users writs in other language respond please ask in English.
- Explain technical concepts simply.
- Give practical examples whenever possible.
- Be supportive and educational.

Communication style:
- Friendly and conversational.
- Avoid sounding like a textbook.
- Keep simple answers short.
- Give detailed explanations for technical questions.
- Use Ethiopian examples when relevant.

Rules:
- Never claim experiences that are not in the knowledge base.
- If information is unknown, say so honestly.
- Focus on helping users learn technology.
If a user asks about Biniyam and the answer is not explicitly present in the knowledge base, respond:
"I am not sure about that information."

Never invent personal facts.
Never assume details.
Only use information contained in the knowledge base.
`;



const userSessions = new Map();

function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, { history: [] });
  }
  return userSessions.get(userId);
}
async function askGroq(userId, userMessage) {
  const session = getSession(userId);

   session.history.push({ role: "user", content: userMessage });

   if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",  
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + getKnowledge() },
      ...session.history,
    ],
  });

  const reply = response.choices[0].message.content;

  
  session.history.push({ role: "assistant", content: reply });

  return reply;
}

function isOwner(userId) {
  return userId === OWNER_ID;
}



bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "ወዳጄ";

  if (isOwner(msg.from.id)) {
    return bot.sendMessage(
      msg.chat.id,
      `👋 Welcome Owner ${name}!\n\n🤖 Admin Panel Commands:\n\n` +
        `/learn <text> - Add knowledge\n` +
        `/knowledge - View knowledge file\n` +
        `/knowledgelist - List entries\n` +
        `/editknowledge <id> <text> - Edit entry\n` +
        `/deleteknowledge <id> - Delete entry\n` +
        `/reset - Clear chat memory\n` +
        `/stats - Bot stats\n` +
        `/broadcast <msg> - Send message to users\n\n` +
        `🚀 AI Twin is ready!`
    );
  }

  
  bot.sendMessage(
    msg.chat.id,
    `👋 ሰላም ${name}!\n\nእኔ Biniyam ነኝ — AI Twin 🤖\n\nAsk me anything about my journey and my perspective about tech related ideas! `
  );
});


bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🤖 *Biniyam AI Twin — Help*\n\n` +
      `Just send any message and I'll reply as Biniyam!\n\n` +
      `*Topics I cover:*\n` +
      `• 🧠 AI & Machine Learning\n` +
      `• 💻 Coding (Node.js, React, PHP, MySQL)\n` +
      `• 🔐 Cybersecurity\n` +
      `• 📱 Ethiopian tech news\n` +
      `• 🎓 Student life at Injibara University\n\n` +
      `*Commands:*\n` +
      `/start — Welcome message\n` +
      `/help — This menu\n` +
      `/reset — Clear chat memory\n` +
      `/about — About Aibina channel`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/about/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📺 *Aibina Channel*\n\n` +
      `Ethiopian tech content in *Amharic* — AI, coding & cybersecurity for everyone!\n\n` +
      `🔗 Find us on TikTok,Youtube & Telegram: *@aibina21*`,
    { parse_mode: "Markdown" }
  );
});


bot.onText(/\/reset/, (msg) => {
  const userId = msg.from.id;
  if (userSessions.has(userId)) {
    userSessions.get(userId).history = [];
  }
  bot.sendMessage(msg.chat.id, "🔄 Memory cleared! Fresh start. What's on your mind?");
});


bot.onText(/\/stats/, (msg) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "⛔ This command is for the owner only.");
  }
  const totalUsers    = userSessions.size;
  const totalMessages = [...userSessions.values()].reduce(
    (sum, s) => sum + s.history.length, 0
  );
  bot.sendMessage(
    msg.chat.id,
    `📊 *Bot Stats (Owner Only)*\n\n` +
      `👥 Active users: ${totalUsers}\n` +
      `💬 Total messages in memory: ${totalMessages}`,
    { parse_mode: "Markdown" }
  );
});


bot.onText(/\/model (.+)/, (msg, match) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "⛔ Owner only.");
  }
 
  bot.sendMessage(
    msg.chat.id,
    `🧠 *Available Free Groq Models:*\n\n` +
      `• \`llama-3.1-8b-instant\` — fastest (current)\n` +
      `• \`llama-3.3-70b-versatile\` — smarter, slower\n` +
      `• \`mixtral-8x7b-32768\` — long context\n` +
      `• \`gemma2-9b-it\` — Google Gemma\n\n` +
      `To change model, edit the model name in index-groq.js`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "⛔ Owner only.");
  }
  const message = match[1];
  let sent = 0;
  for (const [userId] of userSessions) {
    try {
      await bot.sendMessage(
        userId,
        `📢 *Message from Biniyam:*\n\n${message}`,
        { parse_mode: "Markdown" }
      );
      sent++;
    } catch (_) {}
  }
  bot.sendMessage(msg.chat.id, `✅ Broadcast sent to ${sent} users.`);
});

bot.onText(/\/savepost/, (msg) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "⛔ Owner only.");
  }

  const replied = msg.reply_to_message;

  if (!replied) {
    return bot.sendMessage(
      msg.chat.id,
      "❌ Reply to a forwarded channel post."
    );
  }

  const content =
    replied.text ||
    replied.caption ||
    "[No text found]";

  fs.appendFileSync(
    CONTENT_FILE,
    `\n\n=== POST ===\n${content}\n`
  );

  bot.sendMessage(
    msg.chat.id,
    "✅ Post saved to Aibina knowledge."
  );
});
bot.onText(/\/learn([\s\S]+)/, (msg, match) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "⛔ Owner only.");
  }

  const text = match[1].trim();

  fs.appendFileSync(
    KNOWLEDGE_FILE,
    `\n---\n${text}\n`
  );

  bot.sendMessage(
    msg.chat.id,
    "✅ Added to knowledge.txt"
  );
});
bot.onText(/\/logs/, (msg) => {
  if (!isOwner(msg.from.id)) return;

  if (!fs.existsSync(LOG_FILE)) {
    return bot.sendMessage(msg.chat.id, "No logs found.");
  }

  const logs = fs.readFileSync(LOG_FILE, "utf8");

  bot.sendMessage(
    msg.chat.id,
    logs.slice(-4000) 
  );
});
bot.onText(/\/knowledge/, (msg) => {
  if (!isOwner(msg.from.id)) return;

  const data = getKnowledge();

  bot.sendMessage(
    msg.chat.id,
    data.length
      ? data.slice(0, 4000)
      : "Knowledge file is empty."
  );
});



bot.onText(/\/knowledgelist/, (msg) => {
  if (!isOwner(msg.from.id)) return;

  const entries = getKnowledge()
    .split("---")
    .filter(e => e.trim());

  let output = "";

  entries.forEach((entry, i) => {
    output += `#${i + 1}\n${entry.trim()}\n\n`;
  });

  bot.sendMessage(
    msg.chat.id,
    output || "No knowledge found."
  );
});



bot.onText(
  /\/editknowledge (\d+) ([\s\S]+)/,
  (msg, match) => {
    if (!isOwner(msg.from.id)) return;

    const index = Number(match[1]) - 1;
    const newText = match[2].trim();

    const entries = getKnowledge()
      .split("---")
      .filter(e => e.trim());

    if (!entries[index]) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Entry not found."
      );
    }

    entries[index] = newText;

    fs.writeFileSync(
      KNOWLEDGE_FILE,
      entries.map(e => `---\n${e}`).join("\n")
    );

    bot.sendMessage(
      msg.chat.id,
      "✅ Knowledge updated."
    );
  }
);

bot.onText(
  /\/deleteknowledge (\d+)/,
  (msg, match) => {
    if (!isOwner(msg.from.id)) return;

    const index = Number(match[1]) - 1;

    const entries = getKnowledge()
      .split("---")
      .filter(e => e.trim());

    if (!entries[index]) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Entry not found."
      );
    }

    entries.splice(index, 1);

    fs.writeFileSync(
      KNOWLEDGE_FILE,
      entries.map(e => `---\n${e}`).join("\n")
    );

    bot.sendMessage(
      msg.chat.id,
      "🗑 Entry deleted."
    );
  }
);


bot.on("message", async (msg) => {



 
  if (msg.text && msg.text.startsWith("/")) return;

  if (!msg.text) {
    return bot.sendMessage(msg.chat.id, "📝 Please send a text message!");
  }

const username = msg.from.username || "NoUsername";
  const name = msg.from.first_name || "";
  const text = msg.text || "[non-text]";

  fs.appendFileSync(
    LOG_FILE,
    `\n${name} (@${username}) [${msg.from.id}]\n${text}\n-------------------\n`
  );



 
  bot.sendChatAction(msg.chat.id, "typing");

  try {
    const reply = await askGroq(msg.from.id, msg.text);
    bot.sendMessage(msg.chat.id, reply);;
  } catch (err) {
    console.error("Groq error:", err.message);
    bot.sendMessage(
      msg.chat.id,
      "⚠️ Something went wrong. Please try again!"
    );
  }
});

<<<<<<< HEAD
=======
app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
>>>>>>> 11e87d5 (fix: clean project update)

bot.on("polling_error", (err) => console.error("Polling error:", err.message));

console.log("🤖 Biniyam AI Twin (Groq) is running...");

