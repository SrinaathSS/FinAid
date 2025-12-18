// utils.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Setup Gemini
// WARNING: In a production app, never store API keys in the frontend code.
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Calculates deterministic statistics from the transaction list.
 * This ensures 100% accuracy for charts and totals.
 */
export function calculateStats(transactions) {
  if (!transactions || transactions.length === 0) return null;

  let totalSpent = 0;
  let totalIncome = 0;
  const categoryMap = {};
  const merchantMap = {};
  const monthlyMap = {};

  transactions.forEach(t => {
    const amount = Number(t.amount || t.Amount || 0);
    const type = (t.type || t.Type || '').toLowerCase();
    const category = (t.category || t.Category || 'Uncategorized').trim();
    const description = (t.description || t.Description || '').trim();
    const dateStr = t.date || t['Txn Date'];
    
    console.log('Processing transaction:', { type, amount, category }); // Debug log

    // Simple date parsing (assuming DD/MM/YYYY or YYYY-MM-DD)
    let monthKey = 'Unknown';
    if (dateStr) {
      try {
        // Try to handle DD/MM/YYYY format which is common in India/UK
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // assume DD/MM/YYYY
            monthKey = `${parts[2]}-${parts[1]}`;
          } else {
            monthKey = dateStr;
          }
        } else {
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj)) {
            monthKey = dateObj.toISOString().slice(0, 7); // YYYY-MM
          }
        }
      } catch (e) {
        monthKey = 'Unknown';
      }
    }

    if (type === 'debit') {
      totalSpent += amount;

      // Category Logic
      if (categoryMap[category]) {
        categoryMap[category] += amount;
      } else {
        categoryMap[category] = amount;
      }

      // Merchant Logic (using description as proxy for merchant if receiver is missing)
      const merchant = (t.receiver || description).split('/')[0].trim(); // Simple heuristic
      if (merchantMap[merchant]) {
        merchantMap[merchant] += amount;
      } else {
        merchantMap[merchant] = amount;
      }

      // Monthly Logic
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey] += amount;
      } else {
        monthlyMap[monthKey] = amount;
      }

    } else if (type === 'credit') {
      totalIncome += amount;
    }
  });

  console.log('💰 Stats calculated:');
  console.log('  Total Spent:', totalSpent);
  console.log('  Total Income:', totalIncome);
  console.log('  Transactions:', transactions.length);
  console.log('  Debit transactions:', transactions.filter(t => t.type === 'debit').length);
  console.log('  Credit transactions:', transactions.filter(t => t.type === 'credit').length);

  // Format for Charts
  const chart_insights = Object.keys(categoryMap).map(cat => ({
    label: cat,
    amount: categoryMap[cat]
  })).sort((a, b) => b.amount - a.amount);

  const top_merchants = Object.keys(merchantMap).map(m => ({
    merchant: m,
    amount: merchantMap[m]
  })).sort((a, b) => b.amount - a.amount).slice(0, 10);

  const monthly_trends = Object.keys(monthlyMap).map(m => ({
    month: m,
    amount: monthlyMap[m]
  })).sort((a, b) => a.month.localeCompare(b.month));

  const highest_category = chart_insights.length > 0 ? chart_insights[0].label : '-';

  return {
    total_spent: totalSpent,
    total_income: totalIncome,
    num_transactions: transactions.length,
    average_transaction: transactions.length > 0 ? totalSpent / transactions.length : 0,
    highest_category,
    chart_insights,
    top_merchants,
    monthly_trends
  };
}

export function convertToCSV(data) {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csv = [headers.join(",")];
  // Limit to first 50 rows to save tokens if dataset is huge
  const slicedData = data.slice(0, 50);
  for (const row of slicedData) {
    csv.push(headers.map((h) => JSON.stringify(row[h] || "")).join(","));
  }
  return csv.join("\n");
}

/**
 * Uses Gemini to generate qualitative insights, anomalies, and advice.
 * It now receives the PRE-CALCULATED stats to avoid hallucinating numbers.
 */
export async function getInsights(transactions, stats) {
  const csvData = convertToCSV(transactions);
  const statsJson = JSON.stringify(stats, null, 2);

  const prompt = `You are a financial analyst. I have already calculated the hard numbers. 
Here are the calculated statistics:
${statsJson}

Here is a sample of the raw transaction data (first 50 rows):
${csvData}

Your job is to provide QUALITATIVE analysis. Do NOT recalculate totals.
1. Provide specific, actionable suggestions. make them SHORT and SWEET. Max 3 bullet points. Each point under 10 words.
2. Write a brief executive summary report.

Return JSON format:
{
  "anomalies": [], 
  "financial_health_score": 0,
  "health_score_reason": "", 
  "reports": ["..."],
  "suggestions": ["Make coffee at home to save $50/mo", "Cancel unused gym membership", "Switch to high-yield savings"]
}
Only return JSON.`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```(?:json)?\n?|```/g, "").trim();
    }
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (e) {
    console.error("AI Error:", e);
    if (e.message?.includes('quota') || e.message?.includes('429')) {
      return { 
        anomalies: [], 
        reports: ["AI quota limit reached. Please wait or upgrade your API plan."], 
        suggestions: ["AI insights temporarily unavailable"], 
        financial_health_score: 0 
      };
    }
    return { anomalies: [], reports: ["AI currently unavailable."], suggestions: [], financial_health_score: 0 };
  }
}

/**
 * Allows the user to ask free-form questions about their data.
 */
export async function askAI(question, transactions, stats) {
  const csvData = convertToCSV(transactions);
  const statsJson = JSON.stringify(stats);

  const prompt = `User Question: "${question}"

Context:
- Calculated Stats: ${statsJson}
- Transaction Sample: ${csvData}

Answer the user's question concisely and accurately based on the data provided. If the answer requires calculating something new (like "how much did I spend on Uber?"), estimate it from the sample or explain you only see a sample. Be helpful and friendly.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return "Sorry, I couldn't process that request right now.";
  }
}
