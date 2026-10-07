/**
 * Mock OCR & LLM Translation Utility
 * In production, this would call OpenAI Vision API or Tesseract + GPT-4.
 */

export const processDocumentImage = async (imageFile) => {
  // Simulate network delay for AI processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        extractedData: {
          documentType: 'E-Way Bill',
          pickupLocation: {
            en: 'Kochi Port, Ernakulam',
            ml: 'കൊച്ചി പോർട്ട്, എറണാകുളം'
          },
          deliveryDestination: {
            en: 'Technopark, Trivandrum',
            ml: 'ടെക്നോപാർക്ക്, തിരുവനന്തപുരം'
          },
          cargoDescription: {
            en: 'Computer Hardware & Servers (15 Boxes)',
            ml: 'കമ്പ്യൂട്ടർ ഹാർഡ്‌വെയർ & സെർവറുകൾ (15 ബോക്സുകൾ)'
          },
          validity: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
          consignor: {
            name: 'Kerala Tech Solutions',
            phone: '+919876543210'
          },
          consignee: {
            name: 'Technopark Admin',
            phone: '+919876543211'
          }
        },
        rawText: "E-Way Bill... Kochi Port... Technopark... 15 Boxes...",
      });
    }, 2500);
  });
};

export const translateLogisticsJargon = (term) => {
  const dictionary = {
    'Consignee': 'ചരക്ക് കൈപ്പറ്റുന്ന വ്യക്തി',
    'Consignor': 'ചരക്ക് അയക്കുന്ന വ്യക്തി',
    'HSN Code': 'ഉൽപ്പന്നങ്ങളെ തരംതിരിക്കാനുള്ള കോഡ്',
    'Transshipment': 'വണ്ടി മാറ്റിക്കയറ്റൽ',
  };
  return dictionary[term] || term;
};
