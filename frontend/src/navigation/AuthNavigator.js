// src/navigation/AuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { View, Text } from 'react-native';

// const Stack = createNativeStackNavigator();

// function TestScreen() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: '#070B1A',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <Text
//         style={{
//           color: 'white',
//           fontSize: 28,
//           fontWeight: 'bold',
//         }}
//       >
//         Trend Validator
//       </Text>
//     </View>
//   );
// }

// export default function AuthNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen
//         name="Test"
//         component={TestScreen}
//       />
//     </Stack.Navigator>
//   );
// }