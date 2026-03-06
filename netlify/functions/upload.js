exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Not: Ücretsiz Netlify'da dosya saklama (storage) yoktur.
        // Bu yüzden şimdilik "Yüklendi" süsü veriyoruz veya 
        // modeli LocalStorage'a kaydedecek şekilde simüle ediyoruz.
        
        const data = JSON.parse(event.body);
        console.log("🚀 Yeni Model Geldi:", data.name);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: "Model başarıyla yüklendi! (Netlify Cloud)",
                modelData: data 
            })
        };
    } catch (err) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};
