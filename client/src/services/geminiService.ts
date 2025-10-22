const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
export interface Ingredient {
  ten: string;
  nhan: 'An toàn' | 'Trung lập' | 'Nguy cơ' | 'Không phù hợp';
  ghi_chu: string;
}

export interface GeminiResponse {
  thanh_phan: Ingredient[];
  loi: string | null;
}

export interface GeminiError {
  error: {
    code: number;
    message: string;
  };
}

class GeminiService {
  private async makeRequest(imageBase64: string): Promise<GeminiResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Bạn là một công cụ AI chuyên trích xuất và phân tích thành phần mỹ phẩm từ hình ảnh nhãn sản phẩm. Nhiệm vụ của bạn là đọc và liệt kê chính xác tất cả các thành phần trong ảnh, dù ảnh có thể chứa nhiều ngôn ngữ khác nhau, chỉ lấy phần danh sách thành phần. Mỗi thành phần cần trả về dưới dạng JSON với các trường "ten" (có tên tiếng Anh và tiếng Việt nếu có), "nhan" (mức độ an toàn: "An toàn", "Trung lập", "Nguy cơ", hoặc "Không phù hợp"), và "ghi_chu" (mô tả chi tiết ngắn gọn về công dụng, nguồn gốc, đánh giá an toàn của thành phần). Nếu ảnh mờ hoặc không thể đọc rõ chữ thành phần, trả về lỗi với thông báo: "Ảnh không rõ, vui lòng chụp lại".

Kết quả đầu ra theo mẫu JSON sau:
{
 "thanh_phan": [
 {
 "ten": "Tên thành phần đầy đủ (ví dụ: Aqua (Water))",
 "nhan": "An toàn|Trung lập|Nguy cơ|Không phù hợp",
 "ghi_chu": "Mô tả công dụng và đánh giá an toàn (Ví dụ: Chất dung môi chính, dưỡng ẩm, được FDA công nhận là an toàn)"
 },
 ...
 ],
 "loi": null hoặc "Mô tả lỗi"
}

Ví dụ hợp lệ:
{
 "thanh_phan": [
 {"ten": "Aqua (Water)", "nhan": "An toàn", "ghi_chu": "Chất dung môi chính, dưỡng ẩm, và làm nền cho sản phẩm. Được sử dụng rộng rãi và được coi là an toàn."},
 {"ten": "Sodium Chloride", "nhan": "An toàn", "ghi_chu": "Muối ăn, hoạt động như một chất làm tăng độ nhớt, tạo hương vị (mặn) và là chất điện giải. Được FDA công nhận là GRAS (Generally Recognized as Safe)."}
 ],
 "loi": null
}

Chỉ trả về JSON, không thêm bất kỳ giải thích hoặc văn bản khác.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const content = data.candidates[0].content.parts?.[0]?.text ?? '';
      
      // Extract JSON from markdown code block if present
      let jsonText = content.trim();
      
      // Check if content is wrapped in markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1].trim();
        console.log('[Gemini] Extracted JSON from markdown:', jsonText);
      }
      
      // Parse JSON response
      try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as GeminiResponse;
      } catch (parseError) {
        // Include a truncated preview of the raw text in the error for UI display
        const preview = jsonText?.slice(0, 600);
        throw new Error(`Invalid JSON response from Gemini API. Raw preview: ${preview}`);
      }
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  async analyzeImage(imageFile: File): Promise<GeminiResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = result.split(',')[1];
          const response = await this.makeRequest(base64Data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(imageFile);
    });
  }

  async analyzeImageFromBase64(base64String: string): Promise<GeminiResponse> {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    return this.makeRequest(base64Data);
  }
}

export const geminiService = new GeminiService();
