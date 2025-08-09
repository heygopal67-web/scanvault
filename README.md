# ScanVault - Pocket Receipts Organizer

A comprehensive receipts organizing and tracking app..

## Features

### 📱 5 Main Screens
- **Home Dashboard**: = receipts summary, quick actions, recent receipts 
- **Add Receipt**: Camera/gallery upload with form inputs
- **Receipt Details**: View, edit, and delete receipts
- **Categories/Tags**: Manage categories and view spending breakdown
- **Settings**: App preferences, data export, and statistics

### 🔧 Core Functionality
- **Camera Integration**: Take photos or select from gallery
- **Receipt Management**: Add, edit, delete, and organize receipts
- **Category System**: Create custom categories with color coding
- **Data Export**: Export to CSV format
- **Local Storage**: All data stored locally using AsyncStorage
- **Currency Selection**: Choose your preferred currency symbol for all totals

### 🎨 UI/UX Features
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Bottom Navigation**: Easy access to all main screens
- **Form Validation**: Input validation and error handling
- **Loading States**: Smooth user experience with loading indicators
- **Empty States**: Helpful messages when no data is available

## Tech Stack 
- **React Native** with Expo
- **TypeScript** for type safety
- **Tailwind CSS** (NativeWind) for styling
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Expo Camera** and **Image Picker** for photo capture
- **Expo Sharing** for data export

## Project Structure

```
scanvault/
├── app/                    # Main app layout
├── components/            # Reusable UI components
├── context/              # React Context for state management
├── navigation/           # Navigation configuration
├── screens/              # Main app screens
├── storage/              # Data storage utilities
├── utils/                # Helper functions
├── assets/               # Images and fonts
└── constants/            # App constants
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions (heygopal67@gmail.com), or please open an issue on GitHub.
