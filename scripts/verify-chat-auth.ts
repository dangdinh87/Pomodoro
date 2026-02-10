
import fetch from 'node-fetch';

async function testChatAuth() {
  const url = 'http://localhost:3000/api/chat';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'moonshotai/kimi-k2-instruct-0905'
      }),
    });

    console.log(`Response Status: ${response.status}`);

    if (response.status === 401) {
      console.log('✅ Auth check passed: Unauthorized request rejected.');
    } else if (response.status === 200) {
      console.log('❌ Auth check failed: Unauthorized request accepted.');
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.error('Error testing chat API:', error);
  }
}

testChatAuth();
