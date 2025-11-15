// Netlify functions have fetch available in Node.js 18+
exports.handler = async (event, context) => {
  // Ensure fetch is available (Node 18+ has it built-in)
  if (typeof fetch === 'undefined') {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Fetch API not available in this environment' })
    };
  }
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const backendUrl = 'https://microgoals-ai-backend-new-1.onrender.com/api/recommend-categories';
    
    // Parse and validate request body
    let requestBody;
    let backendRequestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log('Received request body:', requestBody);
      
      // Support both formats: frontend format (day_of_week, hour) or backend format (day, session)
      
      if (requestBody.day_of_week !== undefined && requestBody.hour !== undefined) {
        // Frontend format - transform to backend format
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = dayNames[requestBody.day_of_week] || 'Mon';
        
        // Convert hour to session
        let session = 'Dinner'; // default
        if (requestBody.hour >= 11 && requestBody.hour < 15) {
          session = 'Lunch';
        } else if (requestBody.hour >= 15 && requestBody.hour < 18) {
          session = 'Afternoon';
        } else if (requestBody.hour >= 18) {
          session = 'Dinner';
        } else {
          session = 'Breakfast';
        }
        
        // Map weather values
        const weatherMap = {
          'rain': 'Rain',
          'cloud': 'Cloud',
          'wind': 'Wind',
          'sunny': 'Sunny'
        };
        const weather = weatherMap[requestBody.weather] || requestBody.weather || 'Sunny';
        
        backendRequestBody = {
          day: day,
          session: session,
          weather: weather,
          waiter: requestBody.waiter || 'default' // Backend requires waiter field, can't be null
        };
      } else if (requestBody.day && requestBody.session) {
        // Already in backend format
        backendRequestBody = requestBody;
      } else {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Missing required fields. Expected: day_of_week, hour, weather OR day, session, weather',
            received: requestBody
          })
        };
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    // Forward the request to the backend
    console.log('Sending to backend:', backendUrl, backendRequestBody);
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequestBody)
    });
    
    console.log('Backend response status:', response.status);

    // Check if response is ok
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `Could not read error response: ${e.message}`;
      }
      
      console.error('Backend error:', response.status, errorText);
      
      // Try to parse as JSON for better error display
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Backend error (${response.status}): ${errorData.error || response.statusText}`,
          details: errorText,
          requestBody: backendRequestBody || requestBody // Include what we sent for debugging
        })
      };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Failed to parse backend response',
          raw: text
        })
      };
    }

    // Transform backend response (recommendations) to frontend format (suggestions)
    // Backend returns: { recommendations: [{ category, predicted_quantity, target_quantity }, ...] }
    // Frontend expects: { suggestions: [{ category, quantity }, ...] }
    let transformedData = data;
    if (data.recommendations && Array.isArray(data.recommendations)) {
      transformedData = {
        suggestions: data.recommendations.map(rec => ({
          category: rec.category || rec.name || rec.item,
          quantity: rec.target_quantity || rec.quantity || rec.predicted_quantity || rec.target || rec.amount || 1
        }))
      };
    } else if (Array.isArray(data)) {
      // If backend returns array directly
      transformedData = {
        suggestions: data.map(rec => ({
          category: rec.category || rec.name || rec.item,
          quantity: rec.quantity || rec.target || rec.amount || 1
        }))
      };
    } else if (!data.suggestions) {
      // If it's already in the right format or needs minimal transformation
      transformedData = data;
    }

    // Return the response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedData)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

