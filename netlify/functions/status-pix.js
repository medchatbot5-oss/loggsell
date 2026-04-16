exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "ID obrigatorio" }) };
  }

  const response = await fetch(`https://api.sunize.com.br/v1/transactions/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SUNIZE_CLIENT_KEY,
      "x-api-secret": process.env.SUNIZE_CLIENT_SECRET,
    },
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};
