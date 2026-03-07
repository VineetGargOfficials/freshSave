interface ParsedFoodData {
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
}

const CATEGORIES = [
  'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 
  'Beverages', 'Snacks', 'Condiments', 'Frozen', 'Other'
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Fruits: ['apple', 'banana', 'orange', 'mango', 'grape', 'strawberry', 'watermelon', 'pineapple', 'kiwi', 'peach'],
  Vegetables: ['tomato', 'potato', 'onion', 'carrot', 'lettuce', 'cabbage', 'spinach', 'broccoli', 'cucumber', 'pepper'],
  Dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'paneer', 'curd'],
  Meat: ['chicken', 'mutton', 'beef', 'pork', 'fish', 'lamb', 'turkey'],
  Grains: ['rice', 'wheat', 'bread', 'pasta', 'cereal', 'oats', 'quinoa'],
  Beverages: ['juice', 'soda', 'tea', 'coffee', 'water', 'milk'],
  Snacks: ['chips', 'cookies', 'crackers', 'popcorn', 'nuts'],
  Condiments: ['ketchup', 'sauce', 'mayo', 'mustard', 'vinegar'],
  Frozen: ['ice cream', 'frozen pizza', 'frozen vegetables'],
};

// Parse quantity from text
function parseQuantity(text: string): string {
  // Match patterns like: "5 pieces", "2 kg", "500 grams", "3 bottles", etc.
  const quantityPatterns = [
    /(\d+\.?\d*)\s*(piece|pieces|kg|grams?|g|liters?|l|bottles?|packets?|boxes?|cans?)/i,
    /(\d+\.?\d*)\s*([a-z]+)/i,
  ];

  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }

  // Look for just numbers
  const numberMatch = text.match(/(\d+)/);
  if (numberMatch) {
    return `${numberMatch[1]} piece${parseInt(numberMatch[1]) > 1 ? 's' : ''}`;
  }

  return '1';
}

// Parse category from text
function parseCategory(text: string): string {
  const lowerText = text.toLowerCase();

  // Check direct category mentions
  for (const category of CATEGORIES) {
    if (lowerText.includes(category.toLowerCase())) {
      return category;
    }
  }

  // Check keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}

// Parse date from text
function parseDate(text: string): string {
  const today = new Date();
  const lowerText = text.toLowerCase();

  // Handle relative dates
  if (lowerText.includes('today')) {
    return formatDate(today);
  }

  if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  // Handle "in X days"
  const inDaysMatch = lowerText.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    return formatDate(futureDate);
  }

  // Handle specific dates: "12 jan 2025", "january 12 2025", "12th january"
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const monthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // Pattern: "12 jan 2025" or "12 january 2025"
  const datePattern1 = /(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})?/i;
  const match1 = lowerText.match(datePattern1);
  
  if (match1) {
    const day = parseInt(match1[1]);
    const monthStr = match1[2].toLowerCase();
    let month = monthShort.indexOf(monthStr);
    if (month === -1) {
      month = monthNames.indexOf(monthStr);
    }
    const year = match1[3] ? parseInt(match1[3]) : today.getFullYear();
    
    if (month !== -1) {
      const date = new Date(year, month, day);
      return formatDate(date);
    }
  }

  // Pattern: "january 12 2025"
  const datePattern2 = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(\d{4})?/i;
  const match2 = lowerText.match(datePattern2);
  
  if (match2) {
    const monthStr = match2[1].toLowerCase();
    let month = monthShort.indexOf(monthStr);
    if (month === -1) {
      month = monthNames.indexOf(monthStr);
    }
    const day = parseInt(match2[2]);
    const year = match2[3] ? parseInt(match2[3]) : today.getFullYear();
    
    if (month !== -1) {
      const date = new Date(year, month, day);
      return formatDate(date);
    }
  }

  // Default: 7 days from now
  const defaultDate = new Date(today);
  defaultDate.setDate(defaultDate.getDate() + 7);
  return formatDate(defaultDate);
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Extract food name (remove quantity, category, date keywords)
function extractFoodName(text: string): string {
  let name = text;

  // Remove quantity patterns
  name = name.replace(/(\d+\.?\d*)\s*(piece|pieces|kg|grams?|g|liters?|l|bottles?|packets?|boxes?|cans?)/gi, '');
  
  // Remove "quantity" keyword
  name = name.replace(/quantity\s+/gi, '');
  
  // Remove "category" keyword and category names
  name = name.replace(/category\s+/gi, '');
  for (const category of CATEGORIES) {
    name = name.replace(new RegExp(category, 'gi'), '');
  }
  
  // Remove date-related keywords
  name = name.replace(/expir(ing|es|ed|y)\s+(on|date|in)?/gi, '');
  name = name.replace(/\b(today|tomorrow|in\s+\d+\s+days?)\b/gi, '');
  
  // Remove month names and dates
  name = name.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi, '');
  name = name.replace(/\d{1,2}(?:st|nd|rd|th)?\s*\d{0,4}/g, '');
  
  // Clean up
  name = name.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name || 'Unknown Item';
}

/**
 * Parse voice input and extract food details
 * Example inputs:
 * - "banana quantity 6 pieces category fruits expiring on 12 jan 2025"
 * - "milk 2 liters dairy expiring tomorrow"
 * - "bread 1 loaf grains expires in 3 days"
 */
export function parseVoiceInput(text: string): ParsedFoodData {
  const name = extractFoodName(text);
  const quantity = parseQuantity(text);
  const category = parseCategory(text);
  const expiryDate = parseDate(text);

  return {
    name,
    quantity,
    category,
    expiryDate,
  };
}