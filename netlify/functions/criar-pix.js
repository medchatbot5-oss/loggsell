exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);

  const payload = {
    external_id: body.external_id || `order-${Date.now()}`,
    total_amount: body.total_amount,
    payment_method: "PIX",
    ip: body.ip || "177.0.0.1",
    items: body.items,
    customer: body.customer,
  };

  const response = await fetch("https://api.sunize.com.br/v1/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SUNIZE_CLIENT_KEY,
      "x-api-secret": process.env.SUNIZE_CLIENT_SECRET,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};
