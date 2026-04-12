exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const auth = "Basic " + Buffer.from(
    `${process.env.FREEPAY_PUBLIC_KEY}:${process.env.FREEPAY_SECRET_KEY}`
  ).toString("base64");

  const response = await fetch("https://api.freepaybrasil.com/v1/payment-transaction/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": auth,
    },
    body: event.body,
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};
