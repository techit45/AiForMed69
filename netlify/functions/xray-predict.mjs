// Netlify Function v2 — Proxy X-Ray Prediction API
// แก้ปัญหา: Netlify proxy redirect ส่ง multipart/form-data (ไฟล์รูป) ไม่ผ่าน ทำให้ 504 timeout
// วิธีแก้: ใช้ Serverless Function รับ request แล้ว forward ไปยัง Ultralytics API โดยตรง

const UPSTREAM_URL = "https://predict-69a257cff20f47264cce-dproatj77a-as.a.run.app/predict";

export default async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    try {
        // อ่าน body ดิบทั้งหมด (รวม multipart boundary + ไฟล์ไบนารี)
        const body = await req.arrayBuffer();

        // Forward request ไปยัง Ultralytics API พร้อม headers เดิม
        const response = await fetch(UPSTREAM_URL, {
            method: "POST",
            headers: {
                "Authorization": req.headers.get("authorization") || "",
                "Content-Type": req.headers.get("content-type") || "",
            },
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
