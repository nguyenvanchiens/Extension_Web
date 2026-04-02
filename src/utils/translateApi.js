/**
 * Dịch text bằng Google Translate API (miễn phí, không cần API key)
 * @param {string} text - Text cần dịch
 * @param {string} from - Ngôn ngữ nguồn (VD: 'en')
 * @param {string} to - Ngôn ngữ đích (VD: 'vi')
 * @returns {Promise<string>} Text đã dịch
 */
export async function translateText(text, from = 'en', to = 'vi') {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // data[0] là mảng các đoạn dịch, mỗi đoạn [0] là text dịch
    return data[0].map((item) => item[0]).join('');
  } catch {
    return text;
  }
}

/**
 * Dịch nhiều text cùng lúc (gộp thành 1 request để nhanh hơn)
 * Dùng ký tự \n để tách các dòng, sau đó split lại
 * @param {string[]} texts - Mảng text cần dịch
 * @param {string} from
 * @param {string} to
 * @returns {Promise<string[]>} Mảng text đã dịch
 */
export async function translateBatch(texts, from = 'en', to = 'vi') {
  if (texts.length === 0) return [];
  try {
    const joined = texts.join('\n');
    const translated = await translateText(joined, from, to);
    const results = translated.split('\n');
    // Đảm bảo số lượng kết quả khớp
    return texts.map((_, i) => (results[i] || '').trim());
  } catch {
    return texts;
  }
}
