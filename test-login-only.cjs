const BASE = "http://localhost:3001/api";

async function testLogin() {
  try {
    console.log("Testing login...");
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test-learner@exam.com", password: "test123" })
    });
    
    console.log("Status:", loginRes.status);
    const data = await loginRes.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testLogin();
