const fetch = require('node-fetch');

const getExchangeRate = async (fromCurrency, toCurrency = 'USD') => {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const response = await fetch(`https://v6.exchangerate-api.com/v6/d97f7e8a9c763aae5c0db862/latest/USD`);
    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('Failed to fetch exchange rate');
    }

    return data.conversion_rates[toCurrency] || 1; // Default to 1 if same currency
  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
    return 1; // Safe fallback
  }
};

module.exports = { getExchangeRate };
