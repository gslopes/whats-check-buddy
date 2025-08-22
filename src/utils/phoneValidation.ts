// Utility functions for phone number validation

export const isValidE164 = (phoneNumber: string): boolean => {
  // E164 format: +[country code][national number]
  // Regex pattern for E164: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  // Remove any whitespace and check format
  const cleanNumber = phoneNumber.trim();
  return e164Regex.test(cleanNumber);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Clean the number first
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + if not present
  if (!phoneNumber.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

export const simulateWhatsAppValidation = async (phoneNumber: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
  
  // Simulate random results for demo purposes
  // In a real implementation, this would call WhatsApp Business API
  const random = Math.random();
  
  // Simulate higher success rate for valid E164 numbers
  if (isValidE164(phoneNumber)) {
    return random > 0.3; // 70% chance of having WhatsApp
  } else {
    return false; // Invalid numbers don't have WhatsApp
  }
};

export const validateBatchNumbers = async (
  numbers: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ number: string; isValidE164: boolean; hasWhatsApp: boolean }[]> => {
  const results = [];
  
  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i];
    const isValidFormat = isValidE164(number);
    
    let hasWhatsApp = false;
    if (isValidFormat) {
      hasWhatsApp = await simulateWhatsAppValidation(number);
    }
    
    results.push({
      number,
      isValidE164: isValidFormat,
      hasWhatsApp
    });
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, numbers.length);
    }
  }
  
  return results;
};