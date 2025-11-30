const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock API endpoint for saving user fashion persona
app.post('/api/v1/save-persona', (req, res) => {
  try {
    const personaData = req.body;
    
    // Log the received data for demonstration
    console.log('=== Fashion Persona Data Received ===');
    console.log('Physical Attributes:');
    console.log(`  Height: ${personaData.height} cm`);
    console.log(`  Weight: ${personaData.weight} kg`);
    console.log(`  Gender: ${personaData.gender}`);
    
    console.log('\nVisual Analysis:');
    console.log(`  Skin Undertone: ${personaData.skinUndertone}`);
    console.log(`  Body Type: ${personaData.bodyType} (${personaData.bodyTypeDetails})`);
    
    console.log('\nStyle Preferences:');
    console.log(`  Style Profile: ${personaData.styleProfile}`);
    console.log(`  Preferred Fit: ${personaData.preferredFit}`);
    console.log(`  Budget Range: ${personaData.budgetRange}`);
    console.log(`  Liked Colors: ${personaData.likedColors.join(', ')}`);
    console.log(`  Disliked Colors: ${personaData.dislikedColors.join(', ')}`);
    console.log(`  Occasions: ${personaData.occasions.join(', ')}`);
    console.log(`  Weather Sensitivity: ${personaData.weatherSensitivity}`);
    console.log(`  Activity Level: ${personaData.activityLevel}`);
    console.log(`  Color Temperature: ${personaData.colorTemperature}`);
    console.log(`  Sustainability Preference: ${personaData.sustainabilityPreference}`);
    console.log(`  Avoid Patterns: ${personaData.avoidPatterns.join(', ')}`);
    console.log('=====================================\n');

    // Mock AI analysis response
    const aiAnalysis = {
      personalityType: generatePersonalityType(personaData),
      recommendations: generateRecommendations(personaData),
      colorPalette: generateColorPalette(personaData),
      styleScore: Math.floor(Math.random() * 20) + 80 // 80-100
    };

    // Simulate processing time
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: 'Fashion persona saved successfully',
        data: {
          userId: 'user_' + Date.now(),
          personaId: 'persona_' + Date.now(),
          analysis: aiAnalysis,
          timestamp: new Date().toISOString()
        }
      });
    }, 1000);

  } catch (error) {
    console.error('Error processing persona data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process fashion persona data',
      error: error.message
    });
  }
});

// Helper functions for mock AI analysis
function generatePersonalityType(data) {
  const types = {
    'Minimalist': 'Clean Sophisticate',
    'Streetwear': 'Urban Trendsetter',
    'Bohemian': 'Free Spirit',
    'Formal': 'Classic Elegance',
    'Casual': 'Effortless Chic',
    'Athleisure': 'Active Lifestyle'
  };
  return types[data.styleProfile] || 'Unique Individual';
}

function generateRecommendations(data) {
  const recs = [];
  
  if (data.bodyType === 'hourglass') {
    recs.push('Fitted silhouettes that highlight your waist');
  }
  if (data.skinUndertone === 'cool') {
    recs.push('Cool-toned colors like blues, purples, and emerald greens');
  }
  if (data.sustainabilityPreference) {
    recs.push('Sustainable brands and timeless pieces');
  }
  
  return recs.length > 0 ? recs : ['Versatile basics that match your lifestyle'];
}

function generateColorPalette(data) {
  const palettes = {
    'cool': ['#4A90E2', '#8E44AD', '#2ECC71', '#34495E'],
    'warm': ['#E67E22', '#F39C12', '#E74C3C', '#D35400'],
    'neutral': ['#95A5A6', '#7F8C8D', '#BDC3C7', '#ECF0F1']
  };
  return palettes[data.skinUndertone] || palettes['neutral'];
}

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fashion Persona API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Fashion Persona API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Persona endpoint: http://localhost:${PORT}/api/v1/save-persona`);
});

module.exports = app;