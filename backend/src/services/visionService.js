const { GoogleGenerativeAI } = require('@google/generative-ai');
const { normalizeCategory } = require('./expiryService');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const extractJsonBlock = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
};

exports.detectFridgeItems = async ({ buffer, mimeType }) => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are analyzing one fridge photo for a food-waste app.
Return only valid JSON with this shape:
{
  "items": [
    {
      "name": "Milk",
      "category": "Dairy",
      "quantity": "1 bottle",
      "expiryDate": "YYYY-MM-DD or null",
      "confidenceScore": 0.0
    }
  ]
}

Rules:
- Detect multiple visible food items.
- Use categories from: Fruits, Vegetables, Dairy, Meat, Grains, Beverages, Snacks, Condiments, Frozen, Other.
- If quantity is unclear, use "1 item".
- If expiry is not visible, use null.
- confidenceScore must be between 0 and 1.
- Return no prose, no markdown, only JSON.
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    }
  ]);

  const raw = result.response.text();
  const parsed = JSON.parse(extractJsonBlock(raw));

  const items = Array.isArray(parsed.items) ? parsed.items : [];

  return items
    .filter((item) => item && item.name)
    .map((item) => ({
      name: String(item.name).trim(),
      category: normalizeCategory(item.category),
      quantity: String(item.quantity || '1 item').trim(),
      expiryDate: item.expiryDate || null,
      confidenceScore: Math.max(0, Math.min(Number(item.confidenceScore || 0.5), 1))
    }));
};
