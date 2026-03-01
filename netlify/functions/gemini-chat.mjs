// Netlify Function v2 — Proxy Google Gemini Chat API
// ใช้ Serverless Function เป็นตัวกลาง เพื่อหลีกเลี่ยง CORS

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export default async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    try {
        // ดึง API key จาก query string
        const url = new URL(req.url);
        const apiKey = url.searchParams.get("key");

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "Missing API key" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // อ่าน JSON body
        const body = await req.text();

        // Forward ไปยัง Gemini API
        const response = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
};
