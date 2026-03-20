const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;

// Extract text from image
exports.extractTextFromImage = async (imageBuffer) => {
  try {
    const worker = await createWorker();
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Parse expiry date from OCR text
exports.parseExpiryDate = (text) => {
  try {
    // Common expiry date patterns
    const patterns = [
      /exp[iry]*[\s:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
      /best before[\s:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
      /use by[\s:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let day, month, year;
        
        // Determine if it's DD/MM/YYYY or MM/DD/YYYY
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        const num3 = parseInt(match[3]);
        
        // If first number > 12, it must be day
        if (num1 > 12) {
          day = num1;
          month = num2;
        } else if (num2 > 12) {
          month = num1;
          day = num2;
        } else {
          // Assume DD/MM/YYYY for Indian context
          day = num1;
          month = num2;
        }
        
        year = num3 < 100 ? 2000 + num3 : num3;
        
        const date = new Date(year, month - 1, day);
        
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Date parsing error:', error);
    return null;
  }
};

// Parse product name from OCR text
exports.parseProductName = (text) => {
  try {
    // Get first few words as product name
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      // Return first substantial line
      for (const line of lines) {
        if (line.length > 3 && line.length < 50) {
          return line.trim();
        }
      }
    }
    
    return 'Unknown Product';
  } catch (error) {
    console.error('❌ Product name parsing error:', error);
    return 'Unknown Product';
  }
};

// Process OCR image and extract food item details
exports.processFoodImage = async (imageBuffer) => {
  try {
    const text = await this.extractTextFromImage(imageBuffer);
    
    const expiryDate = this.parseExpiryDate(text);
    const productName = this.parseProductName(text);
    
    return {
      success: true,
      data: {
        name: productName,
        expiryDate,
        rawText: text
      }
    };
  } catch (error) {
    console.error('❌ Food image processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

exports.extractExpiryCandidates = (text = '') => {
  const patterns = [
    /\b\d{4}[\/-]\d{2}[\/-]\d{2}\b/g,
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g,
    /\b\d{1,2}[\/-]\d{4}\b/g,
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{2,4}\b/gi
  ];

  const values = new Set();
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    matches.forEach((match) => values.add(match.trim()));
  }

  return Array.from(values);
};
