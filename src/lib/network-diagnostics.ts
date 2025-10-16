export async function testNetworkConnectivity() {
  const tests = [
    {
      name: 'API Login Endpoint',
      url: '/api/auth/login',
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' }
    },
    {
      name: 'API Verify Endpoint',
      url: '/api/auth/verify',
      method: 'GET'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const options: RequestInit = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const startTime = Date.now();
      const response = await fetch(test.url, options);
      const endTime = Date.now();

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      results.push({
        name: test.name,
        status: response.status,
        ok: response.ok,
        responseTime: endTime - startTime,
        data: responseData
      });
    } catch (error) {
      results.push({
        name: test.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

export function logNetworkDiagnostics() {
  if (typeof window !== 'undefined') {
    console.log('=== Network Diagnostics ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    console.log('Online Status:', navigator.onLine);
    
    // Test localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('LocalStorage: Working');
    } catch (error) {
      console.log('LocalStorage: Error -', error);
    }
    
    // Test sessionStorage
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      console.log('SessionStorage: Working');
    } catch (error) {
      console.log('SessionStorage: Error -', error);
    }
  }
}