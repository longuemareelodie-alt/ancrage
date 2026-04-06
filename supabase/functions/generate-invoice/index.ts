import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const planLabels: Record<string, string> = {
  monthly: "Abonnement mensuel",
  yearly: "Abonnement annuel",
  one_time: "Accès unique",
};

// Simple PDF builder - generates a valid PDF without external libs
function buildInvoicePDF(invoice: {
  invoiceNumber: string;
  date: string;
  plan: string;
  amount: string;
  email: string;
  firstName: string;
}): Uint8Array {
  const lines: string[] = [];
  let yPos = 750;
  const objects: string[] = [];
  const offsets: number[] = [];

  const addText = (x: number, y: number, size: number, text: string, font = "/F1") => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePDF(text)}) Tj ET`);
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    lines.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const escapePDF = (text: string): string => {
    return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  };

  // Header
  addText(50, yPos, 24, "ANCRAGE");
  yPos -= 20;
  addText(50, yPos, 10, "Bien-etre emotionnel");
  
  // Invoice title
  yPos -= 50;
  addText(50, yPos, 16, "FACTURE");
  
  // Invoice info
  yPos -= 30;
  addText(50, yPos, 10, `Numero : ${invoice.invoiceNumber}`);
  yPos -= 15;
  addText(50, yPos, 10, `Date : ${invoice.date}`);

  // Client info
  yPos -= 35;
  addText(50, yPos, 12, "Client");
  yPos -= 18;
  addText(50, yPos, 10, invoice.firstName || "Client");
  yPos -= 15;
  addText(50, yPos, 10, invoice.email);

  // Separator
  yPos -= 25;
  addLine(50, yPos, 545, yPos);

  // Table header
  yPos -= 25;
  addText(50, yPos, 10, "Description");
  addText(400, yPos, 10, "Montant");
  
  yPos -= 5;
  addLine(50, yPos, 545, yPos);

  // Table row
  yPos -= 20;
  addText(50, yPos, 10, planLabels[invoice.plan] || invoice.plan);
  addText(400, yPos, 10, `${invoice.amount} EUR`);

  // Separator
  yPos -= 15;
  addLine(50, yPos, 545, yPos);

  // Total
  yPos -= 25;
  addText(350, yPos, 12, "Total :");
  addText(400, yPos, 12, `${invoice.amount} EUR`);

  // Footer
  yPos = 60;
  addText(50, yPos, 8, "Ancrage - Application de bien-etre emotionnel");
  yPos -= 12;
  addText(50, yPos, 8, "Merci pour votre confiance.");

  // Build PDF structure
  const contentStream = lines.join("\n");
  const streamBytes = new TextEncoder().encode(contentStream);
  
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${streamBytes.length} >>
stream
${contentStream}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000${(325 + streamBytes.length).toString().padStart(3, "0")} 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>

startxref
0
%%EOF`;

  return new TextEncoder().encode(pdf);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: "Missing subscriptionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch subscription (verify ownership)
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, email")
      .eq("user_id", user.id)
      .single();

    const date = new Date(sub.created_at);
    const formattedDate = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pdfBytes = buildInvoicePDF({
      invoiceNumber: `ANC-${date.getFullYear()}-${sub.id.slice(0, 8).toUpperCase()}`,
      date: formattedDate,
      plan: sub.plan,
      amount: (sub.amount / 100).toFixed(2).replace(".", ","),
      email: profile?.email || user.email || "",
      firstName: profile?.first_name || "",
    });

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-ancrage-${sub.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Invoice generation error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
