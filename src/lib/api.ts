export async function enhanceImage(file: File): Promise<string> {  // 移除 scale 參數，固定使用模型默認
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        
        const response = await fetch('/api/enhance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.image) {
          resolve(data.image);
        } else {
          throw new Error(data.error || 'Enhancement failed');
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}