# AI-Powered Wardrobe Management Web Application  

An intelligent web application that helps users manage, organize, and optimize their wardrobe using AI. The system suggests outfits based on weather, occasions, and personal preferences, while also allowing users to digitally catalog their clothing items.

---

## 🚀 Features  

- **AI Outfit Recommendation**  
  - Suggests daily outfits based on weather, events, and personal style.  
  - Learns user preferences over time.  

- **Smart Wardrobe Organization**  
  - Upload clothing images to create a digital wardrobe.  
  - Categorizes clothes (e.g., shirts, pants, dresses, accessories).  

- **Personalized Styling**  
  - Mix & match outfits automatically.  
  - Occasion-based recommendations (work, casual, party, etc.).  

- **Weather Integration**  
  - Fetches real-time weather to recommend climate-appropriate outfits.  

- **Sustainability Tracker**  
  - Tracks usage frequency of clothes to promote sustainable fashion.  

---

## 🛠️ Tech Stack  

- **Frontend:** React.js / Next.js, TailwindCSS  
- **Backend:** Node.js / Express.js  
- **Database:** MongoDB / PostgreSQL  
- **AI/ML Models:**  
  - Image classification (to categorize clothes).  
  - Recommendation system (outfit suggestions).  
- **APIs:** OpenWeather API (for weather-based recommendations).  

---

## 📂 Project Structure  
/client # Frontend 

/server # Backend 

/models # Al models for classification & recommendation

/database # Database schemas & seed data

/public # Static assets (icons, images, etc.)

## Al Functionality

Clothing Recognition: Detects and categorizes clothing items from uploaded images.

Outfit Recommendation Engine: Suggests outfit combinations

based on:

Weather conditions

Occasion type

User style history

Learning System: Improves recommendations with continued usage

## Future Enhancements

Virtual try-on feature using AR.

Social sharing of outfits with friends.

Integration with e-commerce APIs for shopping suggestions.

---

## 🔧 Troubleshooting

### If Your Closet Appears Empty

If you don't see any sample items in your closet, you can reset the data:

1. **Using the App Button**: Click the "Load Sample Data" button in the Closet page
2. **Using Browser Console**: Open browser dev tools (F12) and run:
   ```javascript
   localStorage.removeItem('wardrobeItems');
   localStorage.removeItem('wardrobeOutfits');
   location.reload();
   ```

### Sample Data Includes:
- **20+ Clothing Items**: Blue Denim Jacket, White T-Shirt, Black Jeans, etc.
- **Sample Outfits**: "Casual Friday", "Business Meeting"
- **Shopping Items**: 5 curated products with real retailer links

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Open `http://localhost:8080/` in your browser
   - Navigate to the Closet page to see sample items
   - Use the "Load Sample Data" button if items don't appear

4. **Explore Features**:
   - **Dashboard**: AI outfit recommendations
   - **Closet**: Manage your wardrobe items
   - **Outfits**: Create and manage outfit combinations
   - **Settings**: Customize your preferences
   - **Shopping**: Browse curated fashion items

